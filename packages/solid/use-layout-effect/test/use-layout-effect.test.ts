import { describe, expect, test, vi } from "vitest";
import { createRoot } from "solid-js";
import { flush } from "solid-js";
import { useLayoutEffect } from "../src/index";

describe("useLayoutEffect", () => {
  test("runs once settled and runs cleanup on dispose", () => {
    const effect = vi.fn();
    const cleanup = vi.fn();

    createRoot((dispose) => {
      useLayoutEffect(() => {
        effect();
        return cleanup;
      });
      flush();
      expect(effect).toHaveBeenCalledTimes(1);
      dispose();
    });

    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
