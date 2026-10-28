import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { createSignal, flush } from "solid-js";
import { SparkLineChart, type ChartItemRef } from "../src/index";
import { datasetFixture, seriesFixture } from "./fixture";

function renderSparkline(extra: Record<string, unknown> = {}) {
  return render(() => (
    <SparkLineChart
      width={120}
      height={32}
      dataset={datasetFixture()}
      series={seriesFixture()}
      {...extra}
    />
  ));
}

describe("SparkLineChart", () => {
  test("renders one line path per series plus an end dot", async () => {
    const { container } = renderSparkline();
    await screen.findByRole("img", { name: "Sparkline chart with 3 points" });
    const paths = Array.from(container.querySelectorAll("path"));
    expect(paths).toHaveLength(2);
    for (const path of paths) {
      expect(path.getAttribute("fill")).toBe("none");
      expect(path.getAttribute("d")).toBeTruthy();
    }
    const dots = Array.from(container.querySelectorAll("circle"));
    expect(dots).toHaveLength(1);
    expect(dots[0]?.getAttribute("r")).toBe("2.5");
  });

  test("area renders one fill path per series in addition to the lines", async () => {
    const { container } = renderSparkline({ area: true });
    await screen.findByRole("img", { name: "Sparkline chart with 3 points" });
    const paths = Array.from(container.querySelectorAll("path"));
    expect(paths).toHaveLength(4);
    const fills = paths.filter((path) => path.getAttribute("fill") !== "none");
    expect(fills).toHaveLength(2);
    for (const fill of fills) {
      expect(fill.getAttribute("fill-opacity")).toBe("0.25");
    }
  });

  test("end dot sits on the last defined point and can be hidden", async () => {
    const { container, unmount } = renderSparkline({
      dataset: [{ label: "Q1", revenue: 100 }, { label: "Q2", revenue: 200 }, { label: "Q3" }],
      series: [{ id: "revenue", label: "Revenue", valueKey: "revenue" }],
    });
    await screen.findByRole("img", { name: "Sparkline chart with 3 points" });
    const dots = Array.from(container.querySelectorAll("circle"));
    expect(dots).toHaveLength(1);
    // Q3 is a gap, so the dot sits on Q2: the second band center of the
    // 112px plot area with 4px margins.
    const band = (120 - 8) / 3;
    expect(Number(dots[0]?.getAttribute("cx"))).toBeCloseTo(band * 1.5, 1);
    unmount();
    const hidden = renderSparkline({ showEndDot: false });
    await screen.findByRole("img", { name: "Sparkline chart with 3 points" });
    expect(hidden.container.querySelectorAll("circle")).toHaveLength(0);
    hidden.unmount();
  });

  test("highlight dot follows the highlighted row", async () => {
    const [hl, setHl] = createSignal<ChartItemRef | null>({ seriesId: "revenue", rowIndex: 0 });
    const { container } = render(() => (
      <SparkLineChart
        width={120}
        height={32}
        dataset={datasetFixture()}
        series={seriesFixture()}
        highlighted={hl()}
        showHighlight
      />
    ));
    await screen.findByRole("img", { name: "Sparkline chart with 3 points" });
    // d3 band scale with padding 0.2 over the 112px plot: step 35, first
    // band starts at 7 with bandwidth 28.
    const center = (index: number) => 7 + 35 * index + 14;
    const dot = () => container.querySelector('circle[r="3"]');
    expect(Number(dot()?.getAttribute("cx"))).toBeCloseTo(center(0), 1);
    setHl({ seriesId: "revenue", rowIndex: 2 });
    await flush();
    expect(Number(dot()?.getAttribute("cx"))).toBeCloseTo(center(2), 1);
  });
});
