import type { EasyEdaShape } from "easyedats"
import { convertEasyEdaLength } from "./coordinates"

export interface EasyEdaStrokeStyle {
  color: string
  width: number
}

export function readStrokeStyle({
  shape,
  startIndex,
  fallbackColor,
}: {
  shape: EasyEdaShape
  startIndex: number
  fallbackColor: string
}): EasyEdaStrokeStyle {
  for (let index = startIndex; index < shape.fields.length; index += 1) {
    const field = shape.fields[index]
    if (!field?.startsWith("#") && !field?.startsWith("rgb")) continue
    const widthField = Number(shape.fields[index + 1])
    return {
      color: field,
      width: convertEasyEdaLength(Number.isFinite(widthField) ? widthField : 1),
    }
  }
  return {
    color: fallbackColor,
    width: convertEasyEdaLength(1),
  }
}

export function readFillColor(field: string | undefined) {
  if (!field || field === "none" || field === "transparent") return undefined
  return field
}

export function readEasyEdaFontSize({
  shape,
  fieldIndex,
  fallbackSize,
}: {
  shape: EasyEdaShape
  fieldIndex: number
  fallbackSize: number
}) {
  const numericPart = Number.parseFloat(shape.fields[fieldIndex] ?? "")
  return convertEasyEdaLength(
    Number.isFinite(numericPart) ? numericPart : fallbackSize,
  )
}
