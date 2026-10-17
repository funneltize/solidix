import { afterEach, describe, expect, test, vi } from "vitest";
import { observeElementRect } from "../src/index.js";

function rect(overrides: Partial<DOMRect> = {}): DOMRect {
  return {
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
    ...overrides,
  } as DOMRect;
}

describe("observeElementRect", () => {
  const frames: Array<() => void> = [];
  const raf = vi.fn((cb: () => void) => {
    frames.push(cb);
    return frames.length;
  });
  const caf = vi.fn();

  afterEach(() => {
    frames.length = 0;
    vi.unstubAllGlobals();
  });

  test("calls back when the rect changes and stops after unsubscribe", () => {
    vi.stubGlobal("requestAnimationFrame", raf);
    vi.stubGlobal("cancelAnimationFrame", caf);

    let current = rect({ width: 10 });
    const calls: DOMRect[] = [];
    const unobserve = observeElementRect(
      { getBoundingClientRect: () => current },
      (r) => void calls.push(r),
    );

    // first frame: initial rect differs from `{}` so it fires
    frames.shift()?.();
    expect(calls).toHaveLength(1);

    // unchanged rect: no call
    frames.shift()?.();
    expect(calls).toHaveLength(1);

    current = rect({ width: 20 });
    frames.shift()?.();
    expect(calls).toHaveLength(2);
    expect(calls[1]?.width).toBe(20);

    unobserve();
    expect(caf).toHaveBeenCalled();
  });

  test("late subscribers get the current rect immediately", () => {
    vi.stubGlobal("requestAnimationFrame", raf);
    vi.stubGlobal("cancelAnimationFrame", caf);

    const element = { getBoundingClientRect: () => rect({ width: 5 }) };
    const first: DOMRect[] = [];
    const second: DOMRect[] = [];
    const unobserve1 = observeElementRect(element, (r) => void first.push(r));
    const unobserve2 = observeElementRect(element, (r) => void second.push(r));

    expect(second).toHaveLength(1);
    expect(second[0]?.width).toBe(5);

    unobserve1();
    unobserve2();
  });
});
