import { For, omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { Scope } from "@solidix/context";
import {
  ChartContainer,
  ChartSurface,
  useChartContext,
  type ChartContainerProps,
  type ScopedProps,
} from "../container";
import { ChartsGrid } from "../grid";
import { ChartsXAxis, ChartsYAxis } from "../axes";
import { useSeriesValues } from "../hooks";
import { computeStackOffsets, itemsEqual, stackedExtent, type StackMode } from "../types";

/** Bar mode. `"grouped"` renders clustered bars; `"stacked"` accumulates series. */
export type BarMode = "grouped" | "stacked";

/** Props for {@link Bars}. */
export interface BarsProps {
  /** Bar mode. Defaults to `"grouped"`. */
  mode?: BarMode | undefined;
  /** Corner radius in pixels, applied to every rect. Defaults to `0`. */
  radius?: number | undefined;
}

/**
 * Bars series: one `<rect>` per non-gap cell, grouped or stacked. Reads the
 * store scales and geometry; pointer and focus interaction drive the shared
 * highlight state.
 */
export function Bars(rawProps: ScopedProps<BarsProps>): JSX.Element {
  useChartContext("Bars", rawProps.__scopeCharts);
  const resolved = useSeriesValues({ scope: rawProps.__scopeCharts });
  const mode = (): Exclude<StackMode, "percent"> =>
    rawProps.mode === "stacked" ? "normal" : "none";

  const radius = (): number => Math.max(0, rawProps.radius ?? 0);

  return (
    <For each={resolved.series}>
      {(s) => (
        <BarSeriesCells
          seriesId={s.id}
          mode={mode()}
          radius={radius()}
          scope={rawProps.__scopeCharts}
        />
      )}
    </For>
  );
}

/** Props for the internal per-series cell renderer. */
interface BarSeriesCellsProps {
  /** Series id to render. */
  seriesId: string;
  /** Resolved stack mode. */
  mode: Exclude<StackMode, "percent">;
  /** Corner radius in pixels. */
  radius: number;
  /** Scope forwarded from the series component. */
  scope: Scope | undefined;
}

/**
 * Render one series column as `<rect>` elements. Split from {@link Bars} so
 * each series subscribes to its own highlight state.
 */
function BarSeriesCells(props: BarSeriesCellsProps): JSX.Element {
  const store = useChartContext("Bars", props.scope);
  const resolved = useSeriesValues({ scope: props.scope });
  const series = (): (typeof resolved.series)[number] | undefined =>
    resolved.series.find((s) => s.id === props.seriesId);

  const rows = (): ReadonlyArray<{
    rowIndex: number;
    value: number;
    baseline: number;
  }> => {
    const s = series();
    if (!s || !s.visible) return [];
    const cells = resolved.values.get(s.id) ?? [];
    const baselines =
      props.mode === "normal"
        ? (computeStackOffsets(store.dataset(), resolved.series, "normal").find(
            (entry) => entry.seriesId === s.id,
          )?.baselines ?? [])
        : undefined;
    const out: Array<{ rowIndex: number; value: number; baseline: number }> = [];
    cells.forEach((cell, rowIndex) => {
      if (cell.value === undefined) return;
      if (!store.isRowVisible(rowIndex)) return;
      out.push({ rowIndex, value: cell.value, baseline: baselines?.[rowIndex] ?? 0 });
    });
    return out;
  };

  return (
    <For each={rows()}>
      {(row) => {
        const s = series;
        const rect = (): { x: number; y: number; width: number; height: number } | null => {
          const current = s();
          if (!current) return null;
          const xScale = store.x();
          const y = store.y();
          const left = xScale(store.labels()[row.rowIndex] ?? "") ?? 0;
          const band = xScale.bandwidth();
          const top = y(row.baseline + row.value);
          const bottom = y(row.baseline);
          const height = Math.abs(bottom - top);
          if (props.mode === "normal") {
            return { x: left, y: Math.min(top, bottom), width: band, height };
          }
          const seriesList = resolved.series;
          const slot = seriesList.findIndex((candidate) => candidate.id === current.id);
          const slotWidth = band / Math.max(1, seriesList.length);
          const inner = slotWidth * 0.7;
          return {
            x: left + slot * slotWidth + (slotWidth - inner) / 2,
            y: Math.min(top, bottom),
            width: inner,
            height,
          };
        };
        const seriesSnapshot = (): { id: string; color: string } | null => {
          const current = s();
          return current ? { id: current.id, color: current.color } : null;
        };
        return (
          <BarRect
            rect={rect()}
            rowIndex={row.rowIndex}
            value={row.value}
            series={seriesSnapshot()}
            radius={props.radius}
            scope={props.scope}
          />
        );
      }}
    </For>
  );
}

/** Props for one bar rectangle. */
interface BarRectProps {
  /** Plot-space geometry, or `null` while the series is unresolved. */
  rect: { x: number; y: number; width: number; height: number } | null;
  /** Dataset row index. */
  rowIndex: number;
  /** Bar value in data units. */
  value: number;
  /** Owning series identity, or `null` while unresolved. */
  series: { id: string; color: string } | null;
  /** Corner radius in pixels. */
  radius: number;
  /** Scope forwarded from the series component. */
  scope: Scope | undefined;
}

/**
 * One focusable bar rectangle. Highlight follows pointer and keyboard focus;
 * activation toggles selection through the store.
 */
function BarRect(props: BarRectProps): JSX.Element {
  const store = useChartContext("Bars", props.scope);
  const active = (): boolean =>
    itemsEqual(
      store.highlighted(),
      props.series ? { seriesId: props.series.id, rowIndex: props.rowIndex } : null,
    ) ||
    itemsEqual(
      store.selected(),
      props.series ? { seriesId: props.series.id, rowIndex: props.rowIndex } : null,
    );
  const label = (): string | undefined => {
    const s = props.series ? store.seriesById(props.series.id) : undefined;
    if (!s) return undefined;
    const name = store.labels()[props.rowIndex] ?? String(props.rowIndex);
    return `${s.label ?? s.id}, ${name}: ${store.formatValue(props.value, s)}`;
  };
  return (
    <rect
      x={props.rect?.x ?? 0}
      y={props.rect?.y ?? 0}
      width={props.rect?.width ?? 0}
      height={props.rect?.height ?? 0}
      rx={props.radius}
      fill={props.series?.color ?? "none"}
      opacity={active() ? 1 : 0.85}
      tabindex={0}
      role="img"
      aria-label={label()}
      style={{ cursor: "pointer", outline: "none" }}
      onPointerEnter={(event: PointerEvent) => {
        if (!props.series) return;
        store.setHighlighted({ seriesId: props.series.id, rowIndex: props.rowIndex });
        const target = event.currentTarget as unknown as SVGGraphicsElement | null;
        const box = target?.getBoundingClientRect?.();
        if (box) store.setAnchor({ x: box.left + box.width / 2, y: box.top });
      }}
      onPointerLeave={() => {
        store.setHighlighted(null);
        store.setAnchor(null);
      }}
      onFocus={() => {
        if (props.series)
          store.setHighlighted({ seriesId: props.series.id, rowIndex: props.rowIndex });
      }}
      onBlur={() => store.setHighlighted(null)}
      onClick={(event: MouseEvent) => {
        if (props.series)
          store.clickItem({ seriesId: props.series.id, rowIndex: props.rowIndex }, event);
      }}
    />
  );
}

/** Props for {@link BarChart}. */
export interface BarChartProps extends ChartContainerProps {
  /** Stack series instead of grouping them. Defaults to `false`. */
  stacked?: boolean | undefined;
  /** Corner radius in pixels for every bar. Defaults to `0`. */
  radius?: number | undefined;
  /** Accessible name for the chart surface. */
  ariaLabel?: string | undefined;
  /** Plot children rendered after the bars (axes overlays, annotations). */
  children?: JSX.Element | undefined;
}

/**
 * Composed bar chart: container, surface, grid, bars, and axes. Pass
 * `stacked` to accumulate series; the y domain widens to the stacked
 * extent unless `yDomain` overrides it.
 */
export function BarChart(rawProps: ScopedProps<BarChartProps>): JSX.Element {
  const containerProps = omit(
    rawProps,
    "__scopeCharts",
    "stacked",
    "radius",
    "ariaLabel",
    "children",
  );
  const stacked = (): boolean => rawProps.stacked ?? false;
  const domain = (): readonly [number, number] | undefined => {
    if (rawProps.yDomain) return rawProps.yDomain;
    if (!stacked()) return undefined;
    const offsets = computeStackOffsets(rawProps.dataset ?? [], rawProps.series ?? [], "normal");
    return stackedExtent(rawProps.dataset ?? [], rawProps.series ?? [], offsets, "normal");
  };
  const label = (): string =>
    rawProps.ariaLabel ?? `Bar chart with ${(rawProps.series ?? []).length} series`;
  return (
    <ChartContainer {...containerProps} yDomain={domain()} __scopeCharts={rawProps.__scopeCharts}>
      <ChartSurface ariaLabel={label()} __scopeCharts={rawProps.__scopeCharts}>
        <ChartsGrid __scopeCharts={rawProps.__scopeCharts} />
        <Bars
          mode={stacked() ? "stacked" : "grouped"}
          radius={rawProps.radius}
          __scopeCharts={rawProps.__scopeCharts}
        />
        <ChartsXAxis __scopeCharts={rawProps.__scopeCharts} />
        <ChartsYAxis __scopeCharts={rawProps.__scopeCharts} />
        {rawProps.children}
      </ChartSurface>
    </ChartContainer>
  );
}
