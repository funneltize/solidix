import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { VISUALLY_HIDDEN_STYLES, VisuallyHidden } from "../src/index";

describe("VisuallyHidden", () => {
  it("renders a span with the hiding styles", async () => {
    render(() => <VisuallyHidden>Hidden label</VisuallyHidden>);
    const el = await screen.findByText("Hidden label");
    expect(el.tagName).toBe("SPAN");
    expect(el.style.position).toBe("absolute");
    expect(el.style.width).toBe("1px");
    expect(el.style.height).toBe("1px");
    expect(el.style.overflow).toBe("hidden");
    expect(el.style.getPropertyValue("white-space")).toBe("nowrap");
  });

  it("merges caller styles over the hiding styles", async () => {
    render(() => <VisuallyHidden style={{ color: "red" }}>Hidden label</VisuallyHidden>);
    const el = await screen.findByText("Hidden label");
    expect(el.style.color).toBe("red");
    expect(el.style.position).toBe("absolute");
  });

  it("supports an element-form render override", async () => {
    render(() => (
      <VisuallyHidden render={<div data-testid="custom-hidden" />}>Hidden label</VisuallyHidden>
    ));
    const el = await screen.findByTestId("custom-hidden");
    expect(el.tagName).toBe("DIV");
    expect(el.style.position).toBe("absolute");
    expect(el.textContent).toBe("Hidden label");
  });

  it("supports a function-form render override", async () => {
    render(() => (
      <VisuallyHidden
        render={(props) => (
          <label data-testid="fn-hidden" style={props.style}>
            {props.children}
          </label>
        )}
      >
        Hidden label
      </VisuallyHidden>
    ));
    const el = await screen.findByTestId("fn-hidden");
    expect(el.tagName).toBe("LABEL");
    expect(el.style.position).toBe("absolute");
  });

  it("exports the frozen hiding styles", () => {
    expect(VISUALLY_HIDDEN_STYLES.position).toBe("absolute");
    expect(VISUALLY_HIDDEN_STYLES.width).toBe("1px");
    expect(VISUALLY_HIDDEN_STYLES.clip).toBe("rect(0, 0, 0, 0)");
  });
});
