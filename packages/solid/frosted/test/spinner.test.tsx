import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Spinner, spinnerPropDefs } from "../src/index";

describe("Spinner", () => {
  it("renders a span with the fui-Spinner class, size-2 default, and 8 leaves", async () => {
    const { container } = render(() => <Spinner data-testid="spinner" />);
    const el = await screen.findByTestId("spinner");
    expect(el.tagName).toBe("SPAN");
    expect(el.classList.contains("fui-Spinner")).toBe(true);
    expect(el.classList.contains("fui-r-size-2")).toBe(true);
    // Upstream carries no default aria-hidden; a consumer value passes through.
    expect(el.getAttribute("aria-hidden")).toBeNull();
    expect(el.querySelectorAll(".fui-SpinnerLeaf")).toHaveLength(8);
    expect(container.firstElementChild).toBe(el);
  });

  it("passes a consumer aria-hidden through to the bare spinner", async () => {
    render(() => <Spinner data-testid="hidden" aria-hidden="true" />);
    const el = await screen.findByTestId("hidden");
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });

  it("applies size classes", async () => {
    render(() => <Spinner data-testid="sized" size="3" />);
    const el = await screen.findByTestId("sized");
    expect(el.classList.contains("fui-r-size-3")).toBe(true);
  });

  it("renders children bare with no wrapper when loading is false", async () => {
    const { container } = render(() => (
      <Spinner loading={false}>
        <button type="button">Action</button>
      </Spinner>
    ));
    const button = await screen.findByRole("button", { name: "Action" });
    expect(button.parentElement).toBe(container);
    expect(container.querySelector(".fui-Spinner")).toBeNull();
  });

  it("overlays a spinner on dimmed, hidden children when loading with children", async () => {
    const { container } = render(() => (
      <Spinner loading>
        <button type="button">Action</button>
      </Spinner>
    ));
    // The button is aria-hidden, so find it by text rather than by role.
    const button = (await screen.findByText("Action")) as HTMLButtonElement;
    const hidden = button.parentElement!;
    expect(hidden.getAttribute("aria-hidden")).toBe("true");
    // `inert` may reflect as an attribute or an IDL property only.
    expect(
      hidden.hasAttribute("inert") || (hidden as unknown as { inert?: boolean }).inert === true,
    ).toBe(true);
    expect(hidden.style.opacity).toBe("0.5");
    const wrapper = hidden.parentElement!;
    expect(wrapper.parentElement).toBe(container);
    expect(wrapper.classList.contains("fui-Spinner")).toBe(false);
    expect(wrapper.style.position).toBe("relative");
    expect(wrapper.style.display).toBe("inline-flex");
    const overlay = wrapper.querySelector(".fui-Spinner") as HTMLElement | null;
    expect(overlay).not.toBeNull();
    expect(overlay!.querySelectorAll(".fui-SpinnerLeaf")).toHaveLength(8);
    expect(overlay!.style.position).toBe("absolute");
  });

  it("merges the consumer class with fui-Spinner", async () => {
    render(() => <Spinner data-testid="merged" class="custom" />);
    const el = await screen.findByTestId("merged");
    expect(el.classList.contains("fui-Spinner")).toBe(true);
    expect(el.classList.contains("custom")).toBe(true);
  });

  it("exposes spinnerPropDefs with the documented defaults", () => {
    expect(spinnerPropDefs.size.default).toBe("2");
    expect(spinnerPropDefs.loading.default).toBe(true);
  });
});
