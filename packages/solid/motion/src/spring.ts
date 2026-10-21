// Spring easing compiler: simulates a damped harmonic oscillator and samples
// the motion into a CSS `linear()` timing function, so spring physics runs on
// the compositor with zero runtime cost. Pure math - no dependencies.

/** Physics and sampling parameters for compiling a spring into a CSS easing. */
export type SpringOptions = {
  /** Spring stiffness. Higher values move faster. Defaults to `170`. */
  stiffness?: number | undefined;
  /** Damping coefficient. Lower values bounce more. Defaults to `22`. */
  damping?: number | undefined;
  /** Mass of the animated object. Defaults to `1`. */
  mass?: number | undefined;
  /** Number of `linear()` stops, including the endpoints. Defaults to `33`. */
  stops?: number | undefined;
};

/** Named spring presets available in `springPresets` and `springs.css`. */
export type SpringPresetName = "gentle" | "default" | "snappy" | "bouncy";

/** Ready-made spring parameters (mass is `1` throughout). Pair with the
 * durations in `springs.css` (`--solidix-spring-<name>-duration`). */
export const springPresets: Record<
  SpringPresetName,
  { stiffness: number; damping: number; mass: number }
> = {
  gentle: { stiffness: 120, damping: 14, mass: 1 },
  default: { stiffness: 170, damping: 22, mass: 1 },
  snappy: { stiffness: 400, damping: 30, mass: 1 },
  bouncy: { stiffness: 200, damping: 12, mass: 1 },
};

const DEFAULT_STOPS = 33;
// Normalized-time simulation (ω = 1): with timescale factored out, the motion
// shape depends only on the damping ratio ζ - which is all a `linear()`
// easing encodes. Fixed-step semi-implicit Euler at ω·dt ≪ 2 is stable for
// any stiffness, including springs an absolute-time simulation rejects.
const STEP_HZ = 240;
const SETTLE_EPSILON = 0.0005;
// ζ below this rings too long to sample; ζ = 0.05 already overshoots ~85%.
// Above MAX_ZETA the motion is single-exponential creep with no overshoot -
// visually identical at any larger ratio once normalized to its duration -
// so clamp instead of simulating (this also absorbs overflow/underflow in the
// ratio arithmetic into a sane, finite value). Both bounds settle within the
// step budget below.
const MIN_ZETA = 0.05;
const MAX_ZETA = 10;
const MAX_STEPS = STEP_HZ * 200;
const CACHE_LIMIT = 256;

const cache = new Map<string, string>();

function assertPositiveFinite(name: string, value: number): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new RangeError(
      `[motion] ${name} must be a positive finite number (got ${String(value)}).`,
    );
  }
}

function trim(value: number, digits: number): string {
  const fixed = value.toFixed(digits);
  return fixed.includes(".") ? fixed.replace(/\.?0+$/, "") : fixed;
}

/**
 * Compiles spring parameters into a CSS `linear()` easing string.
 *
 * The motion is simulated from rest (`0`) toward `1` until it settles, then
 * sampled into evenly spaced stops. Simulation runs in normalized time, so
 * only the damping ratio shapes the output - springs with equal ratios but
 * different timescales compile identically, and absolute timescale is
 * absorbed by the transition duration you declare in CSS. Results are cached
 * by parameters. Throws when the parameters are invalid or the spring is too
 * underdamped to settle (increase damping).
 */
export function createSpring(options: SpringOptions = {}): string {
  if (options === null || typeof options !== "object") {
    throw new TypeError(`[motion] options must be an object (got ${String(options)}).`);
  }
  const stiffness = options.stiffness ?? springPresets.default.stiffness;
  const damping = options.damping ?? springPresets.default.damping;
  const mass = options.mass ?? springPresets.default.mass;
  const stops = options.stops ?? DEFAULT_STOPS;
  assertPositiveFinite("stiffness", stiffness);
  assertPositiveFinite("damping", damping);
  assertPositiveFinite("mass", mass);
  if (!Number.isInteger(stops) || stops < 2 || stops > 1000) {
    throw new RangeError(
      `[motion] stops must be an integer between 2 and 1000 (got ${String(stops)}).`,
    );
  }

  const key = `${stiffness}|${damping}|${mass}|${stops}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  // The damping ratio is the only parameter the easing shape depends on.
  // The comparison catches 0 (overflowed ratio arithmetic) and NaN alike.
  const zetaRaw = damping / (2 * Math.sqrt(stiffness * mass));
  if (!(zetaRaw >= MIN_ZETA)) {
    throw new RangeError(
      `[motion] spring did not settle - damping ratio ${trim(zetaRaw, 4)} is below ${String(MIN_ZETA)}; increase damping (or lower stiffness / mass).`,
    );
  }
  const zeta = Math.min(zetaRaw, MAX_ZETA);

  const dt = 1 / STEP_HZ;
  const dampingTerm = 2 * zeta;
  let position = 0;
  let velocity = 0;
  const samples: number[] = [0];
  let step = 0;
  while (step < MAX_STEPS) {
    const force = -(position - 1) - dampingTerm * velocity;
    velocity += force * dt;
    position += velocity * dt;
    samples.push(position);
    step += 1;
    if (Math.abs(position - 1) < SETTLE_EPSILON && Math.abs(velocity) < SETTLE_EPSILON) {
      break;
    }
  }
  // Unreachable for ζ >= MIN_ZETA (the envelope provably settles first);
  // kept as a backstop so simulation can never loop unboundedly.
  if (step >= MAX_STEPS) {
    throw new RangeError(
      "[motion] spring did not settle - increase damping (or lower stiffness / mass).",
    );
  }

  const last = samples.length - 1;
  // Endpoints are exact so the transition never jumps at either end.
  const parts: string[] = ["0"];
  for (let i = 1; i < stops - 1; i += 1) {
    const value = samples[Math.round((i * last) / (stops - 1))];
    parts.push(`${trim(value, 4)} ${trim((i * 100) / (stops - 1), 2)}%`);
  }
  parts.push("1");
  const easing = `linear(${parts.join(", ")})`;

  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next();
    if (!oldest.done) cache.delete(oldest.value);
  }
  cache.set(key, easing);
  return easing;
}
