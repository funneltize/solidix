import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Text, textPropDefs } from "../src/index";

describe("Text", () => {
  it("renders a span with the fui-Text class by default", async () => {
    render(() => <Text>Hello</Text>);
    const el = await screen.findByText("Hello");
    expect(el.tagName).toBe("SPAN");
    expect(el.classList.contains("fui-Text")).toBe(true);
    expect(el.getAttribute("data-accent-color")).toBeNull();
  });

  it("applies size, weight, align, trim, and high-contrast classes", async () => {
    render(() => (
      <Text size="5" weight="bold" align="center" trim="start" highContrast>
        Styled
      </Text>
    ));
    const el = await screen.findByText("Styled");
    expect(el.classList.contains("fui-Text")).toBe(true);
    expect(el.classList.contains("fui-r-size-5")).toBe(true);
    expect(el.classList.contains("fui-r-weight-bold")).toBe(true);
    expect(el.classList.contains("fui-r-ta-center")).toBe(true);
    expect(el.classList.contains("fui-r-lt-start")).toBe(true);
    expect(el.classList.contains("fui-high-contrast")).toBe(true);
  });

  it("sets data-accent-color from the color prop", async () => {
    render(() => <Text color="red">Accent</Text>);
    const el = await screen.findByText("Accent");
    expect(el.getAttribute("data-accent-color")).toBe("red");
  });

  it("merges the consumer class with fui-Text", async () => {
    render(() => <Text class="custom">Merged</Text>);
    const el = await screen.findByText("Merged");
    expect(el.classList.contains("fui-Text")).toBe(true);
    expect(el.classList.contains("custom")).toBe(true);
  });

  it("slots props onto an element render child", async () => {
    render(() => (
      <Text render={<a href="https://example.com">Link</a>} size="2">
        Ignored
      </Text>
    ));
    const el = await screen.findByRole("link");
    expect(el.classList.contains("fui-Text")).toBe(true);
    expect(el.classList.contains("fui-r-size-2")).toBe(true);
    expect(el.textContent).toBe("Link");
  });

  it("passes props to a function render child", async () => {
    render(() => (
      <Text
        color="red"
        render={(props) => (
          <p data-testid="rendered" class={props.class}>
            {props.children}
          </p>
        )}
      >
        Function
      </Text>
    ));
    const el = await screen.findByTestId("rendered");
    expect(el.tagName).toBe("P");
    expect(el.classList.contains("fui-Text")).toBe(true);
    expect(el.textContent).toBe("Function");
  });

  it("exposes textPropDefs with the documented defaults", () => {
    expect(textPropDefs.size.default).toBeUndefined();
    expect(textPropDefs.weight.default).toBeUndefined();
    expect(textPropDefs.color.default).toBeUndefined();
    expect(textPropDefs.highContrast.default).toBeUndefined();
  });
});
