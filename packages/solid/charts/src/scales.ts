/**
 * d3 scale factories for charts: band and point scales for categorical axes,
 * linear and time scales for value axes. Each factory returns the configured
 * scale plus helpers series components use for geometry.
 */
import {
  scaleBand,
  scaleLinear,
  scalePoint,
  scaleTime,
  type ScaleBand,
  type ScaleLinear,
  type ScalePoint,
  type ScaleTime,
} from "d3-scale";

/** Orientation of an axis scale along the plot area. */
export type ScaleOrientation = "horizontal" | "vertical";

/** Options shared by all categorical scale factories. */
export interface CategoricalScaleOptions {
  /** Category domain in display order. */
  domain: ReadonlyArray<string>;
  /** Pixel range: `[start, stop]` along the axis. */
  range: readonly [number, number];
  /** Padding between bands as a fraction of band width. Defaults to `0.2`. */
  padding?: number | undefined;
  /** Padding inside each band. Defaults to half of `padding`. */
  paddingInner?: number | undefined;
  /** Padding at the domain ends. Defaults to half of `padding`. */
  paddingOuter?: number | undefined;
  /** Round band edges to whole pixels. Defaults to `false`. */
  round?: boolean | undefined;
  /** Align outer padding when the range has leftover space. Defaults to `0.5`. */
  align?: number | undefined;
}

/**
 * Create a band scale for bar charts: each category gets a band wide enough
 * for grouped or single bars.
 */
export function createBandScale(options: CategoricalScaleOptions): ScaleBand<string> {
  const scale = scaleBand<string>()
    .domain([...options.domain])
    .range([options.range[0], options.range[1]]);
  if (options.padding !== undefined) scale.padding(options.padding);
  if (options.paddingInner !== undefined) scale.paddingInner(options.paddingInner);
  if (options.paddingOuter !== undefined) scale.paddingOuter(options.paddingOuter);
  if (options.round !== undefined) scale.round(options.round);
  if (options.align !== undefined) scale.align(options.align);
  return scale;
}

/**
 * Create a point scale for line and area charts: each category maps to a
 * single pixel point.
 */
export function createPointScale(options: CategoricalScaleOptions): ScalePoint<string> {
  const scale = scalePoint<string>()
    .domain([...options.domain])
    .range([options.range[0], options.range[1]]);
  if (options.padding !== undefined) scale.padding(options.padding);
  if (options.round !== undefined) scale.round(options.round);
  if (options.align !== undefined) scale.align(options.align);
  return scale;
}

/** Options for linear value scales. */
export interface LinearScaleOptions {
  /** Data domain. Defaults to `[0, 1]`. */
  domain?: readonly [number, number] | undefined;
  /** Pixel range: `[start, stop]` along the axis. */
  range: readonly [number, number];
  /** Extend the domain to round values. Defaults to `false`. */
  nice?: boolean | number | undefined;
  /** Clamp output to the range. Defaults to `false`. */
  clamp?: boolean | undefined;
}

/** Create a linear scale for numeric value axes. */
export function createLinearScale(options: LinearScaleOptions): ScaleLinear<number, number> {
  const scale = scaleLinear()
    .domain(options.domain ? [options.domain[0], options.domain[1]] : [0, 1])
    .range([options.range[0], options.range[1]]);
  if (options.nice !== undefined && options.nice !== false) {
    if (options.nice === true) scale.nice();
    else scale.nice(options.nice);
  }
  if (options.clamp !== undefined) scale.clamp(options.clamp);
  return scale;
}

/** Options for time value scales. */
export interface TimeScaleOptions {
  /** Date domain. Defaults to the current day. */
  domain?: readonly [Date, Date] | undefined;
  /** Pixel range: `[start, stop]` along the axis. */
  range: readonly [number, number];
  /** Extend the domain to round values. Defaults to `false`. */
  nice?: boolean | undefined;
  /** Clamp output to the range. Defaults to `false`. */
  clamp?: boolean | undefined;
}

/** Create a time scale for date-valued axes. */
export function createTimeScale(options: TimeScaleOptions): ScaleTime<number, number> {
  const now = new Date();
  const scale = scaleTime()
    .domain(options.domain ? [options.domain[0], options.domain[1]] : [now, now])
    .range([options.range[0], options.range[1]]);
  if (options.nice) scale.nice();
  if (options.clamp !== undefined) scale.clamp(options.clamp);
  return scale;
}

/**
 * Evenly spaced tick values between `start` and `stop` (inclusive).
 * Used to derive band-axis tick subsets when labels would collide.
 */
export function evenTickSubset(
  domain: ReadonlyArray<string>,
  maxTicks: number,
): ReadonlyArray<string> {
  if (maxTicks <= 0) return [];
  if (domain.length <= maxTicks) return [...domain];
  const step = Math.ceil(domain.length / maxTicks);
  const picks: Array<string> = [];
  for (let index = 0; index < domain.length; index += step) picks.push(domain[index]!);
  return picks;
}

/**
 * Normalize a domain that may collapse to a single value (or be empty) into
 * a plottable `[min, max]` pair. Zero-width domains expand symmetrically;
 * when `includeZero` is set the domain always spans zero.
 */
export function normalizeDomain(
  extent: readonly [number, number],
  includeZero?: boolean | undefined,
): [number, number] {
  let [min, max] = extent;
  if (!Number.isFinite(min)) min = 0;
  if (!Number.isFinite(max)) max = 0;
  if (min === max) {
    const padding = Math.abs(min) > 0 ? Math.abs(min) * 0.1 : 1;
    min -= padding;
    max += padding;
  }
  if (min > max) [min, max] = [max, min];
  if (includeZero) {
    min = Math.min(min, 0);
    max = Math.max(max, 0);
    if (min === max) {
      min = -1;
      max = 1;
    }
  }
  return [min, max];
}
