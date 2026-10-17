import { describe, expect, test, vi } from "vitest";
import { composeRefs, useComposedRefs } from "../src/index";

describe("composeRefs", () => {
  test("sets callback refs and ref objects", () => {
    const node = document.createElement("div");
    const callback = vi.fn();
    const object = { current: null as HTMLDivElement | null };

    composeRefs<HTMLDivElement>(callback, object)(node);

    expect(callback).toHaveBeenCalledWith(node);
    expect(object.current).toBe(node);
  });

  test("propagates null (unmount) to all refs", () => {
    const callback = vi.fn();
    const object = { current: document.createElement("div") as HTMLDivElement | null };

    composeRefs(callback, object, null, undefined)(null);

    expect(callback).toHaveBeenCalledWith(null);
    expect(object.current).toBe(null);
  });

  test("useComposedRefs composes the same way", () => {
    const node = document.createElement("div");
    const first = vi.fn();
    const second = vi.fn();

    useComposedRefs(first, second)(node);

    expect(first).toHaveBeenCalledWith(node);
    expect(second).toHaveBeenCalledWith(node);
  });
});
