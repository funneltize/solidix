import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { flush } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  BaseButton,
  baseButtonPropDefs,
  type BaseButtonRenderProps,
  type BaseButtonRenderState,
} from "../src/index";

describe("BaseButton", () => {
  it("renders a button with default size and variant classes", async () => {
    render(() => <BaseButton>Save</BaseButton>);
    const el = await screen.findByRole("button", { name: "Save" });
    expect(el.tagName).toBe("BUTTON");
    expect(el.classList.contains("fui-BaseButton")).toBe(true);
    // Defaults from baseButtonPropDefs: size "2", variant "surface".
    expect(el.classList.contains("fui-r-size-2")).toBe(true);
    expect(el.classList.contains("fui-variant-surface")).toBe(true);
    expect(el.hasAttribute("disabled")).toBe(false);
  });

  it("applies size, variant, color, and high-contrast", async () => {
    render(() => (
      <BaseButton size="4" variant="solid" color="red" highContrast>
        Danger
      </BaseButton>
    ));
    const el = await screen.findByRole("button", { name: "Danger" });
    expect(el.classList.contains("fui-r-size-4")).toBe(true);
    expect(el.classList.contains("fui-variant-solid")).toBe(true);
    expect(el.classList.contains("fui-high-contrast")).toBe(true);
    expect(el.getAttribute("data-accent-color")).toBe("red");
  });

  it("merges the consumer class with the Frosted classes", async () => {
    render(() => <BaseButton class="custom">Merged</BaseButton>);
    const el = await screen.findByRole("button", { name: "Merged" });
    expect(el.classList.contains("fui-BaseButton")).toBe(true);
    expect(el.classList.contains("custom")).toBe(true);
  });

  it("disables the button when loading, hides content, and shows a spinner", async () => {
    const { container } = render(() => <BaseButton loading>Saving</BaseButton>);
    const el = await screen.findByRole("button");
    expect(el.hasAttribute("disabled")).toBe(true);
    expect(el.getAttribute("data-disabled")).toBe("");
    expect(el.getAttribute("aria-busy")).toBe("true");
    // Upstream renders the visible copy hidden plus a VisuallyHidden copy for
    // screen readers, with an absolutely positioned Spinner on top.
    // Solid serializes the style object without spaces (`display:contents`).
    const hidden = container.querySelector('[style*="display:contents"]');
    expect(hidden).not.toBeNull();
    expect(hidden?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector(".fui-Spinner")).not.toBeNull();
    expect(el.textContent).toContain("Saving");
  });

  it("supports an explicit disabled independent of loading", async () => {
    render(() => <BaseButton disabled>Blocked</BaseButton>);
    const el = await screen.findByRole("button", { name: "Blocked" });
    expect(el.hasAttribute("disabled")).toBe(true);
    expect(el.getAttribute("aria-busy")).toBeNull();
  });

  it("slots props onto an element render child", async () => {
    render(() => (
      <BaseButton render={<a href="https://example.com">Go</a>} variant="ghost">
        Ignored
      </BaseButton>
    ));
    const el = await screen.findByRole("link", { name: "Go" });
    expect(el.classList.contains("fui-BaseButton")).toBe(true);
    expect(el.classList.contains("fui-variant-ghost")).toBe(true);
    expect(el.textContent).toBe("Go");
  });

  it("passes merged props and button state to a function render child", async () => {
    // Mirrors Base UI `useRender`, which upstream delegates to: the function
    // receives the merged element props plus the button state (`disabled`).
    // `loading` itself is consumed (spinner + `aria-busy`), not forwarded.
    const renderFn = vi.fn(
      (props: BaseButtonRenderProps, _state: BaseButtonRenderState): JSX.Element => (
        <span data-testid="rendered" class={props.class} />
      ),
    );
    render(() => (
      <BaseButton render={renderFn} loading>
        Hidden
      </BaseButton>
    ));
    const el = await screen.findByTestId("rendered");
    expect(el.classList.contains("fui-BaseButton")).toBe(true);
    expect(renderFn).toHaveBeenCalled();
    const passed = renderFn.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(passed["disabled"]).toBe(true);
    expect(passed["aria-busy"]).toBe("true");
    const state = renderFn.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(state["disabled"]).toBe(true);
  });

  it("forwards click handlers from rest props", async () => {
    const onClick = vi.fn();
    render(() => <BaseButton onClick={onClick}>Click</BaseButton>);
    const el = await screen.findByRole("button", { name: "Click" });
    fireEvent.click(el);
    flush();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("exposes baseButtonPropDefs with the upstream defaults", () => {
    expect(baseButtonPropDefs.size.default).toBe("2");
    expect(baseButtonPropDefs.variant.default).toBe("surface");
    expect(baseButtonPropDefs.color.default).toBeUndefined();
    expect(baseButtonPropDefs.highContrast.default).toBeUndefined();
  });
});
