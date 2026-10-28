import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Quote } from "../src/index";

describe("Quote", () => {
  it("renders a q element with the fui-Quote class", async () => {
    render(() => <Quote>quoted</Quote>);
    const el = await screen.findByText("quoted");
    expect(el.tagName).toBe("Q");
    expect(el.classList.contains("fui-Quote")).toBe(true);
  });

  it("merges the consumer class with fui-Quote", async () => {
    render(() => <Quote class="custom">merged</Quote>);
    const el = await screen.findByText("merged");
    expect(el.classList.contains("fui-Quote")).toBe(true);
    expect(el.classList.contains("custom")).toBe(true);
  });
});
