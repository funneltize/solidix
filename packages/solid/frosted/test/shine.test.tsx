import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { Shine } from "../src/index";

/** Dispatch a pointermove with page coordinates (fireEvent cannot set `pageX`). */
function pointerMove(x: number, y: number) {
  const event = new Event("pointermove", { bubbles: true });
  Object.defineProperty(event, "pageX", { value: x });
  Object.defineProperty(event, "pageY", { value: y });
  document.dispatchEvent(event);
}

describe("Shine", () => {
  it("renders the filter linked to the children wrapper", async () => {
    render(() => (
      <Shine puffyness="1.5">
        <span>Shiny</span>
      </Shine>
    ));
    await screen.findByText("Shiny");

    const root = document.querySelector(".fui-Shine") as HTMLElement;
    expect(root).not.toBeNull();
    const filter = root.querySelector("filter") as SVGFilterElement;
    expect(filter.getAttribute("id")).not.toBeNull();
    expect(filter.querySelector("feGaussianBlur")?.getAttribute("stdDeviation")).toBe("1.5");
    const wrapper = root.querySelector("div:not(.fui-Shine)") as HTMLElement;
    // CSSOM serializes the reference with quotes.
    expect(wrapper?.style.filter).toBe(`url("#${filter.getAttribute("id")}")`);
    expect(wrapper?.style.isolation).toBe("isolate");
  });

  it("tracks the pointer by moving the point light", async () => {
    render(() => (
      <Shine>
        <span>Shiny</span>
      </Shine>
    ));
    await screen.findByText("Shiny");

    const root = document.querySelector(".fui-Shine") as HTMLElement;
    const wrapper = root.querySelector("div:not(.fui-Shine)") as HTMLElement;
    Object.defineProperty(wrapper, "getBoundingClientRect", {
      configurable: true,
      value: () =>
        ({ top: 10, left: 20, width: 100, height: 100 }) as unknown as DOMRect,
    });
    const light = root.querySelector("fePointLight") as SVGElement;

    pointerMove(120, 60);

    expect(light.getAttribute("x")).toBe("100");
    expect(light.getAttribute("y")).toBe("50");
  });

  it("re-anchors the light on scroll", async () => {
    render(() => (
      <Shine>
        <span>Shiny</span>
      </Shine>
    ));
    await screen.findByText("Shiny");

    const root = document.querySelector(".fui-Shine") as HTMLElement;
    const wrapper = root.querySelector("div:not(.fui-Shine)") as HTMLElement;
    const rect = { top: 10, left: 20, width: 100, height: 100 };
    Object.defineProperty(wrapper, "getBoundingClientRect", {
      configurable: true,
      value: () => rect as unknown as DOMRect,
    });
    const light = root.querySelector("fePointLight") as SVGElement;

    pointerMove(120, 60);
    expect(light.getAttribute("x")).toBe("100");

    // The layout shifted under a stationary pointer; scroll re-anchors.
    rect.left = 70;
    rect.top = 30;
    fireEvent.scroll(document);

    expect(light.getAttribute("x")).toBe("50");
    expect(light.getAttribute("y")).toBe("30");
  });
});
