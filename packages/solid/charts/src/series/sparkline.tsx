import { Show, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { CurveFactory } from "d3-shape";
import {
  ChartContainer,
  ChartSurface,
  useChartContext,
  type ChartContainerProps,
  type ChartStore,
  type ResolvedSeries,
  type ScopedProps,
} from "../container";
import { useSeriesValues } from "../hooks";
import { AreaPlot, LinePlot, type CurveName } from "./lines";
import { useHighlight } from "../highlight";
import { ChartsTooltip } from "../tooltip";
import type { Scope } from "@solidix/context";

/** Props for {@link SparkLineChart}. */
export interface SparkLineChartProps extends ChartContainerProps {
  /** Fill the area under the line. Defaults to `false`. */
  area?: boolean | undefined;
  /**
   * d3 curve factory (or named shorthand) shaping the path. Defaults to
   * `"linear"`.
   */
  curve?: CurveFactory | CurveName | undefined;
  /** Stroke width in pixels for the line path. Defaults to `1.5`. */
  strokeWidth?: number | undefined;
  /** Area fill opacity. Defaults to `0.25`. */
  fillOpacity?: number | undefined;
  /** Render a dot on the last defined point. Defaults to `true`. */
  showEndDot?: boolean | undefined;
  /** Render a dot on the highlighted point. Defaults to `false`. */
  showHighlight?: boolean | undefined;
  /** Render headless tooltip content for the highlighted row. Defaults to `false`. */
  showTooltip?: boolean | undefined;
  /** Accessible name for the chart surface. */
  ariaLabel?: string | undefined;
  /** Plot children rendered after the series. */
  children?: JSX.Element | undefined;
}

/** Props for the internal end-dot renderer. */
interface SparkDotProps {
  /** Scope forwarded from the chart. */
  scope: Scope | undefined;
  /** Dot radius in pixels. */
  radius: number;
  /** Render at the highlighted row instead of the last row. */
  highlighted?: boolean | undefined;
}

/**
 * Dot projected onto the first visible series, either at the last defined
 * point or at the highlighted row. Returns nothing when there is no point.
 */
function SparkDot(props: SparkDotProps): JSX.Element {
  const store = useChartContext("SparkDot", props.scope);
  const resolved = useSeriesValues({ scope: props.scope });
  // Keep the hook object: destructuring `highlighted` would read the getter
  // once at setup (untracked and stale). Reading it inside `point()` tracks
  // because `point()` runs in the `Show` below.
  const highlightState = useHighlight({ scope: props.scope });
  const point = (): { cx: number; cy: number } | null => {
    const series: ResolvedSeries | undefined = resolved.series.find((s) => s.visible);
    if (!series) return null;
    const cells = resolved.values.get(series.id) ?? [];
    const target = props.highlighted ? highlightState.highlighted?.rowIndex : undefined;
    const index = target !== undefined && target !== null ? target : lastDefinedIndex(cells);
    if (index === null || index === undefined) return null;
    const value = cells[index]?.value;
    if (value === undefined) return null;
    return { cx: centerX(store, index), cy: store.y()(value) };
  };
  return (
    <Show when={point()}>
      {(p) => (
        <circle
          cx={p().cx}
          cy={p().cy}
          r={props.radius}
          fill={firstVisibleColor(resolved.series)}
          style={{ "pointer-events": "none" }}
        />
      )}
    </Show>
  );
}

/**
 * Compact single-glyph chart: line (and optional area) with tight margins,
 * an end dot, and optional highlight dot plus tooltip. No grid or axes.
 */
export const SparkLineChart: Component<ScopedProps<SparkLineChartProps>> = (rawProps) => {
  const containerProps = omit(
    rawProps,
    "__scopeCharts",
    "area",
    "curve",
    "strokeWidth",
    "fillOpacity",
    "showEndDot",
    "showHighlight",
    "showTooltip",
    "ariaLabel",
    "children",
  );
  const margin = (): SparkLineChartProps["margin"] => ({
    top: 4,
    right: 4,
    bottom: 4,
    left: 4,
    ...rawProps.margin,
  });
  const label = (): string =>
    rawProps.ariaLabel ?? `Sparkline chart with ${rawProps.dataset.length} points`;
  return (
    <ChartContainer {...containerProps} margin={margin()} __scopeCharts={rawProps.__scopeCharts}>
      <ChartSurface ariaLabel={label()} __scopeCharts={rawProps.__scopeCharts}>
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
          strokeWidth={rawProps.strokeWidth ?? 1.5}
          fillOpacity={rawProps.fillOpacity}
          __scopeCharts={rawProps.__scopeCharts}
        />
        {rawProps.showEndDot === false ? null : (
          <SparkDot radius={2.5} scope={rawProps.__scopeCharts} />
        )}
        {rawProps.showHighlight === true ? (
          <SparkDot radius={3} highlighted scope={rawProps.__scopeCharts} />
        ) : null}
        {rawProps.children}
      </ChartSurface>
      {rawProps.showTooltip === true ? (
        <ChartsTooltip __scopeCharts={rawProps.__scopeCharts} />
      ) : null}
    </ChartContainer>
  );
};

/**
 * X coordinate of a row center on the categorical scale, mirroring the line
 * series projection.
 */
function centerX(store: ChartStore, rowIndex: number): number {
  const xScale = store.x();
  return (xScale(store.labels()[rowIndex] ?? "") ?? 0) + xScale.bandwidth() / 2;
}

/** Index of the last cell with a defined value, or `null` when none exists. */
function lastDefinedIndex(cells: readonly { value: number | undefined }[]): number | null {
  for (let index = cells.length - 1; index >= 0; index -= 1) {
    if (cells[index]?.value !== undefined) return index;
  }
  return null;
}

/** Resolved color of the first visible series, or `"none"` when empty. */
function firstVisibleColor(series: readonly ResolvedSeries[]): string {
  return series.find((s) => s.visible)?.color ?? "none";
}
