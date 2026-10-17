import { describe, expect, test } from "vitest";
import { clamp } from "../src/index.js";

describe("clamp", () => {
  test("returns the value when inside the range", () => {
    expect(clamp(5, [0, 10])).toBe(5);
  });

  test("clamps to min and max", () => {
    expect(clamp(-5, [0, 10])).toBe(0);
    expect(clamp(15, [0, 10])).toBe(10);
  });

  test("is inclusive of the bounds", () => {
    expect(clamp(0, [0, 10])).toBe(0);
    expect(clamp(10, [0, 10])).toBe(10);
  });
});
