import type { EasyEdaPoint } from "easyedats"
import { applyToPoint, scale } from "transformation-matrix"

/** EasyEDA Standard schematic coordinates are expressed in 10 mil units. */
export const EASYEDA_SCHEMATIC_UNIT_TO_MM = 0.254

const easyEdaToCircuitTransform = scale(
  EASYEDA_SCHEMATIC_UNIT_TO_MM,
  -EASYEDA_SCHEMATIC_UNIT_TO_MM,
)

export function convertEasyEdaPoint(point: EasyEdaPoint) {
  return applyToPoint(easyEdaToCircuitTransform, point)
}

export function convertEasyEdaLength(length: number) {
  return Math.abs(length * easyEdaToCircuitTransform.a)
}
