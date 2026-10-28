import { fireEvent, render, screen } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { BarChart } from "../src/index";
import { datasetFixture, gappedDatasetFixture, seriesFixture } from "./fixture";

/** All bar rects in render order (series-major, then row order). */
function barRects(container: HTMLElement): SVGRectElement[] {
  return Array.from(container.querySelectorAll('rect[role="img"]'));
}

function renderBarChart(extra: Record<string, unknown> = {}) {
  return render(() => (
    <BarChart
      width={400}
      height={300}
      dataset={datasetFixture()}
      series={seriesFixture()}
      ariaLabel="Sales by quarter"
      {...extra}
    />
  ));
}

describe("BarChart", () => {
  test("renders one focusable bar per series per row with accessible labels", async () => {
    const { container } = renderBarChart();
    await screen.findByRole("img", { name: "Sales by quarter" });
    const rects = barRects(container);
    expect(rects).toHaveLength(6);
    expect(rects[0]?.getAttribute("aria-label")).toBe("Revenue, Q1: 120");
    expect(rects[2]?.getAttribute("aria-label")).toBe("Revenue, Q3: 90");
    expect(rects[3]?.getAttribute("aria-label")).toBe("Profit, Q1: 30");
    for (const rect of rects) {
      expect(rect.getAttribute("tabindex")).toBe("0");
    }
    // Series use distinct palette colors.
    expect(rects[0]?.getAttribute("fill")).not.toBe(rects[3]?.getAttribute("fill"));
  });

  test("grouped mode gives same-row bars distinct slots of equal width", async () => {
    const { container } = renderBarChart();
    await screen.findByRole("img", { name: "Sales by quarter" });
    const rects = barRects(container);
    const revenueQ1 = rects[0]!;
    const profitQ1 = rects[3]!;
    expect(revenueQ1.getAttribute("width")).toBe(profitQ1.getAttribute("width"));
    expect(Number(revenueQ1.getAttribute("x"))).toBeLessThan(Number(profitQ1.getAttribute("x")));
    // Same row, so both rects share the zero baseline.
    expect(
      Number(revenueQ1.getAttribute("y")) + Number(revenueQ1.getAttribute("height")),
    ).toBeCloseTo(Number(profitQ1.getAttribute("y")) + Number(profitQ1.getAttribute("height")), 5);
  });

  test("stacked mode accumulates series within the full band", async () => {
    const { container } = renderBarChart({ stacked: true });
    await screen.findByRole("img", { name: "Sales by quarter" });
    const rects = barRects(container);
    const revenueQ1 = rects[0]!;
    const profitQ1 = rects[3]!;
    expect(revenueQ1.getAttribute("width")).toBe(profitQ1.getAttribute("width"));
    expect(revenueQ1.getAttribute("x")).toBe(profitQ1.getAttribute("x"));
    // The second series sits on top of the first (smaller y in SVG coords).
    expect(Number(profitQ1.getAttribute("y"))).toBeLessThan(Number(revenueQ1.getAttribute("y")));
  });

  test("skips gap cells instead of rendering zero bars", async () => {
    const { container } = render(() => (
      <BarChart
        width={400}
        height={300}
        dataset={gappedDatasetFixture()}
        series={seriesFixture()}
        ariaLabel="Sales by quarter"
      />
    ));
    await screen.findByRole("img", { name: "Sales by quarter" });
    const rects = barRects(container);
    expect(rects).toHaveLength(5);
    const labels = rects.map((r) => r.getAttribute("aria-label"));
    expect(labels).not.toContain("Profit, Q2: 0");
    expect(labels).toContain("Revenue, Q2: 150");
  });

  test("applies the radius prop to every bar", async () => {
    const { container } = renderBarChart({ radius: 4 });
    await screen.findByRole("img", { name: "Sales by quarter" });
    for (const rect of barRects(container)) {
      expect(rect.getAttribute("rx")).toBe("4");
    }
  });

  test("click selects the bar and reports the item", async () => {
    const onItemClick = vi.fn();
    const { container } = renderBarChart({ onItemClick });
    await screen.findByRole("img", { name: "Sales by quarter" });
    const rects = barRects(container);
    fireEvent.click(rects[1]!);
    expect(onItemClick).toHaveBeenCalledTimes(1);
    expect(onItemClick.mock.calls[0]?.[0]).toEqual({
      seriesId: "revenue",
      rowIndex: 1,
    });
  });

  test("renders row labels on the x axis", async () => {
    renderBarChart();
    await screen.findByRole("img", { name: "Sales by quarter" });
    for (const label of ["Q1", "Q2", "Q3"]) {
      await screen.findByText(label);
    }
  });
});
