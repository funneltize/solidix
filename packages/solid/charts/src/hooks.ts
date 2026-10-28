import { createMemo } from "solid-js";
import type { Scope } from "@solidix/context";
import { cellValue, rowLabel, toNumber, type Dataset, type Datum } from "./types";
import { useChartContext, type ResolvedSeries } from "./container";

/**
 * A single numeric row value resolved from the dataset: keeping the raw
 * cell next to its coercion lets series render gaps and tooltips separately.
 */
export interface ResolvedValue {
  /** Raw cell from the dataset row. */
  raw: unknown;
  /** Finite number coercion, or `undefined` for a gap. */
  value: number | undefined;
}

/**
 * Resolve one series column to per-row values in render order. Exported for
 * headless series authors; rendered series use {@link useSeriesValues}.
 *
 * @param dataset Dataset rows in render order.
 * @param series Resolved series descriptor carrying the `valueKey`.
 */
export function resolveSeriesValues(
  dataset: Dataset,
  series: Pick<ResolvedSeries, "valueKey">,
): readonly ResolvedValue[] {
  return dataset.map((row) => {
    const raw = cellValue(row, series.valueKey);
    return { raw, value: toNumber(raw) };
  });
}

/**
 * Resolve a category label for one row: the container `label` prop wins,
 * otherwise `labelKey` falls back to the row index.
 *
 * @param row Dataset row.
 * @param index Row index in the dataset.
 * @param label Container label render prop, if any.
 * @param labelKey Row field used when `label` is absent.
 */
export function resolveRowLabel(
  row: Datum,
  index: number,
  label: ((row: Datum, index: number) => string) | undefined,
  labelKey: string,
): string {
  return label ? label(row, index) : rowLabel(row, labelKey, index);
}

/** Options for {@link useSeriesValues}. */
export interface UseSeriesValuesOptions {
  /** Scope forwarded from the consuming component. */
  scope?: Scope | undefined;
}

/**
 * Read the chart store and resolve every visible series to per-row values.
 * Values stay aligned with `labels()` by index.
 */
export function useSeriesValues(options: UseSeriesValuesOptions = {}): {
  /** Category labels in render order. */
  labels: readonly string[];
  /** Visible series in `series` prop order. */
  series: readonly ResolvedSeries[];
  /** Per-series per-row values, aligned with `labels` by row index. */
  values: ReadonlyMap<string, readonly ResolvedValue[]>;
} {
  const store = useChartContext("useSeriesValues", options.scope);
  const computed = createMemo(() => {
    const dataset = store.dataset();
    const series = store.series().filter((s) => s.visible);
    const values = new Map<string, readonly ResolvedValue[]>();
    for (const s of series) values.set(s.id, resolveSeriesValues(dataset, s));
    return { labels: store.labels(), series, values };
  });
  return {
    get labels() {
      return computed().labels;
    },
    get series() {
      return computed().series;
    },
    get values() {
      return computed().values;
    },
  };
}
