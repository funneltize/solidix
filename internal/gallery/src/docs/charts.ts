import type { PrimitiveDoc } from "./types";

export const doc: PrimitiveDoc = {
  slug: "charts",
  title: "Charts",
  metaDescription:
    "Unstyled, accessible chart primitives for Solid 2: bar, line, pie, scatter, sparkline, gauge, radar, radial, candlestick, heatmap, funnel, and sankey charts built on composable container, scale, axis, grid, tooltip, legend, brush, and zoom parts.",
  ariaLink: "",
  description:
    "Renders data visualizations as accessible SVG charts. Compose the container,\n\tseries plots, axes, grid, tooltip, and legend parts, or use the all-in-one\n\t`BarChart`, `LineChart`, `PieChart`, `ScatterChart`, `SparkLineChart`,\n\t`Gauge`, `RadarChart`, `RadialBarChart`, `RadialLineChart`,\n\t`CandlestickChart`, `ChartsHeatmap`, `ChartsFunnelChart`, and\n\t`ChartsSankeyChart` components.",
  features: [
    "Headless series hooks (`useSeriesValues`, `useHighlight`) for custom renders.",
    "Grouped and stacked bars with automatic stacked domain widening.",
    "Line plots with gap breaks for missing values, optional area fill, and named curve shorthands.",
    "Pie plots with donut, pad angle, and corner radius options.",
    "Scatter plots with per-point x values, a numeric x axis, and highlight tooltips.",
    "Sparklines with end dots and optional area fill for KPI tiles.",
    "Standalone gauges with arc or bar variants, pointer, and center text.",
    "Radar charts with polygonal or circular grids and metric labels.",
    "Radial bars and radial lines on a shared polar grid.",
    "Candlestick charts with OHLC wicks, bullish or bearish bodies, and a four-price tooltip.",
    "Heatmaps with sequential color scales, gap cells, and cell focus tooltips.",
    "Funnel charts with vertical or horizontal stage trapezoids and conversion labels.",
    "Sankey diagrams with layered node bars and curved flow ribbons.",
    "Shared Cartesian zoom state: drag-select with ChartsBrush or zoom and pan with ChartsZoomControls.",
    "Dataset row mode: one object per category shared across series.",
    "Palette via `--sx-color-N` CSS variables with hex fallbacks.",
  ],
  anatomyIntro: "",
  anatomy: {
    lang: "jsx",
    highlights: [],
    code: `import * as Charts from "@solidix/charts";

const dataset = [
  { label: "Jan", sales: 12 },
  { label: "Feb", sales: 30 },
  { label: "Mar", sales: 18 },
];

export default () => (
  <Charts.BarChart
    width={480}
    height={300}
    dataset={dataset}
    series={[{ id: "sales", label: "Sales", valueKey: "sales" }]}
  />
);`,
  },
  parts: [
    {
      name: "ChartContainer",
      description: "Provides the chart store, scales, and highlight state to all descendants.",
      props: [
        {
          name: "width",
          type: "number",
          required: true,
          description: "The chart width in pixels.",
        },
        {
          name: "height",
          type: "number",
          required: true,
          description: "The chart height in pixels.",
        },
        {
          name: "margin",
          type: "ChartMargin",
          description: "Plot-area insets. Defaults to { top: 8, right: 8, bottom: 24, left: 32 }.",
        },
        {
          name: "dataset",
          type: "Dataset",
          required: true,
          description: "Row-mode data: one object per category, read via each series `valueKey`.",
        },
        {
          name: "series",
          type: "SeriesDescriptor[]",
          required: true,
          description:
            "Series definitions with `id`, optional `label`, `valueKey`, `color`, and `colorIndex`.",
        },
        {
          name: "labelKey",
          type: "string",
          description: 'Row field used for category labels. Defaults to "label".',
        },
        {
          name: "xScaleType",
          type: "'band' | 'point'",
          description: "The categorical x scale type. Defaults to 'band'.",
        },
        {
          name: "yDomain",
          type: "[number, number]",
          description: "Explicit y domain. Defaults to the data extent.",
        },
        {
          name: "formatValue",
          type: "(value: number | undefined, series: ResolvedSeries) => string",
          description: "Value formatter for tooltip and label output.",
        },
      ],
      dataAttributes: [],
      cssVariables: [
        {
          cssVariable: "--sx-color-N",
          description: "Series palette colors, indexed by series order, with hex fallbacks.",
        },
      ],
    },
    {
      name: "BarChart",
      description: "All-in-one grouped or stacked bar chart: container, grid, bars, axes.",
      props: [
        {
          name: "stacked",
          type: "boolean",
          description: "Accumulate series instead of grouping them. Defaults to false.",
        },
        {
          name: "radius",
          type: "number",
          description: "Corner radius in pixels for every bar. Defaults to 0.",
        },
        {
          name: "children",
          type: "JSX.Element",
          description: "Trailing overlay slot rendered inside the surface (tooltip, legend).",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "LineChart",
      description: "All-in-one line chart with optional area fill: container, grid, plots, axes.",
      props: [
        {
          name: "area",
          type: "boolean",
          description: "Render an area fill under each line. Defaults to false.",
        },
        {
          name: "curve",
          type: 'CurveFactory | "linear" | "monotoneX" | "monotoneY" | "natural" | "step" | "stepBefore" | "stepAfter" | "basis" | "cardinal" | "catmullRom" | "bumpX" | "bumpY"',
          description: "d3 curve factory or named shorthand. Defaults to linear.",
        },
        {
          name: "children",
          type: "JSX.Element",
          description: "Trailing overlay slot rendered inside the surface (tooltip, legend).",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "PieChart",
      description: "All-in-one pie chart over the first visible series: container, plot, legend.",
      props: [
        {
          name: "innerRadius",
          type: "number",
          description: "Inner radius in pixels; greater than zero renders a donut. Defaults to 0.",
        },
        {
          name: "outerRadius",
          type: "number",
          description: "Outer radius in pixels. Defaults to half the smaller plot dimension.",
        },
        {
          name: "padAngle",
          type: "number",
          description: "Gap between slices in radians. Defaults to 0.",
        },
        {
          name: "cornerRadius",
          type: "number",
          description: "Slice corner rounding in pixels. Defaults to 0.",
        },
        {
          name: "children",
          type: "JSX.Element",
          description: "Trailing overlay slot rendered after the surface (tooltip, extra legend).",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "ScatterChart",
      description:
        "All-in-one scatter chart: container, grid, numeric x axis, y axis, points, tooltip slot.",
      props: [
        {
          name: "xDataKey",
          type: "string",
          description: "Dataset key for x values. Defaults to the row index.",
        },
        {
          name: "radius",
          type: "number",
          description: "Point radius in pixels. Defaults to 4.",
        },
        {
          name: "children",
          type: "JSX.Element",
          description: "Trailing overlay slot rendered inside the surface (tooltip, legend).",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "SparkLineChart",
      description:
        "Compact trend chart for KPI tiles: line with end dot, optional area and tooltip.",
      props: [
        {
          name: "area",
          type: "boolean",
          description: "Render an area fill under the line. Defaults to false.",
        },
        {
          name: "curve",
          type: "CurveFactory | CurveName",
          description: "d3 curve factory or named shorthand. Defaults to linear.",
        },
        {
          name: "showEndDot",
          type: "boolean",
          description: "Render a dot on the last defined point. Defaults to true.",
        },
        {
          name: "showHighlight",
          type: "boolean",
          description: "Render a dot on the highlighted point. Defaults to false.",
        },
        {
          name: "showTooltip",
          type: "boolean",
          description:
            "Render headless tooltip content for the highlighted row. Defaults to false.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "Gauge",
      description: "Standalone gauge with arc or bar variants, pointer, and center text.",
      props: [
        {
          name: "variant",
          type: '"arc" | "bar"',
          description: "Circular dial or linear meter. Defaults to arc.",
        },
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          description: "Bar fill direction. Defaults to horizontal.",
        },
        {
          name: "value",
          type: "number",
          required: true,
          description: "Current value between `min` and `max`.",
        },
        {
          name: "min",
          type: "number",
          description: "Scale minimum. Defaults to 0.",
        },
        {
          name: "max",
          type: "number",
          description: "Scale maximum. Defaults to 100.",
        },
        {
          name: "text",
          type: "string",
          description: "Center text, such as the formatted value.",
        },
        {
          name: "showPointer",
          type: "boolean",
          description: "Render the needle pointer. Defaults to true.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "RadarChart",
      description: "All-in-one radar chart: polar grid, area polygons, stroke outlines, and dots.",
      props: [
        {
          name: "max",
          type: "number",
          description: "Scale maximum shared by all axes. Defaults to the data maximum.",
        },
        {
          name: "radius",
          type: "number",
          description: "Outer radius in pixels. Defaults to half the smaller plot edge.",
        },
        {
          name: "levels",
          type: "number",
          description: "Number of grid rings. Defaults to 4.",
        },
        {
          name: "circular",
          type: "boolean",
          description: "Render circular rings and spokes instead of polygons. Defaults to false.",
        },
        {
          name: "showArea",
          type: "boolean",
          description: "Render the translucent area fill. Defaults to true.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "RadialBarChart",
      description:
        "All-in-one radial bar chart: annular sector arcs grouped per row on a polar grid.",
      props: [
        {
          name: "max",
          type: "number",
          description: "Scale maximum for bar length. Defaults to the data maximum.",
        },
        {
          name: "innerRadius",
          type: "number",
          description: "Inner radius in pixels. Defaults to 0.",
        },
        {
          name: "barWidth",
          type: "number",
          description: "Bar angular width as a fraction of its slot, from 0 to 1. Defaults to 0.7.",
        },
        {
          name: "levels",
          type: "number",
          description: "Number of grid rings. Defaults to 4.",
        },
        {
          name: "circular",
          type: "boolean",
          description: "Render circular rings and spokes. Defaults to true.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "RadialLineChart",
      description: "All-in-one radial line chart: closed polylines with dots on a polar grid.",
      props: [
        {
          name: "max",
          type: "number",
          description: "Scale maximum shared by all axes. Defaults to the data maximum.",
        },
        {
          name: "levels",
          type: "number",
          description: "Number of grid rings. Defaults to 4.",
        },
        {
          name: "circular",
          type: "boolean",
          description: "Render circular rings and spokes. Defaults to true.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "CandlestickChart",
      description: "All-in-one candlestick chart: OHLC wicks with bullish or bearish bodies.",
      props: [
        {
          name: "openKey",
          type: "string",
          description: "Dataset key for the open value. Defaults to open.",
        },
        {
          name: "highKey",
          type: "string",
          description: "Dataset key for the high value. Defaults to high.",
        },
        {
          name: "lowKey",
          type: "string",
          description: "Dataset key for the low value. Defaults to low.",
        },
        {
          name: "closeKey",
          type: "string",
          description: "Dataset key for the close value. Defaults to close.",
        },
        {
          name: "bodyWidth",
          type: "number",
          description: "Fraction of the category band filled by each body. Defaults to 0.6.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "ChartsRadialGrid",
      description: "Renders a polar grid: concentric rings with spokes, polygonal or circular.",
      props: [
        {
          name: "radius",
          type: "number",
          required: true,
          description: "Grid radius in pixels.",
        },
        {
          name: "spokes",
          type: "number",
          description: "Spoke count. Defaults to 6.",
        },
        {
          name: "rings",
          type: "number",
          description: "Number of concentric rings. Defaults to 4.",
        },
        {
          name: "circular",
          type: "boolean",
          description: "Render circles instead of polygons. Defaults to true.",
        },
        {
          name: "labels",
          type: "string[]",
          description: "Spoke labels rendered just outside the grid. Length should match `spokes`.",
        },
        {
          name: "labelOffset",
          type: "number",
          description: "Label offset beyond the grid radius. Defaults to 12.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "ChartsHeatmap",
      description:
        "All-in-one heatmap: a color-scaled cell matrix with gap rendering for null values.",
      props: [
        {
          name: "xLabels",
          type: "string[]",
          description: "Column labels along the x axis.",
        },
        {
          name: "yLabels",
          type: "string[]",
          description: "Series labels along the vertical axis. Defaults to the series ids.",
        },
        {
          name: "values",
          type: "(number | null)[][]",
          description:
            "Rows of values, one row per x label, one entry per series. Null renders a gap cell.",
        },
        {
          name: "series",
          type: "HeatmapSeries[]",
          description: "Series metadata (colors); defaults to one id per column.",
        },
        {
          name: "colorScale",
          type: "(t: number) => string",
          description:
            "Interpolator from a 0-1 normalized value to a CSS color. Defaults to a blue ramp.",
        },
        {
          name: "nullFill",
          type: "string",
          description: "Fill for gap cells. Defaults to transparent.",
        },
        {
          name: "gap",
          type: "number",
          description: "Pixels between cells. Defaults to 1.",
        },
        {
          name: "radius",
          type: "number",
          description: "Cell corner radius. Defaults to 0.",
        },
        {
          name: "valueDomain",
          type: "[number, number]",
          description: "Fixed scale domain. Defaults to the data extent.",
        },
        {
          name: "ariaLabel",
          type: "string",
          description: 'Accessible summary. Defaults to "Heatmap".',
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "ChartsFunnelChart",
      description:
        "All-in-one funnel chart: stage trapezoids sized by value, with per-stage conversion in accessible names.",
      props: [
        {
          name: "stages",
          type: "string[]",
          description: "Stage labels in display order.",
        },
        {
          name: "values",
          type: "number[]",
          description: "Stage values, one per stage.",
        },
        {
          name: "orientation",
          type: '"vertical" | "horizontal"',
          description: "Direction the stages flow. Defaults to vertical.",
        },
        {
          name: "gap",
          type: "number",
          description: "Pixels between stages. Defaults to 4.",
        },
        {
          name: "ariaLabel",
          type: "string",
          description: 'Accessible summary. Defaults to "Funnel chart".',
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "ChartsSankeyChart",
      description:
        "All-in-one sankey diagram: node bars layered by depth with curved flow ribbons between them.",
      props: [
        {
          name: "nodes",
          type: "SankeyNodeDatum[]",
          description: "Node ids with optional labels.",
        },
        {
          name: "links",
          type: "SankeyLinkDatum[]",
          description: "Source, target, and value per flow.",
        },
        {
          name: "nodeWidth",
          type: "number",
          description: "Node bar width in pixels. Defaults to 16.",
        },
        {
          name: "nodePadding",
          type: "number",
          description: "Vertical padding between nodes. Defaults to 8.",
        },
        {
          name: "linkOpacity",
          type: "number",
          description: "Link ribbon opacity. Defaults to 0.35.",
        },
        {
          name: "ariaLabel",
          type: "string",
          description: 'Accessible summary. Defaults to "Sankey diagram".',
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "ChartsBrush",
      description:
        "Drag-to-select overlay that writes a fractional zoom window into shared container state.",
      props: [
        {
          name: "fill",
          type: "string",
          description: "Selection rectangle fill. Defaults to #3b82f6.",
        },
        {
          name: "fillOpacity",
          type: "number",
          description: "Selection rectangle fill opacity. Defaults to 0.15.",
        },
        {
          name: "stroke",
          type: "string",
          description: "Selection rectangle stroke. Defaults to #3b82f6.",
        },
        {
          name: "minSpan",
          type: "number",
          description: "Minimum fractional span before the window commits. Defaults to 0.02.",
        },
        {
          name: "resetOnClick",
          type: "boolean",
          description: "Clear the window on a plain click. Defaults to true.",
        },
        {
          name: "ariaLabel",
          type: "string",
          description:
            "Accessible label for the brush overlay. Defaults to brush usage instructions.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "ChartsZoomControls",
      description:
        "Keyboard-operable zoom buttons (in, out, pan left, pan right, reset) for the shared zoom window.",
      props: [
        {
          name: "step",
          type: "number",
          description: "Fraction of the span to add or remove per zoom click. Defaults to 0.5.",
        },
        {
          name: "panStep",
          type: "number",
          description: "Fraction of the span to move per pan click. Defaults to 0.5.",
        },
        {
          name: "labels",
          type: "ChartsZoomControlsLabels",
          description: "Accessible labels for each button.",
        },
        {
          name: "class",
          type: "string",
          description: "Extra class for the button group.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "ChartsXAxis",
      description: "Renders the x axis ticks and labels below the plot area.",
      props: [
        {
          name: "tickFilter",
          type: "(label: string, index: number) => boolean",
          description: "Which category labels get a tick. Defaults to every label.",
        },
        {
          name: "formatTick",
          type: "(value: number, index: number) => string",
          description: "Tick label formatter.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "ScatterXAxis",
      description:
        "Numeric x axis for scatter charts, sharing the plot scale so labels match point positions.",
      props: [
        {
          name: "xDataKey",
          type: "string",
          description: "Dataset key for x values. Must match the plot. Defaults to the row index.",
        },
        {
          name: "tickCount",
          type: "number",
          description: "Approximate tick count. Defaults to 5.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "ChartsYAxis",
      description: "Renders the y axis ticks and labels left of the plot area.",
      props: [
        {
          name: "tickCount",
          type: "number",
          description: "Approximate tick count. Defaults to 5.",
        },
        {
          name: "formatTick",
          type: "(value: number, index: number) => string",
          description: "Tick label formatter. Defaults to grouped numbers.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "ChartsGrid",
      description: "Renders horizontal grid lines aligned to y ticks.",
      props: [
        {
          name: "horizontal",
          type: "boolean",
          description: "Draw horizontal lines at y ticks. Defaults to true.",
        },
        {
          name: "vertical",
          type: "boolean",
          description: "Draw vertical lines at category boundaries. Defaults to false.",
        },
        {
          name: "tickCount",
          type: "number",
          description: "Approximate y tick count for horizontal lines. Defaults to 5.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "ChartsTooltip",
      description:
        "Headless tooltip following highlight state. Accepts a render prop; the default renders a definition list.",
      props: [
        {
          name: "children",
          type: "(entry: { label: string; index: number; entries: TooltipEntry[] }) => JSX.Element",
          description: "Render prop for the highlighted row. Defaults to a definition list.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "CandlestickTooltip",
      description:
        "Headless tooltip rendering all four OHLC prices for the highlighted candle. Accepts a render prop.",
      props: [
        {
          name: "openKey",
          type: "string",
          description: "Dataset key for the open value. Defaults to open.",
        },
        {
          name: "highKey",
          type: "string",
          description: "Dataset key for the high value. Defaults to high.",
        },
        {
          name: "lowKey",
          type: "string",
          description: "Dataset key for the low value. Defaults to low.",
        },
        {
          name: "closeKey",
          type: "string",
          description: "Dataset key for the close value. Defaults to close.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
    {
      name: "ChartsLegend",
      description: "Renders a list of series with color swatches that toggle series visibility.",
      props: [
        {
          name: "onToggleSeries",
          type: "(seriesId: string, event: MouseEvent | KeyboardEvent) => void",
          description:
            "Called when a legend item is activated. Defaults to toggling the series visibility.",
        },
      ],
      dataAttributes: [],
      cssVariables: [],
    },
  ],
  examples: [],
  customApis: [],
  accessibility:
    'Charts render an `svg` with `role="img"` and textual `aria-label` summaries. Bars and points are individually focusable for keyboard inspection.',
  keyboard: [
    {
      keys: ["Tab"],
      description: "Moves focus through marks, legend toggles, and zoom controls.",
    },
    {
      keys: ["Enter", "Space"],
      description: "Activates the focused legend toggle or zoom control button.",
    },
    {
      keys: ["Escape"],
      description: "Cancels an in-progress brush drag, or resets the zoom when idle.",
    },
  ],
  notes: "",
};
