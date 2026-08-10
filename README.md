# easyeda-to-circuit-json

Convert EasyEDA Standard source documents into typed
[Circuit JSON](https://github.com/tscircuit/circuit-json).

This converter deliberately uses
[`easyedats`](https://github.com/tscircuit/easyedats) as its EasyEDA parser and
semantic model. It does not maintain a parallel EasyEDA schema and never
replaces the source document with a lossy intermediate format.

## Usage

```ts
import { convertEasyEdaToCircuitJson } from "easyeda-to-circuit-json"

const result = convertEasyEdaToCircuitJson({ source: easyEdaSource })

console.log(result.circuitJson)
console.log(result.diagnostics)
```

An already parsed `EasyEdaDocument` can be converted without reparsing:

```ts
import { parseEasyEdaSource } from "easyedats"
import { convertEasyEdaDocumentToCircuitJson } from "easyeda-to-circuit-json"

const easyEdaDocument = parseEasyEdaSource(easyEdaSource)
const result = convertEasyEdaDocumentToCircuitJson({ easyEdaDocument })
```

## Initial schematic coverage

- wires and explicit junctions
- net labels and free text
- rectangles, circles, ellipses, lines, polylines, and polygons
- buses and bus entries
- no-connect marks
- nested `LIB` drawing records and schematic symbols
- schematic-list sheet selection
- structured diagnostics for invalid or unsupported records

Coordinates are transformed from EasyEDA's 10 mil, Y-down schematic space to
Circuit JSON's millimeter, Y-up space. Exact EasyEDA source preservation remains
the responsibility of the returned `easyedats` model; conversion only creates a
regenerable Circuit JSON view.

Visual tests render the same fixture twice—first with `easyedats`, then with
`circuit-to-svg`—and stack both SVGs side by side. This makes partial support and
geometry regressions visible while semantic assertions verify the resulting
Circuit JSON.
