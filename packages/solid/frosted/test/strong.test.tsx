import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Strong } from "../src/index";

describe("Strong", () => {
  it("renders a strong element with the upstream class", async () => {
    render(() => <Strong>Bold claim</Strong>);
    const el = await screen.findByText("Bold claim");
    expect(el.tagName).toBe("STRONG");
    expect(el.classList.contains("fui-Strong")).toBe(true);
  });

  it("merges a caller class and forwards a ref", async () => {
    let node: HTMLElement | null = null;
    render(() => (
      <Strong class="custom" ref={(el) => (node = el)}>
        Bold
      </Strong>
    ));
    const el = await screen.findByText("Bold");
    expect(el.classList.contains("fui-Strong")).toBe(true);
    expect(el.classList.contains("custom")).toBe(true);
    expect(node).toBe(el);
  });
});
