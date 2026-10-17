import { describe, expect, test, vi } from "vitest";
import { render } from "@solidjs/testing-library";
import { useEscapeKeydown } from "../src/index";

describe("useEscapeKeydown", () => {
  test("calls back on Escape keydown, ignoring IME compositions", async () => {
    const onEscape = vi.fn();
    function Probe() {
      useEscapeKeydown(onEscape);
      return null;
    }
    render(() => <Probe />);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onEscape).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
    expect(onEscape).toHaveBeenCalledTimes(1);

    const composing = new KeyboardEvent("keydown", { key: "Escape", bubbles: true });
    Object.defineProperty(composing, "isComposing", { value: true });
    document.dispatchEvent(composing);
    expect(onEscape).toHaveBeenCalledTimes(1);
  });
});
