import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import {
  ScrollGallery,
  type ScrollGalleryRootRef,
} from "../src/index";

/** Spies installed on `Element.prototype` (jsdom implements neither). */
let scrollBySpy: ReturnType<typeof vi.fn>;
let scrollToSpy: ReturnType<typeof vi.fn>;

/** Last `IntersectionObserver` instance created by the delivering stub. */
let ioInstance: {
  cb: IntersectionObserverCallback;
  targets: Element[];
} | null = null;

beforeEach(() => {
  // Reduced motion off so programmatic scrolls use the requested behavior.
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
  // Controllable IntersectionObserver: the shared setup only stubs
  // ResizeObserver; jsdom provides neither observer.
  ioInstance = null;
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      cb: IntersectionObserverCallback;
      constructor(cb: IntersectionObserverCallback) {
        this.cb = cb;
        ioInstance = { cb, targets: [] };
      }
      observe(target: Element) {
        ioInstance?.targets.push(target);
      }
      unobserve() {}
      disconnect() {}
    },
  );
  scrollBySpy = vi.fn();
  scrollToSpy = vi.fn();
  Element.prototype.scrollBy = scrollBySpy as unknown as typeof Element.prototype.scrollBy;
  Element.prototype.scrollTo = scrollToSpy as unknown as typeof Element.prototype.scrollTo;
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete (Element.prototype as unknown as Record<string, unknown>).scrollBy;
  delete (Element.prototype as unknown as Record<string, unknown>).scrollTo;
});

/** Horizontal gallery with three items, buttons, and markers. */
function Gallery(props: {
  value?: number | undefined;
  defaultValue?: number | undefined;
  loop?: boolean | undefined;
  orientation?: "horizontal" | "vertical" | undefined;
  onValueChange?: ((value: number, metadata: { source: string }) => void) | undefined;
  ref?: ((handle: ScrollGalleryRootRef | null) => void) | undefined;
}) {
  return (
    <ScrollGallery.Root
      value={props.value}
      defaultValue={props.defaultValue}
      loop={props.loop}
      orientation={props.orientation}
      onValueChange={props.onValueChange}
      ref={props.ref}
    >
      <ScrollGallery.Previous>Prev</ScrollGallery.Previous>
      <ScrollGallery.Viewport>
        <ScrollGallery.Item>One</ScrollGallery.Item>
        <ScrollGallery.Item>Two</ScrollGallery.Item>
        <ScrollGallery.Item>Three</ScrollGallery.Item>
      </ScrollGallery.Viewport>
      <ScrollGallery.Next>Next</ScrollGallery.Next>
      <ScrollGallery.ScrollMarkerGroup>
        <ScrollGallery.ScrollMarker index={0} aria-label="Go to one" />
        <ScrollGallery.ScrollMarker index={1} aria-label="Go to two" />
        <ScrollGallery.ScrollMarker index={2} aria-label="Go to three" />
      </ScrollGallery.ScrollMarkerGroup>
    </ScrollGallery.Root>
  );
}

/** Mock a horizontal overflow layout on the viewport (100px page, 3 items). */
function mockOverflow(viewport: HTMLElement, scrollLeft = 0) {
  Object.defineProperty(viewport, "clientWidth", { configurable: true, get: () => 100 });
  Object.defineProperty(viewport, "scrollWidth", { configurable: true, get: () => 300 });
  Object.defineProperty(viewport, "scrollLeft", { configurable: true, get: () => scrollLeft });
}

/** Mock static item/viewport rects (items 100px wide starting at `offset`). */
function mockRects(items: HTMLElement[], viewport: HTMLElement, offset = 0) {
  const rect = (left: number, width: number) =>
    ({
      left,
      top: 0,
      right: left + width,
      bottom: 100,
      width,
      height: 100,
      x: left,
      y: 0,
      toJSON: () => {},
    }) as DOMRect;
  items.forEach((item, i) => {
    Object.defineProperty(item, "getBoundingClientRect", {
      configurable: true,
      value: () => rect(offset + i * 100, 100),
    });
  });
  Object.defineProperty(viewport, "getBoundingClientRect", {
    configurable: true,
    value: () => rect(0, 100),
  });
}

function viewportEl(): HTMLElement {
  return document.querySelector(".fui-ScrollGalleryViewport") as HTMLElement;
}

function itemEls(): HTMLElement[] {
  return [...document.querySelectorAll(".fui-ScrollGalleryItem")] as HTMLElement[];
}

describe("ScrollGallery", () => {
  it("renders viewport, items, buttons, and markers with upstream classes", async () => {
    render(() => <Gallery />);
    await screen.findByText("Two");

    const viewport = viewportEl();
    expect(viewport.getAttribute("data-orientation")).toBe("horizontal");
    expect(viewport.getAttribute("data-active-index")).toBe("0");

    const items = itemEls();
    expect(items).toHaveLength(3);
    expect(items.map((item) => item.getAttribute("data-index"))).toEqual(["0", "1", "2"]);
    expect(items[0].hasAttribute("data-active")).toBe(true);
    expect(items[1].hasAttribute("data-active")).toBe(false);

    // No overflow in jsdom's zero layout: both buttons start disabled.
    expect((screen.getByRole("button", { name: "Prev" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Next" }) as HTMLButtonElement).disabled).toBe(true);

    const group = screen.getByRole("tablist");
    expect(group.classList.contains("fui-ScrollGalleryScrollMarkerGroup")).toBe(true);
    expect(group.getAttribute("aria-orientation")).toBe("horizontal");

    const markers = screen.getAllByRole("tab");
    expect(markers).toHaveLength(3);
    expect(markers[0].getAttribute("aria-selected")).toBe("true");
    expect(markers[1].getAttribute("aria-selected")).toBe("false");
    expect(markers.map((marker) => marker.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  });

  it("marker click activates the item and scrolls with indicator source", async () => {
    const onValueChange = vi.fn();
    render(() => <Gallery onValueChange={onValueChange} />);
    await screen.findByText("Two");

    const viewport = viewportEl();
    mockOverflow(viewport);
    mockRects(itemEls(), viewport);

    fireEvent.click(screen.getByRole("tab", { name: "Go to three" }));

    expect(scrollBySpy).toHaveBeenCalledWith({ left: 200, behavior: "smooth" });
    expect(onValueChange).toHaveBeenCalledWith(2, { source: "indicator" });
    await screen.findByText("Three");
    expect(itemEls()[2].hasAttribute("data-active")).toBe(true);
    expect(viewport.getAttribute("data-active-index")).toBe("2");
    const markers = screen.getAllByRole("tab");
    expect(markers[2].getAttribute("aria-selected")).toBe("true");
    expect(markers[2].getAttribute("tabindex")).toBe("0");
  });

  it("enables next and disables previous at the start with overflow", async () => {
    render(() => <Gallery />);
    await screen.findByText("Two");

    const viewport = viewportEl();
    mockOverflow(viewport, 0);
    fireEvent.scroll(viewport);

    await vi.waitFor(() => {
      expect((screen.getByRole("button", { name: "Prev" }) as HTMLButtonElement).disabled).toBe(true);
      expect((screen.getByRole("button", { name: "Next" }) as HTMLButtonElement).disabled).toBe(false);
    });
    expect(viewport.hasAttribute("data-can-scroll-next")).toBe(true);
    expect(viewport.hasAttribute("data-can-scroll-prev")).toBe(false);
  });

  it("disables next at the end boundary", async () => {
    render(() => <Gallery />);
    await screen.findByText("Two");

    const viewport = viewportEl();
    mockOverflow(viewport, 200);
    fireEvent.scroll(viewport);

    await vi.waitFor(() => {
      expect((screen.getByRole("button", { name: "Next" }) as HTMLButtonElement).disabled).toBe(true);
      expect((screen.getByRole("button", { name: "Prev" }) as HTMLButtonElement).disabled).toBe(false);
    });
  });

  it("next click scrolls by one page (85% of the viewport)", async () => {
    render(() => <Gallery />);
    await screen.findByText("Two");

    const viewport = viewportEl();
    mockOverflow(viewport, 0);
    fireEvent.scroll(viewport);
    await vi.waitFor(() => {
      expect((screen.getByRole("button", { name: "Next" }) as HTMLButtonElement).disabled).toBe(false);
    });

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(scrollBySpy).toHaveBeenCalledWith({ left: 85, behavior: "smooth" });
  });

  it("user scroll recomputes the active index with scroll source", async () => {
    const onValueChange = vi.fn();
    render(() => <Gallery onValueChange={onValueChange} />);
    await screen.findByText("Two");

    const viewport = viewportEl();
    // As-if scrolled one page: scroll offset 100 with rects shifted one item.
    mockOverflow(viewport, 100);
    mockRects(itemEls(), viewport, -100);
    fireEvent.scroll(viewport);

    expect(onValueChange).toHaveBeenCalledWith(1, { source: "scroll" });
    await vi.waitFor(() => {
      expect(itemEls()[1].hasAttribute("data-active")).toBe(true);
    });
  });

  it("viewport arrow key steps to the next item", async () => {
    render(() => <Gallery />);
    await screen.findByText("Two");

    const viewport = viewportEl();
    mockOverflow(viewport);
    mockRects(itemEls(), viewport);
    fireEvent.keyDown(viewport, { key: "ArrowRight" });

    expect(scrollBySpy).toHaveBeenCalledWith({ left: 100, behavior: "smooth" });
    await vi.waitFor(() => {
      expect(itemEls()[1].hasAttribute("data-active")).toBe(true);
    });
  });

  it("marker group arrow key moves focus and activates", async () => {
    render(() => <Gallery />);
    await screen.findByText("Two");

    const viewport = viewportEl();
    mockOverflow(viewport);
    mockRects(itemEls(), viewport);

    const markers = screen.getAllByRole("tab");
    markers[0].focus();
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });

    expect(document.activeElement).toBe(markers[1]);
    expect(scrollBySpy).toHaveBeenCalledWith({ left: 100, behavior: "smooth" });
    await vi.waitFor(() => {
      expect(itemEls()[1].hasAttribute("data-active")).toBe(true);
    });
  });

  it("controlled value change scrolls to the item", async () => {
    const onValueChange = vi.fn();
    const [value, setValue] = createSignal(0);
    render(() => <Gallery value={value()} onValueChange={onValueChange} />);
    await screen.findByText("Two");

    const viewport = viewportEl();
    mockOverflow(viewport);
    mockRects(itemEls(), viewport);

    setValue(2);
    await vi.waitFor(() => {
      expect(scrollBySpy).toHaveBeenCalledWith({ left: 200, behavior: "smooth" });
    });
    expect(onValueChange).toHaveBeenCalledWith(2, { source: "indicator" });
    expect(itemEls()[2].hasAttribute("data-active")).toBe(true);
  });

  it("defaultValue scrolls to the initial item on mount", async () => {
    // Root's mount scroll runs inside `render()`, before any post-render
    // mock could land: drive layout through dataset-backed prototype
    // getters installed pre-render instead.
    const proto = HTMLElement.prototype as unknown as Record<string, unknown>;
    const descriptors = (["offsetLeft", "offsetWidth", "clientWidth"] as const).map(
      (key) => [key, Object.getOwnPropertyDescriptor(proto, key)] as const,
    );
    const dataNumber = (el: HTMLElement, key: string) => {
      const raw = el.dataset[key];
      return raw == null ? 0 : Number(raw);
    };
    Object.defineProperty(proto, "offsetLeft", {
      configurable: true,
      get(this: HTMLElement) {
        return dataNumber(this, "offset");
      },
    });
    Object.defineProperty(proto, "offsetWidth", {
      configurable: true,
      get(this: HTMLElement) {
        return dataNumber(this, "page");
      },
    });
    Object.defineProperty(proto, "clientWidth", {
      configurable: true,
      get(this: HTMLElement) {
        return dataNumber(this, "page");
      },
    });
    try {
      render(() => (
        <ScrollGallery.Root defaultValue={2}>
          <ScrollGallery.Viewport data-page="100">
            <ScrollGallery.Item data-offset="0" data-page="100">
              One
            </ScrollGallery.Item>
            <ScrollGallery.Item data-offset="100" data-page="100">
              Two
            </ScrollGallery.Item>
            <ScrollGallery.Item data-offset="200" data-page="100">
              Three
            </ScrollGallery.Item>
          </ScrollGallery.Viewport>
        </ScrollGallery.Root>
      ));
      await screen.findByText("Two");
      expect(scrollToSpy).toHaveBeenCalledWith({ left: 200, behavior: "instant" });
      expect(itemEls()[2].hasAttribute("data-active")).toBe(true);
    } finally {
      for (const [key, descriptor] of descriptors) {
        if (descriptor) {
          Object.defineProperty(proto, key, descriptor);
        } else {
          delete proto[key];
        }
      }
    }
  });

  it("loop wraps previous at the start to the last item", async () => {
    render(() => <Gallery loop />);
    await screen.findByText("Two");

    // Loop keeps the button enabled at the boundary.
    expect((screen.getByRole("button", { name: "Prev" }) as HTMLButtonElement).disabled).toBe(false);

    const viewport = viewportEl();
    mockOverflow(viewport);
    mockRects(itemEls(), viewport);
    fireEvent.click(screen.getByRole("button", { name: "Prev" }));

    expect(scrollBySpy).toHaveBeenCalledWith({ left: 200, behavior: "smooth" });
    await vi.waitFor(() => {
      expect(itemEls()[2].hasAttribute("data-active")).toBe(true);
    });
  });

  it("exposes an imperative scrollTo via ref", async () => {
    let handle: ScrollGalleryRootRef | null | undefined;
    render(() => <Gallery ref={(h) => (handle = h)} />);
    await screen.findByText("Two");
    expect(handle).not.toBeNull();

    const viewport = viewportEl();
    mockOverflow(viewport);
    mockRects(itemEls(), viewport);
    handle?.scrollTo(1);

    expect(scrollBySpy).toHaveBeenCalledWith({ left: 100, behavior: "smooth" });
    await vi.waitFor(() => {
      expect(itemEls()[1].hasAttribute("data-active")).toBe(true);
    });
  });

  it("marks items in view via the IntersectionObserver", async () => {
    render(() => <Gallery />);
    await screen.findByText("Two");
    expect(ioInstance).not.toBeNull();

    const items = itemEls();
    ioInstance?.cb(
      [
        { target: items[0], isIntersecting: true },
        { target: items[1], isIntersecting: false },
      ] as unknown as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    );

    expect(items[0].hasAttribute("data-in-view")).toBe(true);
    expect(items[1].hasAttribute("data-in-view")).toBe(false);
  });

  it("applies vertical orientation attributes", async () => {
    render(() => <Gallery orientation="vertical" />);
    await screen.findByText("Two");

    expect(viewportEl().getAttribute("data-orientation")).toBe("vertical");
    expect(screen.getByRole("tablist").getAttribute("aria-orientation")).toBe("vertical");
  });

  it("viewport function render receives merged props and state", async () => {
    render(() => (
      <ScrollGallery.Root>
        <ScrollGallery.Viewport
          render={(props, state) => (
            <section
              data-testid="custom-viewport"
              class={props.class}
              data-active-index={props["data-active-index"]}
            >
              {`active:${state.activeIndex} orientation:${state.orientation}`}
            </section>
          )}
        >
          <ScrollGallery.Item>One</ScrollGallery.Item>
        </ScrollGallery.Viewport>
      </ScrollGallery.Root>
    ));

    const custom = await screen.findByTestId("custom-viewport");
    expect(custom.tagName).toBe("SECTION");
    expect(custom.classList.contains("fui-ScrollGalleryViewport")).toBe(true);
    expect(custom.getAttribute("data-active-index")).toBe("0");
    expect(custom.textContent).toContain("active:0 orientation:horizontal");
  });

  it("item element render slots into the custom element", async () => {
    render(() => (
      <ScrollGallery.Root>
        <ScrollGallery.Viewport>
          <ScrollGallery.Item render={<li data-testid="custom-item" />}>One</ScrollGallery.Item>
        </ScrollGallery.Viewport>
      </ScrollGallery.Root>
    ));

    const custom = await screen.findByTestId("custom-item");
    expect(custom.tagName).toBe("LI");
    expect(custom.classList.contains("fui-ScrollGalleryItem")).toBe(true);
    expect(custom.getAttribute("data-index")).toBe("0");
    expect(custom.textContent).toBe("One");
  });

  it("throws when compound parts render outside Root", () => {
    expect(() => render(() => <ScrollGallery.Viewport />)).toThrow(
      "ScrollGallery compound components must be used within a ScrollGallery.Root",
    );
    expect(() =>
      render(() => (
        <ScrollGallery.Viewport>
          <ScrollGallery.Item>One</ScrollGallery.Item>
        </ScrollGallery.Viewport>
      )),
    ).toThrow("ScrollGallery compound components must be used within a ScrollGallery.Root");
  });
});
