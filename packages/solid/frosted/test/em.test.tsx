import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Em } from "../src/index";

describe("Em", () => {
  it("renders an em element with the fui-Em class", async () => {
    render(() => <Em>emphasized</Em>);
    const el = await screen.findByText("emphasized");
    expect(el.tagName).toBe("EM");
    expect(el.classList.contains("fui-Em")).toBe(true);
  });

  it("merges the consumer class with fui-Em", async () => {
    render(() => <Em class="custom">merged</Em>);
    const el = await screen.findByText("merged");
    expect(el.classList.contains("fui-Em")).toBe(true);
    expect(el.classList.contains("custom")).toBe(true);
  });
});
