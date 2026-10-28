import { fireEvent, render, screen } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { ChartContainer, ChartsLegend, ChartSurface, LineChart, LinePlot } from "../src/index";
import { datasetFixture, gappedDatasetFixture, seriesFixture } from "./fixture";

/** Stroked series paths (grid and axes use lines, areas use filled paths). */
function linePaths(container: HTMLElement): SVGPathElement[] {
  return Array.from(container.querySelectorAll('path[fill="none"]'));
}

function renderLineChart(extra: Record<string, unknown> = {}) {
  return render(() => (
    <LineChart
      width={400}
      height={300}
      dataset={datasetFixture()}
      series={seriesFixture()}
      {...extra}
    />
  ));
}

describe("LineChart", () => {
  test("renders one stroked path per series with a default accessible name", async () => {
    const { container } = renderLineChart();
    await screen.findByRole("img", { name: "Line chart with 2 series" });
    const paths = linePaths(container);
    expect(paths).toHaveLength(2);
    for (const path of paths) {
      expect(path.getAttribute("stroke-width")).toBe("2");
      expect(path.getAttribute("d")).toMatch(/^M/);
    }
  });

  test("breaks the path across gap cells", async () => {
    const { container } = render(() => (
      <LineChart
        width={400}
        height={300}
        dataset={gappedDatasetFixture()}
        series={seriesFixture()}
      />
    ));
    await screen.findByRole("img", { name: "Line chart with 2 series" });
    const paths = linePaths(container);
    expect(paths).toHaveLength(2);
    // The profit series has a middle gap, so its path has two segments.
    const moves = paths[1]?.getAttribute("d")?.match(/M/g) ?? [];
    expect(moves).toHaveLength(2);
    // The complete revenue series stays a single segment.
    expect(paths[0]?.getAttribute("d")?.match(/M/g)).toHaveLength(1);
  });

  test("area mode fills under each series path", async () => {
    const { container } = renderLineChart({ area: true });
    await screen.findByRole("img", { name: "Line chart with 2 series" });
    const areas = Array.from(container.querySelectorAll('path[fill-opacity="0.25"]'));
    expect(areas).toHaveLength(2);
    for (const area of areas) {
      expect(area.getAttribute("stroke-width")).toBe("0");
      expect(area.getAttribute("d")).toMatch(/^M/);
    }
    expect(linePaths(container)).toHaveLength(2);
  });

  test("area mode breaks fills across gap cells", async () => {
    const { container } = render(() => (
      <LineChart
        width={400}
        height={300}
        dataset={gappedDatasetFixture()}
        series={seriesFixture()}
        area
      />
    ));
    await screen.findByRole("img", { name: "Line chart with 2 series" });
    const areas = Array.from(container.querySelectorAll('path[fill-opacity="0.25"]'));
    expect(areas).toHaveLength(2);
    const moves = areas[1]?.getAttribute("d")?.match(/M/g) ?? [];
    expect(moves).toHaveLength(2);
  });

  test("strokeWidth prop applies to series paths", async () => {
    const { container } = renderLineChart({ strokeWidth: 4 });
    await screen.findByRole("img", { name: "Line chart with 2 series" });
    for (const path of linePaths(container)) {
      expect(path.getAttribute("stroke-width")).toBe("4");
    }
  });

  test("area fill baselines at the domain edge when data excludes zero", async () => {
    const { container } = renderLineChart({
      area: true,
      ariaLabel: "High-value trend",
      dataset: [
        { label: "Q1", revenue: 3200 },
        { label: "Q2", revenue: 5800 },
        { label: "Q3", revenue: 4100 },
      ],
      series: [{ id: "revenue", label: "Revenue", valueKey: "revenue" }],
    });
    await screen.findByRole("img", { name: "High-value trend" });
    // Plot height for the 300px fixture: 8px top plus 24px bottom margins.
    const plotBottom = 300 - 8 - 24;
    const fills = Array.from(container.querySelectorAll("path[fill-opacity]"));
    expect(fills.length).toBeGreaterThan(0);
    for (const fill of fills) {
      const coords = fill
        .getAttribute("d")!
        .match(/-?\d+(\.\d+)?/g)!
        .map(Number);
      const ys = coords.filter((_, index) => index % 2 === 1);
      expect(ys.length).toBeGreaterThan(0);
      for (const y of ys) {
        expect(y).toBeLessThanOrEqual(plotBottom + 0.5);
        expect(y).toBeGreaterThanOrEqual(-0.5);
      }
    }
  });

  test("named curve shorthand smooths the path", async () => {
    const { container } = renderLineChart({ curve: "monotoneX" });
    await screen.findByRole("img", { name: "Line chart with 2 series" });
    // Monotone interpolation emits cubic segments; the linear default emits
    // straight lines only.
    for (const path of linePaths(container)) {
      expect(path.getAttribute("d")).toContain("C");
    }
    const { container: linear } = renderLineChart();
    await screen.findAllByRole("img", { name: "Line chart with 2 series" });
    for (const path of linePaths(linear)) {
      expect(path.getAttribute("d")).not.toContain("C");
    }
  });

  test("legend toggle hides the series path", async () => {
    const { container } = render(() => (
      <ChartContainer width={400} height={300} dataset={datasetFixture()} series={seriesFixture()}>
        <ChartSurface ariaLabel="Toggleable lines">
          <LinePlot />
        </ChartSurface>
        <ChartsLegend />
      </ChartContainer>
    ));
    await screen.findByRole("img", { name: "Toggleable lines" });
    expect(linePaths(container)).toHaveLength(2);
    const toggle = await screen.findByRole("button", { name: "Revenue" });
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(toggle);
    await vi.waitFor(() => {
      const next = screen.getByRole("button", { name: "Revenue" });
      expect(next.getAttribute("aria-pressed")).toBe("false");
    });
    await vi.waitFor(() => {
      expect(linePaths(container)).toHaveLength(1);
    });
    expect(linePaths(container)[0]?.getAttribute("d")).not.toBeNull();
  });
});
