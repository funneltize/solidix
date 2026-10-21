import { afterEach, beforeEach, describe, expect, test, vi, type Mock } from "vitest";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "../src/index";

// Regression test for https://github.com/radix-ui/primitives/issues/3963
describe("ref stability", () => {
  afterEach(cleanup);

  test("keeps a stable composed ref on the Toast root", async () => {
    // Solid components run setup once, so composed refs are inherently stable;
    // this asserts the ref fires exactly once (no detach/reattach on updates).
    const seen: Array<HTMLLIElement | null> = [];
    const [duration, setDuration] = createSignal(Infinity);
    render(() => (
      <ToastProvider>
        <Toast open duration={duration()} ref={(node) => void seen.push(node)} data-testid="toast">
          <ToastTitle>Title</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    ));

    await screen.findByTestId("toast");
    setDuration(2000);
    flush();
    await vi.waitFor(() => expect(screen.queryByTestId("toast")).toBeTruthy());

    expect(seen.length).toBe(1);
    expect(seen[0]).toBe(screen.getByTestId("toast"));
  });
});

// Callbacks passed to `useCallbackRef` must stay fresh: Solid props freeze at
// setup, so the port wraps `props.onX` in a stable closure that reads the prop
// at call time instead of capturing the setup-time value.
describe("callback freshness", () => {
  afterEach(cleanup);

  test("calls the latest onPause after the handler identity changes", async () => {
    const firstPause = vi.fn();
    const secondPause = vi.fn();
    // Wrap: `createSignal(fn)` would invoke `fn` as a lazy initializer.
    const [onPause, setOnPause] = createSignal<() => void>(() => firstPause);
    render(() => (
      <ToastProvider>
        <Toast open duration={Infinity} onPause={onPause()} data-testid="toast">
          <ToastTitle>Title</ToastTitle>
        </Toast>
        <ToastViewport data-testid="viewport" />
      </ToastProvider>
    ));

    const viewport = (await screen.findByTestId("viewport")) as HTMLElement;
    await screen.findByTestId("toast");
    expect(firstPause).not.toHaveBeenCalled();

    viewport.dispatchEvent(new CustomEvent("toast.viewportPause"));
    await vi.waitFor(() => expect(firstPause).toHaveBeenCalledTimes(1));

    setOnPause(() => secondPause);
    flush();

    viewport.dispatchEvent(new CustomEvent("toast.viewportPause"));
    await vi.waitFor(() => expect(secondPause).toHaveBeenCalledTimes(1));
    expect(firstPause).toHaveBeenCalledTimes(1);
  });
});

// Regression test for https://github.com/radix-ui/primitives/issues/2906
describe("escape key removal", () => {
  afterEach(cleanup);

  function renderToasts(onOpenChange: { first: Mock; second: Mock; third: Mock }) {
    render(() => (
      <ToastProvider>
        <Toast open duration={Infinity} onOpenChange={onOpenChange.first}>
          <ToastTitle>Toast 1</ToastTitle>
        </Toast>
        <Toast open duration={Infinity} onOpenChange={onOpenChange.second}>
          <ToastTitle>Toast 2</ToastTitle>
        </Toast>
        <Toast open duration={Infinity} onOpenChange={onOpenChange.third}>
          <ToastTitle>Toast 3</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    ));
  }

  test("closes only the focused (non-topmost) toast on Escape", async () => {
    const onOpenChange = { first: vi.fn(), second: vi.fn(), third: vi.fn() };
    renderToasts(onOpenChange);

    const focusedToast = (await screen.findByText("Toast 2")).closest("li")!;
    (focusedToast as HTMLElement).focus();
    fireEvent.keyDown(focusedToast, { key: "Escape" });

    await vi.waitFor(() => expect(onOpenChange.second).toHaveBeenCalledWith(false));
    expect(onOpenChange.first).not.toHaveBeenCalled();
    expect(onOpenChange.third).not.toHaveBeenCalled();
  });

  test("closes the topmost toast on Escape when focus is outside any toast", async () => {
    const onOpenChange = { first: vi.fn(), second: vi.fn(), third: vi.fn() };
    renderToasts(onOpenChange);

    await screen.findByText("Toast 3");
    fireEvent.keyDown(document.body, { key: "Escape" });

    await vi.waitFor(() => expect(onOpenChange.third).toHaveBeenCalledWith(false));
    expect(onOpenChange.first).not.toHaveBeenCalled();
    expect(onOpenChange.second).not.toHaveBeenCalled();
  });
});

// Regression test for https://github.com/radix-ui/primitives/issues/2233
describe("pause/resume with changing duration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test("closes after resume when duration changes from Infinity to a finite value while paused", () => {
    const onOpenChange = vi.fn();
    const [duration, setDuration] = createSignal(Infinity);

    render(() => (
      <ToastProvider>
        <Toast open duration={duration()} onOpenChange={onOpenChange}>
          <ToastTitle>Title</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    ));
    flush();

    // window blur pauses the toast
    fireEvent.blur(window);
    flush();

    // update the toast to a finite duration
    setDuration(3000);
    flush();

    // resume the toast
    fireEvent.focus(window);
    flush();

    // advancing past the new duration should now close the toast
    vi.advanceTimersByTime(3000);
    flush();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

// Regression test for https://github.com/radix-ui/primitives/pull/3703
describe("timer cleanup", () => {
  let clearTimeoutSpy: Mock<(id: number | undefined) => void>;
  beforeEach(() => {
    vi.useFakeTimers();
    clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
  });

  afterEach(() => {
    clearTimeoutSpy.mockRestore();
    cleanup();
    vi.useRealTimers();
  });

  test("should clear the close timer when the component unmounts before duration expires", () => {
    const { unmount } = render(() => (
      <ToastProvider duration={5000}>
        <Toast defaultOpen>
          <ToastTitle>Title</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    ));
    flush();

    // Advance time but not enough to trigger auto-close
    vi.advanceTimersByTime(1000);

    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  test("should not error when unmounting before time expires", () => {
    const { unmount } = render(() => (
      <ToastProvider duration={5000}>
        <Toast defaultOpen>
          <ToastTitle>Title</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    ));
    flush();

    // Advance time but not enough to trigger auto-close
    vi.advanceTimersByTime(1000);

    expect(() => {
      unmount();
      // Advance time past the original duration to ensure no errors occur. In
      // test environments, the dangling timeout would cause "ReferenceError:
      // document is not defined" errors since the DOM test environment would have
      // been torn down by this point.
      vi.advanceTimersByTime(5000);
    }).not.toThrow();
  });
});

describe("Toast.Root", () => {
  afterEach(cleanup);

  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ToastProvider>
        <Toast
          open
          duration={Infinity}
          ref={(node) => void (element = node)}
          data-testid="toast"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <ToastTitle>Title</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    ));

    const toast = (await screen.findByTestId("toast")) as HTMLElement;
    expect(toast.classList.contains("custom-class")).toBe(true);
    expect(toast.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(toast);

    fireEvent.click(toast);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ToastProvider>
        <Toast
          open
          duration={Infinity}
          asChild
          ref={(node) => void (element = node)}
          data-testid="toast"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <article>
            <ToastTitle>Title</ToastTitle>
          </article>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    ));

    // Settle first: slotted delegated listeners attach once connected.
    const toast = (await screen.findByTestId("toast")) as HTMLElement;
    expect(toast.tagName).toBe("ARTICLE");
    expect(toast.getAttribute("data-state")).toBe("open");
    expect(toast.getAttribute("data-swipe-direction")).toBe("right");
    expect(toast.classList.contains("custom-class")).toBe(true);
    expect(toast.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(toast);

    fireEvent.click(toast);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Toast.Viewport", () => {
  afterEach(cleanup);

  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ToastProvider>
        <ToastViewport
          ref={(node) => void (element = node)}
          data-testid="viewport"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        />
      </ToastProvider>
    ));

    const viewport = screen.getByTestId("viewport") as HTMLElement;
    expect(viewport.classList.contains("custom-class")).toBe(true);
    expect(viewport.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(viewport);

    fireEvent.click(viewport);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ToastProvider>
        <ToastViewport
          asChild
          ref={(node) => void (element = node)}
          data-testid="viewport"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <article />
        </ToastViewport>
      </ToastProvider>
    ));

    const viewport = screen.getByTestId("viewport") as HTMLElement;
    expect(viewport.tagName).toBe("ARTICLE");
    expect(viewport.getAttribute("tabindex")).toBe("-1");
    expect(viewport.classList.contains("custom-class")).toBe(true);
    expect(viewport.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(viewport);

    fireEvent.click(viewport);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Toast.Title", () => {
  afterEach(cleanup);

  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ToastProvider>
        <Toast open duration={Infinity}>
          <ToastTitle
            ref={(node) => void (element = node)}
            data-testid="title"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            Title
          </ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    ));

    const title = (await screen.findByTestId("title")) as HTMLElement;
    expect(title.classList.contains("custom-class")).toBe(true);
    expect(title.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(title);

    fireEvent.click(title);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ToastProvider>
        <Toast open duration={Infinity}>
          <ToastTitle
            asChild
            ref={(node) => void (element = node)}
            data-testid="title"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article>Title</article>
          </ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    ));

    // Settle first: slotted delegated listeners attach once connected.
    const title = (await screen.findByTestId("title")) as HTMLElement;
    expect(title.tagName).toBe("ARTICLE");
    expect(title.classList.contains("custom-class")).toBe(true);
    expect(title.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(title);

    fireEvent.click(title);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Toast.Description", () => {
  afterEach(cleanup);

  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ToastProvider>
        <Toast open duration={Infinity}>
          <ToastTitle>Title</ToastTitle>
          <ToastDescription
            ref={(node) => void (element = node)}
            data-testid="description"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            Description
          </ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    ));

    const description = (await screen.findByTestId("description")) as HTMLElement;
    expect(description.classList.contains("custom-class")).toBe(true);
    expect(description.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(description);

    fireEvent.click(description);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ToastProvider>
        <Toast open duration={Infinity}>
          <ToastTitle>Title</ToastTitle>
          <ToastDescription
            asChild
            ref={(node) => void (element = node)}
            data-testid="description"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article>Description</article>
          </ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    ));

    // Settle first: slotted delegated listeners attach once connected.
    const description = (await screen.findByTestId("description")) as HTMLElement;
    expect(description.tagName).toBe("ARTICLE");
    expect(description.classList.contains("custom-class")).toBe(true);
    expect(description.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(description);

    fireEvent.click(description);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Toast.Action", () => {
  afterEach(cleanup);

  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ToastProvider>
        <Toast open duration={Infinity}>
          <ToastTitle>Title</ToastTitle>
          <ToastAction
            altText="Undo the change"
            ref={(node) => void (element = node)}
            data-testid="action"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            Undo
          </ToastAction>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    ));

    const action = (await screen.findByTestId("action")) as HTMLElement;
    expect(action.classList.contains("custom-class")).toBe(true);
    expect(action.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(action);

    // Composed with the action's own close handler rather than replaced by it.
    fireEvent.click(action);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ToastProvider>
        <Toast open duration={Infinity}>
          <ToastTitle>Title</ToastTitle>
          <ToastAction
            altText="Undo the change"
            asChild
            ref={(node) => void (element = node)}
            data-testid="action"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <button type="button">Undo</button>
          </ToastAction>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    ));

    // Settle first: slotted delegated listeners attach once connected.
    const action = (await screen.findByTestId("action")) as HTMLElement;
    expect(action.tagName).toBe("BUTTON");
    // The `altText` the action announces instead of its contents must reach the same element.
    expect(action.getAttribute("data-radix-toast-announce-alt")).toBe("Undo the change");
    expect(action.classList.contains("custom-class")).toBe(true);
    expect(action.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(action);

    fireEvent.click(action);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Toast.Close", () => {
  afterEach(cleanup);

  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ToastProvider>
        <Toast open duration={Infinity}>
          <ToastTitle>Title</ToastTitle>
          <ToastClose
            ref={(node) => void (element = node)}
            data-testid="close"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            Close
          </ToastClose>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    ));

    const close = (await screen.findByTestId("close")) as HTMLElement;
    expect(close.getAttribute("type")).toBe("button");
    expect(close.classList.contains("custom-class")).toBe(true);
    expect(close.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(close);

    // Composed with the close button's own click handler rather than replaced by it.
    fireEvent.click(close);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <ToastProvider>
        <Toast open duration={Infinity}>
          <ToastTitle>Title</ToastTitle>
          <ToastClose
            asChild
            ref={(node) => void (element = node)}
            data-testid="close"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <button type="button">Close</button>
          </ToastClose>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    ));

    // Settle first: slotted delegated listeners attach once connected.
    const close = (await screen.findByTestId("close")) as HTMLElement;
    expect(close.tagName).toBe("BUTTON");
    expect(close.getAttribute("data-radix-toast-announce-exclude")).toBe("");
    expect(close.classList.contains("custom-class")).toBe(true);
    expect(close.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(close);

    fireEvent.click(close);
    expect(onClick).toHaveBeenCalled();
  });
});

// NOTE: Radix's "hydration alongside a pending Suspense boundary" suite (#3301)
// has no port: this Solid RC has no Suspense/SSR-hydration primitives, so the
// provider publishes viewport/count updates directly instead of as transitions.
