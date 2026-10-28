import { describe, expect, it } from "vitest";
import { render } from "@solidjs/testing-library";
import { StackedHorizontalBarChart } from "../src/index";

describe("StackedHorizontalBarChart", () => {
  it("renders proportional bars with labels and colors", () => {
    render(() => (
      <StackedHorizontalBarChart
        data={[
          { label: "Apples", value: 25, color: "red" },
          { label: "Bananas", value: 75, color: "yellow" },
        ]}
      />
    ));
    const root = document.querySelector(".fui-StackedHorizontalBarChart") as HTMLElement;
    expect(root).not.toBeNull();
    const bars = [...root.querySelectorAll(".fui-StackedHorizontalBarChartBar")] as HTMLElement[];
    expect(bars).toHaveLength(2);
    expect(bars[0].style.width).toBe("25%");
    expect(bars[1].style.width).toBe("75%");
    expect(bars[0].getAttribute("aria-label")).toBe("Apples 25%");
    expect(bars[1].getAttribute("aria-label")).toBe("Bananas 75%");
    expect(bars[0].getAttribute("data-accent-color")).toBe("red");
    expect(bars[1].getAttribute("data-accent-color")).toBe("yellow");
  });

  it("rounds percents to two decimals and supports label functions", () => {
    render(() => (
      <StackedHorizontalBarChart
        data={[
          { label: (value, percent) => `${value} units (${percent})`, value: 1, color: "blue" },
          { label: "Rest", value: 2, color: "gray" },
        ]}
      />
    ));
    const bars = [
      ...document.querySelectorAll(".fui-StackedHorizontalBarChartBar"),
    ] as HTMLElement[];
    expect(bars[0].style.width).toBe("33.33%");
    // Function labels are used verbatim as the accessible name.
    expect(bars[0].getAttribute("aria-label")).toBe("1 units (33.33%)");
    expect(bars[1].getAttribute("aria-label")).toBe("Rest 66.67%");
  });
});
