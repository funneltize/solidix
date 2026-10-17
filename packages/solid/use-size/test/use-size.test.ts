import { afterEach, describe, expect, test, vi } from "vitest";
import { createRoot, flush } from "solid-js";
import { useSize } from "../src/index";

describe("useSize", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("reports offset size immediately, then ResizeObserver updates", () => {
    let observerCallback!: ResizeObserverCallback;
    const observe = vi.fn();
    const unobserve = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: ResizeObserverCallback) {
          observerCallback = callback;
        }
        observe = observe;
        unobserve = unobserve;
        disconnect() {}
      },
    );
    const frames: Array<() => void> = [];
    vi.stubGlobal("requestAnimationFrame", (cb: () => void) => {
      frames.push(cb);
      return frames.length;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});

    const element = document.createElement("div");
    Object.defineProperty(element, "offsetWidth", { value: 100 });
    Object.defineProperty(element, "offsetHeight", { value: 50 });

    let size!: () => { width: number; height: number } | undefined;
    const dispose = createRoot((d) => {
      size = useSize(element);
      return d;
    });
    flush();

    expect(size()).toEqual({ width: 100, height: 50 });
    expect(observe).toHaveBeenCalled();

    observerCallback(
      [{ borderBoxSize: [{ inlineSize: 200, blockSize: 80 }] } as any],
      {} as ResizeObserver,
    );
    frames.shift()?.();
    flush();
    expect(size()).toEqual({ width: 200, height: 80 });

    dispose();
    expect(unobserve).toHaveBeenCalled();
  });

  test("resets to undefined when the element becomes null", () => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );

    const element = document.createElement("div");
    let size!: () => unknown;
    const dispose = createRoot((d) => {
      size = useSize(() => element);
      return d;
    });
    flush();
    expect(size()).toBeDefined();

    dispose();
    flush();
  });
});
