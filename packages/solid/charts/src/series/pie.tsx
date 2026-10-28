import { For, omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { Scope } from "@solidix/context";
import { arc, pie, type PieArcDatum } from "d3-shape";
import {
  ChartContainer,
  ChartSurface,
  useChartContext,
  type ChartContainerProps,
  type ScopedProps,
} from "../container";
import { useSeriesValues } from "../hooks";
import { itemsEqual, seriesColor } from "../types";

/** One pie slice: dataset row index plus its positive value. */
interface PieEntry {
  /** Dataset row index. */
  rowIndex: number;
  /** Slice value in data units. Always greater than zero. */
  value: number;
}

/** Props for {@link PiePlot}. */
export interface PiePlotProps {
  /** Inner radius in pixels; greater than zero renders a donut. Defaults to `0`. */
  innerRadius?: number | undefined;
  /** Outer radius in pixels. Defaults to half the smaller plot dimension. */
  outerRadius?: number | undefined;
  /** Angular padding between slices in radians. Defaults to `0`. */
  padAngle?: number | undefined;
  /** Corner radius in pixels for slice edges. Defaults to `0`. */
  cornerRadius?: number | undefined;
  /** Stroke color drawn between slices. Defaults to no stroke. */
  stroke?: string | undefined;
  /** Stroke width in pixels. Defaults to `0`. */
  strokeWidth?: number | undefined;
}

/**
 * Pie slices for the first visible series: each dataset row becomes one
 * slice sized by its value. Rows with missing or non-positive values render
 * no slice. Slices are focusable and drive store highlight, selection, and
 * tooltip anchoring like every other series mark.
 */
export function PiePlot(rawProps: ScopedProps<PiePlotProps>): JSX.Element {
  const store = useChartContext("PiePlot", rawProps.__scopeCharts);
  const resolved = useSeriesValues({ scope: rawProps.__scopeCharts });
  const entries = (): readonly PieEntry[] => {
    const first = resolved.series[0];
    if (!first) return [];
    const column = resolved.values.get(first.id) ?? [];
    const out: PieEntry[] = [];
    column.forEach((resolved, rowIndex) => {
      if (resolved.value !== undefined && resolved.value > 0)
        out.push({ rowIndex, value: resolved.value });
    });
    return out;
  };
  const arcs = (): ReadonlyArray<PieArcDatum<PieEntry>> =>
    pie<PieEntry>()
      .value((entry) => entry.value)
      .sort(null)
      .padAngle(rawProps.padAngle ?? 0)([...entries()]);
  const outer = (): number =>
    rawProps.outerRadius ?? Math.min(store.plotWidth(), store.plotHeight()) / 2;
  const path = (datum: PieArcDatum<PieEntry>): string | null =>
    arc<PieArcDatum<PieEntry>>()
      .innerRadius(rawProps.innerRadius ?? 0)
      .outerRadius(outer())
      .cornerRadius(rawProps.cornerRadius ?? 0)(datum);
  return (
    <g transform={`translate(${store.plotWidth() / 2} ${store.plotHeight() / 2})`}>
      <For each={arcs()}>
        {(datum) => (
          <PieSlice
            datum={datum}
            d={path(datum) ?? ""}
            label={resolved.labels[datum.data.rowIndex] ?? String(datum.data.rowIndex)}
            seriesId={resolved.series[0]?.id ?? ""}
            scope={rawProps.__scopeCharts}
          />
        )}
      </For>
    </g>
  );
}

/** Props for one pie slice. */
interface PieSliceProps {
  /** d3 arc datum carrying angles and the source entry. */
  datum: PieArcDatum<PieEntry>;
  /** Rendered arc path data. */
  d: string;
  /** Category label for the slice. */
  label: string;
  /** Owning series id. */
  seriesId: string;
  /** Scope forwarded from the plot component. */
  scope: Scope | undefined;
}

/**
 * One focusable pie slice. Highlight follows pointer and keyboard focus;
 * activation toggles selection through the store.
 */
function PieSlice(props: PieSliceProps): JSX.Element {
  const store = useChartContext("PiePlot", props.scope);
  const item = (): { seriesId: string; rowIndex: number } => ({
    seriesId: props.seriesId,
    rowIndex: props.datum.data.rowIndex,
  });
  const active = (): boolean =>
    itemsEqual(store.highlighted(), item()) || itemsEqual(store.selected(), item());
  const label = (): string => {
    const s = store.seriesById(props.seriesId);
    const value = s ? store.formatValue(props.datum.data.value, s) : String(props.datum.data.value);
    return `${props.label}: ${value}`;
  };
  return (
    <path
      d={props.d}
      fill={seriesColor({ color: undefined, colorIndex: undefined }, props.datum.index)}
      opacity={active() ? 1 : 0.85}
      tabindex={0}
      role="img"
      aria-label={label()}
      style={{ cursor: "pointer", outline: "none" }}
      onPointerEnter={(event: PointerEvent) => {
        store.setHighlighted(item());
        const target = event.currentTarget as unknown as SVGGraphicsElement | null;
        const box = target?.getBoundingClientRect?.();
        if (box) store.setAnchor({ x: box.left + box.width / 2, y: box.top });
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

/** Props for {@link PieChart}. */
export interface PieChartProps extends ChartContainerProps {
  /** Inner radius in pixels; greater than zero renders a donut. Defaults to `0`. */
  innerRadius?: number | undefined;
  /** Outer radius in pixels. Defaults to half the smaller plot dimension. */
  outerRadius?: number | undefined;
  /** Angular padding between slices in radians. Defaults to `0`. */
  padAngle?: number | undefined;
  /** Corner radius in pixels for slice edges. Defaults to `0`. */
  cornerRadius?: number | undefined;
  /** Accessible name for the chart surface. */
  ariaLabel?: string | undefined;
  /** Plot children rendered after the slices (overlays, annotations). */
  children?: JSX.Element | undefined;
}

/**
 * Composed pie chart: container, surface, and pie slices. Pie charts have no
 * axes or grid; add a legend and tooltip as children of the container.
 */
export function PieChart(rawProps: ScopedProps<PieChartProps>): JSX.Element {
  const containerProps = omit(
    rawProps,
    "__scopeCharts",
    "innerRadius",
    "outerRadius",
    "padAngle",
    "cornerRadius",
    "ariaLabel",
    "children",
  );
  const label = (): string =>
    rawProps.ariaLabel ?? `Pie chart with ${(rawProps.dataset ?? []).length} slices`;
  return (
    <ChartContainer {...containerProps} __scopeCharts={rawProps.__scopeCharts}>
      <ChartSurface ariaLabel={label()} __scopeCharts={rawProps.__scopeCharts}>
        <PiePlot
          innerRadius={rawProps.innerRadius}
          outerRadius={rawProps.outerRadius}
          padAngle={rawProps.padAngle}
          cornerRadius={rawProps.cornerRadius}
          __scopeCharts={rawProps.__scopeCharts}
        />
        {rawProps.children}
      </ChartSurface>
    </ChartContainer>
  );
}
