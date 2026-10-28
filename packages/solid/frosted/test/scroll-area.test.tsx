import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { ScrollArea } from "../src/index";

/** Collected observer instances for re-firing after dimension mocks land. */
let observers: Array<{ cb: ResizeObserverCallback; target: Element }> = [];

/**
 * Delivering `ResizeObserver` stub (headless scroll-area precedent): the
 * shared setup stub never delivers observations. Instances are collected so
 * tests can re-fire after mocking layout dimensions. Restored after each test.
 */
function stubDeliveringResizeObserver() {
  observers = [];
  vi.stubGlobal(
    "ResizeObserver",
    class {
      cb: ResizeObserverCallback;
      constructor(cb: ResizeObserverCallback) {
        this.cb = cb;
      }
      observe(target: Element) {
        observers.push({ cb: this.cb, target });
        this.cb([], this as unknown as ResizeObserver);
      }
      unobserve() {}
      disconnect() {}
    },
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Re-fire every collected observer (after dimension mocks are installed). */
function refireObservers() {
  for (const { cb } of observers) {
    cb([], {} as ResizeObserver);
  }
}

/** Mock jsdom layout dimensions (all zero without layout). */
function mockDimensions() {
  const viewport = document.querySelector(".fui-ScrollAreaViewport") as HTMLElement;
  Object.defineProperty(viewport, "offsetWidth", { configurable: true, get: () => 100 });
  Object.defineProperty(viewport, "offsetHeight", { configurable: true, get: () => 100 });
  Object.defineProperty(viewport, "scrollWidth", { configurable: true, get: () => 200 });
  Object.defineProperty(viewport, "scrollHeight", { configurable: true, get: () => 200 });
  for (const scrollbar of document.querySelectorAll(".fui-ScrollAreaScrollbar")) {
    Object.defineProperty(scrollbar, "clientWidth", { configurable: true, get: () => 16 });
    Object.defineProperty(scrollbar, "clientHeight", { configurable: true, get: () => 16 });
    Object.defineProperty(scrollbar, "offsetWidth", { configurable: true, get: () => 16 });
    Object.defineProperty(scrollbar, "offsetHeight", { configurable: true, get: () => 16 });
  }
}

describe("ScrollArea", () => {
  it("renders root, viewport, and content with upstream classes", async () => {
    render(() => (
      <ScrollArea style={{ height: "100px" }}>
        <div>Scrollable content</div>
      </ScrollArea>
    ));
    const content = await screen.findByText("Scrollable content");
    const viewport = content.closest(".fui-ScrollAreaViewport");
    expect(viewport).not.toBeNull();
    expect(viewport?.closest(".fui-ScrollAreaRoot")).not.toBeNull();
    // No forced tabIndex: native focusable-scroller behavior applies.
    expect(viewport?.hasAttribute("tabindex")).toBe(false);
  });

  it("sets the viewport overflow from the scrollbars prop", async () => {
    const { unmount } = render(() => (
      <ScrollArea scrollbars="vertical">
        <div>Vertical</div>
      </ScrollArea>
    ));
    const vertical = (await screen.findByText("Vertical")).closest(
      ".fui-ScrollAreaViewport",
    ) as HTMLElement | null;
    expect(vertical?.style.overflow).toBe("hidden scroll");
    unmount();
    render(() => (
      <ScrollArea scrollbars="horizontal">
        <div>Horizontal</div>
      </ScrollArea>
    ));
    const horizontal = (await screen.findByText("Horizontal")).closest(
      ".fui-ScrollAreaViewport",
    ) as HTMLElement | null;
    expect(horizontal?.style.overflow).toBe("scroll hidden");
  });

  it("renders only the requested scrollbar orientations", async () => {
    // `always` keeps scrollbars mounted without overflow measurement.
    const { unmount } = render(() => (
      <ScrollArea scrollbars="vertical" type="always">
        <div>Vertical only</div>
      </ScrollArea>
    ));
    await screen.findByText("Vertical only");
    expect(document.querySelectorAll(".fui-ScrollAreaScrollbar")).toHaveLength(1);
    expect(
      document.querySelector(".fui-ScrollAreaScrollbar")?.getAttribute("data-orientation"),
    ).toBe("vertical");
    unmount();
    render(() => (
      <ScrollArea scrollbars="horizontal" type="always">
        <div>Horizontal only</div>
      </ScrollArea>
    ));
    await screen.findByText("Horizontal only");
    expect(document.querySelectorAll(".fui-ScrollAreaScrollbar")).toHaveLength(1);
    expect(
      document.querySelector(".fui-ScrollAreaScrollbar")?.getAttribute("data-orientation"),
    ).toBe("horizontal");
  });

  it("renders both scrollbars, thumbs, and the corner", async () => {
    stubDeliveringResizeObserver();
    render(() => (
      <ScrollArea type="always" size="2">
        <div>Both</div>
      </ScrollArea>
    ));
    await screen.findByText("Both");
    mockDimensions();
    refireObservers();
    // Settle past the rAF + debounce measurement chain.
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Scrollbars are pure visual divs (no `scrollbar` role - Radix parity: the
    // viewport is the AT surface), so assert classes, not roles.
    const scrollbars = document.querySelectorAll(".fui-ScrollAreaScrollbar");
    expect(scrollbars).toHaveLength(2);
    expect([...scrollbars].map((s) => s.getAttribute("data-orientation")).sort()).toEqual([
      "horizontal",
      "vertical",
    ]);
    for (const scrollbar of scrollbars) {
      expect(scrollbar.classList.contains("fui-r-size-2")).toBe(true);
      expect(scrollbar.getAttribute("data-type")).toBe("always");
      expect(scrollbar.querySelector(".fui-ScrollAreaThumb")).not.toBeNull();
    }
    expect(document.querySelector(".fui-ScrollAreaCorner")).not.toBeNull();
  });
});
