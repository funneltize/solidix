import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Inset, insetPropDefs } from "../src/index";

describe("Inset", () => {
  it("renders a div with the fui-Inset class and all/border-box defaults", async () => {
    render(() => (
      <Inset>
        <span>content</span>
      </Inset>
    ));
    const inner = await screen.findByText("content");
    const el = inner.parentElement!;
    expect(el.tagName).toBe("DIV");
    expect(el.classList.contains("fui-Inset")).toBe(true);
    expect(el.classList.contains("fui-r-side-all")).toBe(true);
    expect(el.classList.contains("fui-r-clip-border-box")).toBe(true);
  });

  it("applies side, clip, and padding classes", async () => {
    render(() => (
      <Inset side="x" clip="padding-box" p="current" py="0">
        <span>padded</span>
      </Inset>
    ));
    const inner = await screen.findByText("padded");
    const el = inner.parentElement!;
    expect(el.classList.contains("fui-r-side-x")).toBe(true);
    expect(el.classList.contains("fui-r-clip-padding-box")).toBe(true);
    expect(el.classList.contains("fui-r-p-current")).toBe(true);
    expect(el.classList.contains("fui-r-py-0")).toBe(true);
  });

  it("merges the consumer class with fui-Inset", async () => {
    render(() => (
      <Inset class="custom">
        <span>merged</span>
      </Inset>
    ));
    const inner = await screen.findByText("merged");
    const el = inner.parentElement!;
    expect(el.classList.contains("fui-Inset")).toBe(true);
    expect(el.classList.contains("custom")).toBe(true);
  });

  it("exposes insetPropDefs with the documented defaults", () => {
    expect(insetPropDefs.side.default).toBe("all");
    expect(insetPropDefs.clip.default).toBe("border-box");
    expect(insetPropDefs.p.default).toBeUndefined();
  });
});
