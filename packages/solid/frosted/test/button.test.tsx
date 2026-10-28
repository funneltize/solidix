// Solidix-authored (no upstream tests exist): Button is a thin BaseButton wrapper
// that adds fui-Button and forwards all props verbatim. See /tmp/fui/button.tsx.
import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { Button } from "../src/components/button/button";
import { buttonPropDefs } from "../src/components/button/button.props";
import { baseButtonPropDefs } from "../src/components/base-button/base-button.props";

describe("Button", () => {
  it("renders a button with fui-Button classes", async () => {
    const { findByRole } = render(() => <Button>Click me</Button>);
    const button = await findByRole("button");
    expect(button.classList.contains("fui-Button")).toBe(true);
    expect(button.classList.contains("fui-BaseButton")).toBe(true);
  });

  it("forwards size, variant, color, loading, disabled to BaseButton", async () => {
    const { findByRole } = render(() => (
      <Button size="3" variant="soft" color="red" loading disabled>
        Save
      </Button>
    ));
    const button = await findByRole("button");
    expect(button.classList.contains("fui-r-size-3")).toBe(true);
    expect(button.classList.contains("fui-variant-soft")).toBe(true);
    expect(button.getAttribute("data-accent-color")).toBe("red");
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("merges a consumer class with fui-Button", async () => {
    const { findByRole } = render(() => <Button class="mine">Hi</Button>);
    const button = await findByRole("button");
    expect(button.classList.contains("fui-Button")).toBe(true);
    expect(button.classList.contains("mine")).toBe(true);
  });

  it("re-exports baseButtonPropDefs as buttonPropDefs", () => {
    expect(buttonPropDefs).toBe(baseButtonPropDefs);
  });
});
