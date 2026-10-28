// Solidix-authored behavior tests for the frosted Switch port. No upstream
// test suite exists at the pinned commit, so these assert the render contract
// observed in upstream `switch.tsx` (root span, button classes, thumb,
// data attributes) plus the controlled/uncontrolled contract from
// `@solidix/use-controllable-state`. Rendered bare like the other frosted
// tests - `Theme` needs `window.matchMedia`, which jsdom does not provide.
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "../src/index.js";

describe("Switch", () => {
  it("renders a root span with size class and a button with fui classes", async () => {
    render(() => <Switch aria-label="notifications" />);
    const button = await screen.findByRole("switch");
    expect(button.classList.contains("fui-reset")).toBe(true);
    expect(button.classList.contains("fui-SwitchButton")).toBe(true);
    // Upstream `color` has no default (`switchPropDefs.color.default` is
    // undefined), so `data-accent-color` is absent until set; `Theme`
    // provides the ambient accent instead.
    expect(button.hasAttribute("data-accent-color")).toBe(false);
    const thumb = button.querySelector(".fui-SwitchThumb");
    expect(thumb).not.toBeNull();
    const root = button.parentElement;
    expect(root?.tagName).toBe("SPAN");
    expect(root?.classList.contains("fui-SwitchRoot")).toBe(true);
    expect(root?.classList.contains("fui-r-size-2")).toBe(true);
  });

  it("applies size, color, and highContrast styling props", async () => {
    render(() => <Switch aria-label="styled" size="3" color="ruby" highContrast />);
    const button = await screen.findByRole("switch");
    expect(button.getAttribute("data-accent-color")).toBe("ruby");
    expect(button.classList.contains("fui-high-contrast")).toBe(true);
    expect(button.querySelector(".fui-SwitchThumb")?.classList.contains("fui-high-contrast")).toBe(
      true,
    );
    const root = button.parentElement;
    expect(root?.classList.contains("fui-r-size-3")).toBe(true);
    expect(root?.classList.contains("fui-high-contrast")).toBe(true);
  });

  it("toggles uncontrolled state on click and defaults unchecked", async () => {
    render(() => <Switch aria-label="toggle" />);
    const button = (await screen.findByRole("switch")) as HTMLButtonElement;
    expect(button.getAttribute("aria-checked")).toBe("false");
    expect(button.getAttribute("data-state")).toBe("unchecked");
    expect(button.hasAttribute("data-unchecked")).toBe(true);
    fireEvent.click(button);
    await flush();
    expect(button.getAttribute("aria-checked")).toBe("true");
    expect(button.getAttribute("data-state")).toBe("checked");
    expect(button.hasAttribute("data-checked")).toBe(true);
  });

  it("respects defaultChecked and reports changes via onCheckedChange", async () => {
    const onCheckedChange = vi.fn();
    render(() => <Switch aria-label="default" defaultChecked onCheckedChange={onCheckedChange} />);
    const button = (await screen.findByRole("switch")) as HTMLButtonElement;
    expect(button.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(button);
    await flush();
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it("follows a controlled checked prop", async () => {
    const [checked, setChecked] = createSignal(false);
    render(() => <Switch aria-label="controlled" checked={checked()} />);
    const button = (await screen.findByRole("switch")) as HTMLButtonElement;
    expect(button.getAttribute("aria-checked")).toBe("false");
    setChecked(true);
    await flush();
    expect(button.getAttribute("aria-checked")).toBe("true");
  });
});
