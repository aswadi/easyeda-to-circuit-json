import { expect, test } from "bun:test"
import { parseEasyEdaSource } from "easyedats"
import { convertEasyEdaToCircuitJson } from "lib"
import { schematicFixtureCases } from "tests/fixtures/schematic-cases"
import { renderConversionComparison } from "./render-conversion-comparison"

for (const fixture of schematicFixtureCases) {
  test(`renders ${fixture.name} source and conversion side by side`, async () => {
    const result = convertEasyEdaToCircuitJson({
      source: fixture.source,
      documentId: fixture.name,
    })
    const sourceDocument = parseEasyEdaSource(fixture.source)

    expect(sourceDocument.getString()).toBe(fixture.source)
    expect(
      result.diagnostics.filter(
        (diagnostic) => diagnostic.severity === "error",
      ),
    ).toEqual([])

    const comparisonSvg = renderConversionComparison({
      source: fixture.source,
      circuitJson: result.circuitJson,
      fixtureName: fixture.name,
    })
    await expect(comparisonSvg).toMatchSvgSnapshot(
      import.meta.path,
      fixture.name,
    )
  })
}
