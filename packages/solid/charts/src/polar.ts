/**
 * Shared polar geometry: angle placement, radius fractions, and cartesian
 * projection for radar and radial series. Framework-agnostic; every function
 * is pure.
 */

/** A 2D point in plot pixels. */
export interface PolarPoint {
  /** Horizontal offset in pixels. */
  x: number;
  /** Vertical offset in pixels. */
  y: number;
}

/** Start angle pointing straight up, matching gauge and pie conventions. */
export const POLAR_START_ANGLE = -Math.PI / 2;

/**
 * Evenly spaced angle for one slot of a radial layout.
 *
 * @param index Zero-based slot index.
 * @param count Total slot count. Returns `startAngle` when `count` is `0`.
 * @param startAngle Angle of the first slot in radians. Defaults to straight up.
 * @param offset Extra rotation applied to every slot, in radians.
 */
export function angleForIndex(
  index: number,
  count: number,
  startAngle: number = POLAR_START_ANGLE,
  offset: number = 0,
): number {
  if (count <= 0) return startAngle + offset;
  return startAngle + offset + (index / count) * Math.PI * 2;
}

/**
 * Project a polar coordinate onto cartesian plot pixels.
 *
 * @param cx Center x in pixels.
 * @param cy Center y in pixels.
 * @param radius Distance from the center in pixels.
 * @param angle Angle in radians, measured clockwise from the positive x axis
 * in SVG coordinates (y grows downward).
 */
export function polarPoint(cx: number, cy: number, radius: number, angle: number): PolarPoint {
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}

/**
 * Normalize a value to a `0..1` radius fraction over `[min, max]`.
 * Clamps out-of-range values; a degenerate domain maps everything to `0`
 * except values at or above `max`, which map to `1`.
 */
export function radialFraction(value: number, min: number, max: number): number {
  if (!(max > min)) return value >= max ? 1 : 0;
  if (value <= min) return 0;
  if (value >= max) return 1;
  return (value - min) / (max - min);
}

/**
 * Text anchor for a spoke label at an angle: labels on the right half anchor
 * at the start, on the left half at the end, and near the poles in the
 * middle. Angles within `tolerance` radians of a pole count as polar.
 */
export function spokeTextAnchor(
  angle: number,
  tolerance: number = 0.2,
): "start" | "middle" | "end" {
  const x = Math.cos(angle);
  if (x > tolerance) return "start";
  if (x < -tolerance) return "end";
  return "middle";
}
