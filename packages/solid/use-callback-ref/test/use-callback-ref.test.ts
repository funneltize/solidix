import { describe, expect, test, vi } from "vitest";
import { useCallbackRef } from "../src/index";

describe("useCallbackRef", () => {
  test("returns a stable function that calls the latest callback", () => {
    const first = vi.fn();
    const stable = useCallbackRef(first);
    const again = useCallbackRef(first);

    stable("a");
    expect(first).toHaveBeenCalledWith("a");
    expect(typeof stable).toBe("function");
    expect(typeof again).toBe("function");
  });

  test("tolerates an undefined callback", () => {
    const stable = useCallbackRef(undefined);
    expect(() => stable()).not.toThrow();
  });

  test("sees reactive state at call time", () => {
    let value = 1;
    const stable = useCallbackRef(() => value);

    value = 2;
    expect(stable()).toBe(2);
  });
});
