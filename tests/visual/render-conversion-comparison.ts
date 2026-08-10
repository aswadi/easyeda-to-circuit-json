import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToSchematicSvg } from "circuit-to-svg"
import {
  type EasyEdaDocument,
  parseEasyEdaSource,
  renderEasyEdaSvg,
} from "easyedats"
import {
  convertEasyEdaLength,
  convertEasyEdaPoint,
} from "lib/schematic/coordinates"
import { stackSvgsHorizontally, stackSvgsVertically } from "stack-svgs"

const viewWidth = 560
const viewHeight = 400
const captionHeight = 34

function createCaption(caption: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${viewWidth}" height="${captionHeight}" viewBox="0 0 ${viewWidth} ${captionHeight}">
  <rect width="${viewWidth}" height="${captionHeight}" fill="#111827" />
  <text x="14" y="23" fill="#f8fafc" font-family="ui-monospace, monospace" font-size="14">${caption}</text>
</svg>`
}

function addCaption(caption: string, svg: string) {
  return stackSvgsVertically([createCaption(caption), svg], {
    gap: 0,
    normalizeSize: false,
  })
}

function readSourceBounds(easyEdaDocument: EasyEdaDocument) {
  const bounds = easyEdaDocument.getProperty("BBox")
  if (!bounds || typeof bounds !== "object" || Array.isArray(bounds)) {
    return undefined
  }
  const x = bounds.x
  const y = bounds.y
  const width = bounds.width
  const height = bounds.height
  if (
    typeof x !== "number" ||
    typeof y !== "number" ||
    typeof width !== "number" ||
    typeof height !== "number"
  ) {
    return undefined
  }
  return { x, y, width, height }
}

export function renderConversionComparison({
  source,
  circuitJson,
  fixtureName,
}: {
  source: string
  circuitJson: CircuitJson
  fixtureName: string
}) {
  const easyEdaDocument = parseEasyEdaSource(source)
  const easyEdaSvg = renderEasyEdaSvg(easyEdaDocument, {
    width: viewWidth,
    height: viewHeight,
    padding: 2,
    title: `${fixtureName} EasyEDA source`,
    backgroundColor: "#ffffff",
  })
  // The Circuit JSON sheet renderer adds a synthetic title-block frame that is
  // absent from these source snippets. Exclude only that frame so both columns
  // compare the converted drawing records at their natural bounds.
  const drawingCircuitJson = circuitJson.filter(
    (element) => element.type !== "schematic_sheet",
  )
  const sourceBounds = readSourceBounds(easyEdaDocument)
  if (sourceBounds) {
    drawingCircuitJson.push({
      type: "schematic_rect",
      schematic_rect_id: "visual_comparison_source_bounds",
      center: convertEasyEdaPoint({
        x: sourceBounds.x + sourceBounds.width / 2,
        y: sourceBounds.y + sourceBounds.height / 2,
      }),
      width: convertEasyEdaLength(sourceBounds.width),
      height: convertEasyEdaLength(sourceBounds.height),
      rotation: 0,
      stroke_width: 0,
      color: "transparent",
      is_filled: false,
      is_dashed: false,
    })
  }
  const circuitJsonSvg = convertCircuitJsonToSchematicSvg(drawingCircuitJson, {
    width: viewWidth,
    height: viewHeight,
    includeVersion: false,
    colorOverrides: {
      schematic: {
        background: "#ffffff",
        wire: "#008800",
        wire_crossing: "#008800",
        junction: "#cc0000",
        component_outline: "#880000",
        sheet_label: "#000080",
        label_local: "#000080",
        reference: "#000080",
      },
    },
  })

  return stackSvgsHorizontally(
    [
      addCaption("EasyEDA source · easyedats", easyEdaSvg),
      addCaption("Converted Circuit JSON · circuit-to-svg", circuitJsonSvg),
    ],
    {
      gap: 18,
      normalizeSize: false,
      rootAttributes: {
        role: "img",
        "aria-label": `${fixtureName}: EasyEDA source on left, converted Circuit JSON on right`,
        "data-left-renderer": "easyedats",
        "data-right-renderer": "circuit-to-svg",
      },
    },
  )
}
