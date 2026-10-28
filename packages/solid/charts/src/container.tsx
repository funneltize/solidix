import { createMemo, createSignal, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createContextScope, type Scope } from "@solidix/context";
import { Primitive, type PrimitivePropsWithRef } from "@solidix/primitive";
import { useControllableState } from "@solidix/use-controllable-state";
import { useId } from "@solidix/id";
import {
  DEFAULT_LABEL_KEY,
  DEFAULT_MARGIN,
  cellValue,
  itemsEqual,
  rowLabel,
  seriesColor,
  toNumber,
  type ChartItemRef,
  type ChartMargin,
  type Dataset,
  type Datum,
  type SeriesDescriptor,
} from "./types";
import { createBandScale, createLinearScale, createPointScale } from "./scales";
import { formatNumber } from "./format";

/** Scope name shared by every charts primitive. */
const CHART_NAME = "Charts";

/** Props accepted by every scoped charts component. */
export type ScopedProps<P> = P & { __scopeCharts?: Scope | undefined };

const [createChartContext, createChartScope] = createContextScope(CHART_NAME);

/** Create a scope that isolates one chart subtree from the default context. */
export { createChartScope };

/**
 * A categorical scale along the plot area: d3 band and point scales share
 * this callable surface, so series components work with either.
 */
export interface CategoryScale {
  /** Pixel offset of a category, or `undefined` outside the domain. */
  (label: string): number | undefined;
  /** Width of one band (`0` for point scales). */
  bandwidth(): number;
  /** Category domain in display order. */
  domain(): readonly string[];
  /** Distance between adjacent band starts. */
  step(): number;
}

/**
 * A fractional window over the x domain: `start` and `end` are fractions of
 * the full domain (`0` to `1`). `null` means the whole domain is visible.
 */
export interface ZoomWindow {
  /** Fraction where the visible window starts. */
  start: number;
  /** Fraction where the visible window ends. */
  end: number;
}

/**
 * Normalize a zoom window: sort the bounds and clamp them to `0` - `1`.
 * A window covering the full domain is returned unchanged; use `null` for
 * the unzoomed state.
 */
export function clampZoomWindow(window: ZoomWindow): ZoomWindow {
  const start = Math.min(window.start, window.end);
  const end = Math.max(window.start, window.end);
  return { start: Math.min(1, Math.max(0, start)), end: Math.min(1, Math.max(0, end)) };
}

/**
 * A series descriptor resolved against the dataset: palette color, position,
 * and legend visibility.
 */
export type ResolvedSeries = Omit<SeriesDescriptor, "color" | "colorIndex"> & {
  /** Index of the series in the container `series` prop. */
  index: number;
  /** Resolved CSS color: explicit override or palette slot. */
  color: string;
  /** Whether the series is currently drawn and listed. */
  visible: boolean;
};

/** Format a cell value for tooltip and label output. */
export type FormatValue = (value: number | undefined, series: ResolvedSeries) => string;

/** Default value formatter: grouped number, or a dash for gaps. */
export function defaultFormatValue(value: number | undefined): string {
  return value === undefined ? "-" : formatNumber(value);
}

/**
 * The chart store: dataset, resolved series, scales, geometry, and the
 * shared highlight / selection / tooltip-anchor state. Every charts
 * primitive reads the store through {@link useChartStore}.
 */
export interface ChartStore {
  /** Stable id for this chart instance. */
  chartId: string;
  /** Dataset rows in render order. */
  dataset: () => Dataset;
  /** Category label per dataset row. */
  labels: () => readonly string[];
  /** Resolved series in `series` prop order. */
  series: () => readonly ResolvedSeries[];
  /** Find a resolved series by id. */
  seriesById: (id: string) => ResolvedSeries | undefined;
  /** Categorical x scale over the plot width. */
  x: () => CategoryScale;
  /** Linear y scale mapping data values to plot pixels. */
  y: () => (value: number) => number;
  /** Data domain of the y scale. */
  yDomain: () => readonly [number, number];
  /** Y tick values from the scale. */
  yTicks: (count?: number | undefined) => number[];
  /** Plot width: surface width minus horizontal margins. */
  plotWidth: () => number;
  /** Plot height: surface height minus vertical margins. */
  plotHeight: () => number;
  /** Resolved margins. */
  margin: () => ChartMargin;
  /** Currently highlighted item, or `null`. */
  highlighted: () => ChartItemRef | null;
  /** Set the highlighted item. */
  setHighlighted: (next: ChartItemRef | null) => void;
  /** Currently selected item, or `null`. */
  selected: () => ChartItemRef | null;
  /** Activate an item: toggle selection and notify `onItemClick`. */
  clickItem: (item: ChartItemRef | null, event: MouseEvent) => void;
  /** Whether a series is hidden through the legend. */
  isHidden: (seriesId: string) => boolean;
  /** Toggle legend visibility of a series. */
  toggleSeries: (seriesId: string) => void;
  /** Viewport anchor for the tooltip, or `null` when closed. */
  anchor: () => { x: number; y: number } | null;
  /** Set the tooltip anchor. */
  setAnchor: (next: { x: number; y: number } | null) => void;
  /** The active zoom window, or `null` when the full domain is visible. */
  zoom: () => ZoomWindow | null;
  /** Set the zoom window (`null` restores the full domain). */
  setZoom: (window: ZoomWindow | null) => void;
  /** Clear the zoom window. */
  resetZoom: () => void;
  /** The visible window expressed in row units for the categorical domain. */
  xWindow: () => { start: number; end: number };
  /** Whether a dataset row index overlaps the visible window. */
  isRowVisible: (rowIndex: number) => boolean;
  /** Id of the tooltip element for `aria-describedby` linkage. */
  tooltipId: string;
  /** Value formatter for tooltip and label output. */
  formatValue: FormatValue;
}

const [ChartProvider, useChartContextInternal] = createChartContext<ChartStore>(CHART_NAME);

/**
 * Read the chart store. Throws when rendered outside a `ChartContainer`.
 *
 * @param consumerName Name used in the scope-miss error.
 * @param scope Scope forwarded from the consuming component.
 */
export function useChartContext(consumerName: string, scope: Scope | undefined): ChartStore {
  return useChartContextInternal(consumerName, scope);
}

/** Props for {@link ChartContainer}. */
export interface ChartContainerProps extends PrimitivePropsWithRef<"div"> {
  /** Dataset rows in render order. */
  dataset: Dataset;
  /** Series descriptors, one per data column. */
  series: readonly SeriesDescriptor[];
  /** Row field used for category labels. Defaults to `"label"`. */
  labelKey?: string | undefined;
  /** Label for a row. Wins over `labelKey` when both are set. */
  label?: ((row: Datum, index: number) => string) | undefined;
  /** Drawing surface width in pixels. */
  width: number;
  /** Drawing surface height in pixels. */
  height: number;
  /** Margins around the plot area. Merged over the defaults. */
  margin?: Partial<ChartMargin> | undefined;
  /** Categorical scale kind. Defaults to `"band"`. */
  xScaleType?: "band" | "point" | undefined;
  /** Padding between categories as a fraction of band width. Defaults to `0.2`. */
  xPadding?: number | undefined;
  /** Explicit y domain. Defaults to the visible data extent. */
  yDomain?: readonly [number, number] | undefined;
  /** Extend the y domain to round values. Defaults to `false`. */
  yNice?: boolean | number | undefined;
  /** Value formatter for tooltip and label output. */
  formatValue?: FormatValue | undefined;
  /** Controlled highlighted item. */
  highlighted?: ChartItemRef | null | undefined;
  /** Uncontrolled initial highlighted item. */
  defaultHighlighted?: ChartItemRef | null | undefined;
  /** Called when the highlighted item changes. */
  onHighlightChange?: ((next: ChartItemRef | null) => void) | undefined;
  /** Controlled selected item. */
  selected?: ChartItemRef | null | undefined;
  /** Uncontrolled initial selected item. */
  defaultSelected?: ChartItemRef | null | undefined;
  /** Called when the selected item changes. */
  onSelectChange?: ((next: ChartItemRef | null) => void) | undefined;
  /** Called when an item is activated by pointer or keyboard. */
  onItemClick?: ((item: ChartItemRef | null, event: MouseEvent) => void) | undefined;
  /** Controlled zoom window. `null` shows the full domain. */
  zoom?: ZoomWindow | null | undefined;
  /** Uncontrolled initial zoom window. */
  defaultZoom?: ZoomWindow | null | undefined;
  /** Called when the zoom window changes. */
  onZoomChange?: ((next: ZoomWindow | null) => void) | undefined;
}

/**
 * Root of every chart: builds the store (dataset, series, scales, shared
 * interaction state) and renders the sized box that surfaces, HTML overlays,
 * and legends lay out in.
 */
export const ChartContainer: Component<ScopedProps<ChartContainerProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeCharts",
    "dataset",
    "series",
    "labelKey",
    "label",
    "width",
    "height",
    "margin",
    "xScaleType",
    "xPadding",
    "yDomain",
    "yNice",
    "formatValue",
    "highlighted",
    "defaultHighlighted",
    "onHighlightChange",
    "selected",
    "defaultSelected",
    "onSelectChange",
    "onItemClick",
    "zoom",
    "defaultZoom",
    "onZoomChange",
  );
  const chartId = useId();
  const tooltipId = `${chartId}-tooltip`;

  const margin = createMemo((): ChartMargin => ({ ...DEFAULT_MARGIN, ...props.margin }));
  const plotWidth = createMemo(() => Math.max(0, props.width - margin().left - margin().right));
  const plotHeight = createMemo(() => Math.max(0, props.height - margin().top - margin().bottom));

  const [hidden, setHidden] = createSignal<readonly string[]>([]);
  const isHidden = (seriesId: string): boolean => hidden().includes(seriesId);
  const toggleSeries = (seriesId: string): void => {
    setHidden((prev) =>
      prev.includes(seriesId) ? prev.filter((id) => id !== seriesId) : [...prev, seriesId],
    );
  };

  const labels = createMemo((): readonly string[] => {
    const key = props.labelKey ?? DEFAULT_LABEL_KEY;
    const label = props.label;
    return props.dataset.map((row, index) =>
      label ? label(row, index) : rowLabel(row, key, index),
    );
  });

  const resolvedSeries = createMemo((): readonly ResolvedSeries[] =>
    props.series.map((descriptor, index) => ({
      ...descriptor,
      index,
      color: seriesColor(descriptor, index),
      visible: !isHidden(descriptor.id),
    })),
  );
  const seriesById = (id: string): ResolvedSeries | undefined =>
    resolvedSeries().find((s) => s.id === id);

  const defaultDomain = createMemo((): readonly [number, number] => {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const s of resolvedSeries()) {
      if (!s.visible) continue;
      for (const row of props.dataset) {
        const value = toNumber(cellValue(row, s.valueKey));
        if (value === undefined) continue;
        if (value < min) min = value;
        if (value > max) max = value;
      }
    }
    if (min === Number.POSITIVE_INFINITY) return [0, 1];
    if (min === max) {
      const pad = min === 0 ? 1 : Math.abs(min) * 0.1;
      return [min - pad, max + pad];
    }
    return [min, max];
  });
  const yDomain = createMemo((): readonly [number, number] => props.yDomain ?? defaultDomain());
  const yScale = createMemo(() => {
    const domain = yDomain();
    return createLinearScale({
      domain: [domain[0], domain[1]] as readonly [number, number],
      range: [plotHeight(), 0] as const,
      nice: props.yNice,
    });
  });
  const yTicks = (count?: number | undefined): number[] => yScale().ticks(count ?? 5);

  const [zoom, setZoomState] = useControllableState<ZoomWindow | null>({
    prop: () => props.zoom,
    defaultProp: props.defaultZoom ?? null,
    onChange: props.onZoomChange,
    caller: CHART_NAME,
  });
  const setZoom = (next: ZoomWindow | null): void => {
    setZoomState(() => (next === null ? null : clampZoomWindow(next)));
  };
  const resetZoom = (): void => setZoom(null);
  const xWindow = createMemo((): { start: number; end: number } => {
    const count = labels().length;
    const window = zoom();
    if (window === null) return { start: 0, end: count };
    return { start: window.start * count, end: window.end * count };
  });
  const isRowVisible = (index: number): boolean => {
    const window = xWindow();
    const center = index + 0.5;
    return center >= window.start && center <= window.end;
  };

  const xScale = createMemo((): CategoryScale => {
    const window = zoom();
    const width = plotWidth();
    let range: readonly [number, number] = [0, width];
    if (window !== null) {
      const span = Math.max(1e-6, window.end - window.start);
      const stretched = width / span;
      const offset = window.start * stretched;
      range = [-offset, stretched - offset];
    }
    const options = { domain: labels(), range, padding: props.xPadding ?? 0.2 };
    return (props.xScaleType ?? "band") === "point"
      ? createPointScale(options)
      : createBandScale(options);
  });

  const [highlighted, setHighlightedState] = useControllableState<ChartItemRef | null>({
    prop: () => props.highlighted,
    defaultProp: props.defaultHighlighted ?? null,
    onChange: props.onHighlightChange,
    caller: CHART_NAME,
  });
  const setHighlighted = (next: ChartItemRef | null): void => {
    setHighlightedState((prev) => (itemsEqual(prev, next) ? prev : next));
  };

  const [selected, setSelectedState] = useControllableState<ChartItemRef | null>({
    prop: () => props.selected,
    defaultProp: props.defaultSelected ?? null,
    onChange: props.onSelectChange,
    caller: CHART_NAME,
  });
  const clickItem = (item: ChartItemRef | null, event: MouseEvent): void => {
    setSelectedState((prev) => (itemsEqual(prev, item) ? null : item));
    props.onItemClick?.(item, event);
  };

  const [anchor, setAnchor] = createSignal<{ x: number; y: number } | null>(null);

  const store: ChartStore = {
    chartId,
    dataset: () => props.dataset,
    labels,
    series: resolvedSeries,
    seriesById,
    x: xScale,
    y: () => yScale(),
    yTicks,
    yDomain,
    plotWidth,
    plotHeight,
    margin,
    highlighted,
    setHighlighted,
    selected,
    clickItem,
    zoom,
    setZoom,
    resetZoom,
    xWindow,
    isRowVisible,
    isHidden,
    toggleSeries,
    anchor,
    setAnchor,
    tooltipId,
    formatValue: (value, series) => (props.formatValue ?? defaultFormatValue)(value, series),
  };

  return (
    <ChartProvider scope={props.__scopeCharts} {...store}>
      <Primitive.div
        {...rest}
        style={{
          position: "relative",
          width: `${props.width}px`,
          ...(rest.style as JSX.CSSProperties | undefined),
        }}
      >
        {props.children}
      </Primitive.div>
    </ChartProvider>
  );
};

/** Props for {@link ChartSurface}. */
export interface ChartSurfaceProps extends PrimitivePropsWithRef<"svg"> {
  /** Accessible name for the chart figure. */
  ariaLabel?: string | undefined;
}

/**
 * The SVG drawing surface: sized from the container and translated by the
 * margins so children draw in plot coordinates.
 */
export const ChartSurface: Component<ScopedProps<ChartSurfaceProps>> = (props) => {
  const rest = omit(props, "__scopeCharts", "ariaLabel", "children");
  const store = useChartContext("ChartSurface", props.__scopeCharts);
  return (
    <Primitive.svg
      {...rest}
      width={store.plotWidth() + store.margin().left + store.margin().right}
      height={store.plotHeight() + store.margin().top + store.margin().bottom}
      role={props.ariaLabel ? "img" : undefined}
      aria-label={props.ariaLabel}
    >
      <g transform={`translate(${store.margin().left},${store.margin().top})`}>{props.children}</g>
    </Primitive.svg>
  );
};
