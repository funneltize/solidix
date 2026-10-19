import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import {
  Menubar,
  MenubarArrow,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarItemIndicator,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  type MenubarProps,
} from "../src/index";

const TRIGGER_TEXT = "File";
const ITEM_TEXT = "New";

function MenubarTest(props: MenubarProps = {}) {
  return (
    <Menubar {...props}>
      <MenubarMenu value="file">
        <MenubarTrigger>{TRIGGER_TEXT}</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem>{ITEM_TEXT}</MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </Menubar>
  );
}

describe("aria-controls", () => {
  test("should not reference a non-existent element while closed", () => {
    render(() => <MenubarTest />);
    const trigger = screen.getByText(TRIGGER_TEXT);
    expect(screen.queryByRole("menu")).toBe(null);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.hasAttribute("aria-controls")).toBe(false);
  });

  test("should reference the rendered content while open", async () => {
    render(() => <MenubarTest defaultValue="file" />);
    const trigger = screen.getByText(TRIGGER_TEXT);
    const content = (await screen.findByRole("menu")) as HTMLElement;

    expect(content.id).toBeTruthy();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(content.id);
    expect(document.getElementById(content.id)).toBe(content);
  });
});

describe("Menubar.Root", () => {
  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Menubar
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
        </MenubarMenu>
      </Menubar>
    ));

    const root = screen.getByTestId("root") as HTMLElement;
    expect(root.classList.contains("custom-class")).toBe(true);
    expect(root.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(root);

    fireEvent.click(root);
    expect(onClick).toHaveBeenCalled();
  });

  test("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Menubar
        asChild
        ref={(node) => void (element = node)}
        data-testid="root"
        class="custom-class"
        style={{ "outline-color": "rgb(1, 2, 3)" }}
        onClick={onClick}
      >
        <article>
          <MenubarMenu value="file">
            <MenubarTrigger>File</MenubarTrigger>
          </MenubarMenu>
        </article>
      </Menubar>
    ));

    const root = screen.getByTestId("root") as HTMLElement;
    expect(root.tagName).toBe("ARTICLE");
    expect(root.getAttribute("role")).toBe("menubar");
    expect(root.classList.contains("custom-class")).toBe(true);
    expect(root.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(root);

    fireEvent.click(root);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Menubar.Trigger", () => {
  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Menubar>
        <MenubarMenu value="file">
          <MenubarTrigger
            ref={(node) => void (element = node)}
            data-testid="trigger"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            File
          </MenubarTrigger>
        </MenubarMenu>
      </Menubar>
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
      <Menubar>
        <MenubarMenu value="file">
          <MenubarTrigger
            asChild
            ref={(node) => void (element = node)}
            data-testid="trigger"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <button type="button">File</button>
          </MenubarTrigger>
        </MenubarMenu>
      </Menubar>
    ));

    const trigger = screen.getByTestId("trigger") as HTMLElement;
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("role")).toBe("menuitem");
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("data-state")).toBe("closed");
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect(trigger.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Menubar.Content", () => {
  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent
              ref={(node) => void (element = node)}
              data-testid="content"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <MenubarItem>New</MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
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
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent
              asChild
              ref={(node) => void (element = node)}
              data-testid="content"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <article>
                <MenubarItem>New</MenubarItem>
              </article>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
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

describe("Menubar.Group", () => {
  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarGroup
                ref={(node) => void (element = node)}
                data-testid="group"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <MenubarItem>New</MenubarItem>
              </MenubarGroup>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
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
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarGroup
                asChild
                ref={(node) => void (element = node)}
                data-testid="group"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <article>
                  <MenubarItem>New</MenubarItem>
                </article>
              </MenubarGroup>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
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

describe("Menubar.Label", () => {
  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarLabel
                ref={(node) => void (element = node)}
                data-testid="label"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                Label
              </MenubarLabel>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
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
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarLabel
                asChild
                ref={(node) => void (element = node)}
                data-testid="label"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <article>Label</article>
              </MenubarLabel>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
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

describe("Menubar.Item", () => {
  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem
                ref={(node) => void (element = node)}
                data-testid="item"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                Item
              </MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
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
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem
                asChild
                ref={(node) => void (element = node)}
                data-testid="item"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <article>Item</article>
              </MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
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

describe("Menubar.CheckboxItem", () => {
  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarCheckboxItem
                checked
                ref={(node) => void (element = node)}
                data-testid="checkbox-item"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                Checkbox item
              </MenubarCheckboxItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
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
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarCheckboxItem
                asChild
                checked
                ref={(node) => void (element = node)}
                data-testid="checkbox-item"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <article>Checkbox item</article>
              </MenubarCheckboxItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
    ));

    const checkboxItem = screen.getByTestId("checkbox-item") as HTMLElement;
    expect(checkboxItem.tagName).toBe("ARTICLE");
    expect(checkboxItem.getAttribute("role")).toBe("menuitemcheckbox");
    expect(checkboxItem.getAttribute("aria-checked")).toBe("true");
    expect(checkboxItem.getAttribute("data-state")).toBe("checked");
    expect(checkboxItem.classList.contains("custom-class")).toBe(true);
    expect(checkboxItem.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(checkboxItem);

    fireEvent.click(checkboxItem);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Menubar.RadioGroup", () => {
  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarRadioGroup
                value="one"
                ref={(node) => void (element = node)}
                data-testid="radio-group"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <MenubarRadioItem value="one">Radio item</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
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
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarRadioGroup
                asChild
                value="one"
                ref={(node) => void (element = node)}
                data-testid="radio-group"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <article>
                  <MenubarRadioItem value="one">Radio item</MenubarRadioItem>
                </article>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
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

describe("Menubar.RadioItem", () => {
  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarRadioGroup value="one">
                <MenubarRadioItem
                  value="one"
                  ref={(node) => void (element = node)}
                  data-testid="radio-item"
                  class="custom-class"
                  style={{ "outline-color": "rgb(1, 2, 3)" }}
                  onClick={onClick}
                >
                  Radio item
                </MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
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
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarRadioGroup value="one">
                <MenubarRadioItem
                  asChild
                  value="one"
                  ref={(node) => void (element = node)}
                  data-testid="radio-item"
                  class="custom-class"
                  style={{ "outline-color": "rgb(1, 2, 3)" }}
                  onClick={onClick}
                >
                  <article>Radio item</article>
                </MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
    ));

    const radioItem = screen.getByTestId("radio-item") as HTMLElement;
    expect(radioItem.tagName).toBe("ARTICLE");
    expect(radioItem.getAttribute("role")).toBe("menuitemradio");
    expect(radioItem.getAttribute("aria-checked")).toBe("true");
    expect(radioItem.classList.contains("custom-class")).toBe(true);
    expect(radioItem.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(radioItem);

    fireEvent.click(radioItem);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Menubar.ItemIndicator", () => {
  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarCheckboxItem checked>
                <MenubarItemIndicator
                  ref={(node) => void (element = node)}
                  data-testid="item-indicator"
                  class="custom-class"
                  style={{ "outline-color": "rgb(1, 2, 3)" }}
                  onClick={onClick}
                >
                  Indicator
                </MenubarItemIndicator>
                Checkbox item
              </MenubarCheckboxItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
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
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarCheckboxItem checked>
                <MenubarItemIndicator
                  asChild
                  ref={(node) => void (element = node)}
                  data-testid="item-indicator"
                  class="custom-class"
                  style={{ "outline-color": "rgb(1, 2, 3)" }}
                  onClick={onClick}
                >
                  <article>Indicator</article>
                </MenubarItemIndicator>
                Checkbox item
              </MenubarCheckboxItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
    ));

    const itemIndicator = screen.getByTestId("item-indicator") as HTMLElement;
    expect(itemIndicator.tagName).toBe("ARTICLE");
    expect(itemIndicator.getAttribute("data-state")).toBe("checked");
    expect(itemIndicator.classList.contains("custom-class")).toBe(true);
    expect(itemIndicator.style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(itemIndicator);

    fireEvent.click(itemIndicator);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Menubar.Separator", () => {
  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarSeparator
                ref={(node) => void (element = node)}
                data-testid="separator"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              />
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
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
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarSeparator
                asChild
                ref={(node) => void (element = node)}
                data-testid="separator"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <article />
              </MenubarSeparator>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
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

describe("Menubar.Arrow", () => {
  test("spreads props it does not consume onto the element it renders", () => {
    let element: Element | null = null;
    const onClick = vi.fn();

    render(() => (
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem>Item</MenubarItem>
              <MenubarArrow
                ref={(node) => void (element = node)}
                data-testid="arrow"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              />
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
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
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem>Item</MenubarItem>
              <MenubarArrow
                asChild
                ref={(node) => void (element = node)}
                data-testid="arrow"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <svg />
              </MenubarArrow>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
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

describe("Menubar.SubTrigger", () => {
  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarSub>
                <MenubarSubTrigger
                  ref={(node) => void (element = node)}
                  data-testid="sub-trigger"
                  class="custom-class"
                  style={{ "outline-color": "rgb(1, 2, 3)" }}
                  onClick={onClick}
                >
                  Sub trigger
                </MenubarSubTrigger>
              </MenubarSub>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
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
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarSub>
                <MenubarSubTrigger
                  asChild
                  ref={(node) => void (element = node)}
                  data-testid="sub-trigger"
                  class="custom-class"
                  style={{ "outline-color": "rgb(1, 2, 3)" }}
                  onClick={onClick}
                >
                  <article>Sub trigger</article>
                </MenubarSubTrigger>
              </MenubarSub>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
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

  test("focusing the trigger keeps tabindex applied without transient removal", async () => {
    render(() => (
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem>New</MenubarItem>
              <MenubarSub>
                <MenubarSubTrigger>Share</MenubarSubTrigger>
                <MenubarPortal>
                  <MenubarSubContent>
                    <MenubarItem>Email Link</MenubarItem>
                  </MenubarSubContent>
                </MenubarPortal>
              </MenubarSub>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
    ));

    const subTrigger = (await screen.findByText("Share")) as HTMLElement;
    // The roving tab stop flips tabindex on focus; Slot must update it in
    // place, because a transient removal drops focus in real browsers and
    // makes the submenu unreachable (jsdom never drops it, so assert the
    // mechanism directly instead).
    const removeAttribute = vi.spyOn(subTrigger, "removeAttribute");
    subTrigger.focus();
    await vi.waitFor(() => expect(subTrigger.getAttribute("tabindex")).toBe("0"));
    expect(document.activeElement).toBe(subTrigger);
    expect(removeAttribute).not.toHaveBeenCalledWith("tabindex");
  });

  test("keyboard travels from the trigger into the submenu", async () => {
    render(() => (
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem>New</MenubarItem>
              <MenubarSub>
                <MenubarSubTrigger>Share</MenubarSubTrigger>
                <MenubarPortal>
                  <MenubarSubContent>
                    <MenubarItem>Email Link</MenubarItem>
                  </MenubarSubContent>
                </MenubarPortal>
              </MenubarSub>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
    ));

    const subTrigger = (await screen.findByText("Share")) as HTMLElement;
    subTrigger.focus();
    fireEvent.keyDown(subTrigger, { key: "ArrowRight" });
    const subItem = (await screen.findByText("Email Link")) as HTMLElement;
    expect(subTrigger.getAttribute("aria-expanded")).toBe("true");
    // The submenu content itself must be focusable (roving `tabindex` lands
    // on it, not the popper wrapper) so keyboard can travel into the submenu.
    const subContent = subItem.closest('[role="menu"]') as HTMLElement;
    expect(subContent.hasAttribute("tabindex")).toBe(true);
    subItem.focus();
    expect(document.activeElement).toBe(subItem);
    // Focus moving into the portalled submenu must not read as outside to
    // the parent layer; flush first so a wrongful dismissal would unmount.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByText("New")).not.toBe(null);
    expect(screen.queryByText("Email Link")).not.toBe(null);
  });

  test("pointerdown inside the submenu does not dismiss the parent menu", async () => {
    render(() => (
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem>New</MenubarItem>
              <MenubarSub>
                <MenubarSubTrigger>Share</MenubarSubTrigger>
                <MenubarPortal>
                  <MenubarSubContent>
                    <MenubarItem>Email Link</MenubarItem>
                  </MenubarSubContent>
                </MenubarPortal>
              </MenubarSub>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
    ));

    const subTrigger = (await screen.findByText("Share")) as HTMLElement;
    subTrigger.focus();
    fireEvent.keyDown(subTrigger, { key: "ArrowRight" });
    const subItem = (await screen.findByText("Email Link")) as HTMLElement;
    // Pointerdown alone never legitimately closes anything; if the parent
    // layer reads the portalled submenu as outside, it dismisses here. The
    // tick matters: document pointerdown listeners register on a timeout.
    await new Promise((resolve) => setTimeout(resolve, 0));
    fireEvent.pointerDown(subItem, { button: 0 });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByText("New")).not.toBe(null);
    expect(screen.queryByText("Email Link")).not.toBe(null);
  });
});

describe("Menubar.SubContent", () => {
  test("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarSub>
                <MenubarSubTrigger>Sub trigger</MenubarSubTrigger>
                <MenubarPortal forceMount>
                  <MenubarSubContent
                    ref={(node) => void (element = node)}
                    data-testid="sub-content"
                    class="custom-class"
                    style={{ "outline-color": "rgb(1, 2, 3)" }}
                    onClick={onClick}
                  >
                    <MenubarItem>Sub item</MenubarItem>
                  </MenubarSubContent>
                </MenubarPortal>
              </MenubarSub>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
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
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarSub>
                <MenubarSubTrigger>Sub trigger</MenubarSubTrigger>
                <MenubarPortal forceMount>
                  <MenubarSubContent
                    asChild
                    ref={(node) => void (element = node)}
                    data-testid="sub-content"
                    class="custom-class"
                    style={{ "outline-color": "rgb(1, 2, 3)" }}
                    onClick={onClick}
                  >
                    <article>
                      <MenubarItem>Sub item</MenubarItem>
                    </article>
                  </MenubarSubContent>
                </MenubarPortal>
              </MenubarSub>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
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

// NOTE: Radix's menubar suite only covers `aria-controls` linkage and prop
// spreading - the interactions below are Solidix-authored against the Radix
// source (`menubar.tsx` trigger/content handlers).
describe("menus", () => {
  function TwoMenuBar(props: { loop?: boolean } = {}) {
    return (
      <Menubar loop={props.loop}>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent aria-label="file menu">
              <MenubarItem>New</MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
        <MenubarMenu value="edit">
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent aria-label="edit menu">
              <MenubarItem>Undo</MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
    );
  }

  const openMenuLabels = () =>
    screen.queryAllByRole("menu").map((menu) => menu.getAttribute("aria-label"));

  test("opens on trigger left pointerdown", async () => {
    render(() => <TwoMenuBar />);
    expect(screen.queryByRole("menu")).toBe(null);

    fireEvent.pointerDown(screen.getByText("File"), { button: 0 });
    expect(await screen.findByRole("menu")).toBeTruthy();
    expect(openMenuLabels()).toEqual(["file menu"]);
  });

  test("ignores non-left trigger pointerdown", () => {
    render(() => <TwoMenuBar />);

    fireEvent.pointerDown(screen.getByText("File"), { button: 1 });
    fireEvent.pointerDown(screen.getByText("File"), { button: 0, ctrlKey: true });
    expect(screen.queryByRole("menu")).toBe(null);
  });

  test("toggles with Enter/Space and opens with ArrowDown", async () => {
    render(() => <TwoMenuBar />);
    const trigger = screen.getByText("File");

    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(await screen.findByRole("menu")).toBeTruthy();

    fireEvent.keyDown(trigger, { key: "Enter" });
    await vi.waitFor(() => expect(screen.queryByRole("menu")).toBe(null));

    fireEvent.keyDown(trigger, { key: " " });
    expect(await screen.findByRole("menu")).toBeTruthy();

    fireEvent.keyDown(trigger, { key: " " });
    await vi.waitFor(() => expect(screen.queryByRole("menu")).toBe(null));

    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(await screen.findByRole("menu")).toBeTruthy();
  });

  test("moves between menus with ArrowRight/ArrowLeft inside content", async () => {
    render(() => <TwoMenuBar />);
    fireEvent.pointerDown(screen.getByText("File"), { button: 0 });
    const content = (await screen.findByRole("menu")) as HTMLElement;
    expect(openMenuLabels()).toEqual(["file menu"]);

    fireEvent.keyDown(content, { key: "ArrowRight" });
    await vi.waitFor(() => expect(openMenuLabels()).toEqual(["edit menu"]));

    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowLeft" });
    await vi.waitFor(() => expect(openMenuLabels()).toEqual(["file menu"]));
  });

  test("wraps between menus when loop is enabled and stops when disabled", async () => {
    render(() => <TwoMenuBar />);
    fireEvent.pointerDown(screen.getByText("Edit"), { button: 0 });
    expect(await screen.findByRole("menu")).toBeTruthy();
    expect(openMenuLabels()).toEqual(["edit menu"]);

    // ArrowRight on the last menu wraps to the first (loop defaults true).
    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowRight" });
    await vi.waitFor(() => expect(openMenuLabels()).toEqual(["file menu"]));
  });

  test("stays on the last menu with ArrowRight when loop is disabled", async () => {
    render(() => <TwoMenuBar loop={false} />);
    fireEvent.pointerDown(screen.getByText("Edit"), { button: 0 });
    expect(await screen.findByRole("menu")).toBeTruthy();

    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowRight" });
    await vi.waitFor(() => expect(openMenuLabels()).toEqual(["edit menu"]));
  });

  test("switches menus on pointer enter while open", async () => {
    render(() => <TwoMenuBar />);
    fireEvent.pointerDown(screen.getByText("File"), { button: 0 });
    expect(await screen.findByRole("menu")).toBeTruthy();

    fireEvent.pointerEnter(screen.getByText("Edit"));
    await vi.waitFor(() => expect(openMenuLabels()).toEqual(["edit menu"]));
  });

  test("does not switch menus on pointer enter while closed", () => {
    render(() => <TwoMenuBar />);
    fireEvent.pointerEnter(screen.getByText("Edit"));
    expect(screen.queryByRole("menu")).toBe(null);
  });

  test("does not open a disabled trigger", () => {
    render(() => (
      <Menubar>
        <MenubarMenu value="file">
          <MenubarTrigger disabled>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem>New</MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
    ));

    const trigger = screen.getByText("File");
    expect(trigger.getAttribute("data-disabled")).toBe("");
    fireEvent.pointerDown(trigger, { button: 0 });
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(screen.queryByRole("menu")).toBe(null);
  });

  test("closes on Escape and refocuses the trigger", async () => {
    render(() => <TwoMenuBar />);
    const trigger = screen.getByText("File");
    fireEvent.pointerDown(trigger, { button: 0 });
    const content = (await screen.findByRole("menu")) as HTMLElement;

    fireEvent.keyDown(content, { key: "Escape" });
    await vi.waitFor(() => expect(screen.queryByRole("menu")).toBe(null));
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  test("selects an item and closes the menu", async () => {
    const onSelect = vi.fn();
    render(() => (
      <Menubar>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem onSelect={onSelect}>New</MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
    ));

    fireEvent.pointerDown(screen.getByText("File"), { button: 0 });
    fireEvent.click(await screen.findByText("New"));
    await vi.waitFor(() => expect(onSelect).toHaveBeenCalledTimes(1));
    await vi.waitFor(() => expect(screen.queryByRole("menu")).toBe(null));
  });
});

describe("submenus", () => {
  function SubmenuBar() {
    return (
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent aria-label="file menu">
              <MenubarItem>New</MenubarItem>
              <MenubarSub>
                <MenubarSubTrigger>Share</MenubarSubTrigger>
                <MenubarPortal>
                  <MenubarSubContent aria-label="share menu">
                    <MenubarItem>Email Link</MenubarItem>
                  </MenubarSubContent>
                </MenubarPortal>
              </MenubarSub>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
    );
  }

  const openMenuLabels = () =>
    screen.queryAllByRole("menu").map((menu) => menu.getAttribute("aria-label"));

  function rect(x: number, y: number, width: number, height: number): DOMRect {
    return {
      x,
      y,
      width,
      height,
      top: y,
      left: x,
      right: x + width,
      bottom: y + height,
      toJSON: () => {},
    } as DOMRect;
  }

  test("keeps the root menu open when the pointer crosses into an open submenu", async () => {
    render(() => <SubmenuBar />);
    const share = (await screen.findByText("Share")) as HTMLElement;

    // Hovering the subtrigger opens the submenu after a short delay.
    fireEvent.pointerMove(share, { pointerType: "mouse", clientX: 100, clientY: 120 });
    const email = (await screen.findByText("Email Link")) as HTMLElement;

    // jsdom reports zero rects, which collapses the submenu grace area; give
    // both menus realistic geometry so the crossing stays inside it, as in a
    // real browser (root dropdown with the submenu docked to its right edge).
    const rootMenu = screen.getByLabelText("file menu") as HTMLElement;
    rootMenu.getBoundingClientRect = () => rect(8, 40, 200, 160);
    const subMenu = screen.getByLabelText("share menu") as HTMLElement;
    subMenu.getBoundingClientRect = () => rect(208, 90, 180, 100);

    // Moving the mouse off the root menu into the submenu must not dismiss it.
    fireEvent.pointerMove(share, { pointerType: "mouse", clientX: 180, clientY: 120 });
    fireEvent.pointerLeave(share, { pointerType: "mouse", clientX: 205, clientY: 120 });
    fireEvent.pointerMove(email, { pointerType: "mouse", clientX: 250, clientY: 130 });

    await vi.waitFor(() => expect(document.activeElement).toBe(email));
    expect(openMenuLabels()).toEqual(["file menu", "share menu"]);
  });
});
