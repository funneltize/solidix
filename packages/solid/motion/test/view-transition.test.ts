import { afterEach, describe, expect, test, vi } from "vitest";
import { createSignal, flush } from "solid-js";
import { viewTransition } from "../src/index";

function mockStartViewTransition(impl: (callback: () => void) => ViewTransition) {
  Object.defineProperty(document, "startViewTransition", {
    value: impl,
    configurable: true,
    writable: true,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete (document as { startViewTransition?: unknown }).startViewTransition;
});

describe("viewTransition", () => {
  test("runs the update instantly and returns null without support", () => {
    const [value, setValue] = createSignal(0);
    const result = viewTransition(() => setValue(1));
    expect(result).toBe(null);
    flush();
    expect(value()).toBe(1);
  });

  test("skips the transition when reduced motion is preferred", () => {
    const start = vi.fn();
    mockStartViewTransition(start);
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const [value, setValue] = createSignal(0);
    const result = viewTransition(() => setValue(1));
    expect(result).toBe(null);
    expect(start).not.toHaveBeenCalled();
    flush();
    expect(value()).toBe(1);
  });

  test("transitions when matchMedia is unavailable", () => {
    const transition = { finished: Promise.resolve() } as unknown as ViewTransition;
    const start = vi.fn((_callback: () => void) => transition);
    mockStartViewTransition(start);
    vi.stubGlobal("matchMedia", undefined);
    const result = viewTransition(() => {});
    expect(result).toBe(transition);
    expect(start).toHaveBeenCalledTimes(1);
  });

  test("flushes Solid writes inside the update callback", () => {
    let captured: (() => void) | undefined;
    const transition = { finished: Promise.resolve() } as unknown as ViewTransition;
    mockStartViewTransition((callback: () => void) => {
      captured = callback;
      return transition;
    });
    const [value, setValue] = createSignal(0);
    const result = viewTransition(() => setValue(1));
    expect(result).toBe(transition);
    expect(typeof captured).toBe("function");
    captured?.();
    // Without the flush, Solid 2 reads would still see the stale value here.
    expect(value()).toBe(1);
  });

  test("throws for non-function updates", () => {
    expect(() => viewTransition(undefined as unknown as () => void)).toThrow(TypeError);
  });
});
