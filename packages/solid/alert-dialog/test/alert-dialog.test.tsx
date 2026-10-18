import { afterEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { flush } from "solid-js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../src/index";

const OPEN_TEXT = "Open";
const CANCEL_TEXT = "Cancel";
const ACTION_TEXT = "Do it";
const TITLE_TEXT = "Warning";
const DESC_TEXT = "This is a warning";
const OVERLAY_TEST_ID = "test-overlay";

function AlertDialogTest() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>{OPEN_TEXT}</AlertDialogTrigger>
      <AlertDialogOverlay data-testid={OVERLAY_TEST_ID} />
      <AlertDialogContent>
        <AlertDialogTitle>{TITLE_TEXT}</AlertDialogTitle>
        <AlertDialogDescription>{DESC_TEXT}</AlertDialogDescription>
        <AlertDialogCancel>{CANCEL_TEXT}</AlertDialogCancel>
        <AlertDialogAction>{ACTION_TEXT}</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function cleanupModal() {
  // Modal dialogs set this on the `body` and only restore it on close.
  document.body.style.pointerEvents = "";
}

describe("given a default AlertDialog", () => {
  afterEach(cleanupModal);
  // NOTE: Radix also asserts `axe` cleanliness here (default state and open
  // state); Solidix has no axe harness yet (Phase 6), so those assertions
  // have no port.

  test("opens the content after clicking the trigger", async () => {
    render(() => <AlertDialogTest />);
    fireEvent.click(screen.getByText(OPEN_TEXT));
    expect(await screen.findByText(TITLE_TEXT)).toBeTruthy();
  });

  test("focuses the cancel button after clicking the trigger", async () => {
    render(() => <AlertDialogTest />);
    fireEvent.click(screen.getByText(OPEN_TEXT));
    const cancelButton = (await screen.findByText(CANCEL_TEXT)) as HTMLElement;
    await vi.waitFor(() => expect(document.activeElement).toBe(cancelButton));
  });
});

describe("AlertDialog.Trigger", () => {
  afterEach(cleanupModal);

  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <AlertDialog>
        <AlertDialogTrigger
          ref={(node) => void (element = node)}
          data-testid="trigger"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          Open
        </AlertDialogTrigger>
      </AlertDialog>
    ));

    const trigger = screen.getByTestId("trigger") as HTMLElement;
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect(trigger.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    // Composed with the trigger's own click handler rather than replaced by it.
    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <AlertDialog>
        <AlertDialogTrigger
          asChild
          ref={(node) => void (element = node)}
          data-testid="trigger"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <button type="button">Open</button>
        </AlertDialogTrigger>
      </AlertDialog>
    ));

    const trigger = screen.getByTestId("trigger") as HTMLElement;
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect(trigger.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("AlertDialog.Overlay", () => {
  afterEach(cleanupModal);

  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <AlertDialog defaultOpen>
        <AlertDialogPortal>
          <AlertDialogOverlay
            ref={(node) => void (element = node)}
            data-testid="overlay"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          />
        </AlertDialogPortal>
      </AlertDialog>
    ));

    const overlay = screen.getByTestId("overlay") as HTMLElement;
    expect(overlay.classList.contains("custom-class")).toBe(true);
    expect(overlay.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(overlay);

    fireEvent.click(overlay);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <AlertDialog defaultOpen>
        <AlertDialogPortal>
          <AlertDialogOverlay
            asChild
            ref={(node) => void (element = node)}
            data-testid="overlay"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article />
          </AlertDialogOverlay>
        </AlertDialogPortal>
      </AlertDialog>
    ));

    // Settle first: slotted delegated listeners attach once connected.
    const overlay = (await screen.findByTestId("overlay")) as HTMLElement;
    expect(overlay.tagName).toBe("ARTICLE");
    expect(overlay.getAttribute("data-state")).toBe("open");
    expect(overlay.classList.contains("custom-class")).toBe(true);
    expect(overlay.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(overlay);

    fireEvent.click(overlay);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("AlertDialog.Content", () => {
  afterEach(cleanupModal);

  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <AlertDialog defaultOpen>
        <AlertDialogPortal>
          <AlertDialogContent
            ref={(node) => void (element = node)}
            data-testid="content"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <AlertDialogTitle>Title</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    ));

    const content = screen.getByTestId("content") as HTMLElement;
    expect(content.classList.contains("custom-class")).toBe(true);
    expect(content.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    fireEvent.click(content);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <AlertDialog defaultOpen>
        <AlertDialogPortal>
          <AlertDialogContent
            asChild
            ref={(node) => void (element = node)}
            data-testid="content"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article>
              <AlertDialogTitle>Title</AlertDialogTitle>
            </article>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    ));

    // Settle first: slotted delegated listeners attach once connected.
    const content = (await screen.findByTestId("content")) as HTMLElement;
    expect(content.tagName).toBe("ARTICLE");
    expect(content.getAttribute("role")).toBe("alertdialog");
    expect(content.getAttribute("data-state")).toBe("open");
    expect(content.getAttribute("aria-labelledby")).toBe(screen.getByText("Title").id);
    expect(content.classList.contains("custom-class")).toBe(true);
    expect(content.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    fireEvent.click(content);
    expect(onClick).toHaveBeenCalled();
  });

  // Solidix-authored: Radix prevents outside dismissal unconditionally
  // (`onPointerDownOutside`/`onInteractOutside` both `preventDefault`, see
  // `alert-dialog.tsx` Content), but its suite has no test for it.
  test("does not dismiss on outside interaction", async () => {
    const onOpenChange = vi.fn();
    render(() => (
      <AlertDialog defaultOpen onOpenChange={onOpenChange}>
        <AlertDialogPortal>
          <AlertDialogOverlay />
          <AlertDialogContent>
            <AlertDialogTitle>{TITLE_TEXT}</AlertDialogTitle>
            <AlertDialogDescription>{DESC_TEXT}</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    ));
    // Mount first: the layer's document listeners register after mount.
    await screen.findByRole("alertdialog");
    // `DismissableLayer` registers its `pointerdown` listener in a `setTimeout`.
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    flush();

    fireEvent.pointerDown(document.body, { pointerType: "mouse" });
    fireEvent.mouseDown(document.body);
    fireEvent.pointerUp(document.body, { pointerType: "mouse" });
    fireEvent.mouseUp(document.body);
    fireEvent.click(document.body);
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    flush();

    expect(screen.queryByRole("alertdialog")).toBeTruthy();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe("AlertDialog.Title", () => {
  afterEach(cleanupModal);

  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <AlertDialog defaultOpen>
        <AlertDialogPortal>
          <AlertDialogContent>
            <AlertDialogTitle
              ref={(node) => void (element = node)}
              data-testid="title"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              Title
            </AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    ));

    const title = screen.getByTestId("title") as HTMLElement;
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
      <AlertDialog defaultOpen>
        <AlertDialogPortal>
          <AlertDialogContent>
            <AlertDialogTitle
              asChild
              ref={(node) => void (element = node)}
              data-testid="title"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <article>Title</article>
            </AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
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

describe("AlertDialog.Description", () => {
  afterEach(cleanupModal);

  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <AlertDialog defaultOpen>
        <AlertDialogPortal>
          <AlertDialogContent>
            <AlertDialogTitle>Title</AlertDialogTitle>
            <AlertDialogDescription
              ref={(node) => void (element = node)}
              data-testid="description"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              Description
            </AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    ));

    const description = screen.getByTestId("description") as HTMLElement;
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
      <AlertDialog defaultOpen>
        <AlertDialogPortal>
          <AlertDialogContent>
            <AlertDialogTitle>Title</AlertDialogTitle>
            <AlertDialogDescription
              asChild
              ref={(node) => void (element = node)}
              data-testid="description"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <article>Description</article>
            </AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
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

describe("AlertDialog.Action", () => {
  afterEach(cleanupModal);

  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <AlertDialog defaultOpen>
        <AlertDialogPortal>
          <AlertDialogContent>
            <AlertDialogTitle>Title</AlertDialogTitle>
            <AlertDialogAction
              ref={(node) => void (element = node)}
              data-testid="action"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              Action
            </AlertDialogAction>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    ));

    const action = screen.getByTestId("action") as HTMLElement;
    expect(action.classList.contains("custom-class")).toBe(true);
    expect(action.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(action);

    // Composed with the close behaviour rather than replaced by it.
    fireEvent.click(action);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <AlertDialog defaultOpen>
        <AlertDialogPortal>
          <AlertDialogContent>
            <AlertDialogTitle>Title</AlertDialogTitle>
            <AlertDialogAction
              asChild
              ref={(node) => void (element = node)}
              data-testid="action"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <button type="button">Action</button>
            </AlertDialogAction>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    ));

    // Settle first: slotted delegated listeners attach once connected.
    const action = (await screen.findByTestId("action")) as HTMLElement;
    expect(action.tagName).toBe("BUTTON");
    expect(action.classList.contains("custom-class")).toBe(true);
    expect(action.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(action);

    fireEvent.click(action);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("AlertDialog.Cancel", () => {
  afterEach(cleanupModal);

  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <AlertDialog defaultOpen>
        <AlertDialogPortal>
          <AlertDialogContent>
            <AlertDialogTitle>Title</AlertDialogTitle>
            <AlertDialogCancel
              ref={(node) => void (element = node)}
              data-testid="cancel"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              Cancel
            </AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    ));

    const cancel = screen.getByTestId("cancel") as HTMLElement;
    expect(cancel.classList.contains("custom-class")).toBe(true);
    expect(cancel.style.outlineColor).toBe("rgb(1, 2, 3)");
    // `Cancel` composes the consumer's ref with the one `Content` uses to focus it on open.
    expect(element).toBe(cancel);

    fireEvent.click(cancel);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <AlertDialog defaultOpen>
        <AlertDialogPortal>
          <AlertDialogContent>
            <AlertDialogTitle>Title</AlertDialogTitle>
            <AlertDialogCancel
              asChild
              ref={(node) => void (element = node)}
              data-testid="cancel"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <button type="button">Cancel</button>
            </AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    ));

    // Settle first: slotted delegated listeners attach once connected.
    const cancel = (await screen.findByTestId("cancel")) as HTMLElement;
    expect(cancel.tagName).toBe("BUTTON");
    expect(cancel.classList.contains("custom-class")).toBe(true);
    expect(cancel.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(cancel);

    fireEvent.click(cancel);
    expect(onClick).toHaveBeenCalled();
  });
});
