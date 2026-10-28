# @solidix/charts

## 0.2.0

### Minor Changes

- 85f54c9: Follow-up charting gaps: named line-curve shorthands, Gauge bar variant, numeric ScatterXAxis, four-price CandlestickTooltip, and untracked-read fixes in tooltip, sparkline, candlestick, and radial grid rendering.
- 85f54c9: Add `@solidix/charts` (wave 1): bar and line chart primitives with container, scales, axes, grid, tooltip, legend, highlight parts, headless hooks, and gallery demos.
- 85f54c9: Add `@solidix/charts` wave 2: pie, scatter, sparkline, and gauge chart primitives with gallery demos and docs.
- 85f54c9: Add Wave 3 standalone charts: RadarChart, RadialBarChart, RadialLineChart, and CandlestickChart with a shared ChartsRadialGrid polar grid.
- 85f54c9: Add Wave 4 charts: ChartsHeatmap, ChartsFunnelChart, and ChartsSankeyChart, plus shared Cartesian zoom state with ChartsBrush drag selection and ChartsZoomControls keyboard controls.
- 85f54c9: Record `@solidix/charts` delivery (wave 5): umbrella `Charts` namespace export, full gallery demo and API docs coverage for every wave, and the MUI X Charts 9.16.0 upstream baseline.

### Patch Changes

- 85f54c9: Clamp the area baseline to the y domain edge when data excludes zero, so fills no longer render past the x axis and below the plot.
- Updated dependencies [85f54c9]
  - @solidix/use-controllable-state@0.1.6
