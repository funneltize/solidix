import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { ChartsSankeyChart } from "../src/index";

const nodes = [
  { id: "a", label: "A" },
  { id: "b", label: "B" },
  { id: "c", label: "C" },
];
const links = [
  { source: "a", target: "b", value: 10 },
  { source: "b", target: "c", value: 5 },
];

/** All sankey node rects in render order. */
function nodeRects(container: HTMLElement): SVGRectElement[] {
  return Array.from(container.querySelectorAll("rect[data-node-id]"));
}

/** All sankey link paths in render order. */
function linkPaths(container: HTMLElement): SVGPathElement[] {
  return Array.from(container.querySelectorAll('g[data-series-id="sankey-links"] path'));
}

describe("ChartsSankeyChart", () => {
  test("renders one rect per node with the accessible group label", async () => {
    const { container } = render(() => (
      <ChartsSankeyChart width={400} height={300} nodes={nodes} links={links} />
    ));

    await screen.findByRole("img", { name: "Sankey chart with 3 nodes" });
    expect(nodeRects(container)).toHaveLength(3);
  });

  test("labels nodes with their flow value", async () => {
    const { container } = render(() => (
      <ChartsSankeyChart width={400} height={300} nodes={nodes} links={links} />
    ));

    await screen.findByRole("img", { name: "Sankey chart with 3 nodes" });
    const rects = nodeRects(container);
    expect(rects[0]?.getAttribute("aria-label")).toBe("A: 10");
    expect(rects[0]?.getAttribute("data-node-id")).toBe("a");
    expect(rects[1]?.getAttribute("aria-label")).toContain("B:");
  });

  test("renders one ribbon per link with a tooltip title", async () => {
    const { container } = render(() => (
      <ChartsSankeyChart width={400} height={300} nodes={nodes} links={links} />
    ));

    await screen.findByRole("img", { name: "Sankey chart with 3 nodes" });
    const paths = linkPaths(container);
    expect(paths).toHaveLength(2);
    expect(paths[0]?.querySelector("title")?.textContent).toBe("A to B: 10");
    expect(paths[1]?.querySelector("title")?.textContent).toBe("B to C: 5");
  });

  test("draws ribbons as cubic curves", async () => {
    const { container } = render(() => (
      <ChartsSankeyChart width={400} height={300} nodes={nodes} links={links} />
    ));

    await screen.findByRole("img", { name: "Sankey chart with 3 nodes" });
    for (const path of linkPaths(container)) {
      const d = path.getAttribute("d") ?? "";
      expect(d.startsWith("M")).toBe(true);
      expect(d).toContain("C");
    }
  });

  test("honors the link opacity prop", async () => {
    const { container } = render(() => (
      <ChartsSankeyChart width={400} height={300} nodes={nodes} links={links} linkOpacity={0.5} />
    ));

    await screen.findByRole("img", { name: "Sankey chart with 3 nodes" });
    expect(linkPaths(container)[0]?.getAttribute("stroke-opacity")).toBe("0.5");
  });
});
