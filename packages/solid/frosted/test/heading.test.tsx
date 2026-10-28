import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Heading, headingPropDefs } from "../src/index";

describe("Heading", () => {
  it("renders an h1 with the fui-Heading class and bold size-6 defaults", async () => {
    render(() => <Heading>Hello</Heading>);
    const el = await screen.findByText("Hello");
    expect(el.tagName).toBe("H1");
    expect(el.classList.contains("fui-Heading")).toBe(true);
    expect(el.classList.contains("fui-r-size-6")).toBe(true);
    expect(el.classList.contains("fui-r-weight-bold")).toBe(true);
    expect(el.getAttribute("data-accent-color")).toBeNull();
  });

  it("applies size, weight, align, trim, and high-contrast classes", async () => {
    render(() => (
      <Heading size="3" weight="regular" align="center" trim="both" highContrast>
        Styled
      </Heading>
    ));
    const el = await screen.findByText("Styled");
    expect(el.classList.contains("fui-r-size-3")).toBe(true);
    expect(el.classList.contains("fui-r-weight-regular")).toBe(true);
    expect(el.classList.contains("fui-r-ta-center")).toBe(true);
    expect(el.classList.contains("fui-r-lt-both")).toBe(true);
    expect(el.classList.contains("fui-high-contrast")).toBe(true);
  });

  it("sets data-accent-color from the color prop", async () => {
    render(() => <Heading color="blue">Accent</Heading>);
    const el = await screen.findByText("Accent");
    expect(el.getAttribute("data-accent-color")).toBe("blue");
  });

  it("merges the consumer class with fui-Heading", async () => {
    render(() => <Heading class="custom">Merged</Heading>);
    const el = await screen.findByText("Merged");
    expect(el.classList.contains("fui-Heading")).toBe(true);
    expect(el.classList.contains("custom")).toBe(true);
  });

  it("slots props onto an element render child", async () => {
    render(() => (
      <Heading render={<h2>Slotted</h2>} size="2">
        Ignored
      </Heading>
    ));
    const el = await screen.findByText("Slotted");
    expect(el.tagName).toBe("H2");
    expect(el.classList.contains("fui-Heading")).toBe(true);
    expect(el.classList.contains("fui-r-size-2")).toBe(true);
  });

  it("passes props to a function render child", async () => {
    render(() => (
      <Heading
        color="red"
        render={(props) => (
          <p data-testid="rendered" class={props.class}>
            {props.children}
          </p>
        )}
      >
        Function
      </Heading>
    ));
    const el = await screen.findByTestId("rendered");
    expect(el.tagName).toBe("P");
    expect(el.classList.contains("fui-Heading")).toBe(true);
    expect(el.textContent).toBe("Function");
  });

  it("exposes headingPropDefs with the documented defaults", () => {
    expect(headingPropDefs.size.default).toBe("6");
    expect(headingPropDefs.weight.default).toBe("bold");
  });
});
