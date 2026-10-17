import { afterEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import {
  Menu,
  MenuArrow,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuItemIndicator,
  MenuLabel,
  MenuPortal,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  type MenuProps,
} from "../src/index";

const ITEM_ONE_TEXT = "Item one";
const ITEM_TWO_TEXT = "Item two";
const SUB_TRIGGER_TEXT = "Submenu";
const SUB_ITEM_TEXT = "Sub item";

const MenuTest = (props: MenuProps) => {
  const [open, setOpen] = createSignal(props.open ?? false);
  return (
    <Menu open={props.open ?? open()} onOpenChange={props.onOpenChange ?? setOpen}>
      <button type="button" onClick={() => setOpen((value) => !value)}>
        Toggle
      </button>
      <MenuPortal>
        <MenuContent>
          <MenuItem>{ITEM_ONE_TEXT}</MenuItem>
          <MenuItem>{ITEM_TWO_TEXT}</MenuItem>
          <MenuSub>
            <MenuSubTrigger>{SUB_TRIGGER_TEXT}</MenuSubTrigger>
            <MenuPortal>
              <MenuSubContent>
                <MenuItem>{SUB_ITEM_TEXT}</MenuItem>
              </MenuSubContent>
            </MenuPortal>
          </MenuSub>
        </MenuContent>
      </MenuPortal>
    </Menu>
  );
};

function cleanupModal() {
  // Modal menus set this on the `body` and only restore it on close.
  document.body.style.pointerEvents = "";
}

describe("Menu", () => {
  afterEach(cleanupModal);

  test("renders nothing while closed and content when open", async () => {
    render(() => <MenuTest />);
    expect(screen.queryByRole("menu")).toBe(null);

    fireEvent.click(screen.getByText("Toggle"));
    const menu = (await screen.findByRole("menu")) as HTMLElement;
    expect(menu.getAttribute("data-state")).toBe("open");
    expect(screen.getByText(ITEM_ONE_TEXT)).toBeTruthy();
  });

  test("selects an item on click and closes the menu", async () => {
    const onSelect = vi.fn();
    render(() => (
      <Menu open onOpenChange={() => {}}>
        <MenuPortal>
          <MenuContent>
            <MenuItem onSelect={onSelect}>{ITEM_ONE_TEXT}</MenuItem>
          </MenuContent>
        </MenuPortal>
      </Menu>
    ));

    const item = await screen.findByText(ITEM_ONE_TEXT);
    fireEvent.click(item);
    await vi.waitFor(() => expect(onSelect).toHaveBeenCalledTimes(1));
  });

  test("preventing onSelect keeps the menu open", async () => {
    const onOpenChange = vi.fn();
    render(() => (
      <Menu open onOpenChange={onOpenChange}>
        <MenuPortal>
          <MenuContent>
            <MenuItem
              onSelect={(event: Event) => {
                event.preventDefault();
              }}
            >
              {ITEM_ONE_TEXT}
            </MenuItem>
          </MenuContent>
        </MenuPortal>
      </Menu>
    ));

    fireEvent.click(await screen.findByText(ITEM_ONE_TEXT));
    flush();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.queryByText(ITEM_ONE_TEXT)).toBeTruthy();
  });

  test("selects the focused item with Enter and Space", async () => {
    const onSelect = vi.fn();
    render(() => (
      <Menu open onOpenChange={() => {}}>
        <MenuPortal>
          <MenuContent>
            <MenuItem onSelect={onSelect}>{ITEM_ONE_TEXT}</MenuItem>
            <MenuItem>{ITEM_TWO_TEXT}</MenuItem>
          </MenuContent>
        </MenuPortal>
      </Menu>
    ));

    const item = (await screen.findByText(ITEM_ONE_TEXT)) as HTMLElement;
    item.focus();
    fireEvent.keyDown(item, { key: "Enter" });
    await vi.waitFor(() => expect(onSelect).toHaveBeenCalledTimes(1));
  });

  test("does not select disabled items", async () => {
    const onSelect = vi.fn();
    render(() => (
      <Menu open onOpenChange={() => {}}>
        <MenuPortal>
          <MenuContent>
            <MenuItem disabled onSelect={onSelect}>
              {ITEM_ONE_TEXT}
            </MenuItem>
          </MenuContent>
        </MenuPortal>
      </Menu>
    ));

    const item = (await screen.findByText(ITEM_ONE_TEXT)) as HTMLElement;
    expect(item.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(item);
    flush();
    expect(onSelect).not.toHaveBeenCalled();
  });

  test("moves focus with first/last keys from the content", async () => {
    render(() => (
      <Menu open onOpenChange={() => {}}>
        <MenuPortal>
          <MenuContent>
            <MenuItem>{ITEM_ONE_TEXT}</MenuItem>
            <MenuItem>{ITEM_TWO_TEXT}</MenuItem>
          </MenuContent>
        </MenuPortal>
      </Menu>
    ));
    const menu = (await screen.findByRole("menu")) as HTMLElement;

    fireEvent.keyDown(menu, { key: "End" });
    await vi.waitFor(() => expect(document.activeElement?.textContent).toBe(ITEM_TWO_TEXT));

    fireEvent.keyDown(menu, { key: "Home" });
    await vi.waitFor(() => expect(document.activeElement?.textContent).toBe(ITEM_ONE_TEXT));
  });

  test("typeahead focuses matching items", async () => {
    render(() => (
      <Menu open onOpenChange={() => {}}>
        <MenuPortal>
          <MenuContent>
            <MenuItem>{ITEM_ONE_TEXT}</MenuItem>
            <MenuItem>{ITEM_TWO_TEXT}</MenuItem>
          </MenuContent>
        </MenuPortal>
      </Menu>
    ));
    const menu = (await screen.findByRole("menu")) as HTMLElement;

    // Both items share the "Item " prefix; typing "item t" narrows to the second.
    for (const key of ["i", "t", "e", "m", " ", "t"]) {
      fireEvent.keyDown(menu, { key });
    }
    await vi.waitFor(() => expect(document.activeElement?.textContent).toBe(ITEM_TWO_TEXT));
  });

  test("checkbox items toggle with data-state and indicator", async () => {
    const onCheckedChange = vi.fn();
    render(() => (
      <Menu open onOpenChange={() => {}}>
        <MenuPortal>
          <MenuContent>
            <MenuCheckboxItem checked onCheckedChange={onCheckedChange}>
              <MenuItemIndicator>✓</MenuItemIndicator>
              Check me
            </MenuCheckboxItem>
          </MenuContent>
        </MenuPortal>
      </Menu>
    ));

    const item = (await screen.findByRole("menuitemcheckbox")) as HTMLElement;
    expect(item.getAttribute("aria-checked")).toBe("true");
    expect(item.getAttribute("data-state")).toBe("checked");
    expect(screen.getByText("✓")).toBeTruthy();

    fireEvent.click(item);
    await vi.waitFor(() => expect(onCheckedChange).toHaveBeenCalledWith(false));
  });

  test("radio items report selection within their group", async () => {
    const onValueChange = vi.fn();
    render(() => (
      <Menu open onOpenChange={() => {}}>
        <MenuPortal>
          <MenuContent>
            <MenuRadioGroup value="one" onValueChange={onValueChange}>
              <MenuRadioItem value="one">One</MenuRadioItem>
              <MenuRadioItem value="two">Two</MenuRadioItem>
            </MenuRadioGroup>
          </MenuContent>
        </MenuPortal>
      </Menu>
    ));

    const items = await screen.findAllByRole("menuitemradio");
    expect(items[0]?.getAttribute("aria-checked")).toBe("true");
    expect(items[1]?.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(items[1]!);
    await vi.waitFor(() => expect(onValueChange).toHaveBeenCalledWith("two"));
  });

  test("opens submenus with ArrowRight and closes with ArrowLeft", async () => {
    // `MenuSub` is controlled-only (like Radix); wire it with a signal.
    let setSubOpen!: (open: boolean) => void;
    render(() => {
      const [subOpen, set] = createSignal(false);
      setSubOpen = set;
      return (
        <Menu open onOpenChange={() => {}}>
          <MenuPortal>
            <MenuContent>
              <MenuItem>{ITEM_ONE_TEXT}</MenuItem>
              <MenuSub open={subOpen()} onOpenChange={setSubOpen}>
                <MenuSubTrigger>{SUB_TRIGGER_TEXT}</MenuSubTrigger>
                <MenuPortal>
                  <MenuSubContent>
                    <MenuItem>{SUB_ITEM_TEXT}</MenuItem>
                  </MenuSubContent>
                </MenuPortal>
              </MenuSub>
            </MenuContent>
          </MenuPortal>
        </Menu>
      );
    });
    const subTrigger = (await screen.findByText(SUB_TRIGGER_TEXT)) as HTMLElement;
    subTrigger.focus();

    fireEvent.keyDown(subTrigger, { key: "ArrowRight" });
    const subItem = (await screen.findByText(SUB_ITEM_TEXT)) as HTMLElement;
    expect(subTrigger.getAttribute("aria-expanded")).toBe("true");
    const menus = screen.getAllByRole("menu");
    expect(subTrigger.getAttribute("aria-controls")).toBe(menus[1]?.id);
    expect(subItem).toBeTruthy();

    subItem.focus();
    fireEvent.keyDown(subItem, { key: "ArrowLeft" });
    await vi.waitFor(() => {
      expect(subTrigger.getAttribute("aria-expanded")).toBe("false");
      expect(document.activeElement).toBe(subTrigger);
    });
  });

  test("closes the menu on Escape", async () => {
    const onOpenChange = vi.fn();
    render(() => <MenuTest open onOpenChange={onOpenChange} />);
    const menu = (await screen.findByRole("menu")) as HTMLElement;
    menu.focus();

    fireEvent.keyDown(menu, { key: "Escape" });
    await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  test("renders group, label, separator and arrow parts", async () => {
    render(() => (
      <Menu open onOpenChange={() => {}}>
        <MenuPortal>
          <MenuContent>
            <MenuLabel>Label</MenuLabel>
            <MenuGroup>
              <MenuItem>{ITEM_ONE_TEXT}</MenuItem>
            </MenuGroup>
            <MenuSeparator data-testid="separator" />
            <MenuArrow data-testid="arrow" />
          </MenuContent>
        </MenuPortal>
      </Menu>
    ));

    await screen.findByRole("menu");
    expect(screen.getByText("Label")).toBeTruthy();
    expect(screen.getByRole("group")).toBeTruthy();
    expect(screen.getByTestId("separator").getAttribute("role")).toBe("separator");
    expect(screen.getByTestId("arrow").tagName).toBe("svg");
  });
});
