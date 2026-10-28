import { For, Show, omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { Scope } from "@solidix/context";
import {
  ChartContainer,
  ChartSurface,
  useChartContext,
  type ChartContainerProps,
  type ScopedProps,
} from "../container";
import { ChartsRadialGrid } from "../grid";
import { useSeriesValues } from "../hooks";
import { angleForIndex, polarPoint, radialFraction } from "../polar";
import { itemsEqual, seriesColor } from "../types";

/**
 * Build an annular sector path (a ring segment) centered at (`cx`, `cy`)
 * spanning from `startAngle` to `endAngle` in radians.
 *
 * @param cx Center x in plot pixels.
 * @param cy Center y in plot pixels.
 * @param innerRadius Inner edge radius in plot pixels.
 * @param outerRadius Outer edge radius in plot pixels.
 * @param startAngle Sector start angle in radians.
 * @param endAngle Sector end angle in radians.
 */
export function annularSectorPath(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  const outerStart = polarPoint(cx, cy, outerRadius, startAngle);
  const outerEnd = polarPoint(cx, cy, outerRadius, endAngle);
  const innerEnd = polarPoint(cx, cy, innerRadius, endAngle);
  const innerStart = polarPoint(cx, cy, innerRadius, startAngle);
  const large = endAngle - startAngle > Math.PI ? 1 : 0;
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${large} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

/** Props for {@link RadialBarPlot}. */
export interface RadialBarPlotProps {
  /** Value mapped to the outer radius. Defaults to the data maximum. */
  max?: number | undefined;
  /** Outer radius in plot pixels. Defaults to half the smaller plot edge. */
  radius?: number | undefined;
  /** Inner radius in plot pixels. Defaults to `0` (bars start at the center). */
  innerRadius?: number | undefined;
  /**
   * Bar angular width as a fraction of its slot, from `0` to `1`.
   * Defaults to `0.7`.
   */
  barWidth?: number | undefined;
  /** Ring count for the background grid. Defaults to `4`. */
  levels?: number | undefined;
  /** Whether rings render as circles. Defaults to `true`. */
  circular?: boolean | undefined;
}

/**
 * One radial bar: an annular sector that grows outward with the value.
 * Bars drive store highlight, selection, and tooltip anchoring, like
 * other series marks.
 */
function RadialBar(props: {
  /** Series id that owns the bar. */
  seriesId: string;
  /** Series index for palette resolution. */
  seriesIndex: number;
  /** Dataset row index. */
  rowIndex: number;
  /** Bar value; `undefined` renders a gap. */
  value: number | undefined;
  /** Value mapped to the outer radius. */
  max: number;
  /** Outer radius in plot pixels. */
  radius: number;
  /** Inner radius in plot pixels. */
  innerRadius: number;
  /** Sector start angle in radians. */
  startAngle: number;
  /** Sector end angle in radians. */
  endAngle: number;
  /** Center x in plot pixels. */
  cx: number;
  /** Center y in plot pixels. */
  cy: number;
  /** Scope forwarded from the plot component. */
  scope: Scope | undefined;
}): JSX.Element {
  const store = useChartContext("RadialBarPlot", props.scope);
  const color = (): string =>
    seriesColor(store.seriesById(props.seriesId) ?? {}, props.seriesIndex);
  const item = (): { seriesId: string; rowIndex: number } => ({
    seriesId: props.seriesId,
    rowIndex: props.rowIndex,
  });
  const dimmed = (): boolean => {
    const highlighted = store.highlighted();
    const selected = store.selected();
    if (highlighted === null && selected === null) return false;
    return !itemsEqual(highlighted, item()) && !itemsEqual(selected, item());
  };
  const barLabel = (): string => {
    const s = store.seriesById(props.seriesId);
    const formatted =
      props.value === undefined
        ? "no value"
        : s
          ? store.formatValue(props.value, s)
          : String(props.value);
    return `${s?.label ?? props.seriesId}: ${formatted}`;
  };
  const outer = (): number =>
    props.innerRadius +
    radialFraction(props.value ?? 0, 0, props.max) * (props.radius - props.innerRadius);
  return (
    <Show when={props.value !== undefined && (props.value ?? 0) > 0}>
      <path
        d={annularSectorPath(
          props.cx,
          props.cy,
          props.innerRadius,
          outer(),
          props.startAngle,
          props.endAngle,
        )}
        fill={color()}
        opacity={dimmed() ? 0.4 : 1}
        tabindex={0}
        role="img"
        aria-label={barLabel()}
        data-series-id={props.seriesId}
        data-row-index={props.rowIndex}
        style={{ cursor: "pointer", outline: "none" }}
        onPointerEnter={(event: PointerEvent) => {
          store.setHighlighted(item());
          store.setAnchor({ x: event.clientX, y: event.clientY });
        }}
        onPointerLeave={() => {
          store.setHighlighted(null);
          store.setAnchor(null);
        }}
        onFocus={() => store.setHighlighted(item())}
        onBlur={() => store.setHighlighted(null)}
        onClick={(event: MouseEvent) => store.clickItem(item(), event)}
      />
    </Show>
  );
}

/**
 * Radial bar plot: one annular sector per row per series over a radial
 * grid. Each dataset row owns an angular slot, split evenly across the
 * visible series like grouped bars, and each bar grows outward with value
 * from `innerRadius` toward `radius`.
 */
export function RadialBarPlot(rawProps: ScopedProps<RadialBarPlotProps>): JSX.Element {
  const store = useChartContext("RadialBarPlot", rawProps.__scopeCharts);
  const resolved = useSeriesValues({ scope: rawProps.__scopeCharts });
  const geometry = (): { cx: number; cy: number; radius: number } => {
    const cx = store.plotWidth() / 2;
    const cy = store.plotHeight() / 2;
    const radius = rawProps.radius ?? Math.min(store.plotWidth(), store.plotHeight()) / 2;
    return { cx, cy, radius };
  };
  const max = (): number => {
    if (rawProps.max !== undefined) return rawProps.max;
    let peak = 0;
    for (const column of resolved.values.values()) {
      for (const entry of column) {
        if (entry.value !== undefined && entry.value > peak) peak = entry.value;
      }
    }
    return peak > 0 ? peak : 1;
  };
  const innerRadius = (): number => rawProps.innerRadius ?? 0;
  const barWidth = (): number => {
    const fraction = rawProps.barWidth ?? 0.7;
    return Math.min(1, Math.max(0, fraction));
  };
  const bars = (): ReadonlyArray<{
    id: string;
    index: number;
    rowIndex: number;
    value: number | undefined;
    startAngle: number;
    endAngle: number;
  }> => {
    const count = resolved.labels.length;
    const series = resolved.series;
    if (count === 0 || series.length === 0) return [];
    const slot = (Math.PI * 2) / count;
    const subSlot = slot / series.length;
    const width = subSlot * barWidth();
    const rows: Array<{
      id: string;
      index: number;
      rowIndex: number;
      value: number | undefined;
      startAngle: number;
      endAngle: number;
    }> = [];
    series.forEach((s, seriesIndex) => {
      const column = resolved.values.get(s.id) ?? [];
      for (let rowIndex = 0; rowIndex < count; rowIndex += 1) {
        const center = angleForIndex(rowIndex, count) + seriesIndex * subSlot + subSlot / 2;
        rows.push({
          id: s.id,
          index: seriesIndex,
          rowIndex,
          value: column[rowIndex]?.value,
          startAngle: center - width / 2,
          endAngle: center + width / 2,
        });
      }
    });
    return rows;
  };
  return (
    <>
      <ChartsRadialGrid
        spokes={resolved.labels.length}
        rings={rawProps.levels ?? 4}
        radius={geometry().radius}
        cx={geometry().cx}
        cy={geometry().cy}
        circular={rawProps.circular ?? true}
        labels={resolved.labels}
        labelOffset={14}
      />
      <For each={bars()}>
        {(bar) => (
          <RadialBar
            seriesId={bar.id}
            seriesIndex={bar.index}
            rowIndex={bar.rowIndex}
            value={bar.value}
            max={max()}
            radius={geometry().radius}
            innerRadius={innerRadius()}
            startAngle={bar.startAngle}
            endAngle={bar.endAngle}
            cx={geometry().cx}
            cy={geometry().cy}
            scope={rawProps.__scopeCharts}
          />
        )}
      </For>
    </>
  );
}

/** Props for {@link RadialBarChart}. */
export interface RadialBarChartProps extends ChartContainerProps {
  /** Value mapped to the outer radius. Defaults to the data maximum. */
  max?: number | undefined;
  /** Outer radius in plot pixels. Defaults to half the smaller plot edge. */
  radius?: number | undefined;
  /** Inner radius in plot pixels. Defaults to `0` (bars start at the center). */
  innerRadius?: number | undefined;
  /**
   * Bar angular width as a fraction of its slot, from `0` to `1`.
   * Defaults to `0.7`.
   */
  barWidth?: number | undefined;
  /** Ring count for the background grid. Defaults to `4`. */
  levels?: number | undefined;
  /** Whether rings render as circles. Defaults to `true`. */
  circular?: boolean | undefined;
  /** Accessible name for the chart surface. */
  ariaLabel?: string | undefined;
  /** Plot children rendered after the series (overlays, annotations). */
  children?: JSX.Element | undefined;
}

/**
 * Composed radial bar chart: container, surface, radial grid, and one
 * outward-growing bar per row per series. Add a legend and tooltip as
 * children of the container.
 */
export function RadialBarChart(rawProps: ScopedProps<RadialBarChartProps>): JSX.Element {
  const containerProps = omit(
    rawProps,
    "__scopeCharts",
    "max",
    "radius",
    "innerRadius",
    "barWidth",
    "levels",
    "circular",
    "ariaLabel",
    "children",
  );
  const label = (): string =>
    rawProps.ariaLabel ?? `Radial bar chart with ${(rawProps.dataset ?? []).length} bars`;
  return (
    <ChartContainer {...containerProps} __scopeCharts={rawProps.__scopeCharts}>
      <ChartSurface ariaLabel={label()} __scopeCharts={rawProps.__scopeCharts}>
        <RadialBarPlot
          max={rawProps.max}
          radius={rawProps.radius}
          innerRadius={rawProps.innerRadius}
          barWidth={rawProps.barWidth}
          levels={rawProps.levels}
          circular={rawProps.circular}
          __scopeCharts={rawProps.__scopeCharts}
        />
        {rawProps.children}
      </ChartSurface>
    </ChartContainer>
  );
}

/** Props for {@link RadialLinePlot}. */
export interface RadialLinePlotProps {
  /** Value mapped to the outer ring. Defaults to the data maximum. */
  max?: number | undefined;
  /** Outer radius in plot pixels. Defaults to half the smaller plot edge. */
  radius?: number | undefined;
  /** Ring count for the background grid. Defaults to `4`. */
  levels?: number | undefined;
  /** Whether rings render as circles. Defaults to `true`. */
  circular?: boolean | undefined;
  /** Series stroke width in pixels. Defaults to `2`. */
  strokeWidth?: number | undefined;
  /** Vertex dot radius in pixels. Defaults to `3`. */
  dotRadius?: number | undefined;
}

/**
 * One radial line series: a closed stroke through the per-spoke values
 * plus one focusable vertex dot per spoke. Dots drive store highlight,
 * selection, and tooltip anchoring, like other series marks.
 */
function RadialLineSeriesShape(props: {
  /** Series id that owns the line. */
  seriesId: string;
  /** Series index for palette resolution. */
  seriesIndex: number;
  /** Resolved values in spoke order, with gaps for missing cells. */
  values: ReadonlyArray<number | undefined>;
  /** Value mapped to the outer ring. */
  max: number;
  /** Outer radius in plot pixels. */
  radius: number;
  /** Center x in plot pixels. */
  cx: number;
  /** Center y in plot pixels. */
  cy: number;
  /** Series stroke width in pixels. */
  strokeWidth: number;
  /** Vertex dot radius in pixels. */
  dotRadius: number;
  /** Scope forwarded from the plot component. */
  scope: Scope | undefined;
}): JSX.Element {
  const store = useChartContext("RadialLinePlot", props.scope);
  const count = (): number => props.values.length;
  const color = (): string =>
    seriesColor(store.seriesById(props.seriesId) ?? {}, props.seriesIndex);
  const vertex = (index: number): { x: number; y: number } =>
    polarPoint(
      props.cx,
      props.cy,
      radialFraction(props.values[index] ?? 0, 0, props.max) * props.radius,
      angleForIndex(index, count()),
    );
  const linePoints = (): string =>
    props.values
      .map((_, index) => {
        const point = vertex(index);
        return `${point.x},${point.y}`;
      })
      .join(" ");
  const dot = (index: number): { seriesId: string; rowIndex: number } => ({
    seriesId: props.seriesId,
    rowIndex: index,
  });
  const dimmed = (index: number): boolean => {
    const highlighted = store.highlighted();
    const selected = store.selected();
    if (highlighted === null && selected === null) return false;
    return !itemsEqual(highlighted, dot(index)) && !itemsEqual(selected, dot(index));
  };
  const dotLabel = (index: number): string => {
    const s = store.seriesById(props.seriesId);
    const value = props.values[index];
    const formatted =
      value === undefined ? "no value" : s ? store.formatValue(value, s) : String(value);
    return `${s?.label ?? props.seriesId}: ${formatted}`;
  };
  return (
    <g data-series-id={props.seriesId}>
      <polygon
        points={linePoints()}
        fill="none"
        stroke={color()}
        stroke-width={props.strokeWidth}
        stroke-linejoin="round"
        aria-hidden="true"
      />
      <For each={props.values}>
        {(value, index) => {
          const point = (): { x: number; y: number } => vertex(index());
          return (
            <Show when={value !== undefined}>
              <circle
                cx={point().x}
                cy={point().y}
                r={props.dotRadius}
                fill={color()}
                opacity={dimmed(index()) ? 0.4 : 1}
                tabindex={0}
                role="img"
                aria-label={dotLabel(index())}
                data-series-id={props.seriesId}
                data-row-index={index()}
                style={{ cursor: "pointer", outline: "none" }}
                onPointerEnter={(event: PointerEvent) => {
                  store.setHighlighted(dot(index()));
                  store.setAnchor({ x: event.clientX, y: event.clientY });
                }}
                onPointerLeave={() => {
                  store.setHighlighted(null);
                  store.setAnchor(null);
                }}
                onFocus={() => store.setHighlighted(dot(index()))}
                onBlur={() => store.setHighlighted(null)}
                onClick={(event: MouseEvent) => store.clickItem(dot(index()), event)}
              />
            </Show>
          );
        }}
      </For>
    </g>
  );
}

/**
 * Radial line plot: a closed stroke per visible series through the
 * per-spoke values, over a circular radial grid. The container labels
 * become spoke labels, so each row is one metric and each series traces
 * its values around the dial.
 */
export function RadialLinePlot(rawProps: ScopedProps<RadialLinePlotProps>): JSX.Element {
  const store = useChartContext("RadialLinePlot", rawProps.__scopeCharts);
  const resolved = useSeriesValues({ scope: rawProps.__scopeCharts });
  const geometry = (): { cx: number; cy: number; radius: number } => {
    const cx = store.plotWidth() / 2;
    const cy = store.plotHeight() / 2;
    const radius = rawProps.radius ?? Math.min(store.plotWidth(), store.plotHeight()) / 2;
    return { cx, cy, radius };
  };
  const max = (): number => {
    if (rawProps.max !== undefined) return rawProps.max;
    let peak = 0;
    for (const column of resolved.values.values()) {
      for (const entry of column) {
        if (entry.value !== undefined && entry.value > peak) peak = entry.value;
      }
    }
    return peak > 0 ? peak : 1;
  };
  const columns = (): ReadonlyArray<{
    id: string;
    index: number;
    values: ReadonlyArray<number | undefined>;
  }> =>
    resolved.series.map((s, index) => ({
      id: s.id,
      index,
      values: (resolved.values.get(s.id) ?? []).map((entry) => entry.value),
    }));
  return (
    <g>
      <ChartsRadialGrid
        spokes={resolved.labels.length}
        rings={rawProps.levels ?? 4}
        radius={geometry().radius}
        cx={geometry().cx}
        cy={geometry().cy}
        circular={rawProps.circular ?? true}
        labels={resolved.labels}
        labelOffset={14}
      />
      <For each={columns()}>
        {(column) => (
          <RadialLineSeriesShape
            seriesId={column.id}
            seriesIndex={column.index}
            values={column.values}
            max={max()}
            radius={geometry().radius}
            cx={geometry().cx}
            cy={geometry().cy}
            strokeWidth={rawProps.strokeWidth ?? 2}
            dotRadius={rawProps.dotRadius ?? 3}
            scope={rawProps.__scopeCharts}
          />
        )}
      </For>
    </g>
  );
}

/** Props for {@link RadialLineChart}. */
export interface RadialLineChartProps extends ChartContainerProps {
  /** Value mapped to the outer ring. Defaults to the data maximum. */
  max?: number | undefined;
  /** Outer radius in plot pixels. Defaults to half the smaller plot edge. */
  radius?: number | undefined;
  /** Ring count for the background grid. Defaults to `4`. */
  levels?: number | undefined;
  /** Whether rings render as circles. Defaults to `true`. */
  circular?: boolean | undefined;
  /** Series stroke width in pixels. Defaults to `2`. */
  strokeWidth?: number | undefined;
  /** Vertex dot radius in pixels. Defaults to `3`. */
  dotRadius?: number | undefined;
  /** Accessible name for the chart surface. */
  ariaLabel?: string | undefined;
  /** Plot children rendered after the series (overlays, annotations). */
  children?: JSX.Element | undefined;
}

/**
 * Composed radial line chart: container, surface, circular radial grid,
 * and one closed value line per series. Add a legend and tooltip as
 * children of the container.
 */
export function RadialLineChart(rawProps: ScopedProps<RadialLineChartProps>): JSX.Element {
  const containerProps = omit(
    rawProps,
    "__scopeCharts",
    "max",
    "radius",
    "levels",
    "circular",
    "strokeWidth",
    "dotRadius",
    "ariaLabel",
    "children",
  );
  const label = (): string =>
    rawProps.ariaLabel ?? `Radial line chart with ${(rawProps.dataset ?? []).length} metrics`;
  return (
    <ChartContainer {...containerProps} __scopeCharts={rawProps.__scopeCharts}>
      <ChartSurface ariaLabel={label()} __scopeCharts={rawProps.__scopeCharts}>
        <RadialLinePlot
          max={rawProps.max}
          radius={rawProps.radius}
          levels={rawProps.levels}
          circular={rawProps.circular}
          strokeWidth={rawProps.strokeWidth}
          dotRadius={rawProps.dotRadius}
          __scopeCharts={rawProps.__scopeCharts}
        />
        {rawProps.children}
      </ChartSurface>
    </ChartContainer>
  );
}
