/**
 * Shared chart data types: datasets, series descriptors, margins, and
 * stacking helpers.
 *
 * A chart consumes a {@link Dataset} - one row per category (or timestamp).
 * Each series reads its values from one row field via `valueKey`, so a single
 * dataset can feed many series. Stacking is computed per series order with
 * {@link computeStackOffsets}.
 */

/** One row of chart data. Series read values from row fields by `valueKey`. */
export type Datum = Record<string, unknown>;

/** A dataset: one {@link Datum} row per category or timestamp. */
export type Dataset<TDatum extends Datum = Datum> = ReadonlyArray<TDatum>;

/**
 * A value that can be coerced to a finite number, or nullish for a gap
 * (line charts break the line, bar charts render nothing for the cell).
 */
export type NumericLike = number | string | null | undefined;

/** Padding (in pixels) between the outer chart box and the plot area. */
export interface ChartMargin {
  /** Top margin in pixels. */
  top: number;
  /** Right margin in pixels. */
  right: number;
  /** Bottom margin in pixels. */
  bottom: number;
  /** Left margin in pixels. */
  left: number;
}

/** Default margins applied when a chart prop omits individual sides. */
export const DEFAULT_MARGIN: ChartMargin = { top: 8, right: 8, bottom: 24, left: 32 };

/** A series descriptor: how one data column maps to rendered output. */
export interface SeriesDescriptor<TDatum extends Datum = Datum> {
  /** Stable series id. Used for legend selection, highlight, and palette index. */
  id: string;
  /** Human-readable label shown in the legend and tooltip. Defaults to `id`. */
  label?: string | undefined;
  /** Row field this series reads its values from. */
  valueKey: keyof TDatum & string;
  /**
   * Palette slot for this series. Defaults to the series index. Resolves to
   * `var(--sx-color-N)` in generated class hooks and inline styles.
   */
  colorIndex?: number | undefined;
  /**
   * Explicit color override (any CSS color). Wins over the palette slot when
   * both are set.
   */
  color?: string | undefined;
}

/** Number of slots in the built-in categorical palette. */
export const PALETTE_SIZE = 8;

/**
 * Resolve a series color to a CSS value.
 *
 * An explicit `color` on the descriptor always wins. Otherwise the palette
 * slot wraps modulo {@link PALETTE_SIZE} and resolves to the
 * `--sx-color-N` CSS variable with a built-in fallback hex, so charts render
 * sensibly unthemed and recolor fully through variables.
 */
export function seriesColor(
  descriptor: Pick<SeriesDescriptor, "color" | "colorIndex">,
  index: number,
): string {
  if (descriptor.color) return descriptor.color;
  const slot = (((descriptor.colorIndex ?? index) % PALETTE_SIZE) + PALETTE_SIZE) % PALETTE_SIZE;
  return `var(--sx-color-${slot + 1}, ${PALETTE_FALLBACKS[slot]})`;
}

/** Built-in palette fallbacks, readable on white, colorblind-friendly set. */
export const PALETTE_FALLBACKS: ReadonlyArray<string> = [
  "#2563eb",
  "#dc2626",
  "#059669",
  "#d97706",
  "#0891b2",
  "#4f46e5",
  "#be185d",
  "#65a30d",
];

/** Coerce a row value to a number, or `undefined` for gaps and non-numeric input. */
export function toNumber(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

/** Row field used for category labels and the x axis. Defaults to `"label"`. */
export const DEFAULT_LABEL_KEY = "label";

/** Read the category label for a row. Falls back to the row index. */
export function rowLabel<TDatum extends Datum>(
  row: TDatum,
  labelKey: string,
  index: number,
): string {
  const value = row[labelKey];
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (value instanceof Date) return value.toISOString();
  return String(index);
}

/** Read a numeric cell value for a series, or `undefined` for gaps. */
export function cellValue<TDatum extends Datum>(
  row: TDatum,
  valueKey: keyof TDatum & string,
): number | undefined {
  return toNumber(row[valueKey]);
}

/** Stack offsets for one series: the baseline each row's bar or area starts from. */
export interface StackOffsets {
  /** Series id these offsets belong to. */
  seriesId: string;
  /** Baseline per dataset row, in data units. */
  baselines: ReadonlyArray<number>;
}

/**
 * Stacking mode. `"none"` renders raw values. `"normal"` stacks series in
 * order (positive values stack upward from zero, negative values stack
 * downward). `"percent"` normalizes each row so stacked magnitudes sum to
 * one, preserving sign per segment.
 */
export type StackMode = "none" | "normal" | "percent";

/**
 * Compute per-series stack baselines for a dataset.
 *
 * Series stack in the given order. Positive and negative values accumulate on
 * separate baselines so mixed-sign rows render correctly. In `"percent"`
 * mode each row is normalized by its total absolute magnitude; rows whose
 * total is zero produce zero baselines.
 */
export function computeStackOffsets<TDatum extends Datum>(
  dataset: Dataset<TDatum>,
  series: ReadonlyArray<SeriesDescriptor<TDatum>>,
  mode: Exclude<StackMode, "none">,
): ReadonlyArray<StackOffsets> {
  const positive = Array.from<number>({ length: dataset.length }).fill(0);
  const negative = Array.from<number>({ length: dataset.length }).fill(0);
  const totals =
    mode === "percent"
      ? dataset.map((row) =>
          series.reduce((sum, s) => sum + Math.abs(cellValue(row, s.valueKey) ?? 0), 0),
        )
      : undefined;
  return series.map((s) => {
    const baselines = dataset.map((row, rowIndex) => {
      const raw = cellValue(row, s.valueKey) ?? 0;
      const total = totals?.[rowIndex] ?? 0;
      const value = mode === "percent" ? (total > 0 ? raw / total : 0) : raw;
      if (value < 0) {
        const baseline = negative[rowIndex]!;
        negative[rowIndex] = baseline + value;
        return baseline;
      }
      const baseline = positive[rowIndex]!;
      positive[rowIndex] = baseline + value;
      return baseline;
    });
    return { seriesId: s.id, baselines };
  });
}

/**
 * Compute the stacked (or raw) value extent across series and rows.
 * Returns `[0, 0]` for empty input so scales always receive a valid domain.
 */
export function stackedExtent<TDatum extends Datum>(
  dataset: Dataset<TDatum>,
  series: ReadonlyArray<SeriesDescriptor<TDatum>>,
  offsets: ReadonlyArray<StackOffsets> | undefined,
  mode: StackMode,
): [number, number] {
  let min = 0;
  let max = 0;
  let seen = false;
  dataset.forEach((row, rowIndex) => {
    series.forEach((s, seriesIndex) => {
      const raw = cellValue(row, s.valueKey);
      if (raw === undefined) return;
      let value = raw;
      let baseline = 0;
      if (mode !== "none" && offsets) {
        baseline = offsets[seriesIndex]?.baselines[rowIndex] ?? 0;
        if (mode === "percent") {
          const total = series.reduce(
            (sum, other) => sum + Math.abs(cellValue(row, other.valueKey) ?? 0),
            0,
          );
          value = total > 0 ? raw / total : 0;
        }
      }
      min = seen
        ? Math.min(min, baseline, baseline + value)
        : Math.min(0, baseline, baseline + value);
      max = seen
        ? Math.max(max, baseline, baseline + value)
        : Math.max(0, baseline, baseline + value);
      seen = true;
    });
  });
  return [min, max];
}

/**
 * A stable reference to one hovered/selected chart item: which series and
 * which dataset row. Row `-1` means "the whole series" (legend hover).
 */
export interface ChartItemRef {
  /** Series identity. */
  seriesId: string;
  /** Dataset row index, or `-1` for the whole series. */
  rowIndex: number;
}

/** Structural equality for item refs. Treats two `null`s as equal. */
export function itemsEqual(a: ChartItemRef | null, b: ChartItemRef | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.seriesId === b.seriesId && a.rowIndex === b.rowIndex;
}
