import { describe, expect, it } from "vitest";
import {
  createBandScale,
  createLinearScale,
  createPointScale,
  createTimeScale,
  evenTickSubset,
  normalizeDomain,
} from "../src/scales";

describe("createBandScale", () => {
  it("spreads categories across the range", () => {
    const scale = createBandScale({ domain: ["a", "b"], range: [0, 100], padding: 0 });
    expect(scale("a")).toBe(0);
    expect(scale("b")).toBe(50);
    expect(scale.bandwidth()).toBe(50);
    expect(scale.step()).toBe(50);
  });

  it("shrinks bands with padding", () => {
    const scale = createBandScale({ domain: ["a", "b"], range: [0, 100], padding: 0.2 });
    expect(scale.bandwidth()).toBeLessThan(50);
  });
});

describe("createPointScale", () => {
  it("maps categories to points with zero bandwidth", () => {
    const scale = createPointScale({ domain: ["a", "b"], range: [0, 100], padding: 0 });
    expect(scale("a")).toBe(0);
    expect(scale("b")).toBe(100);
    expect(scale.bandwidth()).toBe(0);
  });
});

describe("createLinearScale", () => {
  it("interpolates the domain onto the range", () => {
    const scale = createLinearScale({ domain: [0, 100], range: [200, 0] });
    expect(scale(0)).toBe(200);
    expect(scale(50)).toBe(100);
    expect(scale.ticks(2)).toEqual([0, 50, 100]);
  });

  it("nices and clamps when asked", () => {
    const scale = createLinearScale({
      domain: [0.3, 9.2],
      range: [0, 100],
      nice: true,
      clamp: true,
    });
    expect(scale.domain()).toEqual([0, 10]);
    expect(scale(99)).toBe(100);
  });
});

describe("createTimeScale", () => {
  it("maps dates across the range", () => {
    const start = new Date(2026, 0, 1);
    const end = new Date(2026, 0, 3);
    const scale = createTimeScale({ domain: [start, end], range: [0, 100] });
    expect(scale(start)).toBe(0);
    expect(scale(end)).toBe(100);
    expect(scale(new Date(2026, 0, 2))).toBe(50);
  });
});

describe("evenTickSubset", () => {
  it("returns the domain when it fits", () => {
    expect(evenTickSubset(["a", "b"], 5)).toEqual(["a", "b"]);
  });

  it("picks evenly spaced labels beyond the budget", () => {
    const domain = ["a", "b", "c", "d", "e", "f"];
    expect(evenTickSubset(domain, 3)).toEqual(["a", "c", "e"]);
  });

  it("returns nothing for a zero budget", () => {
    expect(evenTickSubset(["a"], 0)).toEqual([]);
  });
});

describe("normalizeDomain", () => {
  it("expands collapsed domains", () => {
    expect(normalizeDomain([5, 5])).toEqual([4.5, 5.5]);
    expect(normalizeDomain([0, 0])).toEqual([-1, 1]);
  });

  it("spans zero when asked", () => {
    expect(normalizeDomain([3, 7], true)).toEqual([0, 7]);
    expect(normalizeDomain([-7, -3], true)).toEqual([-7, 0]);
  });

  it("repairs inverted extents", () => {
    expect(normalizeDomain([9, 2])).toEqual([2, 9]);
  });
});
