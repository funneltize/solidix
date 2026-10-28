import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Code, codePropDefs } from "../src/index";

describe("Code", () => {
  it("renders a code element with the fui-Code class and soft default", async () => {
    render(() => <Code>const x = 1;</Code>);
    const el = await screen.findByText("const x = 1;");
    expect(el.tagName).toBe("CODE");
    expect(el.classList.contains("fui-Code")).toBe(true);
    expect(el.classList.contains("fui-variant-soft")).toBe(true);
    expect(el.getAttribute("data-accent-color")).toBeNull();
  });

  it("applies size, variant, weight, and high-contrast classes", async () => {
    render(() => (
      <Code size="3" variant="ghost" weight="bold" highContrast>
        Styled
      </Code>
    ));
    const el = await screen.findByText("Styled");
    expect(el.classList.contains("fui-r-size-3")).toBe(true);
    expect(el.classList.contains("fui-variant-ghost")).toBe(true);
    expect(el.classList.contains("fui-r-weight-bold")).toBe(true);
    expect(el.classList.contains("fui-high-contrast")).toBe(true);
  });

  it("sets data-accent-color from the color prop", async () => {
    render(() => <Code color="orange">Accent</Code>);
    const el = await screen.findByText("Accent");
    expect(el.getAttribute("data-accent-color")).toBe("orange");
  });

  it("merges the consumer class with fui-Code", async () => {
    render(() => <Code class="custom">Merged</Code>);
    const el = await screen.findByText("Merged");
    expect(el.classList.contains("fui-Code")).toBe(true);
    expect(el.classList.contains("custom")).toBe(true);
  });

  it("exposes codePropDefs with the documented defaults", () => {
    expect(codePropDefs.size.default).toBeUndefined();
    expect(codePropDefs.variant.default).toBe("soft");
  });
});
