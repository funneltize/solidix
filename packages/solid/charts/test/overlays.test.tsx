import { fireEvent, render, screen, within } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { flush } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  Bars,
  ChartContainer,
  ChartsHighlightTracker,
  ChartsLegend,
  ChartSurface,
  ChartsTooltip,
  useHighlight,
  type ChartItemRef,
} from "../src/index";
import { datasetFixture, seriesFixture } from "./fixture";

function renderChart(children: () => JSX.Element, extra: Record<string, unknown> = {}) {
  return render(() => (
    <ChartContainer
      width={400}
      height={300}
      dataset={datasetFixture()}
      series={seriesFixture()}
      {...extra}
    >
      {children()}
    </ChartContainer>
  ));
}

describe("tooltip", () => {
  test("renders the highlighted row as a definition list", async () => {
    renderChart(() => (
      <>
        <ChartSurface ariaLabel="Sales by quarter">
          <Bars />
        </ChartSurface>
        <ChartsTooltip />
      </>
    ));
    await screen.findByRole("img", { name: "Sales by quarter" });
    // Nothing highlighted yet, so no tooltip term is present.
    expect(screen.queryByText("Q2")).toBeNull();
    const bars = document.querySelectorAll('rect[role="img"]');
    fireEvent.focus(bars[1]!);
    await flush();
    // Focus on the second revenue bar highlights row 1 (Q2).
    await screen.findByText("Q2");
    await screen.findByText("Revenue");
    await screen.findByText("150");
    await screen.findByText("Profit");
    await screen.findByText("45");
  });

  test("follows the highlight across rows and legend toggles", async () => {
    const { container } = renderChart(() => (
      <>
        <ChartSurface ariaLabel="Sales by quarter">
          <Bars />
        </ChartSurface>
        <ChartsTooltip />
        <ChartsLegend />
      </>
    ));
    // Scope to the tooltip list: the legend keeps its own Profit button.
    const tooltip = () => within(container.querySelector("dl")!);
    await screen.findByRole("img", { name: "Sales by quarter" });
    const bars = document.querySelectorAll('rect[role="img"]');
    fireEvent.focus(bars[1]!);
    await flush();
    await tooltip().findByText("Q2");
    fireEvent.focus(bars[2]!);
    await flush();
    await tooltip().findByText("Q3");
    expect(tooltip().queryByText("Q2")).toBeNull();
    // Hiding Profit drops its row from the tooltip without touching highlight.
    fireEvent.click(await screen.findByRole("button", { name: "Profit" }));
    await flush();
    await vi.waitFor(() => {
      expect(tooltip().queryByText("Profit")).toBeNull();
    });
    await tooltip().findByText("Revenue");
  });

  test("supports a custom render prop", async () => {
    renderChart(() => (
      <>
        <ChartSurface ariaLabel="Sales by quarter">
          <Bars />
        </ChartSurface>
        <ChartsTooltip>{(entry) => <p>{`Custom: ${entry.label}`}</p>}</ChartsTooltip>
      </>
    ));
    await screen.findByRole("img", { name: "Sales by quarter" });
    const bars = document.querySelectorAll('rect[role="img"]');
    fireEvent.focus(bars[0]!);
    await flush();
    await screen.findByText("Custom: Q1");
  });
});

describe("ChartsHighlightTracker", () => {
  test("pointer movement resolves and clears the highlighted item", async () => {
    const resolveItem = vi.fn((_point: { x: number; y: number }): ChartItemRef => ({
      seriesId: "profit",
      rowIndex: 2,
    }));
    renderChart(() => (
      <>
        <ChartSurface ariaLabel="Sales by quarter">
          <Bars />
        </ChartSurface>
        <ChartsTooltip />
        <ChartsHighlightTracker data-testid="tracker" resolveItem={resolveItem} />
      </>
    ));
    const tracker = await screen.findByTestId("tracker");
    fireEvent.pointerMove(tracker, { clientX: 50, clientY: 60 });
    expect(resolveItem).toHaveBeenCalledTimes(1);
    expect(resolveItem.mock.calls[0]?.[0]).toEqual({ x: 50, y: 60 });
    await flush();
    await screen.findByText("Q3");
    fireEvent.pointerLeave(tracker);
    await flush();
    await vi.waitFor(() => {
      expect(screen.queryByText("Q3")).toBeNull();
    });
  });
});

describe("useHighlight", () => {
  test("highlight and isHighlighted drive shared state", async () => {
    const Probe = () => {
      const { highlight, isHighlighted } = useHighlight();
      return (
        <button
          type="button"
          data-testid="probe"
          data-active={String(isHighlighted({ seriesId: "revenue", rowIndex: 0 }))}
          onClick={() => highlight({ seriesId: "revenue", rowIndex: 0 })}
        >
          probe
        </button>
      );
    };
    renderChart(() => (
      <>
        <ChartSurface ariaLabel="Sales by quarter">
          <Bars />
        </ChartSurface>
        <ChartsTooltip />
        <Probe />
      </>
    ));
    const probe = await screen.findByTestId("probe");
    expect(probe.getAttribute("data-active")).toBe("false");
    fireEvent.click(probe);
    await flush();
    await vi.waitFor(() => {
      expect(probe.getAttribute("data-active")).toBe("true");
    });
    await screen.findByText("Q1");
  });
});

describe("ChartsLegend", () => {
  test("custom onToggleSeries handler receives the series id", async () => {
    const onToggleSeries = vi.fn();
    renderChart(() => <ChartsLegend data-testid="legend" onToggleSeries={onToggleSeries} />, {});
    const toggle = await screen.findByRole("button", { name: "Profit" });
    fireEvent.click(toggle);
    expect(onToggleSeries).toHaveBeenCalledTimes(1);
    expect(onToggleSeries.mock.calls[0]?.[0]).toBe("profit");
  });
});
