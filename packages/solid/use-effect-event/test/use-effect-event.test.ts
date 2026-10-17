import { describe, expect, test, vi } from "vitest";
import { useEffectEvent } from "../src/index";

describe("useEffectEvent", () => {
  test("calls the callback with forwarded arguments", () => {
    const callback = vi.fn();
    const event = useEffectEvent(callback);

    event("a", 1);
    expect(callback).toHaveBeenCalledWith("a", 1);
  });

  test("tolerates an undefined callback", () => {
    const event = useEffectEvent(undefined);
    expect(() => event()).not.toThrow();
  });
});
