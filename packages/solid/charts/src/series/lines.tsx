import { For, omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  area,
  curveBasis,
  curveBumpX,
  curveBumpY,
  curveCardinal,
  curveCatmullRom,
  curveLinear,
  curveMonotoneX,
  curveMonotoneY,
  curveNatural,
  curveStep,
  curveStepAfter,
  curveStepBefore,
  line,
  type CurveFactory,
} from "d3-shape";
import {
  ChartContainer,
  ChartSurface,
  useChartContext,
  type ChartContainerProps,
  type ResolvedSeries,
  type ScopedProps,
} from "../container";
import { ChartsGrid } from "../grid";
import { ChartsXAxis, ChartsYAxis } from "../axes";
import { useSeriesValues } from "../hooks";

/**
 * Named d3 curve shorthand for the `curve` prop. Maps to the d3-shape
 * factory of the same name with default settings; pass a configured
 * factory directly when you need custom tension, beta, or alpha.
 * `curveBundle` is deliberately absent: it is line-only and would break
 * `AreaPlot` at runtime.
 */
export type CurveName =
  | "basis"
  | "bumpX"
  | "bumpY"
  | "cardinal"
  | "catmullRom"
  | "linear"
  | "monotoneX"
  | "monotoneY"
  | "natural"
  | "step"
  | "stepAfter"
  | "stepBefore";

/** Named curves resolved to their d3-shape factories. */
const CURVE_FACTORIES: Record<CurveName, CurveFactory> = {
  basis: curveBasis,
  bumpX: curveBumpX,
  bumpY: curveBumpY,
  cardinal: curveCardinal,
  catmullRom: curveCatmullRom,
  linear: curveLinear,
  monotoneX: curveMonotoneX,
  monotoneY: curveMonotoneY,
  natural: curveNatural,
  step: curveStep,
  stepAfter: curveStepAfter,
  stepBefore: curveStepBefore,
};

/**
 * Resolve a `curve` prop to a d3 factory: names map to their d3-shape
 * factory, factories pass through, and `undefined` falls back to
 * `curveLinear`.
 *
 * @param curve Curve factory, curve name, or `undefined`.
 */
export function resolveCurve(curve: CurveFactory | CurveName | undefined): CurveFactory {
  if (curve === undefined) return curveLinear;
  if (typeof curve === "string") return CURVE_FACTORIES[curve];
  return curve;
}

/** Props shared by {@link LinePlot} and {@link AreaPlot}. */
export interface PlotProps {
  /**
   * d3 curve factory (or named shorthand) shaping the path. Defaults to
   * `"linear"`.
   */
  curve?: CurveFactory | CurveName | undefined;
  /** Stroke width in pixels for line paths. Defaults to `2`. */
  strokeWidth?: number | undefined;
  /** Area fill opacity. Defaults to `0.25`. Only used by {@link AreaPlot}. */
  fillOpacity?: number | undefined;
}

/** One plotted point in data coordinates. */
interface PlotPoint {
  /** Dataset row index. */
  rowIndex: number;
  /** Value in data units, or `undefined` for a gap. */
  value: number | undefined;
}

/**
 * Build a data-space point list for one series. Gap cells become
 * `{ value: undefined }` so d3 breaks the path there.
 */
function seriesPoints(
  seriesId: string,
  values: ReadonlyMap<string, ReadonlyArray<{ value: number | undefined }>>,
): readonly PlotPoint[] {
  const cells = values.get(seriesId) ?? [];
  return cells.map((cell, rowIndex) => ({ rowIndex, value: cell.value }));
}

/** Props for the internal per-series path renderer. */
interface SeriesPathProps {
  /** Series id to render. */
  seriesId: string;
  /** Which element to render. */
  kind: "line" | "area";
  /** d3 curve factory shaping the path. */
  curve: CurveFactory;
  /** Stroke width in pixels for line paths. */
  strokeWidth: number;
  /** Area fill opacity. */
  fillOpacity: number;
  /** Scope forwarded from the series component. */
  scope: Parameters<typeof useChartContext>[1];
}

/**
 * Render one series as a single SVG path. Points use band centers on the x
 * axis; gap rows break the path via d3 `defined`.
 */
function SeriesPath(props: SeriesPathProps): JSX.Element {
  const store = useChartContext("LinePlot", props.scope);
  const resolved = useSeriesValues({ scope: props.scope });
  const series = (): ResolvedSeries | undefined =>
    resolved.series.find((s) => s.id === props.seriesId);
  const d = (): string | null => {
    const s = series();
    if (!s || !s.visible) return null;
    const points = seriesPoints(s.id, resolved.values);
    const xScale = store.x();
    const y = store.y();
    const labels = store.labels();
    const project = (point: PlotPoint): readonly [number, number] => [
      (xScale(labels[point.rowIndex] ?? "") ?? 0) + xScale.bandwidth() / 2,
      y(point.value ?? 0),
    ];
    const defined = (point: PlotPoint): boolean =>
      point.value !== undefined && store.isRowVisible(point.rowIndex);
    if (props.kind === "area") {
      // Baseline at zero when the domain spans it, else clamped to the
      // domain edge: all-positive data would otherwise fill past the x axis
      // and below the plot.
      const domain = store.yDomain();
      const baseline = y(Math.min(Math.max(0, domain[0]), domain[1]));
      return (
        area<PlotPoint>()
          .x((point) => project(point)[0])
          .y0(baseline)
          .y1((point) => project(point)[1])
          .defined(defined)
          .curve(props.curve)(points as PlotPoint[]) ?? null
      );
    }
    return (
      line<PlotPoint>()
        .x((point) => project(point)[0])
        .y((point) => project(point)[1])
        .defined(defined)
        .curve(props.curve)(points as PlotPoint[]) ?? null
    );
  };
  return (
    <path
      d={d() ?? undefined}
      fill={props.kind === "area" ? (series()?.color ?? "none") : "none"}
      fill-opacity={props.kind === "area" ? props.fillOpacity : undefined}
      stroke={series()?.color ?? "none"}
      stroke-width={props.kind === "line" ? props.strokeWidth : 0}
      stroke-linejoin="round"
      stroke-linecap="round"
      style={{ "pointer-events": "none" }}
    />
  );
}

/**
 * Line series: one stroked `<path>` per visible series. Paths are decorative
 * (`pointer-events: none`); interaction belongs to overlay components.
 */
export function LinePlot(rawProps: ScopedProps<PlotProps>): JSX.Element {
  useChartContext("LinePlot", rawProps.__scopeCharts);
  const resolved = useSeriesValues({ scope: rawProps.__scopeCharts });
  const curve = (): CurveFactory => resolveCurve(rawProps.curve);
  const strokeWidth = (): number => rawProps.strokeWidth ?? 2;
  const fillOpacity = (): number => rawProps.fillOpacity ?? 0.25;
  return (
    <For each={resolved.series}>
      {(s) => (
        <SeriesPath
          seriesId={s.id}
          kind="line"
          curve={curve()}
          strokeWidth={strokeWidth()}
          fillOpacity={fillOpacity()}
          scope={rawProps.__scopeCharts}
        />
      )}
    </For>
  );
}

/**
 * Area series: one filled `<path>` per visible series, baselined at zero.
 * Paths are decorative (`pointer-events: none`).
 */
export function AreaPlot(rawProps: ScopedProps<PlotProps>): JSX.Element {
  useChartContext("AreaPlot", rawProps.__scopeCharts);
  const resolved = useSeriesValues({ scope: rawProps.__scopeCharts });
  const curve = (): CurveFactory => resolveCurve(rawProps.curve);
  const strokeWidth = (): number => rawProps.strokeWidth ?? 2;
  const fillOpacity = (): number => rawProps.fillOpacity ?? 0.25;
  return (
    <For each={resolved.series}>
      {(s) => (
        <SeriesPath
          seriesId={s.id}
          kind="area"
          curve={curve()}
          strokeWidth={strokeWidth()}
          fillOpacity={fillOpacity()}
          scope={rawProps.__scopeCharts}
        />
      )}
    </For>
  );
}

/** Props for {@link LineChart}. */
export interface LineChartProps extends ChartContainerProps {
  /** Fill series as areas in addition to stroking the line. Defaults to `false`. */
  area?: boolean | undefined;
  /**
   * d3 curve factory (or named shorthand) shaping the paths. Defaults to
   * `"linear"`.
   */
  curve?: CurveFactory | CurveName | undefined;
  /** Stroke width in pixels for line paths. Defaults to `2`. */
  strokeWidth?: number | undefined;
  /** Area fill opacity. Defaults to `0.25`. */
  fillOpacity?: number | undefined;
  /** Accessible name for the chart surface. */
  ariaLabel?: string | undefined;
  /** Plot children rendered after the series (axes overlays, annotations). */
  children?: JSX.Element | undefined;
}

/**
 * Composed line chart: container, surface, grid, line (and optional area)
 * series, and axes.
 */
export function LineChart(rawProps: ScopedProps<LineChartProps>): JSX.Element {
  const containerProps = omit(
    rawProps,
    "__scopeCharts",
    "area",
    "curve",
    "strokeWidth",
    "fillOpacity",
    "ariaLabel",
    "children",
  );
  const label = (): string =>
    rawProps.ariaLabel ?? `Line chart with ${(rawProps.series ?? []).length} series`;
  return (
    <ChartContainer {...containerProps} __scopeCharts={rawProps.__scopeCharts}>
      <ChartSurface ariaLabel={label()} __scopeCharts={rawProps.__scopeCharts}>
        <ChartsGrid __scopeCharts={rawProps.__scopeCharts} />
        {rawProps.area ? (
          <AreaPlot
            curve={rawProps.curve}
            strokeWidth={rawProps.strokeWidth}
            fillOpacity={rawProps.fillOpacity}
            __scopeCharts={rawProps.__scopeCharts}
          />
        ) : null}
        <LinePlot
          curve={rawProps.curve}
          strokeWidth={rawProps.strokeWidth}
          fillOpacity={rawProps.fillOpacity}
          __scopeCharts={rawProps.__scopeCharts}
        />
        <ChartsXAxis __scopeCharts={rawProps.__scopeCharts} />
        <ChartsYAxis __scopeCharts={rawProps.__scopeCharts} />
        {rawProps.children}
      </ChartSurface>
    </ChartContainer>
  );
}
