import { For, omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createBandScale, createLinearScale } from "../scales";
import {
  ChartContainer,
  ChartSurface,
  useChartContext,
  type ChartContainerProps,
  type ScopedProps,
} from "../container";
import { useSeriesValues } from "../hooks";
import { DEFAULT_LABEL_KEY, seriesColor, type Dataset, type SeriesDescriptor } from "../types";

/**
 * Headless heatmap: values mapped to color over an x/y category grid.
 *
 * Inspired by - not copied from - MUI X Heatmap. Shares the container,
 * highlight, and tooltip stores with the rest of the package.
 */

/** One cell's geometry, value, and color. */
export interface HeatmapCell {
  /** The x category label. */
  x: string;
  /** The y category label. */
  y: string;
  /** The cell value, or `null` when the datum is missing. */
  value: number | null;
  /** Plot x of the cell rect. */
  px: number;
  /** Plot y of the cell rect. */
  py: number;
  /** Cell width in pixels. */
  width: number;
  /** Cell height in pixels. */
  height: number;
  /** Fill for the cell rect. */
  fill: string;
}

/** Series metadata for one heatmap column (one y category). */
export interface HeatmapSeries {
  /** Stable series id, used as the dataset value key. */
  id: string;
  /** Y-axis label. Defaults to the id (or the matching `yLabels` entry). */
  label?: string | undefined;
  /** Explicit series color. Defaults to the palette slot. */
  color?: string | undefined;
  /** Palette slot override. */
  colorIndex?: number | undefined;
}

export interface ChartsHeatmapProps extends Omit<
  ChartContainerProps,
  "dataset" | "series" | "children"
> {
  /** Row labels along the horizontal axis. */
  xLabels: string[];
  /** Series labels along the vertical axis. Defaults to the series ids. */
  yLabels?: string[] | undefined;
  /**
   * Rows of numeric values, one row per x label, one entry per series.
   * `null` renders a gap cell with the `nullFill`.
   */
  values: Array<Array<number | null>>;
  /** Series metadata (colors); defaults to one id per column. */
  series?: HeatmapSeries[] | undefined;
  /** Interpolator from a `0` - `1` normalized value to a CSS color. */
  colorScale?: ((t: number) => string) | undefined;
  /** Fill for `null` cells. Defaults to `"transparent"`. */
  nullFill?: string | undefined;
  /** Gap between cells in pixels. Defaults to `1`. */
  gap?: number | undefined;
  /** Corner radius of each cell rect. Defaults to `0`. */
  radius?: number | undefined;
  /** Explicit value domain. Defaults to the data extent. */
  valueDomain?: [number, number] | undefined;
  /** Accessible summary. Defaults to `"Heatmap"`. */
  ariaLabel?: string | undefined;
  /** Extra children (surface content such as grid or tooltip). */
  children?: JSX.Element | undefined;
}

/** Format a heatmap cell value for `aria-label` text. */
export function formatHeatmapCellValue(value: number | null): string {
  return value === null ? "no data" : String(value);
}

/**
 * Map heatmap values to cell geometry and fills.
 *
 * @param args The x/y categories, values, plot size, and color mapping.
 * @returns Cells in row-major order, plus the resolved value domain.
 */
export function layoutHeatmapCells(args: {
  /** X category labels. */
  xLabels: readonly string[];
  /** Y category labels. */
  yLabels: readonly string[];
  /** Values in row-major order (`values[x][y]`). */
  values: Array<Array<number | null>>;
  /** Plot width in pixels. */
  plotWidth: number;
  /** Plot height in pixels. */
  plotHeight: number;
  /** Cell gap in pixels. */
  gap: number;
  /** Interpolator from normalized value to CSS color. */
  colorScale: (t: number) => string;
  /** Fill for `null` cells. */
  nullFill: string;
  /** Optional explicit value domain. */
  valueDomain?: [number, number] | undefined;
}): { cells: HeatmapCell[]; domain: [number, number] } {
  const { xLabels, yLabels, values, plotWidth, plotHeight, gap, colorScale, nullFill } = args;
  const x = createBandScale({ domain: xLabels, range: [0, plotWidth] });
  const y = createBandScale({ domain: yLabels, range: [0, plotHeight] });
  const flat = values.flat().filter((v): v is number => v !== null);
  const domain: [number, number] =
    args.valueDomain ?? (flat.length === 0 ? [0, 1] : [Math.min(...flat), Math.max(...flat)]);
  const normalize = createLinearScale({ domain, range: [0, 1] });
  const cells: HeatmapCell[] = [];
  for (let xi = 0; xi < xLabels.length; xi += 1) {
    for (let yi = 0; yi < yLabels.length; yi += 1) {
      const value = values[xi]?.[yi] ?? null;
      cells.push({
        x: xLabels[xi] ?? "",
        y: yLabels[yi] ?? "",
        value,
        px: (x(xLabels[xi] ?? "") ?? 0) + gap / 2,
        py: (y(yLabels[yi] ?? "") ?? 0) + gap / 2,
        width: Math.max(0, x.bandwidth() - gap),
        height: Math.max(0, y.bandwidth() - gap),
        fill: value === null ? nullFill : colorScale(normalize(value)),
      });
    }
  }
  return { cells, domain };
}

/** Props for {@link HeatmapCells}. */
export interface HeatmapCellsProps {
  /** Cell fills override, keyed `${x}\0${y}`. */
  cellFill?: ((cell: HeatmapCell) => string | undefined) | undefined;
  /** Gap between cells in pixels. Defaults to `1`. */
  gap?: number | undefined;
  /** Corner radius of each cell rect. Defaults to `0`. */
  radius?: number | undefined;
  /** Interpolator from a `0` - `1` normalized value to a CSS color. */
  colorScale?: ((t: number) => string) | undefined;
  /** Fill for `null` cells. Defaults to `"transparent"`. */
  nullFill?: string | undefined;
  /** Explicit value domain. Defaults to the data extent. */
  valueDomain?: [number, number] | undefined;
}

/** Default blue sequential interpolator used when no `colorScale` is given. */
export function defaultHeatmapColor(t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  const channel = Math.round(255 - clamped * 200);
  return `rgb(${channel}, ${Math.round(channel + clamped * 10)}, 255)`;
}

/**
 * Renders heatmap cells from the container dataset.
 *
 * Expects one row per x category and one series per y category. Drive the
 * highlight store and the shared tooltip anchor on pointer and focus, like the
 * other series components.
 */
export function HeatmapCells(rawProps: ScopedProps<HeatmapCellsProps>): JSX.Element {
  const store = useChartContext("HeatmapCells", rawProps.__scopeCharts);
  const resolved = useSeriesValues({ scope: rawProps.__scopeCharts });
  const layout = () =>
    layoutHeatmapCells({
      xLabels: resolved.labels,
      yLabels: resolved.series.map((s) => s.label ?? s.id),
      values: resolved.labels.map((_, xi) =>
        resolved.series.map((s) => resolved.values.get(s.id)?.[xi]?.value ?? null),
      ),
      plotWidth: store.plotWidth(),
      plotHeight: store.plotHeight(),
      gap: rawProps.gap ?? 1,
      colorScale: rawProps.colorScale ?? defaultHeatmapColor,
      nullFill: rawProps.nullFill ?? "transparent",
      valueDomain: rawProps.valueDomain,
    });
  const seriesIdFor = (y: string): string | undefined =>
    resolved.series.find((s) => (s.label ?? s.id) === y)?.id;

  return (
    <g
      role="img"
      aria-label={
        resolved.labels.length === 0
          ? "Empty heatmap"
          : `Heatmap with ${layout().cells.length} cells`
      }
      data-series-id="heatmap"
    >
      <For each={layout().cells}>
        {(cell) => {
          const fill = () => rawProps.cellFill?.(cell) ?? cell.fill;
          const label = () => `${cell.x}, ${cell.y}: ${formatHeatmapCellValue(cell.value)}`;
          const target = () => {
            const rowIndex = resolved.labels.indexOf(cell.x);
            return { seriesId: seriesIdFor(cell.y), rowIndex };
          };
          return (
            <rect
              x={cell.px}
              y={cell.py}
              width={cell.width}
              height={cell.height}
              rx={rawProps.radius ?? 0}
              fill={fill()}
              tabindex={0}
              aria-label={label()}
              data-x={cell.x}
              data-y={cell.y}
              onPointerEnter={(event: PointerEvent) => {
                const { seriesId, rowIndex } = target();
                if (seriesId !== undefined) store.setHighlighted({ seriesId, rowIndex });
                const box = (
                  event.currentTarget as unknown as SVGRectElement | null
                )?.getBoundingClientRect?.();
                if (box) store.setAnchor({ x: box.left + box.width / 2, y: box.top });
              }}
              onPointerLeave={() => {
                store.setHighlighted(null);
                store.setAnchor(null);
              }}
              onFocus={() => {
                const { seriesId, rowIndex } = target();
                if (seriesId !== undefined) store.setHighlighted({ seriesId, rowIndex });
              }}
              onBlur={() => {
                store.setHighlighted(null);
              }}
              onClick={(event: MouseEvent) => {
                const { seriesId, rowIndex } = target();
                if (seriesId !== undefined) store.clickItem({ seriesId, rowIndex }, event);
              }}
            />
          );
        }}
      </For>
    </g>
  );
}

/**
 * Composed heatmap chart: container, surface, and cells with a shared tooltip.
 *
 * Pass `xLabels` and a row-major `values` matrix; series metadata is optional
 * and supplies y labels and the palette only.
 */
export function ChartsHeatmap(rawProps: ScopedProps<ChartsHeatmapProps>): JSX.Element {
  const scope = rawProps.__scopeCharts;
  const columns = (): HeatmapSeries[] => {
    const base: HeatmapSeries[] =
      rawProps.series ??
      (() => {
        const count = Math.max(0, ...rawProps.values.map((row) => row.length));
        return Array.from({ length: count }, (_, index) => ({ id: `series-${index}` }));
      })();
    const yLabels = rawProps.yLabels;
    if (yLabels === undefined) return base;
    return base.map((entry, index) => ({
      ...entry,
      label: yLabels[index] ?? entry.label ?? entry.id,
    }));
  };
  const descriptors = (): SeriesDescriptor[] =>
    columns().map((entry, index) => ({
      id: entry.id,
      label: entry.label ?? entry.id,
      valueKey: entry.id,
      colorIndex: entry.colorIndex,
      color: entry.color ?? seriesColor(entry, index),
    }));
  const dataset = (): Dataset =>
    rawProps.xLabels.map((label, xi) => {
      const row: Record<string, unknown> = { [DEFAULT_LABEL_KEY]: label };
      columns().forEach((entry, yi) => {
        row[entry.id] = rawProps.values[xi]?.[yi] ?? null;
      });
      return row;
    });
  const rest = omit(
    rawProps,
    "xLabels",
    "yLabels",
    "values",
    "series",
    "colorScale",
    "nullFill",
    "gap",
    "radius",
    "valueDomain",
    "ariaLabel",
    "children",
  );
  return (
    <ChartContainer {...rest} __scopeCharts={scope} dataset={dataset()} series={descriptors()}>
      <ChartSurface __scopeCharts={scope} ariaLabel={rawProps.ariaLabel ?? "Heatmap"}>
        <HeatmapCells
          __scopeCharts={scope}
          gap={rawProps.gap}
          radius={rawProps.radius}
          colorScale={rawProps.colorScale}
          nullFill={rawProps.nullFill}
          valueDomain={rawProps.valueDomain}
        />
        {rawProps.children}
      </ChartSurface>
    </ChartContainer>
  );
}
