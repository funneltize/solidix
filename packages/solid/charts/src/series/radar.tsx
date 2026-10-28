import { For, omit, Show } from "solid-js";
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

/** Props for {@link RadarSeriesShape}. */
export interface RadarSeriesShapeProps {
  /** Owning series id. */
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
  /** Outline color override. Defaults to the series palette color. */
  color?: string | undefined;
  /** Outline width in pixels. Defaults to `2`. */
  strokeWidth?: number | undefined;
  /** Whether the polygon interior is filled. Defaults to `true`. */
  showArea?: boolean | undefined;
  /** Area fill opacity. Defaults to `0.2`. */
  fillOpacity?: number | undefined;
  /** Dot radius in pixels. Defaults to `3`. */
  dotRadius?: number | undefined;
  /** Scope forwarded from the plot component. */
  scope: Scope | undefined;
}

/**
 * One radar series: the value polygon, its area fill, and one focusable
 * vertex dot per spoke. Dots drive store highlight, selection, and tooltip
 * anchoring, like other series marks.
 */
export function RadarSeriesShape(props: RadarSeriesShapeProps): JSX.Element {
  const store = useChartContext("RadarPlot", props.scope);
  const count = (): number => props.values.length;
  const color = (): string =>
    props.color ?? seriesColor(store.seriesById(props.seriesId) ?? {}, props.seriesIndex);
  const vertex = (index: number): { x: number; y: number } =>
    polarPoint(
      props.cx,
      props.cy,
      radialFraction(props.values[index] ?? 0, 0, props.max) * props.radius,
      angleForIndex(index, count()),
    );
  const polygonPoints = (): string =>
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
      <Show when={props.showArea ?? true}>
        <polygon
          points={polygonPoints()}
          fill={color()}
          fill-opacity={props.fillOpacity ?? 0.2}
          stroke="none"
          aria-hidden="true"
        />
      </Show>
      <polygon
        points={polygonPoints()}
        fill="none"
        stroke={color()}
        stroke-width={props.strokeWidth ?? 2}
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
                r={props.dotRadius ?? 3}
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

/** Props for {@link RadarPlot}. */
export interface RadarPlotProps {
  /** Value mapped to the outer ring. Defaults to the data maximum. */
  max?: number | undefined;
  /** Outer radius in plot pixels. Defaults to half the smaller plot edge. */
  radius?: number | undefined;
  /** Ring count for the background grid. Defaults to `4`. */
  levels?: number | undefined;
  /** Whether rings render as circles. Defaults to `false` (polygons). */
  circular?: boolean | undefined;
  /** Whether polygons fill their interior. Defaults to `true`. */
  showArea?: boolean | undefined;
  /** Area fill opacity. Defaults to `0.2`. */
  fillOpacity?: number | undefined;
  /** Series outline width in pixels. Defaults to `2`. */
  strokeWidth?: number | undefined;
  /** Vertex dot radius in pixels. Defaults to `3`. */
  dotRadius?: number | undefined;
}

/**
 * Radar plot: a radial grid with one spoke per dataset row plus a value
 * polygon per visible series. The container labels become spoke labels, so
 * each row is one metric and each series traces its values around the dial.
 */
export function RadarPlot(rawProps: ScopedProps<RadarPlotProps>): JSX.Element {
  const store = useChartContext("RadarPlot", rawProps.__scopeCharts);
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
        circular={rawProps.circular ?? false}
        labels={resolved.labels}
        labelOffset={14}
      />
      <For each={columns()}>
        {(column) => (
          <RadarSeriesShape
            seriesId={column.id}
            seriesIndex={column.index}
            values={column.values}
            max={max()}
            radius={geometry().radius}
            cx={geometry().cx}
            cy={geometry().cy}
            showArea={rawProps.showArea}
            fillOpacity={rawProps.fillOpacity}
            strokeWidth={rawProps.strokeWidth}
            dotRadius={rawProps.dotRadius}
            scope={rawProps.__scopeCharts}
          />
        )}
      </For>
    </g>
  );
}

/** Props for {@link RadarChart}. */
export interface RadarChartProps extends ChartContainerProps {
  /** Value mapped to the outer ring. Defaults to the data maximum. */
  max?: number | undefined;
  /** Outer radius in plot pixels. Defaults to half the smaller plot edge. */
  radius?: number | undefined;
  /** Ring count for the background grid. Defaults to `4`. */
  levels?: number | undefined;
  /** Whether rings render as circles. Defaults to `false` (polygons). */
  circular?: boolean | undefined;
  /** Whether polygons fill their interior. Defaults to `true`. */
  showArea?: boolean | undefined;
  /** Area fill opacity. Defaults to `0.2`. */
  fillOpacity?: number | undefined;
  /** Series outline width in pixels. Defaults to `2`. */
  strokeWidth?: number | undefined;
  /** Vertex dot radius in pixels. Defaults to `3`. */
  dotRadius?: number | undefined;
  /** Accessible name for the chart surface. */
  ariaLabel?: string | undefined;
  /** Plot children rendered after the series (overlays, annotations). */
  children?: JSX.Element | undefined;
}

/**
 * Composed radar chart: container, surface, radial grid, and one value
 * polygon per series. Add a legend and tooltip as children of the container.
 */
export function RadarChart(rawProps: ScopedProps<RadarChartProps>): JSX.Element {
  const containerProps = omit(
    rawProps,
    "__scopeCharts",
    "max",
    "radius",
    "levels",
    "circular",
    "showArea",
    "fillOpacity",
    "strokeWidth",
    "dotRadius",
    "ariaLabel",
    "children",
  );
  const label = (): string =>
    rawProps.ariaLabel ?? `Radar chart with ${(rawProps.dataset ?? []).length} metrics`;
  return (
    <ChartContainer {...containerProps} __scopeCharts={rawProps.__scopeCharts}>
      <ChartSurface ariaLabel={label()} __scopeCharts={rawProps.__scopeCharts}>
        <RadarPlot
          max={rawProps.max}
          radius={rawProps.radius}
          levels={rawProps.levels}
          circular={rawProps.circular}
          showArea={rawProps.showArea}
          fillOpacity={rawProps.fillOpacity}
          strokeWidth={rawProps.strokeWidth}
          dotRadius={rawProps.dotRadius}
          __scopeCharts={rawProps.__scopeCharts}
        />
        {rawProps.children}
      </ChartSurface>
    </ChartContainer>
  );
}
