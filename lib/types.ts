import type { CircuitJson } from "circuit-json"
import type { EasyEdaDocument } from "easyedats"

export type EasyEdaToCircuitJsonDiagnosticCode =
  | "invalid-shape"
  | "lossy-conversion"
  | "unsupported-document-kind"
  | "unsupported-shape"

export interface EasyEdaToCircuitJsonDiagnostic {
  code: EasyEdaToCircuitJsonDiagnosticCode
  severity: "warning" | "error"
  message: string
  documentPath: readonly (string | number)[]
  recordToken?: string
  sourceShapeId?: string
}

export interface EasyEdaToCircuitJsonResult {
  circuitJson: CircuitJson
  diagnostics: EasyEdaToCircuitJsonDiagnostic[]
}

export interface ConvertEasyEdaToCircuitJsonOptions {
  source: string
  documentId?: string
  schematicIndex?: number
}

export interface ConvertEasyEdaDocumentToCircuitJsonOptions {
  easyEdaDocument: EasyEdaDocument
  documentId?: string
  schematicIndex?: number
}
