# Charts

`@solidix/charts` renders unstyled, accessible SVG charts with a headless
API: you bring the stylesheet, the primitives bring scales, geometry,
interaction state, and accessibility wiring. There are two layers: all-in-one
charts for the common case, and composable plots for custom work.

## A first chart

Every cartesian chart takes a dataset (one object per category), series
descriptors that name their value field, and an explicit size:

```tsx
import { BarChart } from "@solidix/charts";

const dataset = [
  { label: "Q1", revenue: 120, profit: 30 },
  { label: "Q2", revenue: 150, profit: 45 },
  { label: "Q3", revenue: 90, profit: 60 },
];

<BarChart
  width={480}
  height={300}
  dataset={dataset}
  series={[
    { id: "revenue", label: "Revenue", valueKey: "revenue" },
    { id: "profit", label: "Profit", valueKey: "profit" },
  ]}
/>;
```

Category labels come from each row's `label` field by default; point
`labelKey` at another field, or pass a `label` render function, to change
that. Rows with a missing value render a gap: lines break there, and other
series skip the cell.

The all-in-one set covers `BarChart`, `LineChart`, `PieChart`,
`ScatterChart`, `SparkLineChart`, `Gauge`, `RadarChart`,
`RadialBarChart`, `RadialLineChart`, `CandlestickChart`, `ChartsHeatmap`,
`ChartsFunnelChart`, and `ChartsSankeyChart`. Each renders its container,
surface, grid, plots, and axes in one element.

## Composing custom charts

For mixed series or custom chrome, compose the parts directly. The tooltip
and legend are HTML, so they render as siblings of the SVG surface:

```tsx
import {
  ChartContainer,
  ChartsLegend,
  ChartsTooltip,
  ChartSurface,
  ChartsXAxis,
  ChartsYAxis,
  LinePlot,
} from "@solidix/charts";

<ChartContainer width={480} height={300} dataset={dataset} series={series}>
  <ChartSurface ariaLabel="Revenue by quarter">
    <LinePlot curve="monotoneX" />
    <ChartsXAxis />
    <ChartsYAxis />
  </ChartSurface>
  <ChartsLegend />
  <ChartsTooltip />
</ChartContainer>;
```

`Bars`, `LinePlot`, `AreaPlot`, `PiePlot`, `ScatterPlot`, `Candlesticks`,
and the polar plots all read the same store, so they can be mixed freely
inside one surface.

## Line curves

Line, area, and sparkline paths take a d3 curve factory or a named
shorthand (`"linear"`, `"monotoneX"`, `"monotoneY"`, `"natural"`,
`"step"`, `"stepBefore"`, `"stepAfter"`, `"basis"`,
`"cardinal"`, `"catmullRom"`, `"bumpX"`, `"bumpY"`). Names map to the
d3-shape factory with default settings; pass a configured factory for
custom tension, beta, or alpha:

```tsx
<LineChart curve="monotoneX" width={480} height={300} dataset={dataset} series={series} />
```

## Scatter axes

Scatter points position by numeric x values (`xDataKey`, defaulting to
the row index) over a linear extent. `ScatterChart` renders the matching
numeric `ScatterXAxis` automatically; when composing manually, add
`ScatterXAxis` with the same `xDataKey` so labels match point positions.
The `useScatterXScale` hook exposes the shared scale for custom layers.

## Tooltips

`ChartsTooltip` renders the highlighted row as a definition list: one
entry per visible series. Pass a render prop to take over the content:

```tsx
<ChartsTooltip>
  {(entry) => (
    <p>
      {entry.label}: {entry.entries[0]?.value}
    </p>
  )}
</ChartsTooltip>
```

Candlestick charts pair with `CandlestickTooltip` instead: the generic
tooltip only sees the synthetic close-price series, while the candle
tooltip renders all four OHLC prices for the highlighted row.

## Gauges

`Gauge` is standalone (no container): a `value` between `min` and `max`
announced as a `meter`. The default `arc` variant renders track and value
arcs with an optional needle; `variant="bar"` renders a linear meter,
horizontal by default or vertical with `orientation="vertical"`.

## Zoom, pan, and brush

Cartesian charts share a fractional zoom window on the container
(`zoom`, `defaultZoom`, `onZoomChange`): bars, lines, scatter points,
and axes follow it automatically. `ChartsBrush` turns a pointer drag
into a window, and `ChartsZoomControls` provides the keyboard path
(zoom in and out, pan, reset).

## Styling

Charts ship unstyled. Marks carry `data-chart`, `data-series`,
`data-index`, and `data-state` attributes for styling hooks, and series
colors resolve through `--sx-color-N` CSS variables with built-in
fallbacks, so one variable override re-palettes every chart:

```css
.my-dashboard {
  --sx-color-1: #0e7490;
  --sx-color-2: #be123c;
}
```

## Motion

Charts render instantly; entrances are consumer CSS. Every focusable mark
carries `tabindex="0"`, so one rule fades all marks in, bars grow from the
baseline, and dots pop from their centers, all on spring easings from
`@solidix/motion/springs.css` (vendor the file; the `ease` fallbacks below
cover engines without `linear()`):

```css
@keyframes charts-enter-fade {
  from {
    opacity: 0;
  }
}

@keyframes charts-enter-grow {
  from {
    opacity: 0;
    transform: scaleY(0);
  }
}

.my-chart svg [tabindex="0"] {
  animation: charts-enter-fade 320ms ease backwards;
  animation-timing-function: var(--solidix-spring-default, ease);
}

.my-chart svg rect[role="img"] {
  transform-box: fill-box;
  transform-origin: bottom;
  animation-name: charts-enter-grow;
  animation-timing-function: var(--solidix-spring-snappy, ease);
}
```

`transform-box: fill-box` is load-bearing: without it `scaleY` collapses
toward the SVG origin instead of the mark. Stagger the cascade with
`nth-of-type` delay ladders (extend to your mark count), and leave the
tooltip out: it remounts on every highlight move, so an entrance would
replay constantly. Keyframes run once per mount, so highlight dimming and
legend toggles stay instant; pair everything with the reduced-motion guard
from the [Animation guide](./animation.md). The gallery demo applies the
full recipe, including dots, decorative paths, and the legend.

## Accessibility

Marks are focusable with per-mark labels (`"Revenue, Q2: 150"`), and
keyboard focus drives the same highlight state as hover, so tooltips work
without a pointer. Surfaces take an accessible name via `ariaLabel`, and
gauges use native `meter` semantics with min, max, and current values.

Each chart's props, parts, and data attributes are listed in the
[Charts API reference](#/charts).
