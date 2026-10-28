// No upstream test suite exists at the pinned commit; these are
// Solidix-authored tests asserting observed upstream structure:
// button.fui-SelectTrigger > (span.fui-SelectTriggerValue + icon),
// portalled div.fui-SelectContent > div.fui-SelectViewport > options,
// and div.fui-SelectItem > (indicator + item text).
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { Select } from "../src/components/select/select";

// `Select.Content` mounts a `Theme` for its tokens; `Theme` reads
// `window.matchMedia`, which jsdom does not provide.
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: () => {},
    matches: false,
    removeEventListener: () => {},
  }));
});

function SelectFixture(props: { open?: boolean; size?: "1" | "2" | "3" }) {
  return (
    <Select.Root open={props.open} size={props.size}>
      <Select.Trigger data-testid="trigger" placeholder="Pick one" />
      <Select.Content data-testid="content">
        <Select.Group>
          <Select.GroupLabel data-testid="label">Fruits</Select.GroupLabel>
          <Select.Item data-testid="item-apple" value="apple">
            Apple
          </Select.Item>
          <Select.Item data-testid="item-banana" value="banana">
            Banana
          </Select.Item>
        </Select.Group>
        <Select.Separator data-testid="separator" />
      </Select.Content>
    </Select.Root>
  );
}

describe("Select", () => {
  test("trigger carries Frosted classes, value span, and chevron", () => {
    const { getByTestId } = render(() => <SelectFixture />);
    const trigger = getByTestId("trigger");
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.classList.contains("fui-SelectTrigger")).toBe(true);
    expect(trigger.classList.contains("fui-r-size-2")).toBe(true);
    expect(trigger.classList.contains("fui-variant-surface")).toBe(true);
    expect(trigger.getAttribute("data-accent-color")).toBe("gray");
    expect(trigger.querySelector(".fui-SelectTriggerValue")).not.toBeNull();
    expect(trigger.querySelector(".fui-SelectIcon")).not.toBeNull();
  });

  test("placeholder shows when no option is selected", () => {
    const { getByTestId } = render(() => <SelectFixture />);
    const value = getByTestId("trigger").querySelector(".fui-SelectTriggerValue") as HTMLElement;
    expect(value.textContent).toBe("Pick one");
  });

  test("root size flows to the trigger", () => {
    const { getByTestId } = render(() => <SelectFixture size="3" />);
    expect(getByTestId("trigger").classList.contains("fui-r-size-3")).toBe(true);
  });

  test("opens portalled content with items, label, and separator", async () => {
    // Controlled open, matching the primitive's own tests. Content is
    // portalled to `document.body`, so query via `screen`, not the render
    // container.
    render(() => <SelectFixture open />);
    const content = await screen.findByTestId("content");
    expect(content.classList.contains("fui-SelectContent")).toBe(true);
    expect(content.parentElement?.ownerDocument.body.contains(content)).toBe(true);
    expect(content.querySelector(".fui-SelectViewport")).not.toBeNull();
    expect(content.querySelector(".fui-SelectGroup")).not.toBeNull();
    expect(content.querySelector(".fui-SelectLabel")?.textContent).toBe("Fruits");
    expect(content.querySelector(".fui-SelectSeparator")).not.toBeNull();
    const apple = content.querySelector('[data-testid="item-apple"]') as HTMLElement;
    expect(apple.classList.contains("fui-SelectItem")).toBe(true);
    // Indicator mounts only on the selected item (Base UI parity).
    expect(apple.querySelector(".fui-SelectItemIndicator")).toBeNull();
  });

  test("selecting an item shows its label in the trigger", async () => {
    // Controlled open, matching the primitive's own tests. Content is
    // portalled to `document.body`, so query via `screen`, not the render
    // container.
    render(() => <SelectFixture open />);
    const content = await screen.findByTestId("content");
    const banana = content.querySelector('[data-testid="item-banana"]') as HTMLElement;
    fireEvent.click(banana);
    flush();
    const trigger = screen.getByTestId("trigger");
    const value = trigger.querySelector(".fui-SelectTriggerValue") as HTMLElement;
    expect(value.textContent).toBe("Banana");
  });

  test("selected item mounts the indicator with the check glyph", async () => {
    render(() => <SelectFixture open />);
    const content = await screen.findByTestId("content");
    const banana = content.querySelector('[data-testid="item-banana"]') as HTMLElement;
    fireEvent.click(banana);
    flush();
    const indicator = content.querySelector(
      '[data-testid="item-banana"] .fui-SelectItemIndicator',
    ) as HTMLElement;
    expect(indicator).not.toBeNull();
    expect(indicator.getAttribute("aria-hidden")).toBe("true");
    expect(indicator.querySelector(".fui-SelectItemIndicatorIcon")).not.toBeNull();
  });
});
