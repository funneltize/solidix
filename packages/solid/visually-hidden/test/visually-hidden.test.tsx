import { describe, expect, test } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { VisuallyHidden } from "../src/index";

describe("VisuallyHidden", () => {
  test("applies the visually-hidden styles", async () => {
    render(() => <VisuallyHidden>hidden label</VisuallyHidden>);

    const element = (await screen.findByText("hidden label")) as HTMLElement;
    expect(element.tagName).toBe("SPAN");
    expect(element.style.position).toBe("absolute");
    expect(element.style.width).toBe("1px");
    expect(element.style.height).toBe("1px");
    expect(element.style.margin).toBe("-1px");
    expect(element.style.overflow).toBe("hidden");
    expect(element.style.clip).toBe("rect(0px, 0px, 0px, 0px)");
    // (jsdom's CSSOM does not implement every property - check the cssText)
    expect(element.style.cssText).toContain("white-space: nowrap");
    expect(element.style.cssText).toContain("word-wrap: normal");
    expect(element.style.cssText).toContain("border");
    expect(element.style.cssText).toContain("padding");
  });

  test("user styles win over the defaults", async () => {
    render(() => <VisuallyHidden style={{ position: "relative" }}>label</VisuallyHidden>);

    const element = (await screen.findByText("label")) as HTMLElement;
    expect(element.style.position).toBe("relative");
    expect(element.style.overflow).toBe("hidden");
  });
});
