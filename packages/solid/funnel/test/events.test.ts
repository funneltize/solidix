import { describe, expect, test, vi } from "vitest";
import { dispatchFunnelEvent } from "../src/index";

describe("dispatchFunnelEvent", () => {
  test("dispatches a bubbling composed event with detail", () => {
    const onEvent = vi.fn();
    document.addEventListener("funnel:view", onEvent);
    try {
      const target = document.createElement("div");
      document.body.append(target);
      try {
        dispatchFunnelEvent(target, "funnel:view", { block: "hero" });
      } finally {
        target.remove();
      }
      expect(onEvent).toHaveBeenCalledTimes(1);
      const event = onEvent.mock.calls[0]![0] as CustomEvent;
      expect(event.bubbles).toBe(true);
      expect(event.composed).toBe(true);
      expect(event.detail).toEqual({ block: "hero" });
    } finally {
      document.removeEventListener("funnel:view", onEvent);
    }
  });
});
