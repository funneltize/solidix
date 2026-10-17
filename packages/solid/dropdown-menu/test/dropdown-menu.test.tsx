import { afterEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen, within } from "@solidjs/testing-library";
import { Portal as SolidPortal } from "@solidjs/web";
import { createSignal, flush } from "solid-js";
import {
  DropdownMenu,
  DropdownMenuArrow,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  type DropdownMenuProps,
} from "../src/index";

function renderDropdownMenu(props: DropdownMenuProps = {}, contentProps = {}) {
  render(() => (
    <DropdownMenu {...props}>
      <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent {...contentProps}>
          <DropdownMenuItem>Item1</DropdownMenuItem>
          <DropdownMenuItem>Item2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  ));
}

function cleanupModal() {
  // Modal menus set this on the `body` and only restore it on close.
  document.body.style.pointerEvents = "";
}

describe("DropdownMenu", () => {
  afterEach(cleanupModal);

  test("renders", () => {
    renderDropdownMenu();
    expect(screen.getByRole("button", { name: "Trigger" })).toBeTruthy();
    expect(screen.queryByRole("menu")).toBe(null);
  });

  test("renders with id", async () => {
    render(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent id="test-content-id">
            <DropdownMenuItem>Item1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    ));

    const trigger = screen.getByText("Trigger");
    const content = (await screen.findByRole("menu", { name: "Trigger" })) as HTMLElement;
    // Radix parity quirk: a user `id` wins on the content element (it is
    // spread after the context id) while the trigger keeps pointing at the
    // context id minted by the root.
    expect(content.id).toBe("test-content-id");
    expect(trigger.getAttribute("aria-controls")).toBeTruthy();
    expect(trigger.getAttribute("aria-controls")).not.toBe("test-content-id");
  });

  test("opens on trigger pointer down", async () => {
    renderDropdownMenu();
    const trigger = screen.getByText("Trigger");
    expect(screen.queryByRole("menu")).toBe(null);

    fireEvent.pointerDown(trigger, { button: 0 });
    expect(await screen.findByRole("menu")).toBeTruthy();
  });

  test("does not open on non-left trigger pointer down", () => {
    renderDropdownMenu();
    const trigger = screen.getByText("Trigger");

    fireEvent.pointerDown(trigger, { button: 1 });
    flush();
    expect(screen.queryByRole("menu")).toBe(null);
  });

  test("closes on trigger pointer down when open", async () => {
    renderDropdownMenu();
    const trigger = screen.getByText("Trigger");

    fireEvent.pointerDown(trigger, { button: 0 });
    await screen.findByRole("menu");

    fireEvent.pointerDown(trigger, { button: 0 });
    await vi.waitFor(() => expect(screen.queryByRole("menu")).toBe(null));
  });

  test("closes on escape and refocuses the trigger", async () => {
    renderDropdownMenu();
    const trigger = screen.getByText("Trigger");

    fireEvent.pointerDown(trigger, { button: 0 });
    const content = (await screen.findByRole("menu")) as HTMLElement;

    fireEvent.keyDown(content, { key: "Escape" });
    await vi.waitFor(() => expect(screen.queryByRole("menu")).toBe(null));
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  test("prevents the default tab behavior inside the menu", async () => {
    render(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuItem>Item1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    ));

    const content = (await screen.findByRole("menu")) as HTMLElement;
    // `false` means a handler called `preventDefault` (Radix parity: menus
    // are not navigated with Tab, so Tab neither leaves nor closes them).
    expect(fireEvent.keyDown(content, { key: "Tab" })).toBe(false);
    expect(screen.queryByRole("menu")).toBeTruthy();
  });

  test("focuses the first item on ArrowDown", async () => {
    renderDropdownMenu();
    const trigger = screen.getByText("Trigger");

    fireEvent.pointerDown(trigger, { button: 0 });
    const content = (await screen.findByRole("menu")) as HTMLElement;
    fireEvent.keyDown(content, { key: "ArrowDown" });
    await vi.waitFor(() => expect(document.activeElement?.textContent).toBe("Item1"));
  });

  test("selects the focused item on Enter", async () => {
    const onSelect = vi.fn();
    render(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={onSelect}>Item1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    ));

    const item = (await screen.findByText("Item1")) as HTMLElement;
    item.focus();
    fireEvent.keyDown(item, { key: "Enter" });
    await vi.waitFor(() => expect(onSelect).toHaveBeenCalledTimes(1));
    await vi.waitFor(() => expect(screen.queryByRole("menu")).toBe(null));
  });

  test("arrow navigation moves between items without skipping", async () => {
    render(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuItem>1</DropdownMenuItem>
            <DropdownMenuItem>2</DropdownMenuItem>
            <DropdownMenuItem>3</DropdownMenuItem>
            <DropdownMenuItem>4</DropdownMenuItem>
            <DropdownMenuItem>5</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    ));

    const content = (await screen.findByRole("menu")) as HTMLElement;
    fireEvent.keyDown(content, { key: "ArrowDown" });
    await vi.waitFor(() => expect(document.activeElement?.textContent).toBe("1"));

    const getFocused = () => document.activeElement as HTMLElement;
    fireEvent.keyDown(getFocused(), { key: "ArrowDown" });
    await vi.waitFor(() => expect(document.activeElement?.textContent).toBe("2"));
    fireEvent.keyDown(getFocused(), { key: "ArrowDown" });
    await vi.waitFor(() => expect(document.activeElement?.textContent).toBe("3"));
    fireEvent.keyDown(getFocused(), { key: "ArrowUp" });
    await vi.waitFor(() => expect(document.activeElement?.textContent).toBe("2"));
  });

  test("typeahead focuses items by label text", async () => {
    render(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuItem>New Tab</DropdownMenuItem>
            <DropdownMenuItem>New Window</DropdownMenuItem>
            <DropdownMenuItem>Open File</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    ));

    const content = (await screen.findByRole("menu")) as HTMLElement;
    for (const key of ["o", "p", "e", "n"]) {
      fireEvent.keyDown(content, { key });
    }
    await vi.waitFor(() => expect(document.activeElement?.textContent).toBe("Open File"));
  });

  test("checkbox items toggle and report state", async () => {
    const onCheckedChange = vi.fn();
    render(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked={false} onCheckedChange={onCheckedChange}>
              <DropdownMenuItemIndicator>✓</DropdownMenuItemIndicator>
              Show bookmarks
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    ));

    const item = (await screen.findByRole("menuitemcheckbox")) as HTMLElement;
    expect(item.getAttribute("aria-checked")).toBe("false");
    expect(item.getAttribute("data-state")).toBe("unchecked");
    expect(screen.queryByText("✓")).toBe(null);

    fireEvent.click(item);
    await vi.waitFor(() => expect(onCheckedChange).toHaveBeenCalledWith(true));
  });

  test("radio items report selection within their group", async () => {
    const onValueChange = vi.fn();
    render(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="light" onValueChange={onValueChange}>
              <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    ));

    const items = await screen.findAllByRole("menuitemradio");
    expect(items[0]?.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(items[1]!);
    await vi.waitFor(() => expect(onValueChange).toHaveBeenCalledWith("dark"));
  });

  test("opens submenus on ArrowRight and closes them on ArrowLeft", async () => {
    render(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuItem>Item1</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Sub trigger</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Sub item</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    ));

    const subTrigger = (await screen.findByText("Sub trigger")) as HTMLElement;
    subTrigger.focus();
    fireEvent.keyDown(subTrigger, { key: "ArrowRight" });

    const subItem = (await screen.findByText("Sub item")) as HTMLElement;
    expect(subTrigger.getAttribute("aria-expanded")).toBe("true");

    subItem.focus();
    fireEvent.keyDown(subItem, { key: "ArrowLeft" });
    await vi.waitFor(() => {
      expect(subTrigger.getAttribute("aria-expanded")).toBe("false");
      expect(document.activeElement).toBe(subTrigger);
    });
  });

  test("selects submenu items and closes everything", async () => {
    const onSelect = vi.fn();
    render(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuSub defaultOpen>
              <DropdownMenuSubTrigger>Sub trigger</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onSelect={onSelect}>Sub item</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    ));

    fireEvent.click(await screen.findByText("Sub item"));
    await vi.waitFor(() => expect(onSelect).toHaveBeenCalledTimes(1));
    await vi.waitFor(() => expect(screen.queryByRole("menu")).toBe(null));
  });

  // Adaptation of Radix's ref-stability regression test for
  // https://github.com/radix-ui/primitives/issues/3963: Solid has no
  // re-renders and composed refs are created once per setup, so assert the
  // user-visible essence — refs fire exactly on mount/unmount, never
  // spuriously across open/close cycles.
  test("trigger and sub-trigger refs fire exactly on mount and unmount", async () => {
    const triggerCalls: Array<unknown> = [];
    const subTriggerCalls: Array<unknown> = [];

    render(() => (
      <DropdownMenu>
        <DropdownMenuTrigger ref={(node) => void triggerCalls.push(node)}>
          Trigger
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger ref={(node) => void subTriggerCalls.push(node)}>
                Sub trigger
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Sub item</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    ));

    const trigger = screen.getByText("Trigger");
    flush();
    expect(triggerCalls).toEqual([trigger]);

    // Open, close, and reopen: the always-mounted trigger ref must not refire.
    fireEvent.pointerDown(trigger, { button: 0 });
    await screen.findByRole("menu");
    const subTrigger = screen.getByText("Sub trigger");
    expect(subTriggerCalls).toEqual([subTrigger]);

    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    await vi.waitFor(() => expect(screen.queryByRole("menu")).toBe(null));
    flush();
    expect(subTriggerCalls).toEqual([subTrigger, null]);

    fireEvent.pointerDown(trigger, { button: 0 });
    await screen.findByRole("menu");
    flush();
    expect(triggerCalls).toEqual([trigger]);
    expect(subTriggerCalls).toHaveLength(3);
  });

  // Regression test for https://github.com/radix-ui/primitives/issues/3232
  test("does not intercept selection keys typed into portaled inputs inside items", async () => {
    const onSelect = vi.fn();
    render(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={onSelect}>
              Label
              <SolidPortal mount={document.body}>
                <input data-testid="inner-input" />
              </SolidPortal>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    ));

    const input = (await screen.findByTestId("inner-input")) as HTMLInputElement;
    input.focus();

    // `false` would mean a handler called `preventDefault`.
    expect(fireEvent.keyDown(input, { key: " " })).toBe(true);
    expect(fireEvent.keyDown(input, { key: "Enter" })).toBe(true);
    expect(onSelect).not.toHaveBeenCalled();
  });

  // Regression tests for https://github.com/radix-ui/primitives/issues/4195
  // `forceMount` keeps the content mounted after it closes, as an exit
  // animation does. (Radix re-renders with a new prop; Solid updates a
  // signal, which is the idiomatic equivalent.)
  async function renderClosed() {
    let setOpen!: (open: boolean) => void;
    render(() => {
      const [open, set] = createSignal(true);
      setOpen = set;
      return (
        <>
          <DropdownMenu open={open()}>
            <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
            <DropdownMenuPortal forceMount>
              <DropdownMenuContent forceMount>
                <DropdownMenuItem>Item1</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
          <input data-testid="input" />
        </>
      );
    });
    const item = (await screen.findByText("Item1")) as HTMLElement;
    setOpen(false);
    flush();
    const input = (await screen.findByTestId("input")) as HTMLInputElement;
    input.focus();
    return { item, input };
  }

  test("does not take focus when the pointer leaves an item", async () => {
    const { item, input } = await renderClosed();
    fireEvent.pointerLeave(item, { pointerType: "mouse" });
    flush();
    expect(document.activeElement).toBe(input);
  });

  test("does not focus an item the pointer moves over", async () => {
    const { item, input } = await renderClosed();
    fireEvent.pointerMove(item, { pointerType: "mouse" });
    flush();
    expect(document.activeElement).toBe(input);
  });

  test("content data-state follows open while forceMounted", async () => {
    let setOpen!: (open: boolean) => void;
    render(() => {
      const [open, set] = createSignal(true);
      setOpen = set;
      return (
        <DropdownMenu open={open()}>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuPortal forceMount>
            <DropdownMenuContent forceMount data-testid="content">
              <DropdownMenuItem>Item1</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      );
    });

    const content = (await screen.findByTestId("content")) as HTMLElement;
    expect(content.getAttribute("data-state")).toBe("open");

    setOpen(false);
    flush();
    await vi.waitFor(() => expect(content.getAttribute("data-state")).toBe("closed"));

    setOpen(true);
    flush();
    await vi.waitFor(() => expect(content.getAttribute("data-state")).toBe("open"));
  });
});

describe("DropdownMenu.Trigger", () => {
  afterEach(cleanupModal);

  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <DropdownMenu>
        <DropdownMenuTrigger
          ref={(node) => void (element = node)}
          data-testid="trigger"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          Trigger
        </DropdownMenuTrigger>
      </DropdownMenu>
    ));

    const trigger = (await screen.findByTestId("trigger")) as HTMLElement;
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect(trigger.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          ref={(node) => void (element = node)}
          data-testid="trigger"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <button type="button">Trigger</button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    ));

    const trigger = (await screen.findByTestId("trigger")) as HTMLElement;
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("data-state")).toBe("closed");
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect(trigger.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("DropdownMenu.Content", () => {
  afterEach(cleanupModal);

  test("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent
            ref={(node) => void (element = node)}
            data-testid="content"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            Content
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    ));

    const content = (await screen.findByTestId("content")) as HTMLElement;
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
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent
            asChild
            ref={(node) => void (element = node)}
            data-testid="content"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article>Content</article>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    ));

    const content = (await screen.findByTestId("content")) as HTMLElement;
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

describe("DropdownMenu parts", () => {
  afterEach(cleanupModal);

  test("renders group, label, separator and arrow parts", async () => {
    render(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuLabel>Label</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>Item1</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator data-testid="separator" />
            <DropdownMenuArrow data-testid="arrow" />
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    ));

    await screen.findByRole("menu");
    expect(screen.getByText("Label")).toBeTruthy();
    expect(screen.getByRole("group")).toBeTruthy();
    expect(screen.getByTestId("separator").getAttribute("role")).toBe("separator");
    expect(screen.getByTestId("arrow").tagName).toBe("svg");
  });

  test("within() queries scope to the content", async () => {
    render(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuItem>Item1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    ));

    const content = await screen.findByRole("menu");
    expect(within(content as HTMLElement).getByText("Item1")).toBeTruthy();
  });
});

describe("DropdownMenu.Arrow", () => {
  afterEach(cleanupModal);

  test("spreads props it does not consume onto the element it renders", async () => {
    let element: Element | null = null;
    const onClick = vi.fn();

    render(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            Content
            <DropdownMenuArrow
              ref={(node) => void (element = node)}
              data-testid="arrow"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            />
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    ));

    const arrow = (await screen.findByTestId("arrow")) as HTMLElement;
    expect(arrow.classList.contains("custom-class")).toBe(true);
    expect(arrow.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(arrow);

    fireEvent.click(arrow);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", async () => {
    let element: Element | null = null;
    const onClick = vi.fn();

    render(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            Content
            <DropdownMenuArrow
              asChild
              ref={(node) => void (element = node)}
              data-testid="arrow"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <svg />
            </DropdownMenuArrow>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    ));

    const arrow = (await screen.findByTestId("arrow")) as HTMLElement;
    expect(arrow.tagName).toBe("svg");
    expect(arrow.getAttribute("viewBox")).toBe("0 0 30 10");
    expect(arrow.classList.contains("custom-class")).toBe(true);
    expect(arrow.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(arrow);

    fireEvent.click(arrow);
    expect(onClick).toHaveBeenCalled();
  });
});
