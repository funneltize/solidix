import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Separator, separatorPropDefs } from "../src/index";

describe("Separator", () => {
  it("renders a separator with the fui-Separator class and size-1 default", async () => {
    const { container } = render(() => <Separator />);
    const el = container.firstElementChild!;
    expect(el.classList.contains("fui-Separator")).toBe(true);
    expect(el.classList.contains("fui-r-size-1")).toBe(true);
    expect(el.getAttribute("role")).toBe("separator");
    expect(el.getAttribute("data-accent-color")).toBe("gray");
  });

  it("applies size classes", async () => {
    const { container } = render(() => <Separator size="4" />);
    const el = container.firstElementChild!;
    expect(el.classList.contains("fui-r-size-4")).toBe(true);
  });

  it("merges the consumer class with fui-Separator", async () => {
    const { container } = render(() => <Separator class="custom" />);
    const el = container.firstElementChild!;
    expect(el.classList.contains("fui-Separator")).toBe(true);
    expect(el.classList.contains("custom")).toBe(true);
  });

  it("slots props onto an element render child", async () => {
    const { container } = render(() => (
      <Separator render={<hr data-testid="slotted" />} size="2" />
    ));
    const el = await screen.findByTestId("slotted");
    expect(el.tagName).toBe("HR");
    expect(el.classList.contains("fui-Separator")).toBe(true);
    expect(el.classList.contains("fui-r-size-2")).toBe(true);
    expect(container.firstElementChild).toBe(el);
  });

  it("passes props to a function render child", async () => {
    render(() => (
      <Separator
        render={(props) => (
          <div data-testid="rendered" class={props.class} role={props.role}>
            {props.children}
          </div>
        )}
      />
    ));
    const el = await screen.findByTestId("rendered");
    expect(el.classList.contains("fui-Separator")).toBe(true);
    expect(el.getAttribute("role")).toBe("separator");
  });

  it("exposes separatorPropDefs with the documented defaults", () => {
    expect(separatorPropDefs.size.default).toBe("1");
    expect(separatorPropDefs.color.default).toBe("gray");
  });
});
