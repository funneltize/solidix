import { For, createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { Scope } from "@solidix/context";
import type { ScaleLinear } from "d3-scale";
import {
  ChartContainer,
  ChartSurface,
  useChartContext,
  type ChartContainerProps,
  type ScopedProps,
} from "../container";
import { ChartsYAxis } from "../axes";
import { ChartsGrid } from "../grid";
import { useSeriesValues } from "../hooks";
import { createLinearScale, normalizeDomain } from "../scales";
import { formatNumber } from "../format";
import { itemsEqual, seriesColor, toNumber } from "../types";

/** One scatter point: dataset row position plus its numeric coordinates. */
interface ScatterPoint {
  /** Dataset row index. */
  rowIndex: number;
  /** X coordinate in data units. */
  x: number;
  /** Y coordinate in data units. */
  y: number;
}

/** Options for {@link useScatterXScale}. */
export interface UseScatterXScaleOptions {
  /**
   * Dataset field x values are read from. Defaults to the row index, so a
   * plain value series still scatters left to right.
   */
  xDataKey?: string | undefined;
  /** Scope forwarded from the consuming component. */
  scope?: Scope | undefined;
}

/**
 * Shared numeric x scale for scatter plots and their axis: linear over the
 * x extent of the plotted points (rows with a numeric x and y), narrowed to
 * the zoom window. Using one hook for both keeps points and ticks aligned.
 */
export function useScatterXScale(options: UseScatterXScaleOptions = {}): {
  /** Visible x domain in data units, zoom window applied. */
  domain: readonly [number, number];
  /** Linear scale mapping x values to plot pixels. */
  scale: ScaleLinear<number, number>;
  /** X tick values from the scale. */
  ticks: (count?: number | undefined) => number[];
} {
  const store = useChartContext("useScatterXScale", options.scope);
  const resolved = useSeriesValues({ scope: options.scope });
  const computed = createMemo(() => {
    const dataset = store.dataset();
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const s of resolved.series) {
      const column = resolved.values.get(s.id) ?? [];
      column.forEach((cell, rowIndex) => {
        if (cell.value === undefined) return;
        const x =
          options.xDataKey === undefined
            ? rowIndex
            : toNumber(dataset[rowIndex]?.[options.xDataKey]);
        if (x === undefined) return;
        if (x < min) min = x;
        if (x > max) max = x;
      });
    }
    const full = normalizeDomain(
      min === Number.POSITIVE_INFINITY ? ([0, 1] as const) : ([min, max] as const),
    );
    const window = store.zoom();
    const domain =
      window === null
        ? full
        : normalizeDomain([
            full[0] + (full[1] - full[0]) * window.start,
            full[0] + (full[1] - full[0]) * window.end,
          ]);
    const scale = createLinearScale({ domain, range: [0, store.plotWidth()] });
    return { domain, scale };
  });
  return {
    get domain() {
      return computed().domain;
    },
    get scale() {
      return computed().scale;
    },
    ticks: (count) => computed().scale.ticks(count ?? 5),
  };
}

/** Props for {@link ScatterPlot}. */
export interface ScatterPlotProps {
  /**
   * Dataset field this plot reads x values from. Defaults to the row index,
   * so a plain value series still scatters left to right.
   */
  xDataKey?: string | undefined;
  /** Point radius in pixels. Defaults to `4`. */
  radius?: number | undefined;
}

/**
 * Scatter points for every visible series: one circle per dataset row with a
 * numeric x and y. The y position reuses the store y scale; the x scale comes
 * from {@link useScatterXScale}, shared with {@link ScatterXAxis}. Points are
 * focusable and drive store highlight, selection, and tooltip anchoring.
 */
export function ScatterPlot(rawProps: ScopedProps<ScatterPlotProps>): JSX.Element {
  const store = useChartContext("ScatterPlot", rawProps.__scopeCharts);
  const resolved = useSeriesValues({ scope: rawProps.__scopeCharts });
  const x = useScatterXScale({ xDataKey: rawProps.xDataKey, scope: rawProps.__scopeCharts });
  const points = (): ReadonlyArray<{ seriesId: string; point: ScatterPoint }> => {
    const dataset = store.dataset();
    const out: Array<{ seriesId: string; point: ScatterPoint }> = [];
    for (const s of resolved.series) {
      const column = resolved.values.get(s.id) ?? [];
      column.forEach((resolved, rowIndex) => {
        const y = resolved.value;
        const xValue =
          rawProps.xDataKey === undefined
            ? rowIndex
            : toNumber(dataset[rowIndex]?.[rawProps.xDataKey]);
        if (xValue === undefined || y === undefined) return;
        out.push({ seriesId: s.id, point: { rowIndex, x: xValue, y } });
      });
    }
    return out;
  };
  const visiblePoints = (): ReadonlyArray<{ seriesId: string; point: ScatterPoint }> => {
    const [lo, hi] = x.domain;
    return points().filter((entry) => entry.point.x >= lo && entry.point.x <= hi);
  };
  return (
    <g>
      <For each={visiblePoints()}>
        {(entry) => (
          <ScatterDot
            seriesId={entry.seriesId}
            point={entry.point}
            cx={x.scale(entry.point.x)}
            cy={store.y()(entry.point.y)}
            radius={rawProps.radius ?? 4}
            seriesIndex={resolved.series.findIndex((s) => s.id === entry.seriesId)}
            scope={rawProps.__scopeCharts}
          />
        )}
      </For>
    </g>
  );
}

/** Props for one scatter point. */
interface ScatterDotProps {
  /** Owning series id. */
  seriesId: string;
  /** Point coordinates and row index. */
  point: ScatterPoint;
  /** X position in plot pixels. */
  cx: number;
  /** Y position in plot pixels. */
  cy: number;
  /** Point radius in pixels. */
  radius: number;
  /** Series index for palette resolution. */
  seriesIndex: number;
  /** Scope forwarded from the plot component. */
  scope: Scope | undefined;
}

/**
 * One focusable scatter point. Highlight follows pointer and keyboard focus;
 * activation toggles selection through the store.
 */
function ScatterDot(props: ScatterDotProps): JSX.Element {
  const store = useChartContext("ScatterPlot", props.scope);
  const item = (): { seriesId: string; rowIndex: number } => ({
    seriesId: props.seriesId,
    rowIndex: props.point.rowIndex,
  });
  const dimmed = (): boolean => {
    const highlighted = store.highlighted();
    const selected = store.selected();
    if (highlighted === null && selected === null) return false;
    return !itemsEqual(highlighted, item()) && !itemsEqual(selected, item());
  };
  const label = (): string => {
    const s = store.seriesById(props.seriesId);
    const name = s?.label ?? props.seriesId;
    const x = s ? store.formatValue(props.point.x, s) : String(props.point.x);
    const y = s ? store.formatValue(props.point.y, s) : String(props.point.y);
    return `${name}: (${x}, ${y})`;
  };
  return (
    <circle
      cx={props.cx}
      cy={props.cy}
      r={props.radius}
      fill={seriesColor(
        store.seriesById(props.seriesId) ?? { color: undefined, colorIndex: undefined },
        props.seriesIndex,
      )}
      opacity={dimmed() ? 0.4 : 1}
      tabindex={0}
      role="img"
      aria-label={label()}
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
  );
}

/** Props for {@link ScatterXAxis}. */
export interface ScatterXAxisProps extends JSX.SvgSVGAttributes<SVGGElement> {
  /**
   * Dataset field x values are read from. Must match the plot's `xDataKey`;
   * defaults to the row index like the plot.
   */
  xDataKey?: string | undefined;
  /** Approximate tick count. Defaults to `5`. */
  tickCount?: number | undefined;
  /** Tick label formatter. Defaults to grouped numbers. */
  formatTick?: ((value: number, index: number) => string) | undefined;
}

/**
 * Bottom numeric axis for scatter charts: ticks from the shared
 * {@link useScatterXScale} domain, so labels always match point positions.
 * Rendered inside the plot group, so coordinates are plot-relative.
 */
export const ScatterXAxis: Component<ScopedProps<ScatterXAxisProps>> = (props) => {
  const rest = omit(props, "__scopeCharts", "xDataKey", "tickCount", "formatTick", "children");
  const store = useChartContext("ScatterXAxis", props.__scopeCharts);
  const x = useScatterXScale({ xDataKey: props.xDataKey, scope: props.__scopeCharts });
  return (
    <g aria-hidden="true" {...(rest as JSX.SvgSVGAttributes<SVGGElement>)}>
      <line
        x1={0}
        x2={store.plotWidth()}
        y1={store.plotHeight()}
        y2={store.plotHeight()}
        stroke="currentColor"
      />
      <For each={x.ticks(props.tickCount)}>
        {(tick, index) => (
          <text
            x={x.scale(tick)}
            y={store.plotHeight() + 14}
            text-anchor="middle"
            font-size="11"
            fill="currentColor"
          >
            {props.formatTick ? props.formatTick(tick, index()) : formatNumber(tick)}
          </text>
        )}
      </For>
    </g>
  );
};

/** Props for {@link ScatterChart}. */
export interface ScatterChartProps extends ChartContainerProps {
  /**
   * Dataset field the plot reads x values from. Defaults to the row index.
   */
  xDataKey?: string | undefined;
  /** Point radius in pixels. Defaults to `4`. */
  radius?: number | undefined;
  /** Accessible name for the chart surface. */
  ariaLabel?: string | undefined;
  /** Plot children rendered after the points (overlays, annotations). */
  children?: JSX.Element | undefined;
}

/**
 * Composed scatter chart: container, surface, grid, numeric x axis, y axis,
 * and scatter points. Points and the x axis share
 * {@link useScatterXScale}, so labels always match positions; add a legend
 * and tooltip as children of the container.
 */
export function ScatterChart(rawProps: ScopedProps<ScatterChartProps>): JSX.Element {
  const containerProps = omit(
    rawProps,
    "__scopeCharts",
    "xDataKey",
    "radius",
    "ariaLabel",
    "children",
  );
  const label = (): string =>
    rawProps.ariaLabel ?? `Scatter chart with ${(rawProps.dataset ?? []).length} points`;
  return (
    <ChartContainer {...containerProps} __scopeCharts={rawProps.__scopeCharts}>
      <ChartSurface ariaLabel={label()} __scopeCharts={rawProps.__scopeCharts}>
        <ChartsGrid __scopeCharts={rawProps.__scopeCharts} />
        <ChartsYAxis __scopeCharts={rawProps.__scopeCharts} />
        <ScatterPlot
          xDataKey={rawProps.xDataKey}
          radius={rawProps.radius}
          __scopeCharts={rawProps.__scopeCharts}
        />
        <ScatterXAxis xDataKey={rawProps.xDataKey} __scopeCharts={rawProps.__scopeCharts} />
        {rawProps.children}
      </ChartSurface>
    </ChartContainer>
  );
}
