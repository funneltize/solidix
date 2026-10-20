import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@solidjs/testing-library";
import { Portal as SolidPortal } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { createSignal, flush } from "solid-js";
import * as Select from "../src/index";

const PLACEHOLDER_TEXT = "Pick one";
const CLEAR_TEXT = "None";

const SelectTest = (props: Select.SelectProps) => (
  <Select.Root {...props}>
    <Select.Trigger aria-label="Choice">
      <Select.Value placeholder={PLACEHOLDER_TEXT} />
    </Select.Trigger>
    <Select.Portal>
      <Select.Content position="popper">
        <Select.Viewport>
          <Select.Item value="apple">
            <Select.ItemText>Apple</Select.ItemText>
          </Select.Item>
          <Select.Item value="banana">
            <Select.ItemText>Banana</Select.ItemText>
          </Select.Item>
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);

const SelectClearableTest = (props: Select.SelectProps) => (
  <Select.Root {...props}>
    <Select.Trigger aria-label="Choice">
      <Select.Value placeholder={PLACEHOLDER_TEXT} />
    </Select.Trigger>
    <Select.Portal>
      <Select.Content position="popper">
        <Select.Viewport>
          <Select.Item value="">
            <Select.ItemText>{CLEAR_TEXT}</Select.ItemText>
          </Select.Item>
          <Select.Item value="apple">
            <Select.ItemText>Apple</Select.ItemText>
          </Select.Item>
          <Select.Item value="banana">
            <Select.ItemText>Banana</Select.ItemText>
          </Select.Item>
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);

describe("aria-controls", () => {
  afterEach(cleanup);

  it("should not reference a non-existent element while closed", () => {
    render(() => <SelectTest />);
    const trigger = screen.getByRole("combobox");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.getAttribute("aria-controls")).toBeNull();
  });

  it("should reference the rendered content while open", async () => {
    render(() => <SelectTest defaultOpen />);
    const trigger = screen.getByRole("combobox", { hidden: true });
    const content = await vi.waitFor(() => screen.getByRole("listbox"));

    expect(content.id).toBeTruthy();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(content.id);
    expect(document.getElementById(content.id)).toBe(content);
  });
});

describe("clearing an optional value (#2706)", () => {
  afterEach(cleanup);

  it("allows a `Select.Item` with an empty string value to be rendered", async () => {
    expect(() => render(() => <SelectClearableTest defaultOpen />)).not.toThrow();
    const clearItem = await vi.waitFor(() => screen.getByText(CLEAR_TEXT));
    expect(document.contains(clearItem)).toBe(true);
  });

  it("marks the empty value item as selected when the value is empty", async () => {
    render(() => <SelectClearableTest defaultOpen value="" />);
    const clearItem = await vi.waitFor(() =>
      screen.getByRole("option", { name: CLEAR_TEXT, hidden: true }),
    );
    expect(clearItem.getAttribute("data-state")).toBe("checked");
  });

  it("shows the placeholder (not the item text) when the empty value item is selected", async () => {
    render(() => <SelectClearableTest value="" />);
    const trigger = screen.getByRole("combobox");
    expect(trigger.textContent).toContain(PLACEHOLDER_TEXT);
    expect(trigger.textContent ?? "").not.toContain(CLEAR_TEXT);
    expect(trigger.hasAttribute("data-placeholder")).toBe(true);
  });

  it("lets the user reset a previously selected value back to the placeholder", async () => {
    function ControlledSelect() {
      const [value, setValue] = createSignal<string | undefined>("apple");
      return <SelectClearableTest value={value()} onValueChange={setValue} defaultOpen />;
    }

    render(() => <ControlledSelect />);
    const trigger = screen.getByRole("combobox", { hidden: true });

    // Value starts as "apple" and the trigger reflects it.
    await vi.waitFor(() => expect(trigger.textContent).toContain("Apple"));
    expect(trigger.hasAttribute("data-placeholder")).toBe(false);

    // Selecting the empty value item clears the selection.
    const clearItem = screen.getByRole("option", { name: CLEAR_TEXT, hidden: true });
    fireEvent.click(clearItem);

    await vi.waitFor(() => expect(trigger.textContent).toContain(PLACEHOLDER_TEXT));
    expect(trigger.textContent ?? "").not.toContain("Apple");
    expect(trigger.hasAttribute("data-placeholder")).toBe(true);
  });

  it("renders a single empty native option when a clear item is provided", async () => {
    const { container } = render(() => (
      <form>
        <SelectClearableTest name="fruit" value="" defaultOpen />
      </form>
    ));
    // Wait for items to register their native options.
    await vi.waitFor(() => {
      const nativeSelect = container.querySelector("select");
      const optionValues = Array.from(nativeSelect?.querySelectorAll("option") ?? []).map(
        (o) => o.value,
      );
      expect(optionValues).toContain("apple");
    });
    const nativeSelect = container.querySelector("select");
    const emptyOptions = Array.from(nativeSelect?.querySelectorAll("option") ?? []).filter(
      (option) => option.value === "",
    );
    expect(emptyOptions).toHaveLength(1);
  });
});

// Regression tests for https://github.com/radix-ui/primitives/issues/4197
describe("handlers with a narrower parameter type than the prop", () => {
  afterEach(cleanup);

  type Fruit = "apple" | "banana";

  it("accepts an `onValueChange` handler typed with the item values on a controlled select", async () => {
    const handleValueChange = vi.fn((value: Fruit) => value);

    function ControlledSelect() {
      const [value, setValue] = createSignal<Fruit>("apple");
      return (
        <SelectTest
          value={value()}
          onValueChange={(nextValue: Fruit) => {
            handleValueChange(nextValue);
            setValue(nextValue);
          }}
          defaultOpen
        />
      );
    }

    render(() => <ControlledSelect />);
    const bananaItem = await vi.waitFor(() =>
      screen.getByRole("option", { name: "Banana", hidden: true }),
    );
    fireEvent.click(bananaItem);

    expect(handleValueChange).toHaveBeenCalledWith("banana");
  });

  it("accepts an `onValueChange` handler typed with the item values on an uncontrolled select", async () => {
    const handleValueChange = vi.fn((value: Fruit) => value);

    render(() => <SelectTest defaultValue="apple" onValueChange={handleValueChange} defaultOpen />);
    const bananaItem = await vi.waitFor(() =>
      screen.getByRole("option", { name: "Banana", hidden: true }),
    );
    // Uncontrolled `onChange` fires from an effect: flush so the assertion below observes it.
    flush(() => fireEvent.click(bananaItem));

    expect(handleValueChange).toHaveBeenCalledWith("banana");
  });

  it("accepts an `onOpenChange` handler typed with a narrower parameter", async () => {
    const handleOpenChange = vi.fn((open: false) => open);

    render(() => <SelectTest onOpenChange={handleOpenChange} defaultOpen />);
    const bananaItem = await vi.waitFor(() =>
      screen.getByRole("option", { name: "Banana", hidden: true }),
    );
    // Uncontrolled `onChange` fires from an effect: flush so the assertion below observes it.
    flush(() => fireEvent.click(bananaItem));

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});

// Regression test for https://github.com/radix-ui/primitives/issues/1663
describe("given all select items are disabled", () => {
  afterEach(cleanup);

  it("positions content relative to the trigger", async () => {
    render(() => (
      <Select.Root defaultOpen>
        <Select.Trigger aria-label="Choice">
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport>
              <Select.Item value="a" disabled>
                <Select.ItemText>Option A</Select.ItemText>
              </Select.Item>
              <Select.Item value="b" disabled>
                <Select.ItemText>Option B</Select.ItemText>
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));

    const content = await vi.waitFor(() => screen.getByRole("listbox"));
    const options = screen.getAllByRole("option", { hidden: true });
    expect(options).toHaveLength(2);

    await vi.waitFor(() => {
      expect(content.parentElement?.style.minWidth).not.toBe("");
    });
  });
});

describe("disabled item", () => {
  afterEach(cleanup);

  const SelectWithDisabledItem = (
    props: Select.SelectProps & { onItemClick?: (() => void) | undefined },
  ) => {
    return (
      <Select.Root defaultOpen {...props}>
        <Select.Trigger aria-label="Choice">
          <Select.Value placeholder={PLACEHOLDER_TEXT} />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content position="popper">
            <Select.Viewport>
              <Select.Item value="apple">
                <Select.ItemText>Apple</Select.ItemText>
              </Select.Item>
              <Select.Item value="banana" disabled onClick={props.onItemClick}>
                <Select.ItemText>Banana</Select.ItemText>
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    );
  };

  it("does not select a disabled item that is clicked", async () => {
    const onValueChange = vi.fn();
    render(() => <SelectWithDisabledItem onValueChange={onValueChange} />);
    const banana = await vi.waitFor(() =>
      screen.getByRole("option", { name: "Banana", hidden: true }),
    );
    fireEvent.click(banana);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("still calls a consumer-provided `onClick` on a disabled item", async () => {
    const onItemClick = vi.fn();
    render(() => <SelectWithDisabledItem onItemClick={onItemClick} />);
    const banana = await vi.waitFor(() =>
      screen.getByRole("option", { name: "Banana", hidden: true }),
    );
    fireEvent.click(banana);
    expect(onItemClick).toHaveBeenCalledTimes(1);
  });
});

// Regression tests for https://github.com/radix-ui/primitives/issues/3232
describe("keys from focusable descendants", () => {
  afterEach(cleanup);

  const SelectWithPortaledInput = (props: Select.SelectProps) => (
    <Select.Root defaultOpen {...props}>
      <Select.Trigger aria-label="Choice">
        <Select.Value placeholder={PLACEHOLDER_TEXT} />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content position="popper">
          <Select.Viewport>
            <Select.Item value="apple">
              <Select.ItemText>Apple</Select.ItemText>
              <SolidPortal mount={document.body}>
                <input data-testid="input" value="" onInput={() => {}} />
              </SolidPortal>
            </Select.Item>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );

  it("does not select an item from Space/Enter typed into a portaled focusable descendant", async () => {
    const onValueChange = vi.fn();
    render(() => <SelectWithPortaledInput onValueChange={onValueChange} />);
    const input = (await vi.waitFor(() => screen.getByTestId("input"))) as HTMLInputElement;
    input.focus();
    fireEvent.keyDown(input, { key: " " });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("still selects the item via Enter when the item itself is focused", async () => {
    const onValueChange = vi.fn();
    render(() => <SelectWithPortaledInput onValueChange={onValueChange} />);
    const item = await vi.waitFor(() =>
      screen.getByRole("option", { name: "Apple", hidden: true }),
    );
    (item as HTMLElement).focus();
    // Uncontrolled `onChange` fires from an effect: flush so the assertion below observes it.
    flush(() => fireEvent.keyDown(item, { key: "Enter" }));
    expect(onValueChange).toHaveBeenCalledWith("apple");
  });
});

// Regression tests for https://github.com/radix-ui/primitives/issues/3963
describe("Select ref stability", () => {
  afterEach(cleanup);

  const renderOpenSelect =
    (slot: "content" | "item" | "itemText") => (ref: (node: unknown) => void) => (
      <Select.Root defaultOpen>
        <Select.Trigger aria-label="Choice">
          <Select.Value placeholder={PLACEHOLDER_TEXT} />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content ref={slot === "content" ? (ref as never) : undefined}>
            <Select.Viewport>
              <Select.Item value="apple" ref={slot === "item" ? (ref as never) : undefined}>
                <Select.ItemText ref={slot === "itemText" ? (ref as never) : undefined}>
                  Apple
                </Select.ItemText>
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    );

  it("keeps a stable composed ref on Content", () => {
    assertStableComposedRef(renderOpenSelect("content"));
  });

  it("keeps a stable composed ref on Item", () => {
    assertStableComposedRef(renderOpenSelect("item"));
  });

  it("keeps a stable composed ref on ItemText", () => {
    assertStableComposedRef(renderOpenSelect("itemText"));
  });
});

describe("given a Select in a form that is reset", () => {
  afterEach(cleanup);

  describe("uncontrolled", () => {
    it("should restore its `defaultValue` when the form is reset", async () => {
      render(() => (
        <form>
          {/* Keep the content open so the items (and their selection state) stay mounted. */}
          <SelectTest name="fruit" defaultValue="apple" open onOpenChange={() => {}} />
          <button type="reset">Reset</button>
        </form>
      ));

      const listbox = await vi.waitFor(() => screen.getByRole("listbox", { hidden: true }));
      const apple = within(listbox).getByRole("option", { name: "Apple" });
      const banana = within(listbox).getByRole("option", { name: "Banana" });

      expect(apple.getAttribute("data-state")).toBe("checked");

      flush(() => fireEvent.click(banana));
      expect(banana.getAttribute("data-state")).toBe("checked");
      expect(apple.getAttribute("data-state")).toBe("unchecked");

      flush(() => fireEvent.click(screen.getByText("Reset")));
      expect(apple.getAttribute("data-state")).toBe("checked");
      expect(banana.getAttribute("data-state")).toBe("unchecked");
    });

    it("should restore the placeholder when reset with no initial value", async () => {
      render(() => (
        <form>
          {/* Keep the content open so the items (and their selection state) stay mounted. */}
          <SelectTest name="fruit" open onOpenChange={() => {}} />
          <button type="reset">Reset</button>
        </form>
      ));

      const trigger = screen.getByRole("combobox", { name: "Choice", hidden: true });
      // No value selected initially, so the placeholder is shown.
      expect(trigger.textContent).toContain(PLACEHOLDER_TEXT);

      const listbox = await vi.waitFor(() => screen.getByRole("listbox", { hidden: true }));
      const banana = within(listbox).getByRole("option", { name: "Banana" });
      flush(() => fireEvent.click(banana));
      expect(banana.getAttribute("data-state")).toBe("checked");
      expect(trigger.textContent ?? "").not.toContain(PLACEHOLDER_TEXT);

      flush(() => fireEvent.click(screen.getByRole("button", { name: "Reset", hidden: true })));
      expect(banana.getAttribute("data-state")).toBe("unchecked");
      expect(trigger.textContent).toContain(PLACEHOLDER_TEXT);
    });
  });

  describe("controlled", () => {
    it("should restore its initial `value` when the form is reset", async () => {
      function ControlledSelect() {
        const [value, setValue] = createSignal("apple");
        return (
          <form>
            <SelectTest
              name="fruit"
              value={value()}
              onValueChange={setValue}
              open
              onOpenChange={() => {}}
            />
            <button type="reset">Reset</button>
          </form>
        );
      }

      render(() => <ControlledSelect />);

      const listbox = await vi.waitFor(() => screen.getByRole("listbox", { hidden: true }));
      const apple = within(listbox).getByRole("option", { name: "Apple" });
      expect(apple.getAttribute("data-state")).toBe("checked");

      const banana = within(listbox).getByRole("option", { name: "Banana" });
      flush(() => fireEvent.click(banana));
      expect(banana.getAttribute("data-state")).toBe("checked");
      expect(apple.getAttribute("data-state")).toBe("unchecked");

      flush(() => fireEvent.click(screen.getByText("Reset")));
      expect(apple.getAttribute("data-state")).toBe("checked");
      expect(banana.getAttribute("data-state")).toBe("unchecked");
    });
  });

  describe("external form association", () => {
    it("should restore its `defaultValue` when reset from an external form", async () => {
      render(() => (
        <>
          <form id="select-reset-form">
            <button type="reset">Reset</button>
          </form>
          <SelectTest
            name="fruit"
            form="select-reset-form"
            defaultValue="apple"
            open
            onOpenChange={() => {}}
          />
        </>
      ));

      const listbox = await vi.waitFor(() => screen.getByRole("listbox", { hidden: true }));
      const apple = within(listbox).getByRole("option", { name: "Apple" });
      expect(apple.getAttribute("data-state")).toBe("checked");

      const banana = within(listbox).getByRole("option", { name: "Banana" });
      flush(() => fireEvent.click(banana));
      expect(banana.getAttribute("data-state")).toBe("checked");

      flush(() => fireEvent.click(screen.getByRole("button", { name: "Reset", hidden: true })));
      expect(apple.getAttribute("data-state")).toBe("checked");
      expect(banana.getAttribute("data-state")).toBe("unchecked");
    });

    it("should restore its initial `value` when reset from an external form", async () => {
      function ControlledSelect() {
        const [value, setValue] = createSignal("apple");
        return (
          <>
            <form id="select-reset-form">
              <button type="reset">Reset</button>
            </form>
            <SelectTest
              name="fruit"
              form="select-reset-form"
              value={value()}
              onValueChange={setValue}
              open
              onOpenChange={() => {}}
            />
          </>
        );
      }

      render(() => <ControlledSelect />);

      const listbox = await vi.waitFor(() => screen.getByRole("listbox", { hidden: true }));
      const apple = within(listbox).getByRole("option", { name: "Apple" });
      expect(apple.getAttribute("data-state")).toBe("checked");

      const banana = within(listbox).getByRole("option", { name: "Banana" });
      flush(() => fireEvent.click(banana));
      expect(banana.getAttribute("data-state")).toBe("checked");

      flush(() => fireEvent.click(screen.getByRole("button", { name: "Reset", hidden: true })));
      expect(apple.getAttribute("data-state")).toBe("checked");
      expect(banana.getAttribute("data-state")).toBe("unchecked");
    });
  });
});

/**
 * The scroll buttons mount off the viewport's scroll offsets, which jsdom
 * always reports as zero. We fake the metrics then re-notify the `scroll`
 * listener the buttons install once the content has been placed.
 */
function fakeViewportScroll(metrics: {
  scrollTop?: number | undefined;
  scrollHeight?: number | undefined;
}) {
  const viewport = document.querySelector("[data-radix-select-viewport]");
  if (!viewport) {
    console.warn("Expected a `Select.Viewport` to be rendered.");
    return;
  }
  for (const [property, value] of Object.entries(metrics)) {
    Object.defineProperty(viewport, property, {
      configurable: true,
      get: () => value,
      set: () => {},
    });
  }
  // Flush so the scroll listener's state update (and the button mount) applies synchronously.
  flush(() => fireEvent.scroll(viewport));
}

/**
 * The scroll-button `scroll` listener attaches once the content has been
 * placed (`isPositioned`), which also moves focus to the selected item. Wait
 * for that focus so scrolled metrics are observed deterministically.
 */
async function waitForContentPlaced() {
  await vi.waitFor(() => {
    expect(document.activeElement?.getAttribute("role")).toBe("option");
  });
}

describe("Select.Trigger", () => {
  afterEach(cleanupModal);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLButtonElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root>
        <Select.Trigger
          ref={(node) => void (element = node)}
          data-testid="trigger"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
      </Select.Root>
    ));

    const trigger = screen.getByTestId("trigger");
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect((trigger as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    // Composed with the trigger's own click handler rather than replaced by it.
    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLButtonElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root>
        <Select.Trigger
          asChild
          ref={(node) => void (element = node)}
          data-testid="trigger"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        >
          <button type="button">
            <Select.Value placeholder="Pick one" />
          </button>
        </Select.Trigger>
      </Select.Root>
    ));

    const trigger = screen.getByTestId("trigger");
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("role")).toBe("combobox");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.classList.contains("custom-class")).toBe(true);
    expect((trigger as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(trigger);

    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Select.Icon", () => {
  afterEach(cleanupModal);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLSpanElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root>
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
          <Select.Icon
            ref={(node) => void (element = node)}
            data-testid="icon"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          />
        </Select.Trigger>
      </Select.Root>
    ));

    const icon = screen.getByTestId("icon");
    expect(icon.classList.contains("custom-class")).toBe(true);
    expect((icon as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(icon);

    fireEvent.click(icon);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLSpanElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root>
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
          <Select.Icon
            asChild
            ref={(node) => void (element = node)}
            data-testid="icon"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article />
          </Select.Icon>
        </Select.Trigger>
      </Select.Root>
    ));

    const icon = screen.getByTestId("icon");
    expect(icon.tagName).toBe("ARTICLE");
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.classList.contains("custom-class")).toBe(true);
    expect((icon as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(icon);

    fireEvent.click(icon);
    expect(onClick).toHaveBeenCalled();
  });
});

// `position="item-aligned"` and `position="popper"` render entirely different
// internal trees so we need coverage for both.
describe("Select.Content", () => {
  afterEach(cleanupModal);

  it('spreads props it does not consume onto the element it renders with `position="item-aligned"`', () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root defaultOpen defaultValue="apple">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position="item-aligned"
            ref={(node) => void (element = node)}
            data-testid="content"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <Select.Viewport>
              <Select.Item value="apple">
                <Select.ItemText>Apple</Select.ItemText>
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));

    const content = screen.getByTestId("content");
    expect(content.classList.contains("custom-class")).toBe(true);
    expect((content as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    fireEvent.click(content);
    expect(onClick).toHaveBeenCalled();
  });

  it('forwards props to the child element when `asChild` is set with `position="item-aligned"`', () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root defaultOpen defaultValue="apple">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position="item-aligned"
            asChild
            ref={(node) => void (element = node)}
            data-testid="content"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article>
              <Select.Viewport>
                <Select.Item value="apple">
                  <Select.ItemText>Apple</Select.ItemText>
                </Select.Item>
              </Select.Viewport>
            </article>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));

    const content = screen.getByTestId("content");
    expect(content.tagName).toBe("ARTICLE");
    expect(content.getAttribute("role")).toBe("listbox");
    expect(content.getAttribute("data-state")).toBe("open");
    expect(content.classList.contains("custom-class")).toBe(true);
    expect((content as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    fireEvent.click(content);
    expect(onClick).toHaveBeenCalled();
  });

  it('spreads props it does not consume onto the element it renders with `position="popper"`', () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root defaultOpen defaultValue="apple">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position="popper"
            ref={(node) => void (element = node)}
            data-testid="content"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <Select.Viewport>
              <Select.Item value="apple">
                <Select.ItemText>Apple</Select.ItemText>
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));

    const content = screen.getByTestId("content");
    expect(content.classList.contains("custom-class")).toBe(true);
    expect((content as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    fireEvent.click(content);
    expect(onClick).toHaveBeenCalled();
  });

  it('forwards props to the child element when `asChild` is set with `position="popper"`', () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root defaultOpen defaultValue="apple">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position="popper"
            asChild
            ref={(node) => void (element = node)}
            data-testid="content"
            class="custom-class"
            style={{ "outline-color": "rgb(1, 2, 3)" }}
            onClick={onClick}
          >
            <article>
              <Select.Viewport>
                <Select.Item value="apple">
                  <Select.ItemText>Apple</Select.ItemText>
                </Select.Item>
              </Select.Viewport>
            </article>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));

    const content = screen.getByTestId("content");
    expect(content.tagName).toBe("ARTICLE");
    expect(content.getAttribute("role")).toBe("listbox");
    expect(content.getAttribute("data-state")).toBe("open");
    expect(content.classList.contains("custom-class")).toBe(true);
    expect((content as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(content);

    fireEvent.click(content);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Select.Viewport", () => {
  afterEach(cleanupModal);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root defaultOpen defaultValue="apple">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport
              ref={(node) => void (element = node)}
              data-testid="viewport"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <Select.Item value="apple">
                <Select.ItemText>Apple</Select.ItemText>
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
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
      <Select.Root defaultOpen defaultValue="apple">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport
              asChild
              ref={(node) => void (element = node)}
              data-testid="viewport"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <article>
                <Select.Item value="apple">
                  <Select.ItemText>Apple</Select.ItemText>
                </Select.Item>
              </article>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));

    const viewport = screen.getByTestId("viewport");
    expect(viewport.tagName).toBe("ARTICLE");
    expect(viewport.getAttribute("data-radix-select-viewport")).toBe("");
    expect(viewport.getAttribute("role")).toBe("presentation");
    expect(viewport.classList.contains("custom-class")).toBe(true);
    expect((viewport as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(viewport);

    fireEvent.click(viewport);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Select.Group", () => {
  afterEach(cleanupModal);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root defaultOpen defaultValue="apple">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport>
              <Select.Group
                ref={(node) => void (element = node)}
                data-testid="group"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <Select.Label>Fruit</Select.Label>
              </Select.Group>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));

    const group = screen.getByTestId("group");
    expect(group.classList.contains("custom-class")).toBe(true);
    expect((group as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(group);

    fireEvent.click(group);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root defaultOpen defaultValue="apple">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport>
              <Select.Group
                asChild
                ref={(node) => void (element = node)}
                data-testid="group"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <article>
                  <Select.Label data-testid="label">Fruit</Select.Label>
                </article>
              </Select.Group>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));

    const group = screen.getByTestId("group");
    expect(group.tagName).toBe("ARTICLE");
    expect(group.getAttribute("role")).toBe("group");
    expect(group.getAttribute("aria-labelledby")).toBe(screen.getByTestId("label").id);
    expect(group.classList.contains("custom-class")).toBe(true);
    expect((group as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(group);

    fireEvent.click(group);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Select.Label", () => {
  afterEach(cleanupModal);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root defaultOpen defaultValue="apple">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport>
              <Select.Group>
                <Select.Label
                  ref={(node) => void (element = node)}
                  data-testid="label"
                  class="custom-class"
                  style={{ "outline-color": "rgb(1, 2, 3)" }}
                  onClick={onClick}
                >
                  Fruit
                </Select.Label>
              </Select.Group>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));

    const label = screen.getByTestId("label");
    expect(label.classList.contains("custom-class")).toBe(true);
    expect((label as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(label);

    fireEvent.click(label);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root defaultOpen defaultValue="apple">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport>
              <Select.Group data-testid="group">
                <Select.Label
                  asChild
                  ref={(node) => void (element = node)}
                  data-testid="label"
                  class="custom-class"
                  style={{ "outline-color": "rgb(1, 2, 3)" }}
                  onClick={onClick}
                >
                  <article>Fruit</article>
                </Select.Label>
              </Select.Group>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));

    const label = screen.getByTestId("label");
    expect(label.tagName).toBe("ARTICLE");
    // The label owns the `id` its group points at, so that has to land on the consumer's element.
    expect(screen.getByTestId("group").getAttribute("aria-labelledby")).toBe(label.id);
    expect(label.classList.contains("custom-class")).toBe(true);
    expect((label as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(label);

    fireEvent.click(label);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Select.Item", () => {
  afterEach(cleanupModal);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root defaultOpen defaultValue="apple">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport>
              <Select.Item
                value="apple"
                ref={(node) => void (element = node)}
                data-testid="item"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <Select.ItemText>Apple</Select.ItemText>
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));

    const item = screen.getByTestId("item");
    expect(item.classList.contains("custom-class")).toBe(true);
    expect((item as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(item);

    // Composed with the item's own handler rather than replaced
    fireEvent.click(item);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root defaultOpen defaultValue="apple">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport>
              <Select.Item
                value="apple"
                asChild
                ref={(node) => void (element = node)}
                data-testid="item"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <article>
                  <Select.ItemText>Apple</Select.ItemText>
                </article>
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));

    const item = screen.getByTestId("item");
    expect(item.tagName).toBe("ARTICLE");
    expect(item.getAttribute("role")).toBe("option");
    expect(item.getAttribute("data-state")).toBe("checked");
    expect(item.classList.contains("custom-class")).toBe(true);
    expect((item as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(item);

    fireEvent.click(item);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Select.ItemIndicator", () => {
  afterEach(cleanupModal);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLSpanElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root defaultOpen defaultValue="apple">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport>
              {/* The indicator only renders inside the selected item. */}
              <Select.Item value="apple">
                <Select.ItemText>Apple</Select.ItemText>
                <Select.ItemIndicator
                  ref={(node) => void (element = node)}
                  data-testid="indicator"
                  class="custom-class"
                  style={{ "outline-color": "rgb(1, 2, 3)" }}
                  onClick={onClick}
                />
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));

    const indicator = screen.getByTestId("indicator");
    expect(indicator.classList.contains("custom-class")).toBe(true);
    expect((indicator as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(indicator);

    fireEvent.click(indicator);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLSpanElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root defaultOpen defaultValue="apple">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport>
              <Select.Item value="apple">
                <Select.ItemText>Apple</Select.ItemText>
                <Select.ItemIndicator
                  asChild
                  ref={(node) => void (element = node)}
                  data-testid="indicator"
                  class="custom-class"
                  style={{ "outline-color": "rgb(1, 2, 3)" }}
                  onClick={onClick}
                >
                  <article />
                </Select.ItemIndicator>
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));

    const indicator = screen.getByTestId("indicator");
    expect(indicator.tagName).toBe("ARTICLE");
    expect(indicator.getAttribute("aria-hidden")).toBe("true");
    expect(indicator.classList.contains("custom-class")).toBe(true);
    expect((indicator as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(indicator);

    fireEvent.click(indicator);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Select.ScrollUpButton", () => {
  afterEach(cleanupModal);

  it("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root defaultOpen defaultValue="apple">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.ScrollUpButton
              ref={(node) => void (element = node)}
              data-testid="scroll-up-button"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            />
            <Select.Viewport>
              <Select.Item value="apple">
                <Select.ItemText>Apple</Select.ItemText>
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));

    await waitForContentPlaced();

    // The up button only mounts once the viewport has been scrolled away from the top.
    fakeViewportScroll({ scrollTop: 1 });

    const scrollUpButton = screen.getByTestId("scroll-up-button");
    expect(scrollUpButton.classList.contains("custom-class")).toBe(true);
    expect((scrollUpButton as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(scrollUpButton);

    fireEvent.click(scrollUpButton);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root defaultOpen defaultValue="apple">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.ScrollUpButton
              asChild
              ref={(node) => void (element = node)}
              data-testid="scroll-up-button"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <article />
            </Select.ScrollUpButton>
            <Select.Viewport>
              <Select.Item value="apple">
                <Select.ItemText>Apple</Select.ItemText>
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));
    await waitForContentPlaced();
    fakeViewportScroll({ scrollTop: 1 });

    const scrollUpButton = screen.getByTestId("scroll-up-button");
    expect(scrollUpButton.tagName).toBe("ARTICLE");
    expect(scrollUpButton.getAttribute("aria-hidden")).toBe("true");
    expect(scrollUpButton.classList.contains("custom-class")).toBe(true);
    expect((scrollUpButton as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(scrollUpButton);

    fireEvent.click(scrollUpButton);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Select.ScrollDownButton", () => {
  afterEach(cleanupModal);

  it("spreads props it does not consume onto the element it renders", async () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root defaultOpen defaultValue="apple">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport>
              <Select.Item value="apple">
                <Select.ItemText>Apple</Select.ItemText>
              </Select.Item>
            </Select.Viewport>
            <Select.ScrollDownButton
              ref={(node) => void (element = node)}
              data-testid="scroll-down-button"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            />
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));
    await waitForContentPlaced();
    // The down button only mounts once the viewport has more content than it can show.
    fakeViewportScroll({ scrollHeight: 100 });

    const scrollDownButton = screen.getByTestId("scroll-down-button");
    expect(scrollDownButton.classList.contains("custom-class")).toBe(true);
    expect((scrollDownButton as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(scrollDownButton);

    fireEvent.click(scrollDownButton);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", async () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root defaultOpen defaultValue="apple">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport>
              <Select.Item value="apple">
                <Select.ItemText>Apple</Select.ItemText>
              </Select.Item>
            </Select.Viewport>
            <Select.ScrollDownButton
              asChild
              ref={(node) => void (element = node)}
              data-testid="scroll-down-button"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <article />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));
    await waitForContentPlaced();
    fakeViewportScroll({ scrollHeight: 100 });

    const scrollDownButton = screen.getByTestId("scroll-down-button");
    expect(scrollDownButton.tagName).toBe("ARTICLE");
    expect(scrollDownButton.getAttribute("aria-hidden")).toBe("true");
    expect(scrollDownButton.classList.contains("custom-class")).toBe(true);
    expect((scrollDownButton as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(scrollDownButton);

    fireEvent.click(scrollDownButton);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Select.Separator", () => {
  afterEach(cleanupModal);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root defaultOpen defaultValue="apple">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport>
              <Select.Item value="apple">
                <Select.ItemText>Apple</Select.ItemText>
              </Select.Item>
              <Select.Separator
                ref={(node) => void (element = node)}
                data-testid="separator"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              />
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));

    const separator = screen.getByTestId("separator");
    expect(separator.classList.contains("custom-class")).toBe(true);
    expect((separator as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(separator);

    fireEvent.click(separator);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", () => {
    let element: HTMLDivElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root defaultOpen defaultValue="apple">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport>
              <Select.Item value="apple">
                <Select.ItemText>Apple</Select.ItemText>
              </Select.Item>
              <Select.Separator
                asChild
                ref={(node) => void (element = node)}
                data-testid="separator"
                class="custom-class"
                style={{ "outline-color": "rgb(1, 2, 3)" }}
                onClick={onClick}
              >
                <article />
              </Select.Separator>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));

    const separator = screen.getByTestId("separator");
    expect(separator.tagName).toBe("ARTICLE");
    expect(separator.getAttribute("aria-hidden")).toBe("true");
    expect(separator.classList.contains("custom-class")).toBe(true);
    expect((separator as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(separator);

    fireEvent.click(separator);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Select.Arrow", () => {
  afterEach(cleanupModal);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: SVGSVGElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root defaultOpen defaultValue="apple">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          {/* The arrow only renders for `position="popper"`. */}
          <Select.Content position="popper">
            <Select.Viewport>
              <Select.Item value="apple">
                <Select.ItemText>Apple</Select.ItemText>
              </Select.Item>
            </Select.Viewport>
            <Select.Arrow
              ref={(node) => void (element = node)}
              data-testid="arrow"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            />
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));

    const arrow = screen.getByTestId("arrow");
    expect(arrow.classList.contains("custom-class")).toBe(true);
    expect((arrow as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(arrow);

    fireEvent.click(arrow);
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards props to the child element when `asChild` is set", () => {
    let element: SVGSVGElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root defaultOpen defaultValue="apple">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content position="popper">
            <Select.Viewport>
              <Select.Item value="apple">
                <Select.ItemText>Apple</Select.ItemText>
              </Select.Item>
            </Select.Viewport>
            <Select.Arrow
              asChild
              ref={(node) => void (element = node)}
              data-testid="arrow"
              class="custom-class"
              style={{ "outline-color": "rgb(1, 2, 3)" }}
              onClick={onClick}
            >
              <svg />
            </Select.Arrow>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));

    const arrow = screen.getByTestId("arrow");
    // SVG tag names keep their authored case.
    expect(arrow.tagName).toBe("svg");
    expect(arrow.getAttribute("viewBox")).toBe("0 0 30 10");
    expect(arrow.classList.contains("custom-class")).toBe(true);
    expect((arrow as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(arrow);

    fireEvent.click(arrow);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Select.unstable_BubbleInput", () => {
  afterEach(cleanupModal);

  it("spreads props it does not consume onto the element it renders", () => {
    let element: HTMLSelectElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.unstable_Provider>
        <Select.unstable_BubbleInput
          ref={(node) => void (element = node)}
          data-testid="bubble-input"
          class="custom-class"
          style={{ "outline-color": "rgb(1, 2, 3)" }}
          onClick={onClick}
        />
      </Select.unstable_Provider>
    ));

    const bubbleInput = screen.getByTestId("bubble-input");
    expect(bubbleInput.getAttribute("aria-hidden")).toBe("true");
    expect(bubbleInput.getAttribute("tabindex")).toBe("-1");
    expect(bubbleInput.classList.contains("custom-class")).toBe(true);
    expect((bubbleInput as HTMLElement).style.outlineColor).toBe("rgb(1, 2, 3)");
    expect(element).toBe(bubbleInput);

    fireEvent.click(bubbleInput);
    expect(onClick).toHaveBeenCalled();
  });

  // TODO: Fix this
  it.todo("forwards props to the child element when `asChild` is set");
});

describe("Select.Value", () => {
  afterEach(cleanupModal);

  it("spreads unknown props and the ref onto the element it renders", () => {
    let element: HTMLSpanElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root>
        <Select.Trigger>
          <Select.Value
            ref={(node) => void (element = node)}
            data-testid="value"
            onClick={onClick}
            placeholder="Pick one"
          />
        </Select.Trigger>
      </Select.Root>
    ));

    const value = screen.getByTestId("value");
    expect(element).toBe(value);

    fireEvent.click(value);
    expect(onClick).toHaveBeenCalled();
  });

  // TODO: Fix this
  it.todo("applies the consumer's `class` and `style`");

  // TODO: Fix this
  it.todo("forwards props to the child element when `asChild` is set");
});

describe("Select.ItemText", () => {
  afterEach(cleanupModal);

  it("spreads unknown props and the ref onto the element it renders", () => {
    let element: HTMLSpanElement | null = null;
    const onClick = vi.fn();

    render(() => (
      <Select.Root defaultOpen defaultValue="banana">
        <Select.Trigger>
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content position="item-aligned">
            <Select.Viewport>
              <Select.Item value="apple">
                <Select.ItemText
                  ref={(node) => void (element = node)}
                  data-testid="item-text"
                  onClick={onClick}
                >
                  Apple
                </Select.ItemText>
              </Select.Item>
              <Select.Item value="banana">
                <Select.ItemText>Banana</Select.ItemText>
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    ));

    const itemText = screen.getByTestId("item-text");
    expect(element).toBe(itemText);

    fireEvent.click(itemText);
    expect(onClick).toHaveBeenCalled();
  });

  // TODO: Fix this
  it.todo("applies the consumer's `class` and `style`");
});

// Regression tests for https://github.com/radix-ui/primitives/issues/4102
describe("bubble input change events", () => {
  afterEach(cleanupModal);

  it("does not bubble a programmatic value change to ancestor `onChange` listeners", async () => {
    const onFormChange = vi.fn();
    const onAncestorChange = vi.fn();

    function ControlledSelect() {
      const [value, setValue] = createSignal("apple");
      return (
        <form onChange={onFormChange}>
          <div onChange={onAncestorChange}>
            <SelectTest name="fruit" value={value()} onValueChange={setValue} />
          </div>
          <button type="button" onClick={() => setValue("banana")}>
            Set programmatically
          </button>
        </form>
      );
    }

    const { container } = render(() => <ControlledSelect />);
    await vi.waitFor(() => {
      expect((container.querySelector("select") as HTMLSelectElement).value).toBe("apple");
    });
    onFormChange.mockClear();
    onAncestorChange.mockClear();

    flush(() => fireEvent.click(screen.getByRole("button", { name: "Set programmatically" })));

    expect(onFormChange).not.toHaveBeenCalled();
    expect(onAncestorChange).not.toHaveBeenCalled();
    expect((container.querySelector("select") as HTMLSelectElement).value).toBe("banana");
    expect(new FormData(container.querySelector("form")!).get("fruit")).toBe("banana");
  });

  it("bubbles a user-driven value change to ancestor `onChange` listeners", async () => {
    const onFormChange = vi.fn();
    const onAncestorChange = vi.fn();

    const { container } = render(() => (
      <form onChange={onFormChange}>
        <div onChange={onAncestorChange}>
          <SelectTest name="fruit" defaultValue="apple" defaultOpen />
        </div>
      </form>
    ));

    const listbox = await vi.waitFor(() => screen.getByRole("listbox", { hidden: true }));
    onFormChange.mockClear();
    onAncestorChange.mockClear();

    flush(() => fireEvent.click(within(listbox).getByRole("option", { name: "Banana" })));

    expect(onAncestorChange).toHaveBeenCalled();
    expect(onFormChange).toHaveBeenCalled();
    expect((container.querySelector("select") as HTMLSelectElement).value).toBe("banana");
  });

  it("bubbles a typeahead value change to the parent form", async () => {
    const onFormChange = vi.fn();

    render(() => (
      <form onChange={onFormChange}>
        <SelectTest name="fruit" defaultValue="apple" />
      </form>
    ));

    const trigger = screen.getByRole("combobox");
    await vi.waitFor(() => {
      expect((document.querySelector("select") as HTMLSelectElement).value).toBe("apple");
    });
    onFormChange.mockClear();

    flush(() => fireEvent.keyDown(trigger, { key: "b" }));

    expect(trigger.textContent).toContain("Banana");
    expect(onFormChange).toHaveBeenCalled();
  });

  it("does not bubble a user-driven value change when the consumer stopped propagation", async () => {
    const onFormChange = vi.fn();

    render(() => (
      <form onChange={onFormChange}>
        <Select.Root defaultValue="apple" defaultOpen>
          <Select.Trigger aria-label="Choice">
            <Select.Value placeholder={PLACEHOLDER_TEXT} />
          </Select.Trigger>
          <Select.Portal>
            <Select.Content position="popper">
              <Select.Viewport>
                <Select.Item value="apple">
                  <Select.ItemText>Apple</Select.ItemText>
                </Select.Item>
                <Select.Item
                  value="banana"
                  onClick={(event) => event.stopPropagation()}
                  onPointerUp={(event) => event.stopPropagation()}
                >
                  <Select.ItemText>Banana</Select.ItemText>
                </Select.Item>
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </form>
    ));

    const listbox = await vi.waitFor(() => screen.getByRole("listbox", { hidden: true }));
    onFormChange.mockClear();

    flush(() => fireEvent.click(within(listbox).getByRole("option", { name: "Banana" })));

    expect(screen.getByRole("combobox", { name: "Choice" }).textContent).toContain("Banana");
    expect(onFormChange).not.toHaveBeenCalled();
  });

  it("does not bubble a programmatic update after a selection that did not change the value", async () => {
    const onFormChange = vi.fn();

    function LockedSelect() {
      const [value, setValue] = createSignal("apple");
      return (
        <form onChange={onFormChange}>
          <SelectTest name="fruit" value={value()} onValueChange={() => {}} defaultOpen />
          <button type="button" onClick={() => setValue("banana")}>
            Apply programmatically
          </button>
        </form>
      );
    }

    render(() => <LockedSelect />);
    const listbox = await vi.waitFor(() => screen.getByRole("listbox", { hidden: true }));
    flush(() => fireEvent.click(within(listbox).getByRole("option", { name: "Banana" })));
    expect(screen.getByRole("combobox", { name: "Choice" }).textContent).toContain("Apple");
    onFormChange.mockClear();

    flush(() => fireEvent.click(screen.getByRole("button", { name: "Apply programmatically" })));

    expect(onFormChange).not.toHaveBeenCalled();
    expect((document.querySelector("select") as HTMLSelectElement).value).toBe("banana");
  });

  it("bubbles a user-driven value change once when the controlled parent applies it after a timeout", async () => {
    const onFormChange = vi.fn();

    function DelayedSelect() {
      const [value, setValue] = createSignal("apple");
      return (
        <form
          onChange={(event) => onFormChange((event.target as unknown as HTMLSelectElement).value)}
        >
          <SelectTest
            name="fruit"
            value={value()}
            onValueChange={(nextValue) => {
              setTimeout(() => setValue(nextValue));
            }}
            defaultOpen
          />
        </form>
      );
    }

    render(() => <DelayedSelect />);
    const listbox = await vi.waitFor(() => screen.getByRole("listbox", { hidden: true }));
    onFormChange.mockClear();

    flush(() => fireEvent.click(within(listbox).getByRole("option", { name: "Banana" })));
    await new Promise((resolve) => setTimeout(resolve, 0));
    flush();

    expect(screen.getByRole("combobox", { name: "Choice" }).textContent).toContain("Banana");
    expect(onFormChange).toHaveBeenCalledTimes(1);
    expect(onFormChange).toHaveBeenCalledWith("banana");
    expect(new FormData(document.querySelector("form")!).get("fruit")).toBe("banana");
  });

  // Radix applies the value in a React transition; Solid 2 has no transition
  // API, so the async-apply shape is covered with a microtask instead.
  it("bubbles a user-driven value change once when the controlled parent applies it in a microtask", async () => {
    const onFormChange = vi.fn();

    function MicrotaskSelect() {
      const [value, setValue] = createSignal("apple");
      return (
        <form
          onChange={(event) => onFormChange((event.target as unknown as HTMLSelectElement).value)}
        >
          <SelectTest
            name="fruit"
            value={value()}
            onValueChange={(nextValue) => {
              queueMicrotask(() => setValue(nextValue));
            }}
            defaultOpen
          />
        </form>
      );
    }

    render(() => <MicrotaskSelect />);
    const listbox = await vi.waitFor(() => screen.getByRole("listbox", { hidden: true }));
    onFormChange.mockClear();

    flush(() => fireEvent.click(within(listbox).getByRole("option", { name: "Banana" })));
    await vi.waitFor(() => {
      expect(screen.getByRole("combobox", { name: "Choice" }).textContent).toContain("Banana");
    });
    flush();

    expect(onFormChange).toHaveBeenCalledTimes(1);
    expect(onFormChange).toHaveBeenCalledWith("banana");
    expect(new FormData(document.querySelector("form")!).get("fruit")).toBe("banana");
  });

  it("bubbles the value a controlled parent applies in place of the user-selected one", async () => {
    const onFormChange = vi.fn();

    function CoercingSelect() {
      const [value, setValue] = createSignal("apple");
      return (
        <form
          onChange={(event) => onFormChange((event.target as unknown as HTMLSelectElement).value)}
        >
          <Select.Root
            name="fruit"
            value={value()}
            onValueChange={(nextValue) => setValue(nextValue === "banana" ? "cherry" : nextValue)}
            defaultOpen
          >
            <Select.Trigger aria-label="Choice">
              <Select.Value placeholder={PLACEHOLDER_TEXT} />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content position="popper">
                <Select.Viewport>
                  <Select.Item value="apple">
                    <Select.ItemText>Apple</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="banana">
                    <Select.ItemText>Banana</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="cherry">
                    <Select.ItemText>Cherry</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </form>
      );
    }

    render(() => <CoercingSelect />);
    const listbox = await vi.waitFor(() => screen.getByRole("listbox", { hidden: true }));
    onFormChange.mockClear();

    flush(() => fireEvent.click(within(listbox).getByRole("option", { name: "Banana" })));

    expect(screen.getByRole("combobox", { name: "Choice" }).textContent).toContain("Cherry");
    expect(onFormChange).toHaveBeenCalledTimes(1);
    expect(onFormChange).toHaveBeenCalledWith("cherry");
    expect(new FormData(document.querySelector("form")!).get("fruit")).toBe("cherry");
  });

  it("bubbles a user-driven value change that the controlled parent ignores, without applying it", async () => {
    const onFormChange = vi.fn();
    const onValueChange = vi.fn();

    render(() => (
      <form
        onChange={(event) => onFormChange((event.target as unknown as HTMLSelectElement).value)}
      >
        <SelectTest name="fruit" value="apple" onValueChange={onValueChange} defaultOpen />
      </form>
    ));
    const listbox = await vi.waitFor(() => screen.getByRole("listbox", { hidden: true }));
    onFormChange.mockClear();

    flush(() => fireEvent.click(within(listbox).getByRole("option", { name: "Banana" })));

    expect(onFormChange).toHaveBeenCalledTimes(1);
    expect(onFormChange).toHaveBeenCalledWith("banana");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("combobox", { name: "Choice" }).textContent).toContain("Apple");
    expect(new FormData(document.querySelector("form")!).get("fruit")).toBe("apple");
  });

  it("does not bubble a user-driven value change when the consumer stopped propagation and the controlled parent applies it later", async () => {
    const onFormChange = vi.fn();

    function DelayedSelect() {
      const [value, setValue] = createSignal("apple");
      return (
        <form onChange={onFormChange}>
          <Select.Root
            name="fruit"
            value={value()}
            onValueChange={(nextValue) => {
              setTimeout(() => setValue(nextValue));
            }}
            defaultOpen
          >
            <Select.Trigger aria-label="Choice">
              <Select.Value placeholder={PLACEHOLDER_TEXT} />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content position="popper">
                <Select.Viewport>
                  <Select.Item value="apple">
                    <Select.ItemText>Apple</Select.ItemText>
                  </Select.Item>
                  <Select.Item
                    value="banana"
                    onClick={(event) => event.stopPropagation()}
                    onPointerUp={(event) => event.stopPropagation()}
                  >
                    <Select.ItemText>Banana</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </form>
      );
    }

    render(() => <DelayedSelect />);
    const listbox = await vi.waitFor(() => screen.getByRole("listbox", { hidden: true }));
    onFormChange.mockClear();

    flush(() => fireEvent.click(within(listbox).getByRole("option", { name: "Banana" })));
    await new Promise((resolve) => setTimeout(resolve, 0));
    flush();

    expect(screen.getByRole("combobox", { name: "Choice" }).textContent).toContain("Banana");
    expect(onFormChange).not.toHaveBeenCalled();
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

function cleanupModal() {
  cleanup();
  // Open content is a modal layer, which sets this on the `body` and only
  // restores it on close.
  document.body.style.pointerEvents = "";
}
