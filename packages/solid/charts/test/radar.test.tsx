import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { RadarChart } from "../src/index";
import { datasetFixture, gappedDatasetFixture, seriesFixture } from "./fixture";

/** All radar dots in render order (series-major, then row order). */
function radarDots(container: HTMLElement): SVGCircleElement[] {
  return Array.from(container.querySelectorAll('circle[role="img"]'));
}

function renderRadarChart(extra: Record<string, unknown> = {}) {
  return render(() => (
    <RadarChart
      width={400}
      height={300}
      dataset={datasetFixture()}
      series={seriesFixture()}
      ariaLabel="Quarterly performance radar"
      {...extra}
    />
  ));
}

describe("RadarChart", () => {
  test("renders one focusable dot per series per spoke with the series color", async () => {
    const { container } = renderRadarChart();
    await screen.findByRole("img", { name: "Quarterly performance radar" });
    const dots = radarDots(container);
    expect(dots).toHaveLength(6);
    expect(dots[0]?.getAttribute("aria-label")).toBe("Revenue: 120");
    expect(dots[1]?.getAttribute("aria-label")).toBe("Revenue: 150");
    expect(dots[3]?.getAttribute("aria-label")).toBe("Profit: 30");
    for (const dot of dots) {
      expect(dot.getAttribute("tabindex")).toBe("0");
      expect(dot.getAttribute("r")).toBe("3");
    }
    // Same-series dots share a fill; series differ.
    expect(dots[0]?.getAttribute("fill")).toBe(dots[1]?.getAttribute("fill"));
    expect(dots[0]?.getAttribute("fill")).not.toBe(dots[3]?.getAttribute("fill"));
  });

  test("draws one web polygon per series plus the area fill", async () => {
    const { container } = renderRadarChart();
    await screen.findByRole("img", { name: "Quarterly performance radar" });
    const webs = container.querySelectorAll('polygon[aria-hidden="true"]');
    // Two series, each with an outline plus an area fill.
    expect(webs).toHaveLength(4);
    for (const web of webs) {
      expect(web.getAttribute("points")?.split(" ")).toHaveLength(3);
    }
  });

  test("skips dots for missing values but keeps the spoke grid", async () => {
    const { container } = renderRadarChart({ dataset: gappedDatasetFixture() });
    await screen.findByRole("img", { name: "Quarterly performance radar" });
    // Q2 profit is missing, so the profit web loses one dot.
    expect(radarDots(container)).toHaveLength(5);
    // Spoke grid still renders all three axes.
    const spokes = container.querySelectorAll('g[aria-hidden="true"] > line');
    expect(spokes.length).toBeGreaterThanOrEqual(3);
  });

  test("circular ring grids render circles instead of spoke polygons", async () => {
    const { container } = renderRadarChart({ circular: true });
    await screen.findByRole("img", { name: "Quarterly performance radar" });
    const rings = container.querySelectorAll('g[aria-hidden="true"] > circle');
    expect(rings.length).toBeGreaterThanOrEqual(3);
  });
});
