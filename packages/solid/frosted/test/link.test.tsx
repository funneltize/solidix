import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Link, linkPropDefs } from "../src/index";

describe("Link", () => {
  it("renders an anchor with the fui-Link classes by default", async () => {
    render(() => <Link href="https://example.com">Home</Link>);
    const el = await screen.findByRole("link", { name: "Home" });
    expect(el.tagName).toBe("A");
    expect(el.classList.contains("fui-Link")).toBe(true);
    expect(el.classList.contains("fui-reset")).toBe(true);
    expect(el.classList.contains("fui-underline-auto")).toBe(true);
    expect(el.getAttribute("href")).toBe("https://example.com");
  });

  it("applies size and underline classes", async () => {
    render(() => (
      <Link href="https://example.com" size="2" underline="always">
        Styled
      </Link>
    ));
    const el = await screen.findByRole("link", { name: "Styled" });
    expect(el.classList.contains("fui-r-size-2")).toBe(true);
    expect(el.classList.contains("fui-underline-always")).toBe(true);
  });

  it("sets data-accent-color from the color prop", async () => {
    render(() => (
      <Link href="https://example.com" color="green">
        Accent
      </Link>
    ));
    const el = await screen.findByRole("link", { name: "Accent" });
    expect(el.getAttribute("data-accent-color")).toBe("green");
  });

  it("merges the consumer class with fui-Link", async () => {
    render(() => (
      <Link href="https://example.com" class="custom">
        Merged
      </Link>
    ));
    const el = await screen.findByRole("link", { name: "Merged" });
    expect(el.classList.contains("fui-Link")).toBe(true);
    expect(el.classList.contains("custom")).toBe(true);
  });

  it("exposes linkPropDefs with the documented defaults", () => {
    expect(linkPropDefs.underline.default).toBe("auto");
  });
});
