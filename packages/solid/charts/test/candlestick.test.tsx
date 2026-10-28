import { fireEvent, render, screen, within } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { flush } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  CandlestickChart,
  CandlestickTooltip,
  Candlesticks,
  ChartContainer,
  ChartSurface,
} from "../src/index";
import type { CandlestickTooltipContent, Dataset } from "../src/index";

function ohlcDataset(): Dataset {
  return [
    { date: "Mon", open: 100, high: 130, low: 90, close: 120 },
    { date: "Tue", open: 120, high: 140, low: 100, close: 105 },
    { date: "Wed", open: 105, high: 110, low: 80, close: 85 },
  ];
}

/** All candle groups in row order. */
function candles(container: HTMLElement): SVGGElement[] {
  return Array.from(container.querySelectorAll('g[role="img"]'));
}

function renderCandlestickChart(extra: Record<string, unknown> = {}) {
  return render(() => (
    <CandlestickChart
      width={400}
      height={300}
      dataset={ohlcDataset()}
      labelKey="date"
      ariaLabel="Weekly price candles"
      {...extra}
    />
  ));
}

describe("CandlestickChart", () => {
  test("renders one focusable candle group per row with all four prices", async () => {
    const { container } = renderCandlestickChart();
    await screen.findByRole("img", { name: "Weekly price candles" });
    const groups = candles(container).filter((g) => g.hasAttribute("data-candle-direction"));
    expect(groups).toHaveLength(3);
    expect(groups[0]?.getAttribute("aria-label")).toBe(
      "Mon, open 100, high 130, low 90, close 120",
    );
    for (const group of groups) {
      expect(group.getAttribute("tabindex")).toBe("0");
    }
    // Monday closed up (bullish), the others closed down (bearish).
    expect(groups[0]?.getAttribute("data-candle-direction")).toBe("up");
    expect(groups[1]?.getAttribute("data-candle-direction")).toBe("down");
    expect(groups[2]?.getAttribute("data-candle-direction")).toBe("down");
    const wicks = container.querySelectorAll('g[data-candle-direction] > line[stroke-width="1.5"]');
    expect(wicks.length).toBeGreaterThanOrEqual(3);
    const bodies = container.querySelectorAll('g[data-candle-direction] > rect[fill="#16a34a"]');
    expect(bodies).toHaveLength(1);
  });

  test("skips rows missing any OHLC value", async () => {
    const dataset: Dataset = [...ohlcDataset(), { date: "Thu", open: 85, high: 95, low: 75 }];
    const { container } = renderCandlestickChart({ dataset });
    await screen.findByRole("img", { name: "Weekly price candles" });
    const groups = candles(container).filter((g) => g.hasAttribute("data-candle-direction"));
    expect(groups).toHaveLength(3);
  });
});

describe("CandlestickTooltip", () => {
  function renderTooltip(children?: (content: CandlestickTooltipContent) => JSX.Element) {
    return render(() => (
      <ChartContainer
        width={400}
        height={300}
        dataset={ohlcDataset()}
        labelKey="date"
        series={[{ id: "candlestick", label: "Price", valueKey: "close" }]}
      >
        <ChartSurface ariaLabel="Weekly price candles">
          <Candlesticks />
        </ChartSurface>
        <CandlestickTooltip>{children}</CandlestickTooltip>
      </ChartContainer>
    ));
  }

  test("renders all four OHLC prices for the highlighted candle", async () => {
    const { container } = renderTooltip();
    await screen.findByRole("img", { name: "Weekly price candles" });
    expect(container.querySelector("dl")).toBeNull();
    const groups = Array.from(container.querySelectorAll("g[data-candle-direction]"));
    fireEvent.focusIn(groups[1]!);
    await flush();
    const tooltip = within(container.querySelector("dl")!);
    await tooltip.findByText("Tue");
    for (const [term, value] of [
      ["Open", "120"],
      ["High", "140"],
      ["Low", "100"],
      ["Close", "105"],
    ]) {
      await tooltip.findByText(term);
      await tooltip.findByText(value);
    }
  });

  test("render prop receives the OHLC content", async () => {
    const { container } = renderTooltip((content) => (
      <p>{`${content.label}: ${content.open}/${content.high}/${content.low}/${content.close}`}</p>
    ));
    await screen.findByRole("img", { name: "Weekly price candles" });
    const groups = Array.from(container.querySelectorAll("g[data-candle-direction]"));
    fireEvent.focusIn(groups[0]!);
    await flush();
    await screen.findByText("Mon: 100/130/90/120");
  });
});
