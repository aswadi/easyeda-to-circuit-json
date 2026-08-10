import type { CircuitJson } from "circuit-json"
import { type EasyEdaJunction, type EasyEdaShape, shapeId } from "easyedats"
import type { EasyEdaToCircuitJsonDiagnostic } from "../types"

export interface SchematicConversionContext {
  circuitJson: CircuitJson
  diagnostics: EasyEdaToCircuitJsonDiagnostic[]
  idCounts: Map<string, number>
  junctions: EasyEdaJunction[]
  consumedJunctions: Set<EasyEdaJunction>
  schematicSheetId: string
}

export interface ShapeConversionLocation {
  documentPath: readonly (string | number)[]
  schematicSymbolId?: string
}

function sanitizeIdPart(sourcePart: string) {
  return sourcePart
    .trim()
    .replace(/[^A-Za-z0-9_-]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
}

export function reserveCircuitElementId({
  context,
  prefix,
  shape,
  documentPath,
}: {
  context: SchematicConversionContext
  prefix: string
  shape: EasyEdaShape
  documentPath: readonly (string | number)[]
}) {
  const locationStem = documentPath.join("-")
  const sourceStem = sanitizeIdPart(
    shapeId(shape) ?? `${shape.token}-${locationStem}`,
  )
  const baseId = `${prefix}_${sourceStem || "shape"}`
  const previousCount = context.idCounts.get(baseId) ?? 0
  context.idCounts.set(baseId, previousCount + 1)
  return previousCount === 0 ? baseId : `${baseId}_${previousCount + 1}`
}

export function reportShapeDiagnostic({
  context,
  shape,
  documentPath,
  code,
  severity = "warning",
  message,
}: {
  context: SchematicConversionContext
  shape: EasyEdaShape
  documentPath: readonly (string | number)[]
  code: EasyEdaToCircuitJsonDiagnostic["code"]
  severity?: EasyEdaToCircuitJsonDiagnostic["severity"]
  message: string
}) {
  context.diagnostics.push({
    code,
    severity,
    message,
    documentPath,
    recordToken: shape.token,
    sourceShapeId: shapeId(shape),
  })
}
