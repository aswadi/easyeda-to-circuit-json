import type { CircuitJson } from "circuit-json"
import {
  type EasyEdaDocument,
  EasyEdaJunction,
  EasyEdaLibrary,
  type EasyEdaShape,
  shapeId,
} from "easyedats"
import type {
  EasyEdaToCircuitJsonDiagnostic,
  EasyEdaToCircuitJsonResult,
} from "../types"
import type { SchematicConversionContext } from "./conversion-context"
import { convertSchematicShape } from "./convert-schematic-shape"

function sanitizeDocumentId(documentId: string) {
  return (
    documentId
      .trim()
      .replace(/[^A-Za-z0-9_-]+/gu, "-")
      .replace(/^-+|-+$/gu, "") || "easyeda"
  )
}

function collectJunctions(shapes: EasyEdaShape[]) {
  const junctions: EasyEdaJunction[] = []
  for (const shape of shapes) {
    if (shape instanceof EasyEdaJunction) junctions.push(shape)
    if (shape instanceof EasyEdaLibrary) {
      junctions.push(...collectJunctions(shape.children))
    }
  }
  return junctions
}

function reportUnattachedJunctions(context: SchematicConversionContext) {
  for (const junction of context.junctions) {
    if (context.consumedJunctions.has(junction)) continue
    context.diagnostics.push({
      code: "lossy-conversion",
      severity: "warning",
      message: "EasyEDA junction is not attached to a converted wire",
      documentPath: ["shape"],
      recordToken: junction.token,
      sourceShapeId: shapeId(junction),
    })
  }
}

export function convertEasyEdaSchematic({
  easyEdaDocument,
  documentId,
}: {
  easyEdaDocument: EasyEdaDocument
  documentId: string
}): EasyEdaToCircuitJsonResult {
  const diagnostics: EasyEdaToCircuitJsonDiagnostic[] = []
  const circuitJson: CircuitJson = []
  const idStem = sanitizeDocumentId(documentId)
  const schematicSheetId = `schematic_sheet_${idStem}`
  const context: SchematicConversionContext = {
    circuitJson,
    diagnostics,
    idCounts: new Map(),
    junctions: collectJunctions(easyEdaDocument.shapes),
    consumedJunctions: new Set(),
    schematicSheetId,
  }

  circuitJson.push({
    type: "schematic_sheet",
    schematic_sheet_id: schematicSheetId,
    name: documentId,
    sheet_index: 0,
  })

  for (const [shapeIndex, shape] of easyEdaDocument.shapes.entries()) {
    convertSchematicShape({
      context,
      shape,
      location: { documentPath: ["shape", shapeIndex] },
    })
  }
  reportUnattachedJunctions(context)

  return { circuitJson, diagnostics }
}
