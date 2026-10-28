import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Badge } from "../src/index";

describe("Badge", () => {
  it("renders a span with Badge, size, and variant classes", async () => {
    render(() => <Badge>New</Badge>);
    const el = await screen.findByText("New");
    expect(el.tagName).toBe("SPAN");
    expect(el.classList.contains("fui-Badge")).toBe(true);
    expect(el.classList.contains("fui-r-size-1")).toBe(true);
    expect(el.classList.contains("fui-variant-soft")).toBe(true);
  });

  it("applies size, variant, and high-contrast classes", async () => {
    render(() => (
      <Badge size="2" variant="solid" highContrast>
        Hot
      </Badge>
    ));
    const el = await screen.findByText("Hot");
    expect(el.classList.contains("fui-r-size-2")).toBe(true);
    expect(el.classList.contains("fui-variant-solid")).toBe(true);
    expect(el.classList.contains("fui-high-contrast")).toBe(true);
  });

  it("sets data-accent-color from the color prop", async () => {
    render(() => <Badge color="green">Accent</Badge>);
    const el = await screen.findByText("Accent");
    expect(el.getAttribute("data-accent-color")).toBe("green");
  });

  it("omits data-accent-color without a color prop", async () => {
    render(() => <Badge>Plain</Badge>);
    const el = await screen.findByText("Plain");
    expect(el.hasAttribute("data-accent-color")).toBe(false);
  });

  it("merges the consumer class with fui-Badge", async () => {
    render(() => <Badge class="custom">Merged</Badge>);
    const el = await screen.findByText("Merged");
    expect(el.classList.contains("fui-Badge")).toBe(true);
    expect(el.classList.contains("custom")).toBe(true);
  });
});
