import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Card } from "../src/index";

describe("Card", () => {
  it("renders a div with reset, Card, size, and variant classes", async () => {
    render(() => <Card>Content</Card>);
    const el = await screen.findByText("Content");
    expect(el.tagName).toBe("DIV");
    expect(el.classList.contains("fui-reset")).toBe(true);
    expect(el.classList.contains("fui-Card")).toBe(true);
    expect(el.classList.contains("fui-r-size-1")).toBe(true);
    expect(el.classList.contains("fui-variant-surface")).toBe(true);
  });

  it("applies size and variant classes", async () => {
    render(() => (
      <Card size="3" variant="outline">
        Sized
      </Card>
    ));
    const el = await screen.findByText("Sized");
    expect(el.classList.contains("fui-r-size-3")).toBe(true);
    expect(el.classList.contains("fui-variant-outline")).toBe(true);
  });

  it("merges the consumer class with fui-Card", async () => {
    render(() => <Card class="custom">Merged</Card>);
    const el = await screen.findByText("Merged");
    expect(el.classList.contains("fui-Card")).toBe(true);
    expect(el.classList.contains("custom")).toBe(true);
  });

  it("renders as the element-form render target", async () => {
    render(() => <Card render={<button type="button" data-testid="slotted" />}>Clickable</Card>);
    const el = await screen.findByTestId("slotted");
    expect(el.tagName).toBe("BUTTON");
    expect(el.classList.contains("fui-Card")).toBe(true);
    expect(el.textContent).toContain("Clickable");
  });

  it("calls a function-form render prop with merged props", async () => {
    render(() => (
      <Card
        size="2"
        render={(props) => (
          <section data-testid="fn" class={props.class}>
            {props.children}
          </section>
        )}
      >
        Custom
      </Card>
    ));
    const el = await screen.findByTestId("fn");
    expect(el.tagName).toBe("SECTION");
    expect(el.classList.contains("fui-Card")).toBe(true);
    expect(el.classList.contains("fui-r-size-2")).toBe(true);
    expect(el.textContent).toContain("Custom");
  });
});
