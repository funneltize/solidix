// Solidix-authored (no upstream tests exist): IconButton is a thin BaseButton
// wrapper that adds fui-IconButton and forwards all props. See /tmp/fui/icon-button.tsx.
import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { IconButton } from "../src/components/icon-button/icon-button";
import { iconButtonPropDefs } from "../src/components/icon-button/icon-button.props";
import { baseButtonPropDefs } from "../src/components/base-button/base-button.props";

describe("IconButton", () => {
  it("renders a button with fui-IconButton classes", async () => {
    const { findByRole } = render(() => (
      <IconButton aria-label="Close">
        <span>x</span>
      </IconButton>
    ));
    const button = await findByRole("button");
    expect(button.classList.contains("fui-IconButton")).toBe(true);
    expect(button.classList.contains("fui-BaseButton")).toBe(true);
  });

  it("forwards size, variant, loading to BaseButton", async () => {
    const { findByRole } = render(() => (
      <IconButton aria-label="Refresh" size="1" variant="ghost" loading>
        <span>r</span>
      </IconButton>
    ));
    const button = await findByRole("button");
    expect(button.classList.contains("fui-r-size-1")).toBe(true);
    expect(button.classList.contains("fui-variant-ghost")).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("merges a consumer class with fui-IconButton", async () => {
    const { findByRole } = render(() => (
      <IconButton aria-label="More" class="mine">
        <span>m</span>
      </IconButton>
    ));
    const button = await findByRole("button");
    expect(button.classList.contains("fui-IconButton")).toBe(true);
    expect(button.classList.contains("mine")).toBe(true);
  });

  it("re-exports baseButtonPropDefs as iconButtonPropDefs", () => {
    expect(iconButtonPropDefs).toBe(baseButtonPropDefs);
  });
});
