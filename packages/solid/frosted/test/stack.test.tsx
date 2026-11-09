import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Row, Stack, rowPropDefs, stackPropDefs } from "../src/index";

describe("Stack", () => {
  it("renders a div with the fui-Stack class and default rhythm classes", async () => {
    render(() => (
      <Stack>
        <span>content</span>
      </Stack>
    ));
    const inner = await screen.findByText("content");
    const el = inner.parentElement!;
    expect(el.tagName).toBe("DIV");
    expect(el.classList.contains("fui-Stack")).toBe(true);
    expect(el.classList.contains("fui-r-gap-4")).toBe(true);
    expect(el.classList.contains("fui-r-align-stretch")).toBe(true);
    expect(el.classList.contains("fui-r-justify-start")).toBe(true);
  });

  it("applies gap, align, and justify classes", async () => {
    render(() => (
      <Stack gap="2" align="center" justify="between">
        <span>spaced</span>
      </Stack>
    ));
    const inner = await screen.findByText("spaced");
    const el = inner.parentElement!;
    expect(el.classList.contains("fui-r-gap-2")).toBe(true);
    expect(el.classList.contains("fui-r-align-center")).toBe(true);
    expect(el.classList.contains("fui-r-justify-between")).toBe(true);
  });

  it("merges the consumer class with fui-Stack", async () => {
    render(() => (
      <Stack class="custom">
        <span>merged</span>
      </Stack>
    ));
    const inner = await screen.findByText("merged");
    const el = inner.parentElement!;
    expect(el.classList.contains("fui-Stack")).toBe(true);
    expect(el.classList.contains("custom")).toBe(true);
  });

  it("exposes stackPropDefs with the documented defaults", () => {
    expect(stackPropDefs.gap.default).toBe("4");
    expect(stackPropDefs.align.default).toBe("stretch");
    expect(stackPropDefs.justify.default).toBe("start");
  });
});

describe("Row", () => {
  it("renders a div with the fui-Row class and centered cross axis by default", async () => {
    render(() => (
      <Row>
        <span>content</span>
      </Row>
    ));
    const inner = await screen.findByText("content");
    const el = inner.parentElement!;
    expect(el.tagName).toBe("DIV");
    expect(el.classList.contains("fui-Row")).toBe(true);
    expect(el.classList.contains("fui-r-gap-4")).toBe(true);
    expect(el.classList.contains("fui-r-align-center")).toBe(true);
  });

  it("applies gap, align, and justify classes", async () => {
    render(() => (
      <Row gap="1" align="end" justify="end">
        <span>spaced</span>
      </Row>
    ));
    const inner = await screen.findByText("spaced");
    const el = inner.parentElement!;
    expect(el.classList.contains("fui-r-gap-1")).toBe(true);
    expect(el.classList.contains("fui-r-align-end")).toBe(true);
    expect(el.classList.contains("fui-r-justify-end")).toBe(true);
  });

  it("exposes rowPropDefs with the documented defaults", () => {
    expect(rowPropDefs.gap.default).toBe("4");
    expect(rowPropDefs.align.default).toBe("center");
    expect(rowPropDefs.justify.default).toBe("start");
  });
});
