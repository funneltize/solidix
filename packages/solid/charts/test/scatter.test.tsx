import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { ScatterChart } from "../src/index";
import { datasetFixture, seriesFixture } from "./fixture";

/** Bottom-axis tick labels (the x axis sits below the plot area). */
function xTicks(container: HTMLElement): string[] {
  // Plot height for the 300px fixture: 8px top plus 24px bottom margins.
  const plotBottom = 300 - 8 - 24;
  return Array.from(container.querySelectorAll("text"))
    .filter((text) => Number(text.getAttribute("y")) > plotBottom)
    .map((text) => text.textContent ?? "");
}

/** All scatter points in render order (series-major, then row order). */
function scatterDots(container: HTMLElement): SVGCircleElement[] {
  return Array.from(container.querySelectorAll('circle[role="img"]'));
}

function renderScatterChart(extra: Record<string, unknown> = {}) {
  return render(() => (
    <ScatterChart
      width={400}
      height={300}
      dataset={datasetFixture()}
      series={seriesFixture()}
      ariaLabel="Spend versus revenue"
      {...extra}
    />
  ));
}

describe("ScatterChart", () => {
  test("renders one focusable point per series per row, defaulting x to the row index", async () => {
    const { container } = renderScatterChart();
    await screen.findByRole("img", { name: "Spend versus revenue" });
    const dots = scatterDots(container);
    expect(dots).toHaveLength(6);
    expect(dots[0]?.getAttribute("aria-label")).toBe("Revenue: (0, 120)");
    expect(dots[1]?.getAttribute("aria-label")).toBe("Revenue: (1, 150)");
    expect(dots[3]?.getAttribute("aria-label")).toBe("Profit: (0, 30)");
    for (const dot of dots) {
      expect(dot.getAttribute("tabindex")).toBe("0");
      expect(dot.getAttribute("r")).toBe("4");
    }
    // Points spread left to right with the row index.
    const cx = dots.slice(0, 3).map((dot) => Number(dot.getAttribute("cx")));
    expect(cx[0]).toBeLessThan(cx[1]!);
    expect(cx[1]).toBeLessThan(cx[2]!);
  });

  test("xDataKey reads x values from the dataset and skips missing coordinates", async () => {
    const { container } = renderScatterChart({
      dataset: [
        { label: "A", spend: 10, revenue: 100 },
        { label: "B", revenue: 200 },
        { label: "C", spend: 30, revenue: 300 },
      ],
      series: [{ id: "revenue", label: "Revenue", valueKey: "revenue" }],
      xDataKey: "spend",
      radius: 6,
    });
    await screen.findByRole("img", { name: "Spend versus revenue" });
    const dots = scatterDots(container);
    // Row B has no spend value, so it renders no point.
    expect(dots).toHaveLength(2);
    expect(dots[0]?.getAttribute("aria-label")).toBe("Revenue: (10, 100)");
    expect(dots[1]?.getAttribute("aria-label")).toBe("Revenue: (30, 300)");
    for (const dot of dots) {
      expect(dot.getAttribute("r")).toBe("6");
    }
    // The smaller x value plots left of the larger one.
    expect(Number(dots[0]?.getAttribute("cx"))).toBeLessThan(Number(dots[1]?.getAttribute("cx")));
  });

  test("renders a numeric x axis spanning the plotted extent", async () => {
    const { container } = renderScatterChart({
      dataset: [
        { label: "A", spend: 10, revenue: 100 },
        { label: "B", revenue: 200 },
        { label: "C", spend: 30, revenue: 300 },
      ],
      series: [{ id: "revenue", label: "Revenue", valueKey: "revenue" }],
      xDataKey: "spend",
    });
    await screen.findByRole("img", { name: "Spend versus revenue" });
    // d3 ticks over the [10, 30] extent: endpoints plus round steps.
    const ticks = xTicks(container);
    expect(ticks).toContain("10");
    expect(ticks).toContain("30");
    expect(ticks.length).toBeGreaterThan(2);
  });

  test("x axis defaults to row-index ticks without xDataKey", async () => {
    const { container } = renderScatterChart();
    await screen.findByRole("img", { name: "Spend versus revenue" });
    const ticks = xTicks(container);
    expect(ticks).toContain("0");
    expect(ticks).toContain("2");
  });
});
