import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { RadialBarChart, RadialLineChart } from "../src/index";
import { datasetFixture, gappedDatasetFixture, seriesFixture } from "./fixture";

/** All radial bars in render order (series-major, then row order). */
function radialBars(container: HTMLElement): SVGPathElement[] {
  return Array.from(container.querySelectorAll('path[role="img"]'));
}

/** All radial line vertex dots in render order. */
function radialDots(container: HTMLElement): SVGCircleElement[] {
  return Array.from(container.querySelectorAll('circle[role="img"]'));
}

function renderRadialBarChart(extra: Record<string, unknown> = {}) {
  return render(() => (
    <RadialBarChart
      width={400}
      height={300}
      dataset={datasetFixture()}
      series={seriesFixture()}
      ariaLabel="Quarterly radial bars"
      {...extra}
    />
  ));
}

function renderRadialLineChart(extra: Record<string, unknown> = {}) {
  return render(() => (
    <RadialLineChart
      width={400}
      height={300}
      dataset={datasetFixture()}
      series={seriesFixture()}
      ariaLabel="Quarterly radial lines"
      {...extra}
    />
  ));
}

describe("RadialBarChart", () => {
  test("renders one focusable annular sector per series per row", async () => {
    const { container } = renderRadialBarChart();
    await screen.findByRole("img", { name: "Quarterly radial bars" });
    const bars = radialBars(container);
    expect(bars).toHaveLength(6);
    expect(bars[0]?.getAttribute("aria-label")).toBe("Revenue: 120");
    expect(bars[3]?.getAttribute("aria-label")).toBe("Profit: 30");
    for (const bar of bars) {
      expect(bar.getAttribute("tabindex")).toBe("0");
      // Annular sectors close the path around the inner arc.
      expect(bar.getAttribute("d")).toContain("Z");
    }
    expect(bars[0]?.getAttribute("fill")).not.toBe(bars[3]?.getAttribute("fill"));
  });

  test("skips bars for missing values", async () => {
    const { container } = renderRadialBarChart({ dataset: gappedDatasetFixture() });
    await screen.findByRole("img", { name: "Quarterly radial bars" });
    // Q2 profit is missing, so one sector is omitted.
    expect(radialBars(container)).toHaveLength(5);
  });
});

describe("RadialLineChart", () => {
  test("renders one closed line per series with focusable vertices", async () => {
    const { container } = renderRadialLineChart();
    await screen.findByRole("img", { name: "Quarterly radial lines" });
    const dots = radialDots(container);
    expect(dots).toHaveLength(6);
    expect(dots[0]?.getAttribute("aria-label")).toBe("Revenue: 120");
    expect(dots[4]?.getAttribute("aria-label")).toBe("Profit: 45");
    for (const dot of dots) {
      expect(dot.getAttribute("tabindex")).toBe("0");
    }
    const lines = container.querySelectorAll('polygon[aria-hidden="true"]');
    expect(lines).toHaveLength(2);
    for (const line of lines) {
      expect(line.getAttribute("points")?.split(" ")).toHaveLength(3);
    }
  });

  test("skips vertex dots for missing values", async () => {
    const { container } = renderRadialLineChart({ dataset: gappedDatasetFixture() });
    await screen.findByRole("img", { name: "Quarterly radial lines" });
    expect(radialDots(container)).toHaveLength(5);
  });
});
