import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Blockquote } from "../src/index";

describe("Blockquote", () => {
  it("renders a blockquote with the fui-Blockquote class", async () => {
    render(() => <Blockquote>Quoted text</Blockquote>);
    const el = await screen.findByText("Quoted text");
    expect(el.tagName).toBe("BLOCKQUOTE");
    expect(el.classList.contains("fui-Blockquote")).toBe(true);
    expect(el.classList.contains("fui-Text")).toBe(true);
  });

  it("flows size, weight, and high-contrast through to Text", async () => {
    render(() => (
      <Blockquote size="4" weight="medium" highContrast>
        Styled
      </Blockquote>
    ));
    const el = await screen.findByText("Styled");
    expect(el.classList.contains("fui-r-size-4")).toBe(true);
    expect(el.classList.contains("fui-r-weight-medium")).toBe(true);
    expect(el.classList.contains("fui-high-contrast")).toBe(true);
  });

  it("sets data-accent-color from the color prop", async () => {
    render(() => <Blockquote color="purple">Accent</Blockquote>);
    const el = await screen.findByText("Accent");
    expect(el.getAttribute("data-accent-color")).toBe("purple");
  });

  it("merges the consumer class with fui-Blockquote", async () => {
    render(() => <Blockquote class="custom">Merged</Blockquote>);
    const el = await screen.findByText("Merged");
    expect(el.classList.contains("fui-Blockquote")).toBe(true);
    expect(el.classList.contains("custom")).toBe(true);
  });
});
