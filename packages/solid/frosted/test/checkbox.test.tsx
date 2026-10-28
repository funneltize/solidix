// Solidix-authored behavior tests for the frosted Checkbox port. No upstream
// test suite exists at the pinned commit, so these assert the render contract
// observed in upstream `checkbox.tsx` (root class, button class, indicator,
// icons, data attributes) plus the controlled/uncontrolled contract from
// `@solidix/use-controllable-state`. Rendered bare like the other frosted
// tests - `Theme` needs `window.matchMedia`, which jsdom does not provide.
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "../src/index.js";

describe("Checkbox", () => {
  it("renders a root label with the fui classes and a checkbox button", async () => {
    render(() => <Checkbox>Remember me</Checkbox>);
    const box = await screen.findByRole("checkbox");
    expect(box.classList.contains("fui-reset")).toBe(true);
    expect(box.classList.contains("fui-CheckboxButton")).toBe(true);
    // Upstream `color` has no default (`checkboxPropDefs.color.default` is
    // undefined), so `data-accent-color` is absent until set; `Theme` provides
    // the ambient accent instead.
    expect(box.hasAttribute("data-accent-color")).toBe(false);
    // Upstream renders `label` when children are present
    // (`const Comp = children ? 'label' : 'span'`, checkbox.tsx:86).
    const root = box.parentElement;
    expect(root?.tagName).toBe("LABEL");
    expect(root?.classList.contains("fui-CheckboxRoot")).toBe(true);
    expect(root?.classList.contains("fui-r-size-2")).toBe(true);
    expect(root?.textContent).toContain("Remember me");
  });

  it("renders a bare span root when no label children are given", async () => {
    render(() => <Checkbox aria-label="bare" />);
    const box = await screen.findByRole("checkbox");
    expect(box.parentElement?.tagName).toBe("SPAN");
    expect(box.parentElement?.classList.contains("fui-CheckboxRoot")).toBe(true);
  });

  it("toggles uncontrolled state on click and defaults unchecked", async () => {
    render(() => <Checkbox>Toggle me</Checkbox>);
    const box = (await screen.findByRole("checkbox")) as HTMLButtonElement;
    expect(box.getAttribute("aria-checked")).toBe("false");
    expect(box.getAttribute("data-state")).toBe("unchecked");
    fireEvent.click(box);
    await flush();
    expect(box.getAttribute("aria-checked")).toBe("true");
    expect(box.getAttribute("data-state")).toBe("checked");
  });

  it("respects a controlled checked value", async () => {
    const [checked, setChecked] = createSignal(false);
    render(() => (
      <Checkbox checked={checked()} onCheckedChange={setChecked}>
        Controlled
      </Checkbox>
    ));
    const box = (await screen.findByRole("checkbox")) as HTMLButtonElement;
    fireEvent.click(box);
    await flush();
    expect(checked()).toBe(true);
    expect(box.getAttribute("aria-checked")).toBe("true");
  });

  it("supports the indeterminate state with its icon and data attribute", async () => {
    render(() => <Checkbox checked="indeterminate">Tri-state</Checkbox>);
    const box = await screen.findByRole("checkbox");
    expect(box.getAttribute("aria-checked")).toBe("mixed");
    expect(box.hasAttribute("data-indeterminate")).toBe(true);
    // Upstream nests the svg inside `Indicator.fui-CheckboxIndicator`; the svg
    // itself carries `fui-CheckboxIndicatorIcon` (checkbox.tsx:100-113).
    const indicator = box.querySelector("span");
    expect(indicator?.classList.contains("fui-CheckboxIndicator")).toBe(true);
    const svg = indicator?.querySelector("svg");
    expect(svg?.classList.contains("fui-CheckboxIndicatorIcon")).toBe(true);
    // Size 2 indeterminate artwork, verbatim from upstream checkbox.tsx:60-64.
    expect(svg?.querySelector("path")?.getAttribute("d")).toBe("M6 10H14");
  });

  it("renders the checkmark icon when checked by default", async () => {
    render(() => <Checkbox defaultChecked>Checked</Checkbox>);
    const box = await screen.findByRole("checkbox");
    const indicator = box.querySelector("span");
    expect(indicator?.classList.contains("fui-CheckboxIndicator")).toBe(true);
    const svg = indicator?.querySelector("svg");
    expect(svg?.classList.contains("fui-CheckboxIndicatorIcon")).toBe(true);
    // Size 2 checkmark artwork, verbatim from upstream checkbox.tsx:30-34.
    expect(svg?.querySelector("path")?.getAttribute("d")).toBe("M5 11L8 14L15 7");
  });

  it("forwards size, color, and highContrast to data attributes and classes", async () => {
    render(() => (
      <Checkbox size="3" color="ruby" highContrast>
        Styled
      </Checkbox>
    ));
    const box = await screen.findByRole("checkbox");
    expect(box.parentElement?.classList.contains("fui-r-size-3")).toBe(true);
    expect(box.getAttribute("data-accent-color")).toBe("ruby");
    // Upstream renders `highContrast` as the `fui-high-contrast` class on the
    // button (checkbox.tsx:95-97), not a data attribute on the root.
    expect(box.classList.contains("fui-high-contrast")).toBe(true);
  });

  it("disables the button when disabled", async () => {
    render(() => <Checkbox disabled>Disabled</Checkbox>);
    const box = (await screen.findByRole("checkbox")) as HTMLButtonElement;
    expect(box.disabled).toBe(true);
    expect(box.hasAttribute("data-disabled")).toBe(true);
  });

  it("calls onCheckedChange with the next value", async () => {
    const onCheckedChange = vi.fn();
    render(() => <Checkbox onCheckedChange={onCheckedChange}>Notify</Checkbox>);
    const box = await screen.findByRole("checkbox");
    fireEvent.click(box);
    await flush();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("renders an indicator hidden span for screen readers when checked", async () => {
    render(() => <Checkbox defaultChecked>Label text</Checkbox>);
    const box = await screen.findByRole("checkbox");
    const indicator = box.querySelector("span");
    expect(indicator?.getAttribute("data-state")).toBe("checked");
    expect(indicator?.textContent).toBe("");
  });
});
