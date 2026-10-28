/** Shared dataset, series, and stacking types and helpers. */
export {
  DEFAULT_LABEL_KEY,
  DEFAULT_MARGIN,
  PALETTE_FALLBACKS,
  PALETTE_SIZE,
  cellValue,
  computeStackOffsets,
  itemsEqual,
  rowLabel,
  seriesColor,
  stackedExtent,
  toNumber,
} from "./types";
export type {
  ChartItemRef,
  ChartMargin,
  Datum,
  Dataset,
  NumericLike,
  SeriesDescriptor,
  StackMode,
  StackOffsets,
} from "./types";

/** Number, date, and tick formatting helpers. */
export {
  compactTickFormat,
  formatCompact,
  formatCurrency,
  formatDate,
  formatDuration,
  formatNumber,
  formatPercent,
  formatUtcDate,
  tickFormatForStep,
} from "./format";
export type { Formatter } from "./format";

/** Scale factories and domain helpers. */
export {
  createBandScale,
  createLinearScale,
  createPointScale,
  createTimeScale,
  evenTickSubset,
  normalizeDomain,
} from "./scales";
export type {
  CategoricalScaleOptions,
  LinearScaleOptions,
  ScaleOrientation,
  TimeScaleOptions,
} from "./scales";

/** Chart context, container, and drawing surface. */
export {
  ChartContainer,
  ChartSurface,
  clampZoomWindow,
  createChartScope,
  defaultFormatValue,
  useChartContext,
} from "./container";
export type {
  CategoryScale,
  ChartContainerProps,
  ChartStore,
  ChartSurfaceProps,
  FormatValue,
  ResolvedSeries,
  ScopedProps,
  ZoomWindow,
} from "./container";

/** Headless series resolution hooks. */
export { resolveRowLabel, resolveSeriesValues, useSeriesValues } from "./hooks";
export type { ResolvedValue, UseSeriesValuesOptions } from "./hooks";

/** Axes and grid. */
export { ChartsXAxis, ChartsYAxis } from "./axes";
export type { ChartsXAxisProps, ChartsYAxisProps } from "./axes";
export { ChartsGrid, ChartsRadialGrid } from "./grid";
export type { ChartsGridProps, ChartsRadialGridProps } from "./grid";

/** Polar geometry helpers. */
export {
  angleForIndex,
  POLAR_START_ANGLE,
  polarPoint,
  radialFraction,
  spokeTextAnchor,
} from "./polar";
export type { PolarPoint } from "./polar";

/** Tooltip, legend, and highlight primitives. */
export { ChartsTooltip } from "./tooltip";
export type { ChartsTooltipProps, ChartsTooltipTriggerProps, TooltipEntry } from "./tooltip";
export { ChartsLegend } from "./legend";
export type { ChartsLegendProps } from "./legend";
export { ChartsHighlightTracker, useHighlight } from "./highlight";
export type { ChartsHighlightTrackerProps, UseHighlightOptions } from "./highlight";

/** Bar series. */
export { BarChart, Bars } from "./series/bars";
export type { BarChartProps, BarMode, BarsProps } from "./series/bars";

/** Line and area series. */
export { AreaPlot, LineChart, LinePlot, resolveCurve } from "./series/lines";
export type { CurveName, LineChartProps, PlotProps } from "./series/lines";

/** Pie series. */
export { PieChart, PiePlot } from "./series/pie";
export type { PieChartProps, PiePlotProps } from "./series/pie";

/** Scatter series. */
export { ScatterChart, ScatterPlot, ScatterXAxis, useScatterXScale } from "./series/scatter";
export type {
  ScatterChartProps,
  ScatterPlotProps,
  ScatterXAxisProps,
  UseScatterXScaleOptions,
} from "./series/scatter";

/** Radar series. */
export { RadarChart, RadarPlot, RadarSeriesShape } from "./series/radar";
export type { RadarChartProps, RadarPlotProps, RadarSeriesShapeProps } from "./series/radar";

/** Radial bar and radial line series. */
export {
  annularSectorPath,
  RadialBarChart,
  RadialBarPlot,
  RadialLineChart,
  RadialLinePlot,
} from "./series/radial";
export type {
  RadialBarChartProps,
  RadialBarPlotProps,
  RadialLineChartProps,
  RadialLinePlotProps,
} from "./series/radial";

/** Candlestick series. */
export {
  CANDLESTICK_SERIES_ID,
  CandlestickChart,
  Candlesticks,
  CandlestickTooltip,
} from "./series/candlestick";
export type {
  CandleDatum,
  CandlestickChartProps,
  CandlestickKeys,
  CandlesticksProps,
  CandlestickTooltipContent,
  CandlestickTooltipProps,
} from "./series/candlestick";

/** Sparkline series. */
export { SparkLineChart } from "./series/sparkline";
export type { SparkLineChartProps } from "./series/sparkline";

/** Gauge. */
export { Gauge } from "./series/gauge";
export type { GaugePoint, GaugeProps } from "./series/gauge";

/** Cartesian zoom and pan. */
export { ChartsZoomControls, panWindow, zoomInWindow, zoomOutWindow } from "./zoom";
export type { ChartsZoomControlsLabels, ChartsZoomControlsProps } from "./zoom";

/** Brush selection. */
export { ChartsBrush } from "./brush";
export type { ChartsBrushProps } from "./brush";

/** Heatmap series. */
export {
  ChartsHeatmap,
  HeatmapCells,
  defaultHeatmapColor,
  formatHeatmapCellValue,
  layoutHeatmapCells,
} from "./series/heatmap";
export type { ChartsHeatmapProps, HeatmapCell, HeatmapCellsProps } from "./series/heatmap";

/** Funnel series. */
export {
  ChartsFunnelChart,
  FunnelStages,
  formatFunnelConversion,
  layoutFunnelStages,
} from "./series/funnel";
export type {
  ChartsFunnelChartProps,
  FunnelOrientation,
  FunnelStage,
  FunnelStagesProps,
} from "./series/funnel";

/** Sankey series. */
export {
  ChartsSankeyChart,
  SankeyLinks,
  SankeyNodes,
  formatSankeyLink,
  layoutSankey,
} from "./series/sankey";
export type {
  ChartsSankeyChartProps,
  SankeyLayout,
  SankeyLink,
  SankeyLinkDatum,
  SankeyNode,
  SankeyNodeDatum,
  SankeyPartsProps,
} from "./series/sankey";

/**
 * Root alias for the chart container.
 *
 * The umbrella package expects every namespace to expose a `Root` part; for
 * charts the root is the store-owning {@link ChartContainer} every surface,
 * plot, and overlay composes under.
 */
export { ChartContainer as Root } from "./container";
