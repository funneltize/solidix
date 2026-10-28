import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Gauge } from "../src/index";

function renderGauge(extra: Record<string, unknown> = {}) {
  return render(() => <Gauge value={60} text="60%" {...extra} />);
}

describe("Gauge", () => {
  test("announces as a meter with track, value, pointer, and text", async () => {
    const { container } = renderGauge();
    const meter = await screen.findByRole("meter", { name: "Gauge showing 60 out of 0 to 100" });
    expect(meter.getAttribute("aria-valuemin")).toBe("0");
    expect(meter.getAttribute("aria-valuemax")).toBe("100");
    expect(meter.getAttribute("aria-valuenow")).toBe("60");
    expect(container.querySelector("[data-chart-gauge-track]")).not.toBeNull();
    expect(container.querySelector("[data-chart-gauge-value]")).not.toBeNull();
    expect(container.querySelector("[data-chart-gauge-pointer]")).not.toBeNull();
    expect(container.querySelector("[data-chart-gauge-text]")?.textContent).toBe("60%");
  });

  test("clamps the value arc to the dial span", async () => {
    const { container, unmount } = renderGauge({ value: 150 });
    await screen.findByRole("meter");
    const track = container.querySelector("[data-chart-gauge-track]")!;
    const value = container.querySelector("[data-chart-gauge-value]")!;
    // Above max fills the full dial, so the arcs match exactly.
    expect(value.getAttribute("d")).toBe(track.getAttribute("d"));
    unmount();
    const below = renderGauge({ value: -10 });
    await screen.findByRole("meter");
    const belowValue = below.container.querySelector("[data-chart-gauge-value]")!;
    // Below min collapses to a dot-sized path at the start angle.
    expect(belowValue.getAttribute("d")).toMatch(/^M [^ ]+ [^ ]+ L /);
    below.unmount();
  });

  test("pointer can be hidden", async () => {
    const { container } = renderGauge({ showPointer: false });
    await screen.findByRole("meter");
    expect(container.querySelector("[data-chart-gauge-pointer]")).toBeNull();
    expect(container.querySelector("[data-chart-gauge-value]")).not.toBeNull();
  });

  test("bar variant fills proportionally with no pointer", async () => {
    const { container } = renderGauge({ variant: "bar", width: 200, height: 20 });
    const meter = await screen.findByRole("meter", { name: "Gauge showing 60 out of 0 to 100" });
    expect(meter.getAttribute("data-variant")).toBe("bar");
    const track = container.querySelector("[data-chart-gauge-track]")!;
    const value = container.querySelector("[data-chart-gauge-value]")!;
    expect(track.tagName).toBe("rect");
    expect(value.tagName).toBe("rect");
    expect(Number(track.getAttribute("width"))).toBe(200);
    // 60% of the 200px track.
    expect(Number(value.getAttribute("width"))).toBeCloseTo(120, 5);
    expect(container.querySelector("[data-chart-gauge-pointer]")).toBeNull();
  });

  test("vertical bar fills bottom to top", async () => {
    const { container } = renderGauge({
      variant: "bar",
      orientation: "vertical",
      width: 20,
      height: 200,
    });
    await screen.findByRole("meter");
    const track = container.querySelector("[data-chart-gauge-track]")!;
    const value = container.querySelector("[data-chart-gauge-value]")!;
    expect(Number(track.getAttribute("height"))).toBe(200);
    expect(Number(value.getAttribute("height"))).toBeCloseTo(120, 5);
    // The fill sits on the track bottom edge.
    expect(Number(value.getAttribute("y"))).toBeCloseTo(80, 5);
  });
});
