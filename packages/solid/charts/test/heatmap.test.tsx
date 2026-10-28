import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { ChartsHeatmap } from "../src/index";

const xLabels = ["Q1", "Q2"];
const yLabels = ["Revenue", "Profit"];
const values = [
  [10, 20],
  [30, null],
];

/** All heatmap cell rects in render order (row-major over x, then y). */
function cellRects(container: HTMLElement): SVGRectElement[] {
  return Array.from(container.querySelectorAll('g[data-series-id="heatmap"] rect'));
}

describe("ChartsHeatmap", () => {
  test("renders one rect per cell with the accessible group label", async () => {
    const { container } = render(() => (
      <ChartsHeatmap width={400} height={300} xLabels={xLabels} yLabels={yLabels} values={values} />
    ));

    await screen.findByRole("img", { name: "Heatmap with 4 cells" });
    expect(cellRects(container)).toHaveLength(4);
  });

  test("labels cells with coordinates and value", async () => {
    const { container } = render(() => (
      <ChartsHeatmap width={400} height={300} xLabels={xLabels} yLabels={yLabels} values={values} />
    ));

    await screen.findByRole("img", { name: "Heatmap with 4 cells" });
    const rects = cellRects(container);
    expect(rects[0]?.getAttribute("aria-label")).toBe("Q1, Revenue: 10");
    expect(rects[0]?.getAttribute("data-x")).toBe("Q1");
    expect(rects[0]?.getAttribute("data-y")).toBe("Revenue");
  });

  test("renders gaps with the null fill and a no-data label", async () => {
    const { container } = render(() => (
      <ChartsHeatmap width={400} height={300} xLabels={xLabels} yLabels={yLabels} values={values} />
    ));

    await screen.findByRole("img", { name: "Heatmap with 4 cells" });
    const gap = container.querySelector(
      'rect[data-x="Q2"][data-y="Profit"]',
    ) as SVGRectElement | null;
    expect(gap?.getAttribute("fill")).toBe("transparent");
    expect(gap?.getAttribute("aria-label")).toBe("Q2, Profit: no data");
  });

  test("honors a custom color scale", async () => {
    const { container } = render(() => (
      <ChartsHeatmap
        width={400}
        height={300}
        xLabels={xLabels}
        yLabels={yLabels}
        values={values}
        colorScale={() => "#ff0000"}
      />
    ));

    await screen.findByRole("img", { name: "Heatmap with 4 cells" });
    const rects = cellRects(container);
    expect(rects[0]?.getAttribute("fill")).toBe("#ff0000");
  });

  test("renders keyboard-focusable cells", async () => {
    const { container } = render(() => (
      <ChartsHeatmap width={400} height={300} xLabels={xLabels} yLabels={yLabels} values={values} />
    ));

    await screen.findByRole("img", { name: "Heatmap with 4 cells" });
    for (const rect of cellRects(container)) {
      expect(rect.getAttribute("tabindex")).toBe("0");
    }
  });

  test("labels an empty heatmap", async () => {
    render(() => <ChartsHeatmap width={400} height={300} xLabels={[]} yLabels={[]} values={[]} />);

    await screen.findByRole("img", { name: "Empty heatmap" });
  });
});
