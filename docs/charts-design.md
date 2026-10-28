# Charts design: MUI-X-inspired headless charting for Solidix

Status: proposal (2026-10-27). Locked decisions: broad MUI-X parity as the
target, a headless package (not funnel blocks), and this design doc before
any component code.

This file is a design doc, not a user guide, so it stays out of
`internal/gallery/src/guides.ts` until implementation produces user docs.

## 1. Goal and non-goals

Goal: built-in charting for Solidix apps, covering the MUI-X chart set
with a Solid-idiomatic, headless, tree-shakeable API.

Non-goals for the initial waves:

- Pixel or prop-for-prop parity with MUI-X. Names stay close where the
  mapping is natural (`series`, `xAxis`, `dataset`), but React-isms
  (theme, `sx`, `slots`/`slotProps`, Emotion) do not cross over.
- A theming system. Charts follow the headless rule: unstyled structure
  plus styling hooks. The one deliberate exception is the default series
  palette (section 6), because color is the encoding channel, not decor.
- Funnel integration. `@solidix/funnel` is the landing-page system;
  charts are data visualization and stay independent. Funnel blocks may
  consume charts later.

## 2. Upstream baseline

Upstream: MUI-X Charts `v9.16.0`, docs checked 2026-10-27:

- Overview and composition model:
  [Composition](https://mui.com/x/react-charts/composition/),
  [Quickstart](https://mui.com/x/react-charts/quickstart/),
  [Bars](https://mui.com/x/react-charts/bars/).
- License model: open-core. `@mui/x-charts` is MIT (community);
  `@mui/x-charts-pro` and `@mui/x-charts-premium` are commercial.

License boundary rule: port structure and behavior from the MIT
community surface only. Pro/Premium chart types get behavior-inspired,
clean implementations in later waves (section 9), never ported code or
types. Verify the plan badge on each docs page at build time; tiers move
between majors.

| Chart / feature             | Tier (v9.16.0)         | Evidence / note                                 |
| --------------------------- | ---------------------- | ----------------------------------------------- |
| Bar (incl. stacked, horiz.) | Community (MIT)        | Main community docs track                       |
| Line / Area                 | Community (MIT)        | Main community docs track                       |
| Pie / Donut                 | Community (MIT)        | Main community docs track                       |
| Scatter                     | Community (MIT)        | Main community docs track                       |
| Sparkline                   | Community (MIT)        | Main community docs track                       |
| Gauge                       | Community (MIT)        | Main community docs track                       |
| Radar                       | Unverified, likely Pro | Listed in docs nav; pricing sources say Pro     |
| Radial Bars / Radial Lines  | Unverified             | Listed in docs nav; check badge at build time   |
| Candlestick                 | Unverified, maybe Prem | Listed in docs nav; pricing sources say Premium |
| Heatmap                     | Pro                    | "Pro plan" badge; `@mui/x-charts-pro/Heatmap`   |
| Funnel                      | Pro                    | `@mui/x-charts-pro/FunnelChart`                 |
| Sankey                      | Pro                    | Pro docs track                                  |
| Zoom / pan / Brush          | Pro                    | Pro features track                              |
| Export, WebGL, Gantt        | Premium                | Premium features track                          |
| Map                         | Preview                | Out of scope until stable                       |
| Data Grid integration       | -                      | Out of scope (no Solidix grid exists)           |

When implementation starts, record the pinned version in
`docs/radix-baseline.md` (add an MUI-X section) or in the package README
per the parity-first workflow, and re-check on re-baselining.

## 3. What MUI-X gives us (the parts worth keeping)

Two API layers, both worth porting:

1. Single-component charts for the common case:

```tsx
<BarChart
  xAxis={[{ id: "cats", data: ["bar A", "bar B", "bar C"], height: 28 }]}
  series={[{ data: [2, 5, 3] }]}
  height={300}
/>
```

2. Composition for mixed and custom charts: a data provider holding
   series/axes config plus scales, an SVG surface for plot layers, and HTML
   outside the surface for legend and tooltip:

```tsx
<ChartsDataProvider series={...} xAxis={...} width={640} height={400}>
  <ChartsLegend />
  <ChartsSurface>
    <Bars />
    <LinePlot />
    <ChartsXAxis />
    <ChartsYAxis />
    <ChartsGrid />
  </ChartsSurface>
  <ChartsTooltip />
</ChartsDataProvider>
```

Supporting concepts that port cleanly: `dataset` row mode (`dataset`
plus per-series `dataKey`), stacking config, axis definitions with
scales, highlighting state, and scale hooks (`useXScale`, `useYScale`,
`useDrawingArea`) for custom layers.

What stays behind: `@mui/material` and Emotion peers, the theme object,
`sx` props, and the `slots`/`slotProps` override system. Extension
points become plain subcomponents, `asChild` composition via
`@solidix/slot` for HTML parts (legend items, tooltip content), and
rendered SVG parts carrying data attributes.

## 4. Package layout

One package: `@solidix/charts`.

Rationale: every chart type shares the drawing context (scales, axes,
highlight state, tooltip). Splitting per chart type would force a core
package plus a dozen thin wrappers with no tree-shaking gain (a single
ESM entry already shakes) and would multiply the JSR export surface,
which is one subpath per package. MUI-X itself ships one community
package, so this mirrors the upstream instead of the Radix one-primitive
shape. Document as a deliberate deviation in the package README.

Internal module sketch (single `src/index.ts` entry, builder default):

```text
packages/solid/charts/src/
  index.ts            public entry (single-component + composition + hooks + types)
  container.tsx       ChartsDataProvider, ChartsContainer, ChartsSurface, ChartsWrapper
  scales.ts           scale construction from axis defs (memo-friendly pure fns)
  axes.tsx            ChartsXAxis, ChartsYAxis, radial axes (wave 3)
  grid.tsx            ChartsGrid, reference lines
  series/
    bars.tsx          Bars + BarChart (+ BarLabel)
    lines.tsx         LinePlot, AreaPlot + LineChart
    pie.tsx           PiePlot + PieChart
    scatter.tsx       ScatterPlot + ScatterChart
    sparkline.tsx     SparkLineChart
    gauge.tsx         Gauge
  tooltip.tsx         ChartsTooltip (HTML overlay)
  legend.tsx          ChartsLegend (HTML list)
  highlight.tsx       highlight state + HighlightPlot helpers
  hooks.ts            useDrawingArea, useXScale, useYScale, useSeries, useChartId
  format.ts           number/date tick formatting helpers
```

Umbrella wiring on first release: `export * as Charts` in
`packages/solid/solidix/src/index.ts` plus the test-table row, per the
meta-package convention.

## 5. Dependencies

Scales, shapes, and array stats come from d3 micro-packages (MIT,
framework-agnostic, the same modules MUI-X builds on):

- Wave 1: `d3-scale`, `d3-shape`, `d3-array`, `d3-format`,
  `d3-time` + `d3-time-format` (time axes).
- Later waves add only what they need (`d3-sankey`-style layout code
  stays hand-rolled or wave-4 scoped).

Packaging notes, verified against `scripts/jsr-publish.mjs` and
`internal/builder/bin/solidix-build.js`:

- Pins must be exact (toolchain rule; JSR also rejects ranges).
- The builder externalizes only `solid-js`, `@solidjs/*`,
  `@solidix/*`, `@repo/*`, so d3 bundles into `dist/index.mjs`. That
  needs no `jsr-publish` change and raises no bare-specifier failure,
  but it grows the bundle with `minify: false`. Watch output size per
  wave; if it bites, extend the external regex and let JSR resolve
  exact-pinned d3 from npm instead.
- No `@mui/*`, Emotion, or React peers. Ever.

## 6. Headless reading of charts

Structure ships unstyled; styling hooks carry the weight:

- SVG plot parts render with `data-chart`, `data-series`,
  `data-index`, `data-state` (normal/highlighted/faded), and
  `data-placement` attributes for axes. Consumers style fills, strokes,
  and grid lines through these plus their own classes.
- Series color default: a built-in categorical palette applied as
  `fill`/`stroke` presentation attributes that read CSS variables with
  fallbacks (`var(--solidix-charts-c1, #...)`). An unstyled chart still
  distinguishes its series, and one variable override re-palettes every
  chart. This is the documented exception to pure headless: without a
  default, every chart renders unreadable until styled.
- Tooltip is an HTML overlay positioned over the surface (absolute
  positioning from drawing-area state; no Popper dependency - chart
  tooltips track the pointer, not an anchor). Legend is an HTML list
  with roving or plain tab order.
- `width`/`height`: explicit props always win. When omitted, the
  container measures itself with `ResizeObserver` (precedent:
  `useSize`), defaulting to a fallback size for SSR and jsdom.
- Kebab-case style objects and lowercase `tabindex` in merged spreads,
  per repo rules. SVG attributes keep authored spelling (`viewBox`).

## 7. Solid API mapping

| MUI-X (React)             | Solidix                                                                   |
| ------------------------- | ------------------------------------------------------------------------- |
| `<BarChart series … />`   | Same names; `class`, `onX` events, plain `ref`                            |
| `slots` / `slotProps`     | Subcomponents + `asChild` on HTML parts                                   |
| `sx`, theme, `useTheme`   | Data attributes + CSS variables, no provider                              |
| Context + hooks           | Solid context (context is its own provider) with accessor-returning hooks |
| `dataset` + `dataKey`     | Same shape; rows resolved in memos                                        |
| Controlled highlight      | Controlled/uncontrolled via `useControllableState` precedent              |
| Animation on mount/update | V1: instant render + CSS opacity hooks; JS tween wave later (section 8)   |

Scales and derived geometry live in `createMemo` so a data update
recomputes paths without rebuilding the SVG tree. Dynamic series use
`<For>`; note the RC has no `Key`, so keyed identity across reorder
needs care at build time.

Accessibility target (MUI-X v9 is keyboard-first; match the intent):

- Each single-component chart renders `role="img"` with an accessible
  name built from title/axis/series labels, plus a visually-hidden data
  table or description for AT that cannot use the visual marks.
- Marks are focusable with roving `tabindex` and per-mark `aria-label`
  ("bar B, 5"); focus drives the same highlight state as hover.
- Legend items expose series names as text (native list semantics);
  gauge and sparkline render their value as text for AT.
- Reduced motion collapses any animation, same guard style as
  `@solidix/motion`.

## 8. Risks and open questions

1. Text measurement. Axes and auto-margins need label sizes; jsdom
   measures zero and SSR has no layout. Mitigation: fixed `width`/`height`
   props in tests and SSR, measured layout only in CSR via
   `ResizeObserver`, and tick-count caps so worst case is clipping, not
   breakage.
2. Animation. MUI-X animates geometry (path `d`, bar positions), which
   CSS cannot interpolate in general. V1 ships instant updates with CSS
   fade hooks on `data-state`; a later wave can add a small rAF tween
   helper inside the package. Do not pull in a JS animation runtime for v1.
3. Bundle size. d3 bundled plus `minify: false` needs a per-wave size
   check against JSR install cost. Splitting rarely-used layouts
   (sankey, radial) into lazy internal modules is the fallback, not a
   second package.
4. Solid 2 RC gaps. No `Key`, no Suspense/transitions in this RC; Slot
   SVG attribute handling has precedent but composed custom SVG layers
   through `asChild` need build-time verification.
5. Tier drift. Re-check each Pro/Premium badge when its wave starts;
   a component moving to community changes ported-vs-inspired treatment.

## 9. Phased waves

Each wave is its own change with tests, gallery demo(s) plus CSS (demos
ship per-chart stylesheets by gallery precedent), docs page, README
update, and a `minor` changeset (new `0.x` surface).

- Wave 1 (foundation + first charts): container, scales, axes, grid,
  tooltip, legend, highlight, hooks, dataset mode, stacking; `BarChart`
  (vertical, horizontal, stacked, bar labels) and `LineChart`
  (line, area, stacked area).
- Wave 2: `PieChart` (pie, donut, nested), `ScatterChart`,
  `SparkLineChart`, `Gauge`.
- Wave 3 (verify tiers first; inspired-only for anything still
  commercial): `RadarChart`, radial bars/lines, `CandlestickChart`.
- Wave 4 (inspired-only clean implementations): `Heatmap`, `Funnel`,
  `Sankey`, zoom/pan, brush selection.
- Out of scope: Map preview, Data Grid integration, WebGL
  large-dataset path, Gantt, Export (revisit after wave 2 - export may
  be community-tier and cheap as SVG serialization).

Wave 1 acceptance: two chart types with axes/grid/tooltip/legend,
dataset and stacking coverage, keyboard-navigable marks, gallery demos,
and `pnpm release:dry-run` still green with the new package staged.

## 10. Next step

Approve this doc (or amend tiers and wave order), then scaffold
`@solidix/charts` per the scaffold conventions (`src/index.ts`, lint /
typecheck / build / clean scripts, both tsconfigs, `test/*.test.tsx`)
and start Wave 1. No code, changeset, or gallery wiring ships with this
doc change.
