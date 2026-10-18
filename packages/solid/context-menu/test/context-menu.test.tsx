import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import {
  ContextMenu,
  ContextMenuArrow,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuItemIndicator,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  type ContextMenuProps,
} from "../src/index";

const TRIGGER_TEXT = "Right click here";
const ITEM_TEXT = "Item";

function ContextMenuTest(props: ContextMenuProps = {}) {
  return (
    <ContextMenu {...props}>
      <ContextMenuTrigger>{TRIGGER_TEXT}</ContextMenuTrigger>
      <ContextMenuPortal>
        <ContextMenuContent>
          <ContextMenuItem>{ITEM_TEXT}</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenuPortal>
    </ContextMenu>
  );
}

function cleanupModal() {
  // Modal menus set this on the `body` and only restore it on close.
  document.body.style.pointerEvents = "";
}

describe("rendering and opening", () => {
  afterEach(cleanupModal);

  test("keeps the content closed by default", () => {
    render(() => <ContextMenuTest />);
    expect(screen.getByText(TRIGGER_TEXT).getAttribute("data-state")).toBe("closed");
    expect(screen.queryByText(ITEM_TEXT)).toBe(null);
  });

  test("opens the content on right click", async () => {
    render(() => <ContextMenuTest />);
    fireEvent.contextMenu(screen.getByText(TRIGGER_TEXT));

    expect(await screen.findByRole("menu")).toBeTruthy();
    expect(screen.getByText(ITEM_TEXT)).toBeTruthy();
    expect(screen.getByText(TRIGGER_TEXT).getAttribute("data-state")).toBe("open");
  });

  test("re-anchors the content when re-triggered in a new location while open", async () => {
    render(() => <ContextMenuTest />);
    const trigger = screen.getByText(TRIGGER_TEXT);

    fireEvent.contextMenu(trigger, { clientX: 10, clientY: 10 });
    expect(await screen.findByRole("menu")).toBeTruthy();

    const wrapper = () =>
      document.querySelector("[data-radix-popper-content-wrapper]") as HTMLElement;
    await vi.waitFor(() => expect(wrapper()).toBeTruthy());
    const initialTransform = wrapper().style.transform;

    // Right-click again in a different location while the menu is still open.
    fireEvent.contextMenu(trigger, { clientX: 200, clientY: 150 });

    expect(screen.getByRole("menu")).toBeTruthy();
    await vi.waitFor(() => expect(wrapper().style.transform).not.toEqual(initialTransform));
  });

  test("closes the content when pressing escape", async () => {
    render(() => <ContextMenuTest />);
    fireEvent.contextMenu(screen.getByText(TRIGGER_TEXT));
    expect(await screen.findByRole("menu")).toBeTruthy();

    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    await vi.waitFor(() => expect(screen.queryByRole("menu")).toBe(null));
    expect(screen.getByText(TRIGGER_TEXT).getAttribute("data-state")).toBe("closed");
  });

  // NOTE: Radix also asserts `axe` cleanliness here; Solidix has no axe harness
  // yet (Phase 6), so that assertion has no port.
});

describe("disabled trigger", () => {
  afterEach(cleanupModal);

  test("does not open the menu on right click", () => {
    render(() => (
      <ContextMenu>
        <ContextMenuTrigger disabled>{TRIGGER_TEXT}</ContextMenuTrigger>
        <ContextMenuPortal>
          <ContextMenuContent>
            <ContextMenuItem>{ITEM_TEXT}</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenuPortal>
      </ContextMenu>
    ));

    const trigger = screen.getByText(TRIGGER_TEXT);
    expect(trigger.getAttribute("data-disabled")).toBe("");
    fireEvent.contextMenu(trigger);
    flush();
    expect(screen.queryByRole("menu")).toBe(null);
  });
});

describe("items", () => {
  afterEach(cleanupModal);

  test("calls `onSelect` and closes the menu when an item is selected", async () => {
    const onSelect = vi.fn();
    render(() => (
      <ContextMenu>
        <ContextMenuTrigger>{TRIGGER_TEXT}</ContextMenuTrigger>
        <ContextMenuPortal>
          <ContextMenuContent>
            <ContextMenuItem onSelect={onSelect}>{ITEM_TEXT}</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenuPortal>
      </ContextMenu>
    ));

    fireEvent.contextMenu(screen.getByText(TRIGGER_TEXT));
    expect(await screen.findByText(ITEM_TEXT)).toBeTruthy();

    fireEvent.click(screen.getByText(ITEM_TEXT));
    expect(onSelect).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(screen.queryByRole("menu")).toBe(null));
  });

  test("does not select a disabled item", async () => {
    const onSelect = vi.fn();
    render(() => (
      <ContextMenu>
        <ContextMenuTrigger>{TRIGGER_TEXT}</ContextMenuTrigger>
        <ContextMenuPortal>
          <ContextMenuContent>
            <ContextMenuItem disabled onSelect={onSelect}>
              {ITEM_TEXT}
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenuPortal>
      </ContextMenu>
    ));

    fireEvent.contextMenu(screen.getByText(TRIGGER_TEXT));
    const item = (await screen.findByText(ITEM_TEXT)) as HTMLElement;
    expect(item.getAttribute("data-disabled")).toBe("");
    expect(item.getAttribute("aria-disabled")).toBe("true");

    fireEvent.click(item);
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  test("keeps the menu open when `onSelect` prevents default", async () => {
    render(() => (
      <ContextMenu>
        <ContextMenuTrigger>{TRIGGER_TEXT}</ContextMenuTrigger>
        <ContextMenuPortal>
          <ContextMenuContent>
            <ContextMenuItem onSelect={(event: Event) => event.preventDefault()}>
              Stay open
            </ContextMenuItem>
            <ContextMenuItem>Close me</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenuPortal>
      </ContextMenu>
    ));

    fireEvent.contextMenu(screen.getByText(TRIGGER_TEXT));
    expect(await screen.findByRole("menu")).toBeTruthy();

    fireEvent.click(screen.getByText("Stay open"));
    flush();
    expect(screen.getByRole("menu")).toBeTruthy();

    fireEvent.click(screen.getByText("Close me"));
    await vi.waitFor(() => expect(screen.queryByRole("menu")).toBe(null));
  });
});

describe("groups and labels", () => {
  afterEach(cleanupModal);

  test("renders grouped items with a label", async () => {
    render(() => (
      <ContextMenu>
        <ContextMenuTrigger>{TRIGGER_TEXT}</ContextMenuTrigger>
        <ContextMenuPortal>
          <ContextMenuContent>
            <ContextMenuGroup>
              <ContextMenuLabel>Fruits</ContextMenuLabel>
              <ContextMenuItem>Apple</ContextMenuItem>
              <ContextMenuItem>Banana</ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuContent>
        </ContextMenuPortal>
      </ContextMenu>
    ));

    fireEvent.contextMenu(screen.getByText(TRIGGER_TEXT));
    expect(await screen.findByRole("menu")).toBeTruthy();

    expect(screen.getByRole("group")).toBeTruthy();
    expect(screen.getByText("Fruits")).toBeTruthy();
    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
  });
});

describe("checkbox items", () => {
  afterEach(cleanupModal);

  test("toggles a checkbox item and reflects the checked state", async () => {
    render(() => {
      const [checked, setChecked] = createSignal(false);
      return (
        <ContextMenu>
          <ContextMenuTrigger>{TRIGGER_TEXT}</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuCheckboxItem checked={checked()} onCheckedChange={setChecked}>
                Bold
              </ContextMenuCheckboxItem>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      );
    });
    fireEvent.contextMenu(screen.getByText(TRIGGER_TEXT));

    const checkbox = (await screen.findByRole("menuitemcheckbox")) as HTMLElement;
    expect(checkbox.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(checkbox);
    fireEvent.contextMenu(screen.getByText(TRIGGER_TEXT));
    const updated = (await screen.findByRole("menuitemcheckbox")) as HTMLElement;
    expect(updated.getAttribute("aria-checked")).toBe("true");
  });

  test("marks a disabled checkbox item as disabled", async () => {
    render(() => (
      <ContextMenu>
        <ContextMenuTrigger>{TRIGGER_TEXT}</ContextMenuTrigger>
        <ContextMenuPortal>
          <ContextMenuContent>
            <ContextMenuCheckboxItem disabled>Strikethrough</ContextMenuCheckboxItem>
          </ContextMenuContent>
        </ContextMenuPortal>
      </ContextMenu>
    ));

    fireEvent.contextMenu(screen.getByText(TRIGGER_TEXT));
    const checkbox = (await screen.findByRole("menuitemcheckbox")) as HTMLElement;
    expect(checkbox.getAttribute("aria-disabled")).toBe("true");
  });
});

describe("radio items", () => {
  afterEach(cleanupModal);

  test("selects a radio item and calls `onValueChange`", async () => {
    const onValueChange = vi.fn();
    render(() => {
      const [value, setValue] = createSignal("index.js");
      return (
        <ContextMenu>
          <ContextMenuTrigger>{TRIGGER_TEXT}</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuRadioGroup
                value={value()}
                onValueChange={(next) => {
                  onValueChange(next);
                  setValue(next);
                }}
              >
                <ContextMenuRadioItem value="README.md">README.md</ContextMenuRadioItem>
                <ContextMenuRadioItem value="index.js">index.js</ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      );
    });
    fireEvent.contextMenu(screen.getByText(TRIGGER_TEXT));

    const radios = (await screen.findAllByRole("menuitemradio")) as HTMLElement[];
    expect(radios[0]?.getAttribute("aria-checked")).toBe("false");
    expect(radios[1]?.getAttribute("aria-checked")).toBe("true");

    fireEvent.click(radios[0]!);
    expect(onValueChange).toHaveBeenCalledWith("README.md");

    fireEvent.contextMenu(screen.getByText(TRIGGER_TEXT));
    const updated = (await screen.findAllByRole("menuitemradio")) as HTMLElement[];
    expect(updated[0]?.getAttribute("aria-checked")).toBe("true");
    expect(updated[1]?.getAttribute("aria-checked")).toBe("false");
  });
});

describe("submenus", () => {
  afterEach(cleanupModal);

  test("opens a submenu via keyboard", async () => {
    render(() => (
      <ContextMenu>
        <ContextMenuTrigger>{TRIGGER_TEXT}</ContextMenuTrigger>
        <ContextMenuPortal>
          <ContextMenuContent>
            <ContextMenuSub>
              <ContextMenuSubTrigger>Bookmarks</ContextMenuSubTrigger>
              <ContextMenuPortal>
                <ContextMenuSubContent>
                  <ContextMenuItem>Inbox</ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuPortal>
            </ContextMenuSub>
          </ContextMenuContent>
        </ContextMenuPortal>
      </ContextMenu>
    ));

    fireEvent.contextMenu(screen.getByText(TRIGGER_TEXT));
    const subTrigger = (await screen.findByText("Bookmarks")) as HTMLElement;
    expect(subTrigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(subTrigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.keyDown(subTrigger, { key: "ArrowRight" });
    expect(await screen.findByText("Inbox")).toBeTruthy();
    expect(subTrigger.getAttribute("aria-expanded")).toBe("true");
  });

  test("associates the sub trigger with its content via `aria-controls` only while open", async () => {
    render(() => (
      <ContextMenu>
        <ContextMenuTrigger>{TRIGGER_TEXT}</ContextMenuTrigger>
        <ContextMenuPortal>
          <ContextMenuContent>
            <ContextMenuSub>
              <ContextMenuSubTrigger>Bookmarks</ContextMenuSubTrigger>
              <ContextMenuPortal>
                <ContextMenuSubContent>
                  <ContextMenuItem>Inbox</ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuPortal>
            </ContextMenuSub>
          </ContextMenuContent>
        </ContextMenuPortal>
      </ContextMenu>
    ));

    fireEvent.contextMenu(screen.getByText(TRIGGER_TEXT));
    const subTrigger = (await screen.findByText("Bookmarks")) as HTMLElement;
    expect(subTrigger.hasAttribute("aria-controls")).toBe(false);

    fireEvent.keyDown(subTrigger, { key: "ArrowRight" });
    const subContent = await vi.waitFor(() => screen.getByText("Inbox").closest('[role="menu"]'));
    expect(subContent).toBeTruthy();
    expect((subContent as HTMLElement).id).toBeTruthy();
    expect(subTrigger.getAttribute("aria-controls")).toBe((subContent as HTMLElement).id);
    expect(document.getElementById((subContent as HTMLElement).id)).toBe(subContent);
  });

  test("does not open a disabled submenu", async () => {
    render(() => (
      <ContextMenu>
        <ContextMenuTrigger>{TRIGGER_TEXT}</ContextMenuTrigger>
        <ContextMenuPortal>
          <ContextMenuContent>
            <ContextMenuSub>
              <ContextMenuSubTrigger disabled>History</ContextMenuSubTrigger>
              <ContextMenuPortal>
                <ContextMenuSubContent>
                  <ContextMenuItem>Github</ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuPortal>
            </ContextMenuSub>
          </ContextMenuContent>
        </ContextMenuPortal>
      </ContextMenu>
    ));

    fireEvent.contextMenu(screen.getByText(TRIGGER_TEXT));
    const subTrigger = (await screen.findByText("History")) as HTMLElement;
    expect(subTrigger.getAttribute("data-disabled")).toBe("");

    fireEvent.keyDown(subTrigger, { key: "ArrowRight" });
    flush();
    expect(screen.queryByText("Github")).toBe(null);
  });
});

describe("modality", () => {
  afterEach(cleanupModal);

  test("disables pointer events on the body while a modal menu is open", async () => {
    render(() => <ContextMenuTest />);
    expect(document.body.style.pointerEvents).toBe("");

    fireEvent.contextMenu(screen.getByText(TRIGGER_TEXT));
    await vi.waitFor(() => expect(document.body.style.pointerEvents).toBe("none"));

    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    await vi.waitFor(() => expect(document.body.style.pointerEvents).toBe(""));
  });

  test("does not disable pointer events on the body for a non-modal menu", async () => {
    render(() => <ContextMenuTest modal={false} />);
    fireEvent.contextMenu(screen.getByText(TRIGGER_TEXT));
    expect(await screen.findByRole("menu")).toBeTruthy();
    expect(document.body.style.pointerEvents).toBe("");
  });
});

describe("controlled `open` state", () => {
  let consoleWarnMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnMock = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanupModal();
    consoleWarnMock.mockRestore();
  });

  test("opens on right click and reflects the open state via `onOpenChange`", async () => {
    const onOpenChange = vi.fn();
    render(() => <ContextMenuTest onOpenChange={onOpenChange} />);

    const trigger = screen.getByText(TRIGGER_TEXT);
    expect(trigger.getAttribute("data-state")).toBe("closed");
    expect(screen.queryByText(ITEM_TEXT)).toBe(null);

    fireEvent.contextMenu(trigger);

    expect(await screen.findByText(ITEM_TEXT)).toBeTruthy();
    expect(trigger.getAttribute("data-state")).toBe("open");
    // `useControllableState` notifies asynchronously in Solidix.
    await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true));
  });

  test("respects a controlled `open={false}` value and does not open on right click", async () => {
    const onOpenChange = vi.fn();
    render(() => <ContextMenuTest open={false} onOpenChange={onOpenChange} />);

    const trigger = screen.getByText(TRIGGER_TEXT);
    fireEvent.contextMenu(trigger);

    await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true));
    expect(trigger.getAttribute("data-state")).toBe("closed");
    expect(screen.queryByText(ITEM_TEXT)).toBe(null);
  });

  test("can be closed programmatically while controlled", async () => {
    render(() => {
      const [open, setOpen] = createSignal(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(false)}>
            close
          </button>
          <ContextMenuTest open={open()} onOpenChange={setOpen} />
        </>
      );
    });
    const trigger = screen.getByText(TRIGGER_TEXT);

    fireEvent.contextMenu(trigger);
    expect(await screen.findByText(ITEM_TEXT)).toBeTruthy();

    fireEvent.click(screen.getByText("close"));
    await vi.waitFor(() => expect(screen.queryByText(ITEM_TEXT)).toBe(null));
    expect(trigger.getAttribute("data-state")).toBe("closed");
  });

  test("calls `onOpenChange` with `false` when dismissed via Escape", async () => {
    const onOpenChange = vi.fn();
    render(() => {
      const [open, setOpen] = createSignal(false);
      return (
        <ContextMenuTest
          open={open()}
          onOpenChange={(next) => {
            onOpenChange(next);
            setOpen(next);
          }}
        />
      );
    });
    const trigger = screen.getByText(TRIGGER_TEXT);

    fireEvent.contextMenu(trigger);
    expect(await screen.findByText(ITEM_TEXT)).toBeTruthy();
    await vi.waitFor(() => expect(onOpenChange).toHaveBeenLastCalledWith(true));

    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    await vi.waitFor(() => expect(screen.queryByText(ITEM_TEXT)).toBe(null));
    await vi.waitFor(() => expect(onOpenChange).toHaveBeenLastCalledWith(false));
  });

  describe("dev warning when opened before interaction", () => {
    // Solid 2's strict reactivity diagnostics also go through `console.warn`
    // (eager first-compute reads in menu internals), so filter to ours.
    const ourWarnings = () =>
      consoleWarnMock.mock.calls.filter((args: Array<unknown>) =>
        String(args[0]).includes("The `open` prop has been set to `true`"),
      );

    test("warns when `open` is `true` before the user has interacted with the trigger", () => {
      render(() => <ContextMenuTest open={true} />);
      flush();
      expect(ourWarnings()).toHaveLength(1);
    });

    test("does not warn for an uncontrolled menu", () => {
      render(() => <ContextMenuTest />);
      fireEvent.contextMenu(screen.getByText(TRIGGER_TEXT));
      flush();
      expect(ourWarnings()).toHaveLength(0);
    });

    test("does not warn when the menu is opened through user interaction", async () => {
      render(() => {
        const [open, setOpen] = createSignal(false);
        return <ContextMenuTest open={open()} onOpenChange={setOpen} />;
      });
      fireEvent.contextMenu(screen.getByText(TRIGGER_TEXT));
      expect(await screen.findByText(ITEM_TEXT)).toBeTruthy();
      flush();
      expect(ourWarnings()).toHaveLength(0);
    });
  });
});

describe("prop spreading", () => {
  afterEach(cleanupModal);

  describe("ContextMenu.Trigger", () => {
    test("spreads props it does not consume onto the element it renders", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu>
          <ContextMenuTrigger
            ref={(node) => void (element = node)}
            data-testid="trigger"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            Right click here
          </ContextMenuTrigger>
        </ContextMenu>
      ));

      const trigger = screen.getByTestId("trigger") as HTMLElement;
      expect(trigger.classList.contains("custom-class")).toBe(true);
      expect(trigger.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(trigger);

      fireEvent.click(trigger);
      expect(onClick).toHaveBeenCalled();
    });

    test("forwards props to the child element when `asChild` is set", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu>
          <ContextMenuTrigger
            asChild
            ref={(node) => void (element = node)}
            data-testid="trigger"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article>Right click here</article>
          </ContextMenuTrigger>
        </ContextMenu>
      ));

      const trigger = screen.getByTestId("trigger") as HTMLElement;
      expect(trigger.tagName).toBe("ARTICLE");
      expect(trigger.getAttribute("data-state")).toBe("closed");
      expect(trigger.classList.contains("custom-class")).toBe(true);
      // The trigger sets `-webkit-touch-callout` itself, so this also shows the two are merged.
      expect(trigger.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(trigger);

      fireEvent.click(trigger);
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe("ContextMenu.Content", () => {
    test("spreads props it does not consume onto the element it renders", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent
              ref={(node) => void (element = node)}
              data-testid="content"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <ContextMenuItem>Item</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
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
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent
              asChild
              ref={(node) => void (element = node)}
              data-testid="content"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <article>
                <ContextMenuItem>Item</ContextMenuItem>
              </article>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const content = screen.getByTestId("content") as HTMLElement;
      expect(content.tagName).toBe("ARTICLE");
      expect(content.getAttribute("role")).toBe("menu");
      expect(content.getAttribute("data-state")).toBe("open");
      expect(content.classList.contains("custom-class")).toBe(true);
      expect(content.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(content);

      fireEvent.click(content);
      expect(onClick).toHaveBeenCalled();
    });

    test("forwards props to the child element when `asChild` is set on a non-modal menu", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open modal={false}>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent
              asChild
              ref={(node) => void (element = node)}
              data-testid="content"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <article>
                <ContextMenuItem>Item</ContextMenuItem>
              </article>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const content = screen.getByTestId("content") as HTMLElement;
      expect(content.tagName).toBe("ARTICLE");
      expect(content.getAttribute("role")).toBe("menu");
      expect(content.getAttribute("data-state")).toBe("open");
      expect(content.classList.contains("custom-class")).toBe(true);
      expect(content.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(content);

      fireEvent.click(content);
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe("ContextMenu.Group", () => {
    test("spreads props it does not consume onto the element it renders", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuGroup
                ref={(node) => void (element = node)}
                data-testid="group"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <ContextMenuItem>Item</ContextMenuItem>
              </ContextMenuGroup>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const group = screen.getByTestId("group") as HTMLElement;
      expect(group.classList.contains("custom-class")).toBe(true);
      expect(group.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(group);

      fireEvent.click(group);
      expect(onClick).toHaveBeenCalled();
    });

    test("forwards props to the child element when `asChild` is set", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuGroup
                asChild
                ref={(node) => void (element = node)}
                data-testid="group"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <article>
                  <ContextMenuItem>Item</ContextMenuItem>
                </article>
              </ContextMenuGroup>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const group = screen.getByTestId("group") as HTMLElement;
      expect(group.tagName).toBe("ARTICLE");
      expect(group.getAttribute("role")).toBe("group");
      expect(group.classList.contains("custom-class")).toBe(true);
      expect(group.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(group);

      fireEvent.click(group);
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe("ContextMenu.Label", () => {
    test("spreads props it does not consume onto the element it renders", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuLabel
                ref={(node) => void (element = node)}
                data-testid="label"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                Label
              </ContextMenuLabel>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const label = screen.getByTestId("label") as HTMLElement;
      expect(label.classList.contains("custom-class")).toBe(true);
      expect(label.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(label);

      fireEvent.click(label);
      expect(onClick).toHaveBeenCalled();
    });

    test("forwards props to the child element when `asChild` is set", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuLabel
                asChild
                ref={(node) => void (element = node)}
                data-testid="label"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <article>Label</article>
              </ContextMenuLabel>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const label = screen.getByTestId("label") as HTMLElement;
      expect(label.tagName).toBe("ARTICLE");
      expect(label.classList.contains("custom-class")).toBe(true);
      expect(label.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(label);

      fireEvent.click(label);
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe("ContextMenu.Item", () => {
    test("spreads props it does not consume onto the element it renders", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuItem
                ref={(node) => void (element = node)}
                data-testid="item"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                Item
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const item = screen.getByTestId("item") as HTMLElement;
      expect(item.classList.contains("custom-class")).toBe(true);
      expect(item.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(item);

      fireEvent.click(item);
      expect(onClick).toHaveBeenCalled();
    });

    test("forwards props to the child element when `asChild` is set", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuItem
                asChild
                ref={(node) => void (element = node)}
                data-testid="item"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <article>Item</article>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const item = screen.getByTestId("item") as HTMLElement;
      expect(item.tagName).toBe("ARTICLE");
      expect(item.getAttribute("role")).toBe("menuitem");
      expect(item.classList.contains("custom-class")).toBe(true);
      expect(item.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(item);

      fireEvent.click(item);
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe("ContextMenu.CheckboxItem", () => {
    test("spreads props it does not consume onto the element it renders", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuCheckboxItem
                checked
                ref={(node) => void (element = node)}
                data-testid="checkbox-item"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                Checkbox item
              </ContextMenuCheckboxItem>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const checkboxItem = screen.getByTestId("checkbox-item") as HTMLElement;
      expect(checkboxItem.classList.contains("custom-class")).toBe(true);
      expect(checkboxItem.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(checkboxItem);

      fireEvent.click(checkboxItem);
      expect(onClick).toHaveBeenCalled();
    });

    test("forwards props to the child element when `asChild` is set", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuCheckboxItem
                asChild
                checked
                ref={(node) => void (element = node)}
                data-testid="checkbox-item"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <article>Checkbox item</article>
              </ContextMenuCheckboxItem>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const checkboxItem = screen.getByTestId("checkbox-item") as HTMLElement;
      expect(checkboxItem.tagName).toBe("ARTICLE");
      expect(checkboxItem.getAttribute("role")).toBe("menuitemcheckbox");
      expect(checkboxItem.classList.contains("custom-class")).toBe(true);
      expect(checkboxItem.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(checkboxItem);

      fireEvent.click(checkboxItem);
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe("ContextMenu.RadioGroup", () => {
    test("spreads props it does not consume onto the element it renders", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuRadioGroup
                ref={(node) => void (element = node)}
                data-testid="radio-group"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <ContextMenuRadioItem value="one">One</ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const radioGroup = screen.getByTestId("radio-group") as HTMLElement;
      expect(radioGroup.classList.contains("custom-class")).toBe(true);
      expect(radioGroup.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(radioGroup);

      fireEvent.click(radioGroup);
      expect(onClick).toHaveBeenCalled();
    });

    test("forwards props to the child element when `asChild` is set", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuRadioGroup
                asChild
                ref={(node) => void (element = node)}
                data-testid="radio-group"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <article>
                  <ContextMenuRadioItem value="one">One</ContextMenuRadioItem>
                </article>
              </ContextMenuRadioGroup>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const radioGroup = screen.getByTestId("radio-group") as HTMLElement;
      expect(radioGroup.tagName).toBe("ARTICLE");
      expect(radioGroup.getAttribute("role")).toBe("group");
      expect(radioGroup.classList.contains("custom-class")).toBe(true);
      expect(radioGroup.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(radioGroup);

      fireEvent.click(radioGroup);
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe("ContextMenu.RadioItem", () => {
    test("spreads props it does not consume onto the element it renders", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuRadioGroup value="one">
                <ContextMenuRadioItem
                  value="one"
                  ref={(node) => void (element = node)}
                  data-testid="radio-item"
                  class="custom-class"
                  style={{ "outline-color": "rgb(1, 2, 3)" }}
                  onClick={onClick}
                >
                  One
                </ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const radioItem = screen.getByTestId("radio-item") as HTMLElement;
      expect(radioItem.classList.contains("custom-class")).toBe(true);
      expect(radioItem.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(radioItem);

      fireEvent.click(radioItem);
      expect(onClick).toHaveBeenCalled();
    });

    test("forwards props to the child element when `asChild` is set", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuRadioGroup value="one">
                <ContextMenuRadioItem
                  asChild
                  value="one"
                  ref={(node) => void (element = node)}
                  data-testid="radio-item"
                  class="custom-class"
                  style={{ "outline-color": "rgb(1, 2, 3)" }}
                  onClick={onClick}
                >
                  <article>One</article>
                </ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const radioItem = screen.getByTestId("radio-item") as HTMLElement;
      expect(radioItem.tagName).toBe("ARTICLE");
      expect(radioItem.getAttribute("role")).toBe("menuitemradio");
      expect(radioItem.classList.contains("custom-class")).toBe(true);
      expect(radioItem.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(radioItem);

      fireEvent.click(radioItem);
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe("ContextMenu.ItemIndicator", () => {
    test("spreads props it does not consume onto the element it renders", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuCheckboxItem checked>
                <ContextMenuItemIndicator
                  ref={(node) => void (element = node)}
                  data-testid="item-indicator"
                  class="custom-class"
                  style={{ "outline-color": "rgb(1, 2, 3)" }}
                  onClick={onClick}
                >
                  Indicator
                </ContextMenuItemIndicator>
                Checkbox item
              </ContextMenuCheckboxItem>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const itemIndicator = screen.getByTestId("item-indicator") as HTMLElement;
      expect(itemIndicator.classList.contains("custom-class")).toBe(true);
      expect(itemIndicator.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(itemIndicator);

      fireEvent.click(itemIndicator);
      expect(onClick).toHaveBeenCalled();
    });

    test("forwards props to the child element when `asChild` is set", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuCheckboxItem checked>
                <ContextMenuItemIndicator
                  asChild
                  ref={(node) => void (element = node)}
                  data-testid="item-indicator"
                  class="custom-class"
                  style={{ "outline-color": "rgb(1, 2, 3)" }}
                  onClick={onClick}
                >
                  <article>Indicator</article>
                </ContextMenuItemIndicator>
                Checkbox item
              </ContextMenuCheckboxItem>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const itemIndicator = screen.getByTestId("item-indicator") as HTMLElement;
      expect(itemIndicator.tagName).toBe("ARTICLE");
      expect(itemIndicator.classList.contains("custom-class")).toBe(true);
      expect(itemIndicator.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(itemIndicator);

      fireEvent.click(itemIndicator);
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe("ContextMenu.Separator", () => {
    test("spreads props it does not consume onto the element it renders", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuSeparator
                ref={(node) => void (element = node)}
                data-testid="separator"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              />
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const separator = screen.getByTestId("separator") as HTMLElement;
      expect(separator.classList.contains("custom-class")).toBe(true);
      expect(separator.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(separator);

      fireEvent.click(separator);
      expect(onClick).toHaveBeenCalled();
    });

    test("forwards props to the child element when `asChild` is set", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuSeparator
                asChild
                ref={(node) => void (element = node)}
                data-testid="separator"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <article />
              </ContextMenuSeparator>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const separator = screen.getByTestId("separator") as HTMLElement;
      expect(separator.tagName).toBe("ARTICLE");
      expect(separator.getAttribute("role")).toBe("separator");
      expect(separator.getAttribute("aria-orientation")).toBe("horizontal");
      expect(separator.classList.contains("custom-class")).toBe(true);
      expect(separator.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(separator);

      fireEvent.click(separator);
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe("ContextMenu.Arrow", () => {
    test("spreads props it does not consume onto the element it renders", () => {
      let element: Element | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuItem>Item</ContextMenuItem>
              <ContextMenuArrow
                ref={(node) => void (element = node)}
                data-testid="arrow"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              />
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const arrow = screen.getByTestId("arrow") as HTMLElement;
      expect(arrow.classList.contains("custom-class")).toBe(true);
      expect(arrow.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(arrow);

      fireEvent.click(arrow);
      expect(onClick).toHaveBeenCalled();
    });

    test("forwards props to the child element when `asChild` is set", () => {
      let element: Element | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuItem>Item</ContextMenuItem>
              <ContextMenuArrow
                asChild
                ref={(node) => void (element = node)}
                data-testid="arrow"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <svg />
              </ContextMenuArrow>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const arrow = screen.getByTestId("arrow") as HTMLElement;
      // SVG elements report their tag name in lower case.
      expect(arrow.tagName).toBe("svg");
      expect(arrow.getAttribute("viewBox")).toBe("0 0 30 10");
      expect(arrow.classList.contains("custom-class")).toBe(true);
      expect(arrow.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(arrow);

      fireEvent.click(arrow);
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe("ContextMenu.SubTrigger", () => {
    test("spreads props it does not consume onto the element it renders", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuSub>
                <ContextMenuSubTrigger
                  ref={(node) => void (element = node)}
                  data-testid="sub-trigger"
                  class="custom-class"
                  style={{ "outline-color": "rgb(1, 2, 3)" }}
                  onClick={onClick}
                >
                  Sub trigger
                </ContextMenuSubTrigger>
              </ContextMenuSub>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const subTrigger = screen.getByTestId("sub-trigger") as HTMLElement;
      expect(subTrigger.classList.contains("custom-class")).toBe(true);
      expect(subTrigger.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(subTrigger);

      fireEvent.click(subTrigger);
      expect(onClick).toHaveBeenCalled();
    });

    test("forwards props to the child element when `asChild` is set", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuSub>
                <ContextMenuSubTrigger
                  asChild
                  ref={(node) => void (element = node)}
                  data-testid="sub-trigger"
                  class="custom-class"
                  style={{ "outline-color": "rgb(1, 2, 3)" }}
                  onClick={onClick}
                >
                  <article>Sub trigger</article>
                </ContextMenuSubTrigger>
              </ContextMenuSub>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const subTrigger = screen.getByTestId("sub-trigger") as HTMLElement;
      expect(subTrigger.tagName).toBe("ARTICLE");
      expect(subTrigger.getAttribute("aria-haspopup")).toBe("menu");
      expect(subTrigger.classList.contains("custom-class")).toBe(true);
      expect(subTrigger.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(subTrigger);

      fireEvent.click(subTrigger);
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe("ContextMenu.SubContent", () => {
    // A submenu closes itself as soon as the parent content takes focus on
    // mount, and the portal's `Presence` gates on the submenu's open state.
    // `forceMount` on the portal is what keeps the sub content rendered so we
    // can test it.
    const FORCE_MOUNT_PORTAL = true;

    test("spreads props it does not consume onto the element it renders", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuSub>
                <ContextMenuSubTrigger>Sub trigger</ContextMenuSubTrigger>
                <ContextMenuPortal forceMount={FORCE_MOUNT_PORTAL}>
                  <ContextMenuSubContent
                    ref={(node) => void (element = node)}
                    data-testid="sub-content"
                    class="custom-class"
                    style={{ "outline-color": "rgb(1, 2, 3)" }}
                    onClick={onClick}
                  >
                    <ContextMenuItem>Sub item</ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuPortal>
              </ContextMenuSub>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const subContent = screen.getByTestId("sub-content") as HTMLElement;
      expect(subContent.classList.contains("custom-class")).toBe(true);
      expect(subContent.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(subContent);

      fireEvent.click(subContent);
      expect(onClick).toHaveBeenCalled();
    });

    test("forwards props to the child element when `asChild` is set", () => {
      let element: HTMLElement | null = null;
      const onClick = vi.fn();

      render(() => (
        <ContextMenu open>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuSub>
                <ContextMenuSubTrigger>Sub trigger</ContextMenuSubTrigger>
                <ContextMenuPortal forceMount={FORCE_MOUNT_PORTAL}>
                  <ContextMenuSubContent
                    asChild
                    ref={(node) => void (element = node)}
                    data-testid="sub-content"
                    class="custom-class"
                    style={{ "outline-color": "rgb(1, 2, 3)" }}
                    onClick={onClick}
                  >
                    <article>
                      <ContextMenuItem>Sub item</ContextMenuItem>
                    </article>
                  </ContextMenuSubContent>
                </ContextMenuPortal>
              </ContextMenuSub>
            </ContextMenuContent>
          </ContextMenuPortal>
        </ContextMenu>
      ));

      const subContent = screen.getByTestId("sub-content") as HTMLElement;
      expect(subContent.tagName).toBe("ARTICLE");
      expect(subContent.getAttribute("role")).toBe("menu");
      expect(subContent.classList.contains("custom-class")).toBe(true);
      expect(subContent.style.outlineColor).toBe("rgb(1, 2, 3)");
      expect(element).toBe(subContent);

      fireEvent.click(subContent);
      expect(onClick).toHaveBeenCalled();
    });
  });
});

describe("touch long press with nested triggers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    cleanupModal();
    vi.useRealTimers();
  });

  function NestedContextMenuTest(props: { innerDisabled?: boolean }) {
    return (
      <ContextMenu>
        <ContextMenuTrigger data-testid="outer">
          <ContextMenu>
            <ContextMenuTrigger data-testid="inner" disabled={props.innerDisabled}>
              {TRIGGER_TEXT}
            </ContextMenuTrigger>
            <ContextMenuPortal>
              <ContextMenuContent aria-label="inner menu">
                <ContextMenuItem>Inner item</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenuPortal>
          </ContextMenu>
        </ContextMenuTrigger>
        <ContextMenuPortal>
          <ContextMenuContent aria-label="outer menu">
            <ContextMenuItem>Outer item</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenuPortal>
      </ContextMenu>
    );
  }

  const openMenus = () =>
    screen.queryAllByRole("menu").map((menu) => menu.getAttribute("aria-label"));

  test("opens only the innermost menu on a touch long press", () => {
    render(() => <NestedContextMenuTest />);
    fireEvent.pointerDown(screen.getByTestId("inner"), { pointerType: "touch" });
    vi.advanceTimersByTime(750);
    flush();
    expect(openMenus()).toEqual(["inner menu"]);
  });

  test("opens only the innermost menu when the platform fires contextmenu during the long press", () => {
    render(() => <NestedContextMenuTest />);
    const inner = screen.getByTestId("inner");
    fireEvent.pointerDown(inner, { pointerType: "touch" });
    vi.advanceTimersByTime(520);
    flush();
    fireEvent.contextMenu(inner);
    vi.advanceTimersByTime(300);
    flush();
    expect(openMenus()).toEqual(["inner menu"]);
  });

  test("opens the menu on a touch long press", () => {
    render(() => <ContextMenuTest />);
    fireEvent.pointerDown(screen.getByText(TRIGGER_TEXT), { pointerType: "touch" });
    vi.advanceTimersByTime(750);
    flush();
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  test("opens the outer menu when the inner trigger is disabled", () => {
    render(() => <NestedContextMenuTest innerDisabled />);
    fireEvent.pointerDown(screen.getByTestId("inner"), { pointerType: "touch" });
    vi.advanceTimersByTime(750);
    flush();
    expect(openMenus()).toEqual(["outer menu"]);
  });
});
