import { For, Show, createMemo, omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  ChartContainer,
  ChartSurface,
  defaultFormatValue,
  useChartContext,
  type ChartContainerProps,
  type ScopedProps,
} from "../container";
import { ChartsGrid } from "../grid";
import { ChartsXAxis, ChartsYAxis } from "../axes";
import { toNumber, itemsEqual, type ChartItemRef } from "../types";

/**
 * Series id used by {@link CandlestickChart} for its synthetic close-price
 * series. Shared so {@link Candlesticks} highlight refs match the store.
 */
export const CANDLESTICK_SERIES_ID = "candlestick";

/** OHLC field keys for {@link Candlesticks} and {@link CandlestickChart}. */
export interface CandlestickKeys {
  /** Dataset key holding the open price. Defaults to `"open"`. */
  openKey?: string | undefined;
  /** Dataset key holding the high price. Defaults to `"high"`. */
  highKey?: string | undefined;
  /** Dataset key holding the low price. Defaults to `"low"`. */
  lowKey?: string | undefined;
  /** Dataset key holding the close price. Defaults to `"close"`. */
  closeKey?: string | undefined;
}

/** Props for {@link Candlesticks}. */
export interface CandlesticksProps extends CandlestickKeys {
  /** Series id carried on highlight refs. Defaults to `"candlestick"`. */
  seriesId?: string | undefined;
  /**
   * Body width as a fraction of the band width. Defaults to `0.6`.
   * The wick always spans the full high-low range.
   */
  bodyWidth?: number | undefined;
  /** Wick stroke width in pixels. Defaults to `1.5`. */
  wickWidth?: number | undefined;
  /** Fill for candles that closed up (`close >= open`). Defaults to green. */
  bullishColor?: string | undefined;
  /** Fill for candles that closed down (`close < open`). Defaults to red. */
  bearishColor?: string | undefined;
}

/** One resolved candle: row index plus its four prices. */
export interface CandleDatum {
  /** Index of the source row in the dataset. */
  rowIndex: number;
  /** Open price. */
  open: number;
  /** High price. */
  high: number;
  /** Low price. */
  low: number;
  /** Close price. */
  close: number;
}

/** Props for one candle glyph. */
interface CandleGlyphProps {
  /** Resolved candle datum. */
  candle: CandleDatum;
  /** Series id carried on highlight refs. */
  seriesId: string;
  /** Body width as a fraction of the band width. */
  bodyWidth: number;
  /** Wick stroke width in pixels. */
  wickWidth: number;
  /** Fill for candles that closed up. */
  bullish: string;
  /** Fill for candles that closed down. */
  bearish: string;
  /** Scope forwarded from the series component. */
  scope: Parameters<typeof useChartContext>[1];
}

/**
 * One focusable candle group. Store reads happen in JSX-bound functions so
 * zoom and highlight updates re-render the glyph (the `For` body that
 * creates glyphs runs untracked).
 */
function CandleGlyph(props: CandleGlyphProps): JSX.Element {
  const store = useChartContext("Candlesticks", props.scope);
  const ref = (): ChartItemRef => ({ seriesId: props.seriesId, rowIndex: props.candle.rowIndex });
  const highlighted = (): boolean => {
    const current = store.highlighted();
    return current !== null && current !== undefined && itemsEqual(current, ref());
  };
  const label = (): string => {
    const name = store.labels()[props.candle.rowIndex] ?? "";
    const c = props.candle;
    return `${name}, open ${c.open}, high ${c.high}, low ${c.low}, close ${c.close}`;
  };
  const cx = (): number => {
    const xScale = store.x();
    const base = xScale(store.labels()[props.candle.rowIndex] ?? "") ?? 0;
    return base + xScale.bandwidth() / 2;
  };
  const width = (): number => store.x().bandwidth() * props.bodyWidth;
  const yOpen = (): number => store.y()(props.candle.open);
  const yHigh = (): number => store.y()(props.candle.high);
  const yLow = (): number => store.y()(props.candle.low);
  const yClose = (): number => store.y()(props.candle.close);
  const up = (): boolean => props.candle.close >= props.candle.open;
  const color = (): string => (up() ? props.bullish : props.bearish);
  const top = (): number => Math.min(yOpen(), yClose());
  const height = (): number => Math.abs(yOpen() - yClose());
  const doji = (): boolean => props.candle.open === props.candle.close;
  return (
    <g
      role="img"
      aria-label={label()}
      tabindex={0}
      data-series-id={props.seriesId}
      data-row-index={props.candle.rowIndex}
      data-candle-direction={up() ? "up" : "down"}
      data-highlighted={highlighted() ? "" : undefined}
      opacity={highlighted() ? 1 : undefined}
      onMouseEnter={() => store.setHighlighted(ref())}
      onMouseLeave={() => store.setHighlighted(null)}
      onFocusIn={() => store.setHighlighted(ref())}
      onFocusOut={() => store.setHighlighted(null)}
      onClick={(event) => store.clickItem(ref(), event)}
    >
      <line
        x1={cx()}
        x2={cx()}
        y1={yHigh()}
        y2={yLow()}
        stroke={color()}
        stroke-width={props.wickWidth}
      />
      {doji() ? (
        <line
          x1={cx() - width() / 2}
          x2={cx() + width() / 2}
          y1={yClose()}
          y2={yClose()}
          stroke={color()}
          stroke-width={props.wickWidth}
        />
      ) : (
        <rect x={cx() - width() / 2} y={top()} width={width()} height={height()} fill={color()} />
      )}
    </g>
  );
}

/**
 * Candlestick bodies and wicks for the chart store. Rows missing any of
 * the four OHLC values are skipped. Each candle is a focusable group with
 * an `aria-label` naming all four prices; interaction state flows through
 * the store so `CandlestickTooltip` and selection stay in sync.
 */
export function Candlesticks(rawProps: ScopedProps<CandlesticksProps>): JSX.Element {
  const store = useChartContext("Candlesticks", rawProps.__scopeCharts);
  const keys = (): { openKey: string; highKey: string; lowKey: string; closeKey: string } => ({
    openKey: rawProps.openKey ?? "open",
    highKey: rawProps.highKey ?? "high",
    lowKey: rawProps.lowKey ?? "low",
    closeKey: rawProps.closeKey ?? "close",
  });
  const candles = (): CandleDatum[] => {
    const k = keys();
    const out: CandleDatum[] = [];
    const dataset = store.dataset();
    for (let rowIndex = 0; rowIndex < dataset.length; rowIndex += 1) {
      const row = dataset[rowIndex] as Record<string, unknown>;
      const open = toNumber(row[k.openKey]);
      const high = toNumber(row[k.highKey]);
      const low = toNumber(row[k.lowKey]);
      const close = toNumber(row[k.closeKey]);
      if (open === undefined || high === undefined || low === undefined || close === undefined)
        continue;
      out.push({ rowIndex, open, high, low, close });
    }
    return out;
  };

  return (
    <g data-charts-candles="">
      <For each={candles()}>
        {(candle) => (
          <CandleGlyph
            candle={candle}
            seriesId={rawProps.seriesId ?? CANDLESTICK_SERIES_ID}
            bodyWidth={rawProps.bodyWidth ?? 0.6}
            wickWidth={rawProps.wickWidth ?? 1.5}
            bullish={rawProps.bullishColor ?? "#16a34a"}
            bearish={rawProps.bearishColor ?? "#dc2626"}
            scope={rawProps.__scopeCharts}
          />
        )}
      </For>
    </g>
  );
}

/** Highlighted OHLC content passed to the tooltip render prop. */
export interface CandlestickTooltipContent {
  /** Category label of the highlighted row. */
  label: string;
  /** Highlighted dataset row index. */
  index: number;
  /** Open price, or `undefined` when the cell is missing. */
  open: number | undefined;
  /** High price, or `undefined` when the cell is missing. */
  high: number | undefined;
  /** Low price, or `undefined` when the cell is missing. */
  low: number | undefined;
  /** Close price, or `undefined` when the cell is missing. */
  close: number | undefined;
}

/** Props for {@link CandlestickTooltip}. */
export interface CandlestickTooltipProps extends CandlestickKeys {
  /**
   * Series id used for value formatting. Must match the chart's synthetic
   * series id. Defaults to `"candlestick"`.
   */
  seriesId?: string | undefined;
  /**
   * Render prop for the highlighted candle. Defaults to a definition list
   * with open, high, low, and close rows.
   */
  children?: ((content: CandlestickTooltipContent) => JSX.Element) | undefined;
}

/**
 * Headless tooltip content for candlestick charts: reads the highlighted row
 * and renders all four OHLC prices (the generic `ChartsTooltip` only sees
 * the synthetic close-price series). Position it next to the chart or inside
 * an overlay.
 */
export function CandlestickTooltip(rawProps: ScopedProps<CandlestickTooltipProps>): JSX.Element {
  const store = useChartContext("CandlestickTooltip", rawProps.__scopeCharts);
  const content = createMemo((): CandlestickTooltipContent | null => {
    const item = store.highlighted();
    if (!item || item.rowIndex < 0) return null;
    const row = store.dataset()[item.rowIndex] as Record<string, unknown> | undefined;
    if (!row) return null;
    return {
      label: store.labels()[item.rowIndex] ?? "",
      index: item.rowIndex,
      open: toNumber(row[rawProps.openKey ?? "open"]),
      high: toNumber(row[rawProps.highKey ?? "high"]),
      low: toNumber(row[rawProps.lowKey ?? "low"]),
      close: toNumber(row[rawProps.closeKey ?? "close"]),
    };
  });
  const series = createMemo(() => store.seriesById(rawProps.seriesId ?? CANDLESTICK_SERIES_ID));
  const text = (value: number | undefined): string => {
    const s = series();
    return s ? store.formatValue(value, s) : defaultFormatValue(value);
  };
  return (
    <Show when={content()} keyed>
      {(c) => {
        const render = rawProps.children;
        if (typeof render === "function") return <>{render(c)}</>;
        const rows: { label: string; value: number | undefined }[] = [
          { label: "Open", value: c.open },
          { label: "High", value: c.high },
          { label: "Low", value: c.low },
          { label: "Close", value: c.close },
        ];
        return (
          <dl>
            <dt>{c.label}</dt>
            {rows.map((row) => (
              <>
                <dt>{row.label}</dt>
                <dd>{text(row.value)}</dd>
              </>
            ))}
          </dl>
        );
      }}
    </Show>
  );
}

/**
 * Props for {@link CandlestickChart}. `series` is omitted: the chart builds
 * one synthetic close-price series internally so axes, tooltip, and legend
 * resolve through the standard store paths.
 */
export interface CandlestickChartProps
  extends CandlestickKeys, Omit<ChartContainerProps, "series"> {
  /** Series id for the synthetic series. Defaults to `"candlestick"`. */
  seriesId?: string | undefined;
  /** Label for the synthetic series. Defaults to `"Price"`. */
  seriesLabel?: string | undefined;
  /**
   * Body width as a fraction of the band width. Defaults to `0.6`.
   * The wick always spans the full high-low range.
   */
  bodyWidth?: number | undefined;
  /** Wick stroke width in pixels. Defaults to `1.5`. */
  wickWidth?: number | undefined;
  /** Fill for candles that closed up (`close >= open`). Defaults to green. */
  bullishColor?: string | undefined;
  /** Fill for candles that closed down (`close < open`). Defaults to red. */
  bearishColor?: string | undefined;
  /** Accessible name for the chart surface. */
  ariaLabel?: string | undefined;
  /** Plot children rendered after the candles (axes overlays, annotations). */
  children?: JSX.Element | undefined;
}

/**
 * Composed candlestick chart: container, surface, grid, candles, and axes.
 * The y domain spans the low-high extent of complete rows unless `yDomain`
 * overrides it. Rows missing any OHLC value render nothing. Pair with
 * {@link CandlestickTooltip} for full OHLC detail (the generic
 * `ChartsTooltip` only sees the synthetic close-price series).
 */
export function CandlestickChart(rawProps: ScopedProps<CandlestickChartProps>): JSX.Element {
  const containerProps = omit(
    rawProps,
    "__scopeCharts",
    "openKey",
    "highKey",
    "lowKey",
    "closeKey",
    "seriesId",
    "seriesLabel",
    "bodyWidth",
    "wickWidth",
    "bullishColor",
    "bearishColor",
    "ariaLabel",
    "children",
  );
  const seriesId = (): string => rawProps.seriesId ?? CANDLESTICK_SERIES_ID;
  const domain = (): readonly [number, number] | undefined => {
    if (rawProps.yDomain) return rawProps.yDomain;
    const openKey = rawProps.openKey ?? "open";
    const highKey = rawProps.highKey ?? "high";
    const lowKey = rawProps.lowKey ?? "low";
    const closeKey = rawProps.closeKey ?? "close";
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const row of rawProps.dataset ?? []) {
      const record = row as Record<string, unknown>;
      const open = toNumber(record[openKey]);
      const high = toNumber(record[highKey]);
      const low = toNumber(record[lowKey]);
      const close = toNumber(record[closeKey]);
      if (open === undefined || high === undefined || low === undefined || close === undefined)
        continue;
      if (low < min) min = low;
      if (high > max) max = high;
    }
    if (min === Number.POSITIVE_INFINITY) return undefined;
    if (min === max) {
      const pad = min === 0 ? 1 : Math.abs(min) * 0.1;
      return [min - pad, max + pad];
    }
    return [min, max];
  };
  const series = () => [
    {
      id: seriesId(),
      label: rawProps.seriesLabel ?? "Price",
      valueKey: rawProps.closeKey ?? "close",
    },
  ];
  const label = (): string =>
    rawProps.ariaLabel ?? `Candlestick chart with ${(rawProps.dataset ?? []).length} periods`;
  return (
    <ChartContainer
      {...containerProps}
      series={series()}
      yDomain={domain()}
      __scopeCharts={rawProps.__scopeCharts}
    >
      <ChartSurface ariaLabel={label()} __scopeCharts={rawProps.__scopeCharts}>
        <ChartsGrid __scopeCharts={rawProps.__scopeCharts} />
        <Candlesticks
          openKey={rawProps.openKey}
          highKey={rawProps.highKey}
          lowKey={rawProps.lowKey}
          closeKey={rawProps.closeKey}
          seriesId={seriesId()}
          bodyWidth={rawProps.bodyWidth}
          wickWidth={rawProps.wickWidth}
          bullishColor={rawProps.bullishColor}
          bearishColor={rawProps.bearishColor}
          __scopeCharts={rawProps.__scopeCharts}
        />
        <ChartsXAxis __scopeCharts={rawProps.__scopeCharts} />
        <ChartsYAxis __scopeCharts={rawProps.__scopeCharts} />
        {rawProps.children}
      </ChartSurface>
    </ChartContainer>
  );
}
