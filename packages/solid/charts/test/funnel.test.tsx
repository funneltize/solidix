import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { ChartsFunnelChart } from "../src/index";

const stages = ["Visit", "Signup", "Pay"];
const values = [100, 50, 25];

/** All funnel stage polygons in render order. */
function stagePolygons(container: HTMLElement): SVGPolygonElement[] {
  return Array.from(container.querySelectorAll("polygon[data-stage]"));
}

describe("ChartsFunnelChart", () => {
  test("renders one polygon per stage with the accessible group label", async () => {
    const { container } = render(() => (
      <ChartsFunnelChart width={400} height={300} stages={stages} values={values} />
    ));

    await screen.findByRole("img", { name: "Funnel chart with 3 stages" });
    expect(stagePolygons(container)).toHaveLength(3);
  });

  test("labels stages with value and conversion", async () => {
    const { container } = render(() => (
      <ChartsFunnelChart width={400} height={300} stages={stages} values={values} />
    ));

    await screen.findByRole("img", { name: "Funnel chart with 3 stages" });
    const polygons = stagePolygons(container);
    expect(polygons[0]?.getAttribute("aria-label")).toBe("Visit: 100 (first stage)");
    expect(polygons[1]?.getAttribute("aria-label")).toBe("Signup: 50 (50% of previous)");
    expect(polygons[2]?.getAttribute("aria-label")).toBe("Pay: 25 (50% of previous)");
    expect(polygons[1]?.getAttribute("data-row-index")).toBe("1");
  });

  test("renders trapezoids as four-point polygons", async () => {
    const { container } = render(() => (
      <ChartsFunnelChart width={400} height={300} stages={stages} values={values} />
    ));

    await screen.findByRole("img", { name: "Funnel chart with 3 stages" });
    for (const polygon of stagePolygons(container)) {
      const points = (polygon.getAttribute("points") ?? "").trim().split(/\s+/);
      expect(points).toHaveLength(4);
    }
  });

  test("renders a horizontal funnel", async () => {
    const { container } = render(() => (
      <ChartsFunnelChart
        width={400}
        height={300}
        stages={stages}
        values={values}
        orientation="horizontal"
      />
    ));

    await screen.findByRole("img", { name: "Funnel chart with 3 stages" });
    expect(stagePolygons(container)).toHaveLength(3);
  });

  test("labels an empty funnel", async () => {
    render(() => <ChartsFunnelChart width={400} height={300} stages={[]} values={[]} />);

    await screen.findByRole("img", { name: "Empty funnel chart" });
  });
});
