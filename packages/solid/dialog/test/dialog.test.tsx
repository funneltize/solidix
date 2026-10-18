import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { Portal as SolidPortal } from "@solidjs/web";
import { createSignal, flush } from "solid-js";
import { DismissableLayer } from "@solidix/dismissable-layer";
import { useFocusScopeBranch } from "@solidix/focus-scope";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  type DialogProps,
} from "../src/index";

const OPEN_TEXT = "Open";
const CLOSE_TEXT = "Close";
const TITLE_TEXT = "Title";

function DialogTest(props: DialogProps = {}) {
  return (
    <Dialog {...props}>
      <DialogTrigger>{OPEN_TEXT}</DialogTrigger>
      <DialogOverlay />
      <DialogContent>
        <DialogTitle>{TITLE_TEXT}</DialogTitle>
        <DialogClose>{CLOSE_TEXT}</DialogClose>
      </DialogContent>
    </Dialog>
  );
}

function cleanupModal() {
  // Modal dialogs set this on the `body` and only restore it on close.
  document.body.style.pointerEvents = "";
}

describe("given a default Dialog", () => {
  // NOTE: Radix also asserts `axe` cleanliness here (default state and open
  // state); Solidix has no axe harness yet (Phase 6), so those assertions
  // have no port.

  test("opens the content after clicking the trigger", async () => {
    render(() => <DialogTest />);
    fireEvent.click(screen.getByText(OPEN_TEXT));
    expect(await screen.findByText(CLOSE_TEXT)).toBeTruthy();
  });

  test("focuses the close button after clicking the trigger", async () => {
    render(() => <DialogTest />);
    fireEvent.click(screen.getByText(OPEN_TEXT));
    const closeButton = (await screen.findByText(CLOSE_TEXT)) as HTMLElement;
    await vi.waitFor(() => expect(document.activeElement).toBe(closeButton));
  });

  test("closes the content when pressing escape", async () => {
    render(() => <DialogTest />);
    fireEvent.click(screen.getByText(OPEN_TEXT));
    expect(await screen.findByText(CLOSE_TEXT)).toBeTruthy();

    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    await vi.waitFor(() => expect(screen.queryByText(CLOSE_TEXT)).toBe(null));
  });
});

describe("aria-controls", () => {
  afterEach(cleanupModal);

  test("does not reference a non-existent element while closed", () => {
    render(() => <DialogTest />);
    const trigger = screen.getByText(OPEN_TEXT);

    expect(screen.queryByRole("dialog")).toBe(null);
    expect(trigger.hasAttribute("aria-controls")).toBe(false);
  });

  test("references the rendered content while open", async () => {
    render(() => <DialogTest />);
    const trigger = screen.getByText(OPEN_TEXT);
    fireEvent.click(trigger);
    const content = (await screen.findByRole("dialog")) as HTMLElement;
    expect(content.id).toBeTruthy();
    expect(trigger.getAttribute("aria-controls")).toBe(content.id);
    expect(document.getElementById(content.id)).toBe(content);
  });

  test("references content with a custom id while open", async () => {
    render(() => (
      <Dialog>
        <DialogTrigger>{OPEN_TEXT}</DialogTrigger>
        <DialogContent id="custom-content">
          <DialogTitle>{TITLE_TEXT}</DialogTitle>
        </DialogContent>
      </Dialog>
    ));
    const trigger = screen.getByText(OPEN_TEXT);
    fireEvent.click(trigger);
    const content = (await screen.findByRole("dialog")) as HTMLElement;
    expect(content.getAttribute("id")).toBe("custom-content");
    expect(trigger.getAttribute("aria-controls")).toBe("custom-content");
  });
});

describe("aria-labelledby / aria-describedby references", () => {
  afterEach(cleanupModal);

  // A referenced `aria-labelledby`/`aria-describedby` id must resolve to an
  // element in the document, otherwise it is a broken ARIA reference.
  // https://github.com/radix-ui/primitives/issues/2836
  test("references `Title` and `Description` when they are rendered", () => {
    render(() => (
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    ));
    const content = screen.getByRole("dialog") as HTMLElement;
    const labelledBy = content.getAttribute("aria-labelledby");
    const describedBy = content.getAttribute("aria-describedby");
    expect(labelledBy).toBeTruthy();
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(labelledBy!)?.textContent).toBe("Title");
    expect(document.getElementById(describedBy!)?.textContent).toBe("Description");
  });

  // Regression test for https://github.com/radix-ui/primitives/issues/2598
  test("normalizes existing aria-describedby ids and appends the Description id", () => {
    render(() => (
      <>
        <span id="existing-description">Existing description</span>
        <span id="shared-description">Shared description</span>
        <Dialog defaultOpen>
          <DialogContent
            aria-describedby={" existing-description\texisting-description shared-description "}
          >
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogContent>
        </Dialog>
      </>
    ));

    const content = screen.getByRole("dialog") as HTMLElement;
    const description = screen.getByText("Description") as HTMLElement;
    expect(content.getAttribute("aria-describedby")).toBe(
      `existing-description shared-description ${description.id}`,
    );
  });

  test("does not set `aria-labelledby` when no `Title` is rendered", () => {
    render(() => (
      <Dialog defaultOpen>
        <DialogContent aria-label="Custom label">
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    ));
    const content = screen.getByRole("dialog") as HTMLElement;
    expect(content.hasAttribute("aria-labelledby")).toBe(false);
  });

  test("does not set `aria-describedby` when no `Description` is rendered", () => {
    render(() => (
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    ));
    const content = screen.getByRole("dialog") as HTMLElement;
    expect(content.hasAttribute("aria-describedby")).toBe(false);
  });

  test("updates references when `Title`/`Description` mount and unmount", () => {
    let setShowText!: (show: boolean) => void;
    render(() => {
      const [showText, set] = createSignal(false);
      setShowText = set;
      return (
        <Dialog defaultOpen>
          <DialogContent aria-label="Custom label">
            {showText() ? <DialogTitle>Title</DialogTitle> : null}
            {showText() ? <DialogDescription>Description</DialogDescription> : null}
          </DialogContent>
        </Dialog>
      );
    });
    const content = screen.getByRole("dialog") as HTMLElement;
    expect(content.hasAttribute("aria-labelledby")).toBe(false);
    expect(content.hasAttribute("aria-describedby")).toBe(false);

    setShowText(true);
    flush();
    expect(content.hasAttribute("aria-labelledby")).toBe(true);
    expect(content.hasAttribute("aria-describedby")).toBe(true);

    setShowText(false);
    flush();
    expect(content.hasAttribute("aria-labelledby")).toBe(false);
    expect(content.hasAttribute("aria-describedby")).toBe(false);
  });

  test("references a `Title` with a custom id", () => {
    render(() => (
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle id="custom-title">Title</DialogTitle>
        </DialogContent>
      </Dialog>
    ));
    const content = screen.getByRole("dialog") as HTMLElement;
    const title = screen.getByText("Title") as HTMLElement;
    expect(title.getAttribute("id")).toBe("custom-title");
    expect(content.getAttribute("aria-labelledby")).toBe("custom-title");
  });

  test("updates the `Title` reference when its custom id changes or is removed", () => {
    let setTitleId!: (id: string | undefined) => void;
    render(() => {
      const [titleId, set] = createSignal<string | undefined>("first-title");
      setTitleId = set;
      return (
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle id={titleId()}>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );
    });
    const content = screen.getByRole("dialog") as HTMLElement;
    const title = screen.getByText("Title") as HTMLElement;
    expect(title.getAttribute("id")).toBe("first-title");
    expect(content.getAttribute("aria-labelledby")).toBe("first-title");

    setTitleId("second-title");
    flush();
    expect(title.getAttribute("id")).toBe("second-title");
    expect(content.getAttribute("aria-labelledby")).toBe("second-title");

    setTitleId(undefined);
    flush();
    expect(title.id).toBeTruthy();
    expect(title.id).not.toBe("second-title");
    expect(content.getAttribute("aria-labelledby")).toBe(title.id);
  });

  test("falls back to a generated id for a `Title` with an empty id", () => {
    render(() => (
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle id="">Title</DialogTitle>
        </DialogContent>
      </Dialog>
    ));
    const content = screen.getByRole("dialog") as HTMLElement;
    const title = screen.getByText("Title") as HTMLElement;
    expect(title.id).toBeTruthy();
    expect(content.getAttribute("aria-labelledby")).toBe(title.id);
  });

  test("references a `Description` with a custom id", () => {
    render(() => (
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription id="custom-description">Description</DialogDescription>
        </DialogContent>
      </Dialog>
    ));
    const content = screen.getByRole("dialog") as HTMLElement;
    const description = screen.getByText("Description") as HTMLElement;
    expect(description.getAttribute("id")).toBe("custom-description");
    expect(content.getAttribute("aria-describedby")).toBe("custom-description");
  });

  test("references every rendered `Description` with unique ids", () => {
    render(() => (
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>First description</DialogDescription>
          <DialogDescription id="custom-description">Second description</DialogDescription>
          <DialogDescription>Third description</DialogDescription>
        </DialogContent>
      </Dialog>
    ));
    const content = screen.getByRole("dialog") as HTMLElement;
    const firstDescription = screen.getByText("First description") as HTMLElement;
    const secondDescription = screen.getByText("Second description") as HTMLElement;
    const thirdDescription = screen.getByText("Third description") as HTMLElement;
    expect(firstDescription.id).toBeTruthy();
    expect(thirdDescription.id).toBeTruthy();
    expect(firstDescription.id).not.toBe(thirdDescription.id);
    expect(secondDescription.getAttribute("id")).toBe("custom-description");
    expect(content.getAttribute("aria-describedby")).toBe(
      `${firstDescription.id} custom-description ${thirdDescription.id}`,
    );
  });

  test("merges `aria-describedby` on `Content` with custom `Description` ids", () => {
    render(() => (
      <>
        <span id="existing-description">Existing description</span>
        <Dialog defaultOpen>
          <DialogContent aria-describedby="existing-description">
            <DialogTitle>Title</DialogTitle>
            <DialogDescription id="first-description">First description</DialogDescription>
            <DialogDescription id="second-description">Second description</DialogDescription>
          </DialogContent>
        </Dialog>
      </>
    ));
    const content = screen.getByRole("dialog") as HTMLElement;
    expect(content.getAttribute("aria-describedby")).toBe(
      "existing-description first-description second-description",
    );
  });

  test("updates the `Description` reference when its custom id changes or is removed", () => {
    let setDescriptionId!: (id: string | undefined) => void;
    render(() => {
      const [descriptionId, set] = createSignal<string | undefined>("first-description");
      setDescriptionId = set;
      return (
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription id={descriptionId()}>Description</DialogDescription>
          </DialogContent>
        </Dialog>
      );
    });
    const content = screen.getByRole("dialog") as HTMLElement;
    const description = screen.getByText("Description") as HTMLElement;
    expect(description.getAttribute("id")).toBe("first-description");
    expect(content.getAttribute("aria-describedby")).toBe("first-description");

    setDescriptionId("second-description");
    flush();
    expect(description.getAttribute("id")).toBe("second-description");
    expect(content.getAttribute("aria-describedby")).toBe("second-description");

    setDescriptionId(undefined);
    flush();
    expect(description.id).toBeTruthy();
    expect(description.id).not.toBe("second-description");
    expect(content.getAttribute("aria-describedby")).toBe(description.id);
  });

  test("removes only the unmounted `Description` from `aria-describedby`", () => {
    let setShowSecond!: (show: boolean) => void;
    render(() => {
      const [showSecond, set] = createSignal(true);
      setShowSecond = set;
      return (
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription id="first-description">First description</DialogDescription>
            {showSecond() ? (
              <DialogDescription id="second-description">Second description</DialogDescription>
            ) : null}
          </DialogContent>
        </Dialog>
      );
    });
    const content = screen.getByRole("dialog") as HTMLElement;
    expect(content.getAttribute("aria-describedby")).toBe("first-description second-description");

    setShowSecond(false);
    flush();
    expect(content.getAttribute("aria-describedby")).toBe("first-description");
  });

  // Adaptation of Radix's React strict-mode remount test: Solid has no
  // remounts, so the user-visible essence — id references stay correct
  // across a full unmount/remount cycle — is asserted instead.
  test("keeps custom id references across an unmount/remount cycle", () => {
    const tree = () => (
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle id="custom-title">Title</DialogTitle>
          <DialogDescription id="custom-description">Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    render(tree);
    cleanup();

    render(tree);
    const content = screen.getByRole("dialog") as HTMLElement;
    expect(content.getAttribute("aria-labelledby")).toBe("custom-title");
    expect(content.getAttribute("aria-describedby")).toBe("custom-description");
  });
});

describe("given a modal Dialog", () => {
  afterEach(cleanupModal);

  test("restores `body` pointer-events after closing", async () => {
    render(() => <DialogTest />);
    expect(document.body.style.pointerEvents).toBe("");
    fireEvent.click(screen.getByText(OPEN_TEXT));
    await screen.findByText(CLOSE_TEXT);
    // The `body` lock applies once the layer node is connected (microtask).
    await vi.waitFor(() => expect(document.body.style.pointerEvents).toBe("none"));
    fireEvent.click(screen.getByText(CLOSE_TEXT));
    await vi.waitFor(() => expect(document.body.style.pointerEvents).toBe(""));
  });

  // Regression test for https://github.com/radix-ui/primitives/issues/2860
  // Ctrl + mouse wheel is the browser zoom gesture on Windows (and pinch-zoom on
  // macOS trackpads emits a `wheel` event with `ctrlKey`).
  test("does not prevent ctrl + wheel (page zoom) while open", async () => {
    render(() => <DialogTest />);
    fireEvent.click(screen.getByText(OPEN_TEXT));

    // `RemoveScroll` attaches its document `wheel` listener from an
    // asynchronously loaded sidecar. Poll until a plain wheel over the isolated
    // `body` is prevented, which confirms the scroll lock is active. If this
    // never happens the test fails loudly rather than passing spuriously.
    async function waitForScrollLock() {
      for (let i = 0; i < 50; i++) {
        const notPrevented = fireEvent.wheel(document.body, { deltaY: 10 });
        if (!notPrevented) {
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 10));
        flush();
      }
      throw new Error("RemoveScroll did not attach its `wheel` listener");
    }

    await waitForScrollLock();

    // The ctrl + wheel zoom gesture over the dialog must NOT be prevented.
    const content = screen.getByRole("dialog");
    const zoomWheelPrevented = !fireEvent.wheel(content, { ctrlKey: true, deltaY: 10 });
    expect(zoomWheelPrevented).toBe(false);
  });
});

describe("given a Dialog with `asChild` on the Content", () => {
  afterEach(cleanupModal);

  // Regression test for https://github.com/radix-ui/primitives/issues/4077
  test.each([{ modal: true }, { modal: false }])(
    "forwards content props and the ref to the child (modal: $modal)",
    ({ modal }) => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <Dialog defaultOpen modal={modal}>
          <DialogPortal>
            <DialogContent
              asChild
              class="content"
              onClick={onClick}
              ref={(node) => void (element = node)}
            >
              <article data-testid="content">
                <DialogTitle>{TITLE_TEXT}</DialogTitle>
                <DialogClose>{CLOSE_TEXT}</DialogClose>
              </article>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      ));

      const content = screen.getByTestId("content") as HTMLElement;
      expect(content.tagName).toBe("ARTICLE");
      expect(content.getAttribute("role")).toBe("dialog");
      expect(content.getAttribute("data-state")).toBe("open");
      expect(content.getAttribute("aria-labelledby")).toBe(screen.getByText(TITLE_TEXT).id);
      expect(content.classList.contains("content")).toBe(true);
      expect(element).toBe(content);

      fireEvent.click(content);
      expect(onClick).toHaveBeenCalledTimes(1);
    },
  );

  test("registers portalled descendants as focus scope branches", () => {
    function PortalledBranch() {
      const [node, setNode] = createSignal<HTMLElement | null>(null);
      useFocusScopeBranch(node);
      return (
        <SolidPortal mount={document.body}>
          <div ref={setNode}>
            <button type="button">branch</button>
          </div>
        </SolidPortal>
      );
    }

    render(() => (
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogContent asChild>
            <article>
              <DialogTitle>{TITLE_TEXT}</DialogTitle>
              <DialogClose>{CLOSE_TEXT}</DialogClose>
              <PortalledBranch />
            </article>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    ));

    // The branch lives outside the dialog's DOM subtree, so a trapped focus
    // scope would normally reclaim focus from it.
    const branch = screen.getByText("branch") as HTMLElement;
    branch.focus();
    flush();
    expect(document.activeElement).toBe(branch);
  });

  test("still dismisses on escape when slotted", async () => {
    const onOpenChange = vi.fn();
    render(() => (
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogContent asChild>
            <article>
              <DialogTitle>{TITLE_TEXT}</DialogTitle>
            </article>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    ));

    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    // `useControllableState` notifies asynchronously in Solidix.
    await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  test("autofocuses the first tabbable element when slotted", async () => {
    render(() => (
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogContent asChild>
            <article>
              <DialogTitle>{TITLE_TEXT}</DialogTitle>
              <DialogClose>{CLOSE_TEXT}</DialogClose>
            </article>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    ));
    await screen.findByText(CLOSE_TEXT);
    await vi.waitFor(() => expect(document.activeElement?.textContent).toBe(CLOSE_TEXT));
  });
});

describe("given two overlapping modal Dialogs (forceMount)", () => {
  // Forcing mount keeps the content (and its `DismissableLayer`) mounted while
  // `open` toggles, which mirrors what happens during exit animations or when
  // controlling presence with an animation library. This is the scenario that
  // leaks `pointer-events: none` on the `body` when multiple layers overlap.
  // https://github.com/radix-ui/primitives/issues/3645
  function TwoDialogsTest() {
    const [openA, setOpenA] = createSignal(true);
    const [openB, setOpenB] = createSignal(true);
    return (
      <>
        <Dialog open={openA()} onOpenChange={setOpenA}>
          <DialogPortal forceMount>
            <DialogOverlay />
            <DialogContent forceMount>
              <DialogTitle>A</DialogTitle>
              <DialogDescription>A</DialogDescription>
              <button type="button" onClick={() => setOpenA(false)}>
                close-a
              </button>
            </DialogContent>
          </DialogPortal>
        </Dialog>
        <Dialog open={openB()} onOpenChange={setOpenB}>
          <DialogPortal forceMount>
            <DialogOverlay />
            <DialogContent forceMount>
              <DialogTitle>B</DialogTitle>
              <DialogDescription>B</DialogDescription>
              <button type="button" onClick={() => setOpenB(false)}>
                close-b
              </button>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </>
    );
  }

  afterEach(cleanupModal);

  test("restores `body` pointer-events after both close", async () => {
    render(() => <TwoDialogsTest />);
    await screen.findByText("close-a");
    // The `body` lock applies once the layer nodes are connected (microtask).
    await vi.waitFor(() => expect(document.body.style.pointerEvents).toBe("none"));
    fireEvent.click(screen.getByText("close-a"));
    fireEvent.click(screen.getByText("close-b"));
    await vi.waitFor(() => expect(document.body.style.pointerEvents).toBe(""));
  });
});

describe("given a modal Dialog containing a nested modal layer (eg. a DropdownMenu)", () => {
  async function waitForDocumentPointerDownListener() {
    // `DismissableLayer` registers its `pointerdown` listener in a `setTimeout`.
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    flush();
  }

  function firePointerMouseClick(target: Element) {
    fireEvent.pointerDown(target, { pointerType: "mouse" });
    fireEvent.mouseDown(target);
    fireEvent.pointerUp(target, { pointerType: "mouse" });
    fireEvent.mouseUp(target);
    fireEvent.click(target);
  }

  afterEach(cleanupModal);

  // Regression test for https://github.com/radix-ui/primitives/issues/4035
  test("does not call `onOpenChange(false)` on a controlled dialog when the nested layer is dismissed by an outside interaction", async () => {
    const onOpenChange = vi.fn();
    const onNestedLayerDismiss = vi.fn();

    function ControlledDialog() {
      const [open, setOpen] = createSignal(true);
      const [menuOpen, setMenuOpen] = createSignal(false);
      return (
        <>
          <Dialog
            open={open()}
            onOpenChange={(nextOpen) => {
              onOpenChange(nextOpen);
              setOpen(nextOpen);
            }}
          >
            <DialogPortal>
              <DialogOverlay />
              <DialogContent>
                <DialogTitle>Title</DialogTitle>
                <button type="button" onClick={() => setMenuOpen(true)}>
                  open menu
                </button>
                {menuOpen() ? (
                  <DismissableLayer disableOutsidePointerEvents onDismiss={onNestedLayerDismiss}>
                    <button type="button">menu item</button>
                  </DismissableLayer>
                ) : null}
              </DialogContent>
            </DialogPortal>
          </Dialog>
          <button type="button">outside</button>
        </>
      );
    }

    render(() => <ControlledDialog />);
    await waitForDocumentPointerDownListener();

    // Open the nested layer so it becomes the top-most layer.
    fireEvent.click(screen.getByText("open menu"));
    // Mount first: the nested layer's document listeners register after mount.
    await screen.findByText("menu item");
    await waitForDocumentPointerDownListener();

    // An outside interaction dismisses the (higher) nested layer but must leave
    // the dialog open, since the dialog is not the top-most layer.
    firePointerMouseClick(screen.getByText("outside"));
    await waitForDocumentPointerDownListener();

    expect(onNestedLayerDismiss).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByText("open menu")).toBeTruthy();
  });
});

describe("given a modal Dialog with an Overlay", () => {
  async function waitForDocumentPointerDownListener() {
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    flush();
  }

  afterEach(() => {
    cleanupModal();
    vi.restoreAllMocks();
  });

  test.each([{ asChild: false }, { asChild: true }])(
    "gives the overlay a click listener of its own so iOS Safari dispatches click for taps on it (asChild: $asChild)",
    ({ asChild }) => {
      const addEventListener = vi.spyOn(EventTarget.prototype, "addEventListener");

      render(() => (
        <Dialog defaultOpen>
          <DialogPortal>
            <DialogOverlay asChild={asChild} data-testid="overlay">
              {asChild ? <article /> : null}
            </DialogOverlay>
            <DialogContent>
              <DialogTitle>{TITLE_TEXT}</DialogTitle>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      ));

      const overlay = screen.getByTestId("overlay") as HTMLElement;
      const clickListenerTargets = addEventListener.mock.contexts.filter(
        (_target, index) => addEventListener.mock.calls[index]?.[0] === "click",
      );
      expect(overlay.tagName).toBe(asChild ? "ARTICLE" : "DIV");
      expect(clickListenerTargets).toContain(overlay);
    },
  );

  test("waits for the click that follows a pointer down on the overlay, then closes and calls the consumer handlers once", async () => {
    const onOpenChange = vi.fn();
    const onOverlayClick = vi.fn();
    const onPointerDownOutside = vi.fn();
    const onInteractOutside = vi.fn();

    render(() => (
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogOverlay data-testid="overlay" onClick={onOverlayClick} />
          <DialogContent
            onPointerDownOutside={onPointerDownOutside}
            onInteractOutside={onInteractOutside}
          >
            <DialogTitle>{TITLE_TEXT}</DialogTitle>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    ));
    // Mount first: the layer's document listeners register after mount.
    await screen.findByTestId("overlay");
    await waitForDocumentPointerDownListener();

    const overlay = screen.getByTestId("overlay");
    fireEvent.pointerDown(overlay);
    await waitForDocumentPointerDownListener();

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onPointerDownOutside).not.toHaveBeenCalled();

    fireEvent.click(overlay);
    await waitForDocumentPointerDownListener();

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onOverlayClick).toHaveBeenCalledTimes(1);
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
    expect(onInteractOutside).toHaveBeenCalledTimes(1);
  });

  test.each([{ handler: "onPointerDownOutside" }, { handler: "onInteractOutside" }] as const)(
    "stays open when `$handler` is prevented",
    async ({ handler }) => {
      const onOpenChange = vi.fn();
      const contentProps = { [handler]: (event: Event) => event.preventDefault() };

      render(() => (
        <Dialog defaultOpen onOpenChange={onOpenChange}>
          <DialogPortal>
            <DialogOverlay data-testid="overlay" />
            <DialogContent {...contentProps}>
              <DialogTitle>{TITLE_TEXT}</DialogTitle>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      ));
      await waitForDocumentPointerDownListener();

      const overlay = screen.getByTestId("overlay");
      fireEvent.pointerDown(overlay);
      fireEvent.click(overlay);
      await waitForDocumentPointerDownListener();

      expect(onOpenChange).not.toHaveBeenCalled();
    },
  );
});

describe("Dialog.Trigger", () => {
  afterEach(cleanupModal);

  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Dialog>
        <DialogTrigger
          ref={(node) => void (element = node)}
          data-testid="trigger"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          Open
        </DialogTrigger>
      </Dialog>
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
      <Dialog>
        <DialogTrigger
          asChild
          ref={(node) => void (element = node)}
          data-testid="trigger"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <button type="button">Open</button>
        </DialogTrigger>
      </Dialog>
    ));

    const trigger = screen.getByTestId("trigger") as HTMLElement;
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect(trigger.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Dialog.Overlay", () => {
  afterEach(cleanupModal);

  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogOverlay
            ref={(node) => void (element = node)}
            data-testid="overlay"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          />
        </DialogPortal>
      </Dialog>
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
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogOverlay
            asChild
            ref={(node) => void (element = node)}
            data-testid="overlay"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article />
          </DialogOverlay>
        </DialogPortal>
      </Dialog>
    ));

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

describe("Dialog.Content", () => {
  afterEach(cleanupModal);

  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogContent
            ref={(node) => void (element = node)}
            data-testid="content"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    ));

    const content = screen.getByTestId("content") as HTMLElement;
    expect(content.classList.contains("custom-class")).toBe(true);
    expect(content.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    fireEvent.click(content);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogContent
            asChild
            ref={(node) => void (element = node)}
            data-testid="content"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article>
              <DialogTitle>Title</DialogTitle>
            </article>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    ));

    const content = screen.getByTestId("content") as HTMLElement;
    expect(content.tagName).toBe("ARTICLE");
    expect(content.getAttribute("role")).toBe("dialog");
    expect(content.getAttribute("data-state")).toBe("open");
    expect(content.getAttribute("aria-labelledby")).toBe(screen.getByText("Title").id);
    expect(content.classList.contains("custom-class")).toBe(true);
    expect(content.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    fireEvent.click(content);
    expect(onClick).toHaveBeenCalled();
  });

  // A non-modal dialog renders a different tree: no overlay, no scroll lock,
  // and an untrapped focus scope, so it needs covering separately.
  test("forwards props to the child element when `asChild` is set on a non-modal dialog", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Dialog defaultOpen modal={false}>
        <DialogPortal>
          <DialogContent
            asChild
            ref={(node) => void (element = node)}
            data-testid="content"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article>
              <DialogTitle>Title</DialogTitle>
            </article>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    ));

    const content = screen.getByTestId("content") as HTMLElement;
    expect(content.tagName).toBe("ARTICLE");
    expect(content.getAttribute("role")).toBe("dialog");
    expect(content.classList.contains("custom-class")).toBe(true);
    expect(content.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    fireEvent.click(content);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Dialog.Title", () => {
  afterEach(cleanupModal);

  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogContent>
            <DialogTitle
              ref={(node) => void (element = node)}
              data-testid="title"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              Title
            </DialogTitle>
          </DialogContent>
        </DialogPortal>
      </Dialog>
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
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogContent>
            <DialogTitle
              asChild
              ref={(node) => void (element = node)}
              data-testid="title"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <article>Title</article>
            </DialogTitle>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    ));

    const title = (await screen.findByTestId("title")) as HTMLElement;
    expect(title.tagName).toBe("ARTICLE");
    expect(title.classList.contains("custom-class")).toBe(true);
    expect(title.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(title);

    fireEvent.click(title);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Dialog.Description", () => {
  afterEach(cleanupModal);

  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogContent>
            <DialogDescription
              ref={(node) => void (element = node)}
              data-testid="description"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              Description
            </DialogDescription>
          </DialogContent>
        </DialogPortal>
      </Dialog>
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
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogContent>
            <DialogDescription
              asChild
              ref={(node) => void (element = node)}
              data-testid="description"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <article>Description</article>
            </DialogDescription>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    ));

    const description = (await screen.findByTestId("description")) as HTMLElement;
    expect(description.tagName).toBe("ARTICLE");
    expect(description.classList.contains("custom-class")).toBe(true);
    expect(description.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(description);

    fireEvent.click(description);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Dialog.Close", () => {
  afterEach(cleanupModal);

  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogContent>
            <DialogClose
              ref={(node) => void (element = node)}
              data-testid="close"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              Close
            </DialogClose>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    ));

    const close = screen.getByTestId("close") as HTMLElement;
    expect(close.classList.contains("custom-class")).toBe(true);
    expect(close.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(close);

    fireEvent.click(close);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogContent>
            <DialogClose
              asChild
              ref={(node) => void (element = node)}
              data-testid="close"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <article>Close</article>
            </DialogClose>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    ));

    const close = (await screen.findByTestId("close")) as HTMLElement;
    expect(close.tagName).toBe("ARTICLE");
    expect(close.classList.contains("custom-class")).toBe(true);
    expect(close.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(close);

    fireEvent.click(close);
    expect(onClick).toHaveBeenCalled();
  });
});
