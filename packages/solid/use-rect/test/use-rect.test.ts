import { describe, expect, test, vi } from "vitest";
import { createRoot, flush } from "solid-js";
import { useRect } from "../src/index";

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

describe("useRect", () => {
  test("observes the measurable rect and clears on dispose", () => {
    const frames: Array<() => void> = [];
    vi.stubGlobal("requestAnimationFrame", (cb: () => void) => {
      frames.push(cb);
      return frames.length;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});

    const element = { getBoundingClientRect: () => rect({ width: 42 }) };
    let observed!: () => DOMRect | undefined;
    const dispose = createRoot((d) => {
      observed = useRect(element);
      return d;
    });
    flush();

    expect(observed()).toBeUndefined();
    frames.shift()?.();
    flush();
    expect(observed()?.width).toBe(42);

    dispose();
    flush();
    expect(observed()).toBeUndefined();

    vi.unstubAllGlobals();
  });
});
