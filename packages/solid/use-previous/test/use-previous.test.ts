import { describe, expect, test } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import { usePrevious } from "../src/index";

describe("usePrevious", () => {
  test("returns the initial value, then the value before the latest change", () => {
    let setValue!: (value: number) => void;
    let previous!: () => number;
    const dispose = createRoot((d) => {
      const [value, set] = createSignal(1);
      setValue = set;
      previous = usePrevious(value);
      return d;
    });

    expect(previous()).toBe(1);

    setValue(2);
    flush();
    expect(previous()).toBe(1);

    setValue(3);
    flush();
    expect(previous()).toBe(2);

    dispose();
  });

  test("accepts a static value that never changes", () => {
    const dispose = createRoot((d) => {
      const previous = usePrevious("a");
      expect(previous()).toBe("a");
      flush();
      expect(previous()).toBe("a");
      return d;
    });
    dispose();
  });
});
