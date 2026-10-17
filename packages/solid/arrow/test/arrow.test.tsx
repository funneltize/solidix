import { describe, expect, test } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Arrow } from "../src/index";

describe("Arrow", () => {
  test("renders the default polygon", () => {
    const { container } = render(() => <Arrow data-testid="arrow" />);
    const svg = container.querySelector('[data-testid="arrow"]') as SVGSVGElement;

    expect(svg.tagName).toBe("svg");
    expect(svg.getAttribute("width")).toBe("10");
    expect(svg.getAttribute("height")).toBe("5");
    expect(svg.getAttribute("viewBox")).toBe("0 0 30 10");
    expect(svg.querySelector("polygon")?.getAttribute("points")).toBe("0,0 30,0 15,10");
  });

  test("uses children when slotting", async () => {
    render(() => (
      <Arrow asChild>
        <svg data-testid="custom">
          <circle cx="5" cy="5" r="5" />
        </svg>
      </Arrow>
    ));

    const svg = (await screen.findByTestId("custom")) as unknown as SVGSVGElement;
    expect(svg.querySelector("circle")).toBeDefined();
    expect(svg.querySelector("polygon")).toBeNull();
  });
});
