/**
 * Number, date, and duration formatting helpers for axes, tooltips, and
 * legends. Thin wrappers over d3-format and d3-time-format with chart
 * friendly defaults, plus compact SI notation for axis ticks.
 */
import { format as d3Format, formatPrefix, precisionFixed, precisionPrefix } from "d3-format";
import { timeFormat as d3TimeFormat, utcFormat as d3UtcFormat } from "d3-time-format";

/** Format a number with d3-format `specifier`. Defaults to `","` (grouped). */
export function formatNumber(value: number, specifier?: string | undefined): string {
  return d3Format(specifier ?? ",")(value);
}

/**
 * Format a number compactly (`1.2K`, `3.4M`, `5.6B`, `7.8T` and down to
 * milli/micro). Handy for axis ticks where space is tight.
 */
export function formatCompact(value: number, digits?: number | undefined): string {
  const precision = Math.max(0, Math.min(3, digits ?? 1));
  if (value === 0) return "0";
  const abs = Math.abs(value);
  const tiers: ReadonlyArray<readonly [number, string]> = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  for (const [threshold, suffix] of tiers) {
    if (abs >= threshold) {
      const scaled = value / threshold;
      const rounded = Number(scaled.toFixed(precision));
      return `${rounded}${suffix}`;
    }
  }
  if (abs >= 1) {
    const rounded = Number(value.toFixed(precision));
    return `${rounded}`;
  }
  if (abs >= 1e-3) return `${Number(value.toFixed(precision + 2))}`;
  return d3Format(`.${precision}e`)(value);
}

/** Format a number as a percentage of 1 (0.25 becomes "25%"). */
export function formatPercent(value: number, digits?: number | undefined): string {
  return d3Format(`.${Math.max(0, digits ?? 0)}%`)(value);
}

/** Format a number as USD. Uses compact notation for large values. */
export function formatCurrency(value: number, compact?: boolean | undefined): string {
  if (compact ?? Math.abs(value) >= 10000) return `$${formatCompact(value)}`;
  return d3Format("$,.2f")(value);
}

/** Format a Date with a d3-time-format specifier in local time. */
export function formatDate(date: Date, specifier?: string | undefined): string {
  return d3TimeFormat(specifier ?? "%b %d, %Y")(date);
}

/** Format a Date with a d3-time-format specifier in UTC. */
export function formatUtcDate(date: Date, specifier?: string | undefined): string {
  return d3UtcFormat(specifier ?? "%b %d, %Y")(date);
}

/** Format a duration in milliseconds as a human string ("1h 23m", "45s"). */
export function formatDuration(milliseconds: number): string {
  if (!Number.isFinite(milliseconds)) return "-";
  const sign = milliseconds < 0 ? "-" : "";
  const total = Math.round(Math.abs(milliseconds) / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) return `${sign}${hours}h ${minutes}m`;
  if (minutes > 0) return `${sign}${minutes}m ${seconds}s`;
  return `${sign}${seconds}s`;
}

/**
 * Pick a tick format that adapts precision to the tick step, so ticks never
 * show more decimals than the step between them warrants.
 */
export function tickFormatForStep(step: number): (value: number) => string {
  if (!Number.isFinite(step) || step <= 0) return (value) => formatNumber(value);
  const precision = Math.max(0, precisionFixed(step));
  return d3Format(`,.${precision}f`);
}

/**
 * Pick a compact SI-prefix tick format for the given maximum value, keeping
 * every tick in the same unit (all "K", all "M", ...).
 */
export function compactTickFormat(maxValue: number): (value: number) => string {
  if (!Number.isFinite(maxValue) || maxValue === 0) return (value) => formatNumber(value);
  const precision = precisionPrefix(Math.abs(maxValue), Math.abs(maxValue));
  return formatPrefix(",." + Math.max(0, precision), Math.abs(maxValue));
}

/** Signature for axis tick and tooltip value formatters. */
export type Formatter<TValue = number> = (value: TValue) => string;
