// Solidix-authored behavior tests for the frosted RadioButtonGroup port. No
// upstream test suite exists at the pinned commit, so these assert the render
// contract observed in upstream `radio-button-group.tsx` (root class, button
// classes, `data-accent-color`, icon, overlay) plus the
// controlled/uncontrolled contract from `@solidix/use-controllable-state`.
// Rendered bare like the other frosted tests - `Theme` needs
// `window.matchMedia`, which jsdom does not provide.
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { RadioButtonGroup } from "../src/index.js";

describe("RadioButtonGroup", () => {
  it("renders a radiogroup root with the fui classes and radio buttons", async () => {
    render(() => (
      <RadioButtonGroup.Root>
        <RadioButtonGroup.Item value="one">
          <div class="fui-Card">One</div>
        </RadioButtonGroup.Item>
        <RadioButtonGroup.Item value="two">
          <div class="fui-Card">Two</div>
        </RadioButtonGroup.Item>
      </RadioButtonGroup.Root>
    ));
    const group = await screen.findByRole("radiogroup");
    expect(group.classList.contains("fui-RadioButtonGroupRoot")).toBe(true);
    // No explicit color, so the accent inherits from the surrounding Theme.
    expect(group.hasAttribute("data-accent-color")).toBe(false);
    const buttons = await screen.findAllByRole("radio");
    expect(buttons.length).toBe(2);
    expect(buttons[0]?.classList.contains("fui-reset")).toBe(true);
    expect(buttons[0]?.classList.contains("fui-RadioButtonGroupButton")).toBe(true);
    expect(buttons[0]?.classList.contains("fui-RadioButtonGroupItem")).toBe(true);
    expect(buttons[0]?.textContent).toContain("One");
  });

  it("selects an item on click in uncontrolled mode", async () => {
    render(() => (
      <RadioButtonGroup.Root>
        <RadioButtonGroup.Item value="one" aria-label="one" />
        <RadioButtonGroup.Item value="two" aria-label="two" />
      </RadioButtonGroup.Root>
    ));
    const buttons = await screen.findAllByRole("radio");
    expect(buttons[0]?.hasAttribute("data-unchecked")).toBe(true);
    fireEvent.click(buttons[0]!);
    await flush();
    await screen.findByRole("radio", { checked: true });
    expect(buttons[0]?.hasAttribute("data-checked")).toBe(true);
    expect(buttons[0]?.hasAttribute("data-unchecked")).toBe(false);
    expect(buttons[1]?.hasAttribute("data-unchecked")).toBe(true);
  });

  it("follows the controlled value and reports changes", async () => {
    const [value, setValue] = createSignal<string | null>("one");
    let reported: string | null = null;
    render(() => (
      <RadioButtonGroup.Root
        value={value() ?? undefined}
        onValueChange={(next) => {
          reported = next;
          setValue(next);
        }}
      >
        <RadioButtonGroup.Item value="one" aria-label="one" />
        <RadioButtonGroup.Item value="two" aria-label="two" />
      </RadioButtonGroup.Root>
    ));
    const buttons = await screen.findAllByRole("radio");
    expect(buttons[0]?.hasAttribute("data-checked")).toBe(true);
    fireEvent.click(buttons[1]!);
    await flush();
    await screen.findByRole("radio", { checked: true });
    expect(reported).toBe("two");
    expect(buttons[1]?.hasAttribute("data-checked")).toBe(true);
    expect(buttons[0]?.hasAttribute("data-unchecked")).toBe(true);
  });

  it("appends the overlay inside single-element children only", async () => {
    render(() => (
      <RadioButtonGroup.Root>
        <RadioButtonGroup.Item value="card">
          <div class="fui-Card">Card</div>
        </RadioButtonGroup.Item>
        <RadioButtonGroup.Item value="multi" aria-label="multi">
          <div>A</div>
          <div>B</div>
        </RadioButtonGroup.Item>
      </RadioButtonGroup.Root>
    ));
    const buttons = await screen.findAllByRole("radio");
    const overlay = buttons[0]?.querySelector(".fui-RadioButtonGroupOverlay");
    expect(overlay).not.toBeNull();
    expect(overlay?.getAttribute("aria-hidden")).toBe("true");
    expect(buttons[1]?.querySelector(".fui-RadioButtonGroupOverlay")).toBeNull();
  });

  it("renders the icon with accent color and contrast", async () => {
    render(() => (
      <RadioButtonGroup.Root color="ruby" highContrast>
        <RadioButtonGroup.Item value="one" aria-label="one">
          <RadioButtonGroup.Icon />
        </RadioButtonGroup.Item>
      </RadioButtonGroup.Root>
    ));
    const group = await screen.findByRole("radiogroup");
    expect(group.getAttribute("data-accent-color")).toBe("ruby");
    expect(group.classList.contains("fui-high-contrast")).toBe(true);
    const icon = group.querySelector(".fui-RadioButtonGroupIcon");
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute("data-accent-color")).toBe("ruby");
    expect(icon?.classList.contains("fui-high-contrast")).toBe(true);
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
  });
});
