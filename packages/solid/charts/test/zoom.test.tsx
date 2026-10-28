import { fireEvent, render, screen } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import {
  BarChart,
  Bars,
  ChartContainer,
  ChartSurface,
  ChartsBrush,
  ChartsZoomControls,
  clampZoomWindow,
  panWindow,
  zoomInWindow,
  zoomOutWindow,
} from "../src/index";
import { datasetFixture, seriesFixture } from "./fixture";

/** All bar rects in render order. */
function barRects(container: HTMLElement): SVGRectElement[] {
  return Array.from(container.querySelectorAll('rect[role="img"]'));
}

describe("zoom window helpers", () => {
  test("zoomInWindow centers a window on a full view", () => {
    const window = zoomInWindow(null)!;
    expect(window.start).toBeGreaterThan(0);
    expect(window.end).toBeLessThan(1);
    expect(window.start).toBeLessThan(window.end);
  });

  test("zoomInWindow shrinks around the center", () => {
    const window = zoomInWindow({ start: 0, end: 1 })!;
    const span = window.end - window.start;
    expect(span).toBeLessThan(1);
    expect(window.start + window.end).toBeCloseTo(1, 5);
  });

  test("zoomOutWindow on a full view stays a full view", () => {
    expect(zoomOutWindow(null)).toBeNull();
    expect(zoomOutWindow({ start: 0, end: 1 })).toBeNull();
  });

  test("zoomOutWindow grows around the center", () => {
    const window = zoomOutWindow({ start: 0.25, end: 0.75 });
    expect(window).not.toBeNull();
    expect(window!.end - window!.start).toBeGreaterThan(0.5);
  });

  test("panWindow on a full view stays a full view", () => {
    expect(panWindow(null, 1)).toBeNull();
  });

  test("panWindow shifts while keeping the span", () => {
    const window = panWindow({ start: 0.2, end: 0.6 }, 1);
    expect(window!.start).toBeGreaterThan(0.2);
    expect(window!.end - window!.start).toBeCloseTo(0.4, 5);
  });

  test("clampZoomWindow sorts and clamps to the unit range", () => {
    expect(clampZoomWindow({ start: 0.8, end: 0.2 })).toEqual({
      start: 0.2,
      end: 0.8,
    });
    expect(clampZoomWindow({ start: -1, end: 2 })).toEqual({ start: 0, end: 1 });
  });
});

describe("ChartsZoomControls", () => {
  function renderZoomable() {
    return render(() => (
      <ChartContainer width={400} height={300} dataset={datasetFixture()} series={seriesFixture()}>
        <ChartsZoomControls />
        <ChartSurface>
          <Bars />
        </ChartSurface>
      </ChartContainer>
    ));
  }

  function isDisabled(el: HTMLElement | null): boolean {
    return el?.getAttribute("disabled") !== null;
  }

  test("disables zoom-out, pan, and reset on a full view", async () => {
    renderZoomable();

    await screen.findByRole("group", { name: "Chart zoom controls" });
    // Zoom-in stays enabled: it is the keyboard path into a zoomed view.
    expect(isDisabled(screen.getByRole("button", { name: "Zoom in" }))).toBe(false);
    for (const name of ["Zoom out", "Pan left", "Pan right", "Reset"]) {
      expect(isDisabled(screen.getByRole("button", { name }))).toBe(true);
    }
  });

  test("zoom in narrows the visible rows and reset restores them", async () => {
    const { container } = renderZoomable();

    await screen.findByRole("group", { name: "Chart zoom controls" });
    expect(barRects(container)).toHaveLength(6);

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    await vi.waitFor(() => {
      expect(barRects(container).length).toBeLessThan(6);
      expect(barRects(container).length).toBeGreaterThan(0);
    });
    expect(isDisabled(screen.getByRole("button", { name: "Reset" }))).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    await vi.waitFor(() => {
      expect(barRects(container)).toHaveLength(6);
    });
    expect(isDisabled(screen.getByRole("button", { name: "Reset" }))).toBe(true);
  });

  test("pan keeps the zoom window active", async () => {
    const { container } = renderZoomable();

    await screen.findByRole("group", { name: "Chart zoom controls" });
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    await vi.waitFor(() => {
      expect(barRects(container).length).toBeLessThan(6);
    });

    fireEvent.click(screen.getByRole("button", { name: "Pan right" }));
    await vi.waitFor(() => {
      expect(barRects(container).length).toBeGreaterThan(0);
    });
    expect(isDisabled(screen.getByRole("button", { name: "Reset" }))).toBe(false);
  });
});

describe("ChartsBrush", () => {
  /** jsdom has no layout, so the svg reports the chart size. */
  function stubSvgRect(container: HTMLElement): void {
    const svg = container.querySelector("svg");
    if (!svg) throw new Error("expected a rendered svg");
    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 400,
      bottom: 300,
      width: 400,
      height: 300,
      toJSON: () => {},
    } as DOMRect);
  }

  function renderBrushed() {
    const rendered = render(() => (
      <BarChart width={400} height={300} dataset={datasetFixture()} series={seriesFixture()}>
        <ChartsBrush />
      </BarChart>
    ));
    stubSvgRect(rendered.container);
    return rendered;
  }

  function overlay(container: HTMLElement): SVGRectElement {
    const el = container.querySelector("[data-charts-brush-overlay]");
    if (!el) throw new Error("expected a brush overlay");
    return el as SVGRectElement;
  }

  test("dragging a range narrows the visible rows", async () => {
    const { container } = renderBrushed();

    await screen.findByRole("img", { name: "Bar chart with 2 series" });
    expect(barRects(container)).toHaveLength(6);

    fireEvent.pointerDown(overlay(container), { clientX: 40 });
    fireEvent.pointerMove(overlay(container), { clientX: 160 });
    fireEvent.pointerUp(overlay(container), { clientX: 160 });

    await vi.waitFor(() => {
      expect(barRects(container).length).toBeLessThan(6);
      expect(barRects(container).length).toBeGreaterThan(0);
    });
    expect(container.querySelector("[data-charts-brush-selection]")).not.toBeNull();
  });

  test("tapping without a drag resets the zoom", async () => {
    const { container } = renderBrushed();

    await screen.findByRole("img", { name: "Bar chart with 2 series" });
    fireEvent.pointerDown(overlay(container), { clientX: 40 });
    fireEvent.pointerMove(overlay(container), { clientX: 160 });
    fireEvent.pointerUp(overlay(container), { clientX: 160 });
    await vi.waitFor(() => {
      expect(barRects(container).length).toBeLessThan(6);
    });

    fireEvent.pointerDown(overlay(container), { clientX: 100 });
    fireEvent.pointerUp(overlay(container), { clientX: 100 });
    await vi.waitFor(() => {
      expect(barRects(container)).toHaveLength(6);
    });
  });

  test("Escape resets the zoom", async () => {
    const { container } = renderBrushed();

    await screen.findByRole("img", { name: "Bar chart with 2 series" });
    fireEvent.pointerDown(overlay(container), { clientX: 40 });
    fireEvent.pointerMove(overlay(container), { clientX: 160 });
    fireEvent.pointerUp(overlay(container), { clientX: 160 });
    await vi.waitFor(() => {
      expect(barRects(container).length).toBeLessThan(6);
    });

    fireEvent.keyDown(overlay(container), { key: "Escape" });
    await vi.waitFor(() => {
      expect(barRects(container)).toHaveLength(6);
    });
  });
});
