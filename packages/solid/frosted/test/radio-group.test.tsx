// Solidix-authored behavior tests for the frosted RadioGroup port. No upstream
// test suite exists at the pinned commit, so these assert the render contract
// observed in upstream `radio-group.tsx` (root class, button class, indicator,
// `data-checked` / `data-unchecked` bridge attributes) plus the
// controlled/uncontrolled contract from `@solidix/use-controllable-state`.
// Rendered bare like the other frosted tests - `Theme` needs
// `window.matchMedia`, which jsdom does not provide.
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { RadioGroup } from "../src/index.js";

describe("RadioGroup", () => {
  it("renders a radiogroup root with the fui classes and radio items", async () => {
    render(() => (
      <RadioGroup.Root>
        <RadioGroup.Item value="one">One</RadioGroup.Item>
        <RadioGroup.Item value="two">Two</RadioGroup.Item>
      </RadioGroup.Root>
    ));
    const group = await screen.findByRole("radiogroup");
    expect(group.classList.contains("fui-RadioGroupRoot")).toBe(true);
    expect(group.classList.contains("fui-r-size-2")).toBe(true);
    const items = await screen.findAllByRole("radio");
    expect(items.length).toBe(2);
    expect(items[0]?.classList.contains("fui-reset")).toBe(true);
    expect(items[0]?.classList.contains("fui-RadioGroupButton")).toBe(true);
    expect(items[0]?.parentElement?.tagName).toBe("LABEL");
    expect(items[0]?.parentElement?.textContent).toContain("One");
  });

  it("renders a bare span item root when no label children are given", async () => {
    render(() => (
      <RadioGroup.Root>
        <RadioGroup.Item value="bare" aria-label="bare" />
      </RadioGroup.Root>
    ));
    const item = await screen.findByRole("radio");
    expect(item.parentElement?.tagName).toBe("SPAN");
  });

  it("selects an item on click in uncontrolled mode", async () => {
    render(() => (
      <RadioGroup.Root>
        <RadioGroup.Item value="one">One</RadioGroup.Item>
        <RadioGroup.Item value="two">Two</RadioGroup.Item>
      </RadioGroup.Root>
    ));
    const items = (await screen.findAllByRole("radio")) as HTMLButtonElement[];
    expect(items[0]?.getAttribute("aria-checked")).toBe("false");
    expect(items[0]?.hasAttribute("data-unchecked")).toBe(true);
    fireEvent.click(items[0]!);
    await flush();
    expect(items[0]?.getAttribute("aria-checked")).toBe("true");
    expect(items[0]?.hasAttribute("data-checked")).toBe(true);
    expect(items[1]?.getAttribute("aria-checked")).toBe("false");
  });

  it("respects a controlled value", async () => {
    const [value, setValue] = createSignal("one");
    render(() => (
      <RadioGroup.Root value={value()} onValueChange={setValue}>
        <RadioGroup.Item value="one">One</RadioGroup.Item>
        <RadioGroup.Item value="two">Two</RadioGroup.Item>
      </RadioGroup.Root>
    ));
    const items = (await screen.findAllByRole("radio")) as HTMLButtonElement[];
    fireEvent.click(items[1]!);
    await flush();
    expect(value()).toBe("two");
    expect(items[1]?.getAttribute("aria-checked")).toBe("true");
    expect(items[0]?.getAttribute("aria-checked")).toBe("false");
  });

  it("applies size, color, and highContrast on the root (item styling cascades via CSS)", async () => {
    render(() => (
      <RadioGroup.Root size="1" color="jade" highContrast>
        <RadioGroup.Item value="one">One</RadioGroup.Item>
      </RadioGroup.Root>
    ));
    const group = await screen.findByRole("radiogroup");
    expect(group.classList.contains("fui-RadioGroupRoot")).toBe(true);
    expect(group.classList.contains("fui-r-size-1")).toBe(true);
    expect(group.classList.contains("fui-high-contrast")).toBe(true);
    expect(group.getAttribute("data-accent-color")).toBe("jade");
    // Upstream renders the button with only reset + button classes; size and
    // accent cascade from the root through descendant selectors.
    const item = (await screen.findByRole("radio")) as HTMLButtonElement;
    expect(item.classList.contains("fui-RadioGroupButton")).toBe(true);
    expect(item.classList.contains("fui-r-size-1")).toBe(false);
    expect(item.parentElement?.classList.contains("fui-RadioGroupItem")).toBe(true);
  });
});
