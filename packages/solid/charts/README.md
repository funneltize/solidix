# `@solidix/charts`

Unstyled, accessible chart primitives for Solid 2. Wave 1 ships bar and line charts: `BarChart` (`Bars`), `LineChart` (`LinePlot`, `AreaPlot`), plus composable container, scales, axes, grid, tooltip, legend, and highlight parts with headless hooks. Wave 2 adds `PieChart` (`PiePlot`), `ScatterChart` (`ScatterPlot`), `SparkLineChart`, and `Gauge`. Wave 3 adds `RadarChart` (`RadarPlot`), `RadialBarChart` (`RadialBarPlot`), `RadialLineChart` (`RadialLinePlot`), and `CandlestickChart` (`Candlesticks`). Wave 4 adds `ChartsHeatmap` (`HeatmapCells`), `ChartsFunnelChart` (`FunnelStages`), `ChartsSankeyChart` (`SankeyNodes` / `SankeyLinks`), plus shared Cartesian zoom / pan state (`ZoomWindow` on the container, `ChartsZoomControls`, `ChartsBrush`) usable from bar, line, and scatter charts.

Solid API mapping: `class` for `className`; `ref` is a plain prop; `asChild` composes via `@solidix/slot` (see the [Composition guide](../../../docs/composition.md)). Docs site: Charts page (`#/charts` route) with live demos and API reference.

## Differences from Radix

Radix has no chart primitives; this package ports the [MUI X Charts](https://mui.com/x/react-charts/) component model (container, series, axes, grid, tooltip, legend) to Solid 2 idioms. Palette colors resolve through `--sx-color-N` CSS variables so themes restyle charts without re-rendering.

Tier note: `RadarChart` follows the MUI X Community radar closely. Radial bar, radial line, and candlestick behaviors are behavior-inspired clean implementations of MUI X Premium charts (generic polar bars, polar lines, and OHLC candles drawn from first principles); prop names and internals are Solidix originals, not API ports. The same applies to Wave 4: heatmap, funnel, Sankey, zoom / pan, and brush are behavior-inspired clean implementations of the corresponding MUI X Pro ideas, written from first principles with Solidix-original prop names and internals.

Funnel note: this package's `ChartsFunnelChart` is a data-visualization funnel (staged values as trapezoids); it is unrelated to `@solidix/funnel`, the opinionated form-funnel block library.

## Wave 1 scope

- Foundation: `ChartContainer` / `ChartSurface` store, band / linear / time scales, `ChartsXAxis` / `ChartsYAxis`, `ChartsGrid`, `ChartsTooltip`, `ChartsLegend`, `ChartsHighlightTracker`, hooks (`useSeriesValues`, `useHighlight`), dataset row mode, stacking offsets, `format.ts`.
- Bar: `Bars` (grouped + stacked) and all-in-one `BarChart`.
- Line: `LinePlot` / `AreaPlot` with gap breaks for missing values, d3 curve factories or named shorthands (`CurveName`), and all-in-one `LineChart`.

## Wave 2 scope

- Pie: `PiePlot` (d3-shape arcs, first series only) and all-in-one `PieChart` with `innerRadius` / `outerRadius` / `padAngle` / `cornerRadius`, highlight-aware slices, focusable `role="img"` with a text fallback for AT.
- Scatter: `ScatterPlot` (per-point circles reusing the store y scale plus the shared `useScatterXScale` linear x scale from `xDataKey` or row index), numeric `ScatterXAxis`, and all-in-one `ScatterChart` with axes and tooltip.
- Sparkline: `SparkLineChart` reusing `LinePlot` / `AreaPlot` with tight margins, no axes or grid, end-dot plus hover-dot, named curve shorthands, optional tooltip.
- Gauge: standalone `Gauge` SVG with `role="meter"`; the arc variant renders track / value arcs, a pointer, and a formatted value (`min` / `max` / `value` with start/end angles and thickness), and `variant="bar"` renders a horizontal or vertical linear meter.

## Wave 3 scope

- Radar: `RadarPlot` (shared `polar.ts` geometry plus `ChartsRadialGrid` spokes / rings with axis labels) and all-in-one `RadarChart` with `max` / `levels` / `circular` / `showArea` / `fillOpacity`, per-series polygons, vertex dots, and tooltip.
- Radial bar: `RadialBarPlot` (d3-shape annular sector arcs, stacked per row) and all-in-one `RadialBarChart` with `max` / `radius` / `innerRadius` / `barWidth` / `levels` / `circular`, focusable `role="img"` bars with tooltip.
- Radial line: `RadialLinePlot` (series lines radiating from the center) and all-in-one `RadialLineChart` with vertex dots and tooltip.
- Candlestick: `Candlesticks` (cartesian store scales, bullish / bearish bodies plus wicks from `openKey` / `highKey` / `lowKey` / `closeKey`), `CandlestickTooltip` with all four OHLC prices, and all-in-one `CandlestickChart` with numeric Y autoscaling from the high / low extent.

## Wave 4 scope

- Heatmap: `HeatmapCells` (x / y category grid with value-to-color fills and `null` gap cells) and all-in-one `ChartsHeatmap` with `xLabels` / `yLabels` / `values` / `colorScale` / `nullFill` / `gap` / `radius` / `valueDomain`, focusable cells with tooltip.
- Funnel: `FunnelStages` (proportional trapezoids with per-stage conversion) and all-in-one `ChartsFunnelChart` with `stages` / `values` / `orientation` (`"vertical"` | `"horizontal"`) / `gap`, focusable stages with tooltip.
- Sankey: `SankeyNodes` / `SankeyLinks` (hand-rolled layered layout with cubic ribbon paths, no `d3-sankey` dependency) and all-in-one `ChartsSankeyChart` with `nodes` / `links` / `nodeWidth` / `nodePadding` / `linkOpacity`, focusable nodes with tooltip.
- Zoom / pan: fractional `ZoomWindow` in the shared container state (`zoom` / `defaultZoom` / `onZoomChange`), pure `zoomInWindow` / `zoomOutWindow` / `panWindow` helpers plus `clampZoomWindow`, and keyboard-accessible `ChartsZoomControls` (zoom in / out, pan left / right, reset); bar, line, scatter, and the x-axis follow the window automatically.
- Brush: `ChartsBrush` transparent plot overlay (render inside a `ChartSurface`, after the series marks) turning a pointer drag into a zoom window, with click / double-click / `Escape` reset; the keyboard path stays `ChartsZoomControls`.
