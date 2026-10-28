import { fireEvent, render, screen } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { PieChart } from "../src/index";
import { datasetFixture, seriesFixture } from "./fixture";

/** All pie slices in render order (row order of the first series). */
function pieSlices(container: HTMLElement): SVGPathElement[] {
  return Array.from(container.querySelectorAll('path[role="img"]'));
}

function renderPieChart(extra: Record<string, unknown> = {}) {
  return render(() => (
    <PieChart
      width={400}
      height={300}
      dataset={datasetFixture()}
      series={seriesFixture()}
      ariaLabel="Sales mix"
      {...extra}
    />
  ));
}

describe("PieChart", () => {
  test("renders one focusable slice per row of the first series", async () => {
    const { container } = renderPieChart();
    await screen.findByRole("img", { name: "Sales mix" });
    const slices = pieSlices(container);
    expect(slices).toHaveLength(3);
    expect(slices[0]?.getAttribute("aria-label")).toBe("Q1: 120");
    expect(slices[1]?.getAttribute("aria-label")).toBe("Q2: 150");
    expect(slices[2]?.getAttribute("aria-label")).toBe("Q3: 90");
    for (const slice of slices) {
      expect(slice.getAttribute("tabindex")).toBe("0");
      expect(slice.getAttribute("d")).toMatch(/^M/);
    }
    // Slices use distinct per-row palette colors.
    const fills = slices.map((slice) => slice.getAttribute("fill"));
    expect(new Set(fills).size).toBe(3);
  });

  test("skips rows with missing, zero, or negative values", async () => {
    const { container } = renderPieChart({
      dataset: [
        { label: "A", revenue: 100 },
        { label: "B", revenue: 0 },
        { label: "C", revenue: -5 },
        { label: "D" },
      ],
      series: [{ id: "revenue", label: "Revenue", valueKey: "revenue" }],
    });
    await screen.findByRole("img", { name: "Sales mix" });
    const slices = pieSlices(container);
    expect(slices).toHaveLength(1);
    expect(slices[0]?.getAttribute("aria-label")).toBe("A: 100");
  });

  test("focus highlights the slice", async () => {
    const { container } = renderPieChart();
    await screen.findByRole("img", { name: "Sales mix" });
    const slices = pieSlices(container);
    const first = slices[0]!;
    expect(first.getAttribute("opacity")).toBe("0.85");
    fireEvent.focus(first);
    await vi.waitFor(() => expect(first.getAttribute("opacity")).toBe("1"));
    fireEvent.blur(first);
    await vi.waitFor(() => expect(first.getAttribute("opacity")).toBe("0.85"));
  });
});
