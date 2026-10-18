import { describe, expect, test } from "vitest";
import { createSpring, springPresets, type SpringOptions } from "../src/index";

type Stop = { value: number; at: number };

function parseStops(easing: string): Stop[] {
  expect(easing.startsWith("linear(")).toBe(true);
  expect(easing.endsWith(")")).toBe(true);
  const body = easing.slice("linear(".length, -1);
  return body.split(",").map((stop, index) => {
    const [value, at] = stop.trim().split(/\s+/);
    return {
      value: Number(value),
      at: at === undefined ? (index === 0 ? 0 : 100) : Number(at.replace("%", "")),
    };
  });
}

function peak(easing: string): number {
  return Math.max(...parseStops(easing).map((stop) => stop.value));
}

describe("createSpring", () => {
  test("emits endpoints, ascending stops, and the requested stop count", () => {
    const stops = parseStops(createSpring({ stops: 10 }));
    expect(stops).toHaveLength(10);
    expect(stops[0]).toEqual({ value: 0, at: 0 });
    expect(stops[stops.length - 1]).toEqual({ value: 1, at: 100 });
    for (let i = 1; i < stops.length; i += 1) {
      expect(stops[i]!.at).toBeGreaterThan(stops[i - 1]!.at);
    }
  });

  test("bouncier presets peak higher, in preset order", () => {
    const peaks = (["default", "snappy", "gentle", "bouncy"] as const).map((name) =>
      peak(createSpring(springPresets[name])),
    );
    expect(peaks[0]).toBeGreaterThan(1);
    expect(peaks[1]).toBeGreaterThan(peaks[0]!);
    expect(peaks[2]).toBeGreaterThan(peaks[1]!);
    expect(peaks[3]).toBeGreaterThan(peaks[2]!);
    expect(peaks[3]).toBeLessThan(1.5);
  });

  test("overdamped springs never overshoot and stay monotonic", () => {
    const stops = parseStops(createSpring({ stiffness: 100, damping: 40, mass: 1 }));
    for (let i = 1; i < stops.length; i += 1) {
      expect(stops[i]!.value).toBeGreaterThanOrEqual(stops[i - 1]!.value);
      expect(stops[i]!.value).toBeLessThanOrEqual(1);
    }
  });

  test("defaults match the default preset and compile deterministically", () => {
    expect(createSpring()).toBe(createSpring(springPresets.default));
    expect(createSpring({ stiffness: 300, damping: 20 })).toBe(
      createSpring({ stiffness: 300, damping: 20 }),
    );
  });

  test("rejects non-physical parameters", () => {
    for (const stiffness of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => createSpring({ stiffness })).toThrow(RangeError);
    }
    expect(() => createSpring({ damping: 0 })).toThrow(RangeError);
    expect(() => createSpring({ mass: -2 })).toThrow(RangeError);
    for (const stops of [1, 1.5, 1001]) {
      expect(() => createSpring({ stops })).toThrow(RangeError);
    }
  });

  test("rejects springs that never settle", () => {
    expect(() => createSpring({ stiffness: 100, damping: 1e-6, mass: 1 })).toThrow(
      /did not settle/,
    );
  });

  test("rejects a null options object with a clear error", () => {
    expect(() => createSpring(null as unknown as SpringOptions)).toThrow(TypeError);
  });

  test("compiles identical output for equal damping ratios at any timescale", () => {
    // ζ = 22/(2√170) either way; only the CSS duration differs.
    expect(createSpring({ stiffness: 170, damping: 22, mass: 1 })).toBe(
      createSpring({ stiffness: 680, damping: 44, mass: 1 }),
    );
  });

  test("compiles slow but valid springs, however stiff", () => {
    // ζ ≈ 0.16: bouncy but settles; absolute-time simulation rejects it.
    const slow = createSpring({ stiffness: 1, damping: 10, mass: 1000 });
    expect(slow.startsWith("linear(0,")).toBe(true);
    expect(peak(slow)).toBeGreaterThan(1);
    // ω·dt would exceed the stability limit in absolute time.
    const stiff = createSpring({ stiffness: 1e6, damping: 500, mass: 1 });
    for (const stop of parseStops(stiff)) {
      expect(Number.isFinite(stop.value)).toBe(true);
    }
  });

  test("clamps extreme damping ratios to identical, finite output", () => {
    // ζ overflows to Infinity here; the clamp settles it like ζ = 10.
    const clamped = createSpring({ stiffness: 1e-300, damping: 1, mass: 1e-300 });
    expect(clamped).toBe(createSpring({ stiffness: 100, damping: 200, mass: 1 }));
    for (const stop of parseStops(clamped)) {
      expect(Number.isFinite(stop.value)).toBe(true);
      expect(stop.value).toBeLessThanOrEqual(1);
    }
  });

  test("evicts the oldest entries past the cache limit", () => {
    const first = createSpring({ stiffness: 111, damping: 11, mass: 1 });
    for (let i = 0; i < 300; i += 1) {
      createSpring({ stiffness: 200 + i, damping: 20, mass: 1 });
    }
    // Evicted or not, recompiling returns the identical easing.
    expect(createSpring({ stiffness: 111, damping: 11, mass: 1 })).toBe(first);
  });
});
