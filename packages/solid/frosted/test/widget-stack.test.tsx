import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { useWidgetStack, useWidgetStackItem, WidgetStack } from "../src/index";

/** Controllable IntersectionObserver stub (jsdom provides none). */
let ioInstances: Array<{ cb: IntersectionObserverCallback; targets: Element[] }> = [];

beforeEach(() => {
  ioInstances = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      instance: { cb: IntersectionObserverCallback; targets: Element[] };
      constructor(cb: IntersectionObserverCallback) {
        this.instance = { cb, targets: [] };
        ioInstances.push(this.instance);
      }
      observe(target: Element) {
        this.instance.targets.push(target);
      }
      unobserve() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollBy = vi.fn();
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete (Element.prototype as unknown as Record<string, unknown>).scrollBy;
});

function Stack(props: { autoPlay?: number | undefined; orientation?: "horizontal" | "vertical" }) {
  return (
    <WidgetStack.Root autoPlay={props.autoPlay} orientation={props.orientation}>
      <WidgetStack.Prev>Previous</WidgetStack.Prev>
      <WidgetStack.Stack>
        <WidgetStack.Item>One</WidgetStack.Item>
        <WidgetStack.Item>Two</WidgetStack.Item>
        <WidgetStack.Item>Three</WidgetStack.Item>
      </WidgetStack.Stack>
      <WidgetStack.Next>Next</WidgetStack.Next>
    </WidgetStack.Root>
  );
}

/** Fire an intersection entry on every collected observer. */
function intersect(target: Element, isIntersecting: boolean, ratio = 1) {
  for (const { cb } of ioInstances) {
    cb(
      [
        { target, isIntersecting, intersectionRatio: ratio },
      ] as unknown as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    );
  }
}

/**
 * Fire a visibility entry on just one item's own observer. The stack
 * observer watches every item while each item observer watches one, so
 * the single-target instance identifies the item's observer. (Upstream
 * item handlers apply any entry they receive without checking
 * `entry.target`, so broadcast firing cannot set items independently.)
 */
function setItemVisible(item: Element, ratio: number) {
  const instance = ioInstances.find(
    (candidate) => candidate.targets.length === 1 && candidate.targets[0] === item,
  );
  expect(instance).not.toBeUndefined();
  instance?.cb(
    [
      { target: item, isIntersecting: ratio > 0, intersectionRatio: ratio },
    ] as unknown as IntersectionObserverEntry[],
    {} as IntersectionObserver,
  );
}

describe("WidgetStack", () => {
  it("renders the stack, items, and navigation with upstream classes", async () => {
    render(() => <Stack />);
    await screen.findByText("Two");

    const stack = document.querySelector(".fui-WidgetStackStack") as HTMLElement;
    expect(stack).not.toBeNull();
    const scrollArea = stack.querySelector(".fui-WidgetStackScrollArea") as HTMLElement;
    // Vertical is the default orientation.
    expect(scrollArea.getAttribute("data-orientation")).toBe("vertical");

    const items = [...document.querySelectorAll(".fui-WidgetStackItem")] as HTMLElement[];
    expect(items).toHaveLength(3);
    for (const item of items) {
      expect(item.getAttribute("role")).toBe("group");
      expect(item.getAttribute("aria-roledescription")).toBe("slide");
      expect(item.querySelector(".fui-WidgetStackItemContent")).not.toBeNull();
    }
  });

  it("marks fully visible items and lifts inert", async () => {
    render(() => <Stack />);
    await screen.findByText("Two");

    const items = [...document.querySelectorAll(".fui-WidgetStackItem")] as HTMLElement[];
    setItemVisible(items[0], 1);
    setItemVisible(items[1], 0.5);

    await vi.waitFor(() => {
      expect(items[0].getAttribute("data-fully-visible")).toBe("true");
    });
    expect(items[0].hasAttribute("inert")).toBe(false);
    expect(items[1].hasAttribute("data-fully-visible")).toBe(false);
    expect(items[1].hasAttribute("inert")).toBe(true);
  });

  it("disables prev at the first item and next at the last", async () => {
    render(() => <Stack />);
    await screen.findByText("Two");

    const prev = screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement;
    const next = screen.getByRole("button", { name: "Next" }) as HTMLButtonElement;
    const items = [...document.querySelectorAll(".fui-WidgetStackItem")] as HTMLElement[];

    intersect(items[0], true, 1);
    await vi.waitFor(() => {
      expect(prev.disabled).toBe(true);
    });
    expect(next.disabled).toBe(false);
    expect(prev.getAttribute("data-disabled")).toBe("");

    intersect(items[2], true, 1);
    await vi.waitFor(() => {
      expect(next.disabled).toBe(true);
    });
    expect(prev.disabled).toBe(false);
  });

  it("next click scrolls to the following widget", async () => {
    render(() => <Stack orientation="horizontal" />);
    await screen.findByText("Two");

    const scrollArea = document.querySelector(".fui-WidgetStackScrollArea") as HTMLElement;
    const items = [...document.querySelectorAll(".fui-WidgetStackItem")] as HTMLElement[];
    const rect = (left: number) =>
      ({ left, top: 0, width: 100, height: 100 }) as unknown as DOMRect;
    items.forEach((item, i) => {
      Object.defineProperty(item, "getBoundingClientRect", {
        configurable: true,
        value: () => rect(i * 100),
      });
    });
    Object.defineProperty(scrollArea, "getBoundingClientRect", {
      configurable: true,
      value: () => rect(0),
    });

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: 100, behavior: "smooth" });
  });

  it("autoplay advances until manual navigation disables it", async () => {
    render(() => <Stack autoPlay={30} orientation="horizontal" />);
    await screen.findByText("Two");

    const scrollArea = document.querySelector(".fui-WidgetStackScrollArea") as HTMLElement;
    const items = [...document.querySelectorAll(".fui-WidgetStackItem")] as HTMLElement[];
    const rect = (left: number) =>
      ({ left, top: 0, width: 100, height: 100 }) as unknown as DOMRect;
    items.forEach((item, i) => {
      Object.defineProperty(item, "getBoundingClientRect", {
        configurable: true,
        value: () => rect(i * 100),
      });
    });
    Object.defineProperty(scrollArea, "getBoundingClientRect", {
      configurable: true,
      value: () => rect(0),
    });

    const scrollBy = Element.prototype.scrollBy as unknown as ReturnType<typeof vi.fn>;
    await vi.waitFor(() => {
      expect(scrollBy).toHaveBeenCalled();
    });
    const countAfterAutoplay = scrollBy.mock.calls.length;

    // Manual navigation permanently disables autoplay.
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    const countAfterManual = scrollBy.mock.calls.length;
    expect(countAfterManual).toBeGreaterThan(countAfterAutoplay);
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(scrollBy.mock.calls.length).toBe(countAfterManual);
  });

  it("exposes the stack and item hooks", async () => {
    let stackState: ReturnType<typeof useWidgetStack> | null | undefined;
    let itemVisible: (() => boolean) | null | undefined;
    const Probe = () => {
      stackState = useWidgetStack();
      return null;
    };
    const ItemProbe = () => {
      itemVisible = useWidgetStackItem().isFullyVisible;
      return null;
    };
    render(() => (
      <WidgetStack.Root>
        <Probe />
        <WidgetStack.Stack>
          <WidgetStack.Item>
            <ItemProbe />
          </WidgetStack.Item>
        </WidgetStack.Stack>
      </WidgetStack.Root>
    ));
    await vi.waitFor(() => {
      expect(stackState?.widgetsCount).toBe(1);
    });
    expect(stackState?.currentWidgetIndex).toBe(0);
    expect(stackState?.nextDisabled).toBe(false);
    expect(itemVisible?.()).toBe(false);
  });

  it("throws outside the providers", () => {
    expect(() => render(() => <WidgetStack.Stack>Hi</WidgetStack.Stack>)).toThrow(
      "WidgetStackContext must be used within a WidgetStackRoot",
    );
    const ItemProbe = () => {
      useWidgetStackItem();
      return null;
    };
    expect(() => render(() => <ItemProbe />)).toThrow(
      "WidgetStackItemContext must be used within a WidgetStackItem",
    );
  });
});
