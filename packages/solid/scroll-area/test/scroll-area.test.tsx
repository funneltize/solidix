import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";
import * as ScrollArea from "../src/index";

// Regression tests for https://github.com/radix-ui/primitives/issues/3963
describe("ScrollArea ref stability", () => {
  afterEach(cleanup);

  it("keeps a stable composed ref on the root", () => {
    assertStableComposedRef((ref) => (
      <ScrollArea.Root ref={ref}>
        <ScrollArea.Viewport disableImplicitContentElement>
          <ScrollArea.Content>content</ScrollArea.Content>
        </ScrollArea.Viewport>
      </ScrollArea.Root>
    ));
  });

  it("keeps a stable composed ref on the scrollbar", () => {
    assertStableComposedRef((ref) => (
      <ScrollArea.Root type="always">
        <ScrollArea.Viewport disableImplicitContentElement>
          <ScrollArea.Content>content</ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" ref={ref}>
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    ));
  });
});

/**
 * jsdom gives every element zero layout, so `ScrollArea.Corner` measures itself
 * as 0x0 and renders nothing. Give the scrollbars a size before the stubbed
 * `ResizeObserver` delivers its deferred callback, which is what the corner
 * measures from.
 */
function assignScrollbarsSizes() {
  for (const scrollbar of document.querySelectorAll("[data-orientation]")) {
    Object.defineProperty(scrollbar, "offsetWidth", { configurable: true, get: () => 16 });
    Object.defineProperty(scrollbar, "offsetHeight", { configurable: true, get: () => 16 });
  }
}

/**
 * The shared setup stub never delivers observations; tests that assert
 * resize-driven rendering install a delivering `ResizeObserver` themselves.
 */
function stubDeliveringResizeObserver() {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      cb: ResizeObserverCallback;
      constructor(cb: ResizeObserverCallback) {
        this.cb = cb;
      }
      observe() {
        this.cb([], this as unknown as ResizeObserver);
      }
      unobserve() {}
      disconnect() {}
    },
  );
}

describe("ScrollArea.Root", () => {
  afterEach(cleanup);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ScrollArea.Root
        type="always"
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <ScrollArea.Viewport disableImplicitContentElement>
          <ScrollArea.Content>Content</ScrollArea.Content>
        </ScrollArea.Viewport>
      </ScrollArea.Root>
    ));

    const root = screen.getByTestId("root");
    expect(root.classList.contains("custom-class")).toBe(true);
    expect((root as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(root);

    fireEvent.click(root);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ScrollArea.Root
        type="always"
        asChild
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <article>
          <ScrollArea.Viewport disableImplicitContentElement>
            <ScrollArea.Content>Content</ScrollArea.Content>
          </ScrollArea.Viewport>
        </article>
      </ScrollArea.Root>
    ));

    const root = screen.getByTestId("root");
    expect(root.tagName).toBe("ARTICLE");
    expect((root as HTMLElement).style.position).toBe("relative");
    expect(root.classList.contains("custom-class")).toBe(true);
    expect((root as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(root);

    fireEvent.click(root);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("ScrollArea.Scrollbar", () => {
  afterEach(cleanup);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ScrollArea.Root type="always">
        <ScrollArea.Viewport disableImplicitContentElement>
          <ScrollArea.Content>Content</ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          orientation="vertical"
          ref={(node) => void (element = node)}
          data-testid="scrollbar"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        />
      </ScrollArea.Root>
    ));

    const scrollbar = screen.getByTestId("scrollbar");
    expect(scrollbar.classList.contains("custom-class")).toBe(true);
    expect((scrollbar as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(scrollbar);

    fireEvent.click(scrollbar);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ScrollArea.Root type="always">
        <ScrollArea.Viewport disableImplicitContentElement>
          <ScrollArea.Content>Content</ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          orientation="vertical"
          asChild
          ref={(node) => void (element = node)}
          data-testid="scrollbar"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <article />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    ));

    const scrollbar = screen.getByTestId("scrollbar");
    expect(scrollbar.tagName).toBe("ARTICLE");
    expect(scrollbar.getAttribute("data-orientation")).toBe("vertical");
    expect(scrollbar.getAttribute("data-state")).toBe("visible");
    expect(scrollbar.classList.contains("custom-class")).toBe(true);
    expect((scrollbar as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(scrollbar);

    fireEvent.click(scrollbar);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("ScrollArea.Thumb", () => {
  afterEach(cleanup);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ScrollArea.Root type="always">
        <ScrollArea.Viewport disableImplicitContentElement>
          <ScrollArea.Content>Content</ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb
            // `forceMount` because the thumb otherwise waits for a measured overflow
            forceMount
            ref={(node) => void (element = node)}
            data-testid="thumb"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    ));

    const thumb = screen.getByTestId("thumb");
    expect(thumb.classList.contains("custom-class")).toBe(true);
    expect((thumb as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(thumb);

    fireEvent.click(thumb);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ScrollArea.Root type="always">
        <ScrollArea.Viewport disableImplicitContentElement>
          <ScrollArea.Content>Content</ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb
            forceMount
            asChild
            ref={(node) => void (element = node)}
            data-testid="thumb"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article />
          </ScrollArea.Thumb>
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    ));

    const thumb = screen.getByTestId("thumb");
    expect(thumb.tagName).toBe("ARTICLE");
    expect(thumb.getAttribute("data-state")).toBe("hidden");
    expect(thumb.classList.contains("custom-class")).toBe(true);
    expect((thumb as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(thumb);

    fireEvent.click(thumb);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("ScrollArea.Corner", () => {
  afterEach(cleanup);

  it("spreads props it does not consume onto the element it renders", async () => {
    stubDeliveringResizeObserver();
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ScrollArea.Root type="always">
        <ScrollArea.Viewport disableImplicitContentElement>
          <ScrollArea.Content>Content</ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="horizontal" />
        <ScrollArea.Scrollbar orientation="vertical" />
        <ScrollArea.Corner
          ref={(node) => void (element = node)}
          data-testid="corner"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        />
      </ScrollArea.Root>
    ));
    assignScrollbarsSizes();

    const corner = await vi.waitFor(() => screen.getByTestId("corner"));
    expect(corner.classList.contains("custom-class")).toBe(true);
    expect((corner as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(corner);

    fireEvent.click(corner);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", async () => {
    stubDeliveringResizeObserver();
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ScrollArea.Root type="always">
        <ScrollArea.Viewport disableImplicitContentElement>
          <ScrollArea.Content>Content</ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="horizontal" />
        <ScrollArea.Scrollbar orientation="vertical" />
        <ScrollArea.Corner
          asChild
          ref={(node) => void (element = node)}
          data-testid="corner"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <article />
        </ScrollArea.Corner>
      </ScrollArea.Root>
    ));
    assignScrollbarsSizes();

    const corner = await vi.waitFor(() => screen.getByTestId("corner"));
    expect(corner.tagName).toBe("ARTICLE");
    expect((corner as HTMLElement).style.position).toBe("absolute");
    expect((corner as HTMLElement).style.width).toBe("16px");
    expect(corner.classList.contains("custom-class")).toBe(true);
    expect((corner as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(corner);

    fireEvent.click(corner);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("ScrollArea.Viewport", () => {
  afterEach(cleanup);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ScrollArea.Root type="always">
        <ScrollArea.Viewport
          ref={(node) => void (element = node)}
          data-testid="viewport"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          Content
        </ScrollArea.Viewport>
      </ScrollArea.Root>
    ));

    const viewport = screen.getByTestId("viewport");
    expect(viewport.classList.contains("custom-class")).toBe(true);
    expect((viewport as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(viewport);

    fireEvent.click(viewport);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ScrollArea.Root type="always">
        <ScrollArea.Viewport
          asChild
          ref={(node) => void (element = node)}
          data-testid="viewport"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <article>Content</article>
        </ScrollArea.Viewport>
      </ScrollArea.Root>
    ));

    const viewport = screen.getByTestId("viewport");
    expect(viewport.tagName).toBe("ARTICLE");
    expect(viewport.getAttribute("data-radix-scroll-area-viewport")).toBe("");
    expect((viewport as HTMLElement).style.overflowX).toBe("hidden");
    expect((viewport as HTMLElement).style.overflowY).toBe("hidden");
    expect(viewport.classList.contains("custom-class")).toBe(true);
    expect((viewport as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(viewport);
    const contentWrapper = viewport.firstElementChild as HTMLElement;
    expect(contentWrapper.style.display).toBe("table");
    expect(contentWrapper.style.minWidth).toBe("100%");
    expect(viewport.textContent).toContain("Content");

    fireEvent.click(viewport);
    expect(onClick).toHaveBeenCalled();
  });

  // Regression for the Slottable fallback when `asChild` can't redirect onto a
  // single element child. This avoids a breaking change for users who are
  // misusing the asChild API. We should expect this test to fail when we remove
  // the fallback branch ahead of the next major release.
  it("falls back to the content wrapper when `asChild` children are not a single element", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const condition = false;

    expect(() => {
      render(() => (
        <ScrollArea.Root type="always">
          <ScrollArea.Viewport asChild data-testid="viewport" class="custom-class">
            {condition && <article />}
          </ScrollArea.Viewport>
        </ScrollArea.Root>
      ));
    }).not.toThrow();

    // Props land on the implicit content wrapper rather than throwing because
    // there is no element for Slot to target
    const viewport = screen.getByTestId("viewport");
    expect(viewport.classList.contains("custom-class")).toBe(true);
    expect((viewport as HTMLElement).style.display).toBe("table");
    expect((viewport as HTMLElement).style.minWidth).toBe("100%");
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("`asChild` expects a single element child"),
    );

    warn.mockRestore();
  });

  it("renders an implicit content element around its children by default", () => {
    render(() => (
      <ScrollArea.Root type="always">
        <ScrollArea.Viewport data-testid="viewport">Content</ScrollArea.Viewport>
      </ScrollArea.Root>
    ));

    const viewport = screen.getByTestId("viewport");
    const content = viewport.firstElementChild as HTMLElement;
    expect(content).toBeInstanceOf(HTMLDivElement);
    expect(content.style.display).toBe("table");
    expect(content.style.minWidth).toBe("100%");
    expect(content.textContent).toContain("Content");
  });

  it("skips the implicit content element when `disableImplicitContentElement` is set", () => {
    render(() => (
      <ScrollArea.Root type="always">
        <ScrollArea.Viewport disableImplicitContentElement data-testid="viewport">
          <span data-testid="child">Content</span>
        </ScrollArea.Viewport>
      </ScrollArea.Root>
    ));

    const viewport = screen.getByTestId("viewport");
    const child = screen.getByTestId("child");
    expect(viewport.firstElementChild).toBe(child);
    expect((child as HTMLElement).style.display).not.toBe("table");
  });

  it("forwards props to the child when `asChild` is set with `disableImplicitContentElement`", () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ScrollArea.Root type="always">
        <ScrollArea.Viewport
          asChild
          disableImplicitContentElement
          ref={(node) => void (element = node)}
          data-testid="viewport"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <article>
            <ScrollArea.Content>Content</ScrollArea.Content>
          </article>
        </ScrollArea.Viewport>
      </ScrollArea.Root>
    ));

    const viewport = screen.getByTestId("viewport");
    expect(viewport.tagName).toBe("ARTICLE");
    expect(viewport.getAttribute("data-radix-scroll-area-viewport")).toBe("");
    expect((viewport as HTMLElement).style.overflowX).toBe("hidden");
    expect((viewport as HTMLElement).style.overflowY).toBe("hidden");
    expect(viewport.classList.contains("custom-class")).toBe(true);
    expect((viewport as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(viewport);
    const contentWrapper = viewport.firstElementChild as HTMLElement;
    expect(contentWrapper.style.display).toBe("table");
    expect(contentWrapper.style.minWidth).toBe("100%");
    expect(viewport.textContent).toContain("Content");

    fireEvent.click(viewport);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("ScrollArea.Content", () => {
  afterEach(cleanup);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ScrollArea.Root type="always">
        <ScrollArea.Viewport disableImplicitContentElement>
          <ScrollArea.Content
            ref={(node) => void (element = node)}
            data-testid="content"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            Content
          </ScrollArea.Content>
        </ScrollArea.Viewport>
      </ScrollArea.Root>
    ));

    const content = screen.getByTestId("content");
    expect((content as HTMLElement).style.display).toBe("table");
    expect((content as HTMLElement).style.minWidth).toBe("100%");
    expect(content.classList.contains("custom-class")).toBe(true);
    expect((content as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    fireEvent.click(content);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ScrollArea.Root type="always">
        <ScrollArea.Viewport disableImplicitContentElement>
          <ScrollArea.Content
            asChild
            ref={(node) => void (element = node)}
            data-testid="content"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article>Content</article>
          </ScrollArea.Content>
        </ScrollArea.Viewport>
      </ScrollArea.Root>
    ));

    const content = screen.getByTestId("content");
    expect(content.tagName).toBe("ARTICLE");
    expect((content as HTMLElement).style.display).toBe("table");
    expect((content as HTMLElement).style.minWidth).toBe("100%");
    expect(content.classList.contains("custom-class")).toBe(true);
    expect((content as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);
    expect(content.textContent).toContain("Content");

    fireEvent.click(content);
    expect(onClick).toHaveBeenCalled();
  });
});

/**
 * Solid equivalent of Radix's `assertStableComposedRef` helper. Solid
 * components render once (there are no re-renders to count), so instead of a
 * render budget this asserts the composed ref settles: a stable callback ref
 * that writes a signal when it receives a node must not be detached and
 * re-attached in a loop.
 */
function assertStableComposedRef(
  renderWithRef: (ref: (node: unknown) => void) => JSX.Element,
  { maxCalls = 25 }: { maxCalls?: number | undefined } = {},
) {
  let calls = 0;

  function Probe() {
    const [tick, setTick] = createSignal(0);
    tick();
    // The probe ref is intentionally stable so that any loop is caused by the
    // component under test, not by this helper.
    const ref = (node: unknown) => {
      calls++;
      if (node) setTick((t) => t + 1);
    };
    return renderWithRef(ref);
  }

  expect(() => render(() => <Probe />)).not.toThrow();
  expect(
    calls,
    `Expected the component to settle, but the ref was called ${calls} times ` +
      `(>= ${maxCalls}). This usually means a composed ref callback is being ` +
      `recreated on every update.`,
  ).toBeLessThan(maxCalls);
}
