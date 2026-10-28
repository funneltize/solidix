import { For, omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  ChartContainer,
  ChartSurface,
  useChartContext,
  type ChartContainerProps,
  type ScopedProps,
} from "../container";
import { DEFAULT_LABEL_KEY, seriesColor } from "../types";

/**
 * Headless funnel chart: staged values as proportional trapezoids.
 *
 * Inspired by - not copied from - common funnel visualizations. Shares the
 * container, highlight, and tooltip stores with the rest of the package.
 *
 * This is a data-visualization chart and is unrelated to `@solidix/funnel`,
 * the opinionated form-funnel block library.
 */

/** One funnel stage and its trapezoid geometry. */
export interface FunnelStage {
  /** Stage label. */
  label: string;
  /** Stage value. */
  value: number;
  /** Conversion from the previous stage as a fraction, `null` for the first. */
  conversion: number | null;
  /** Trapezoid corner points in plot coordinates, clockwise from top-left. */
  points: [number, number][];
  /** Center of the trapezoid, for tooltip anchoring. */
  center: { x: number; y: number };
  /** Suggested fill from the palette. */
  fill: string;
}

/** Layout direction for {@link ChartsFunnelChart}. */
export type FunnelOrientation = "vertical" | "horizontal";

/**
 * Map stage values to trapezoid geometry.
 *
 * @param args The stage labels, values, plot size, orientation, and gap.
 * @returns Stages with trapezoid points, centers, fills, and conversions.
 */
export function layoutFunnelStages(args: {
  /** Stage labels. */
  labels: string[];
  /** Stage values, one per label. */
  values: number[];
  /** Plot width in pixels. */
  plotWidth: number;
  /** Plot height in pixels. */
  plotHeight: number;
  /** Layout direction. Defaults to `"vertical"`. */
  orientation?: FunnelOrientation | undefined;
  /** Gap between stages in pixels. Defaults to `4`. */
  gap?: number | undefined;
}): FunnelStage[] {
  const { labels, values, plotWidth, plotHeight } = args;
  const orientation = args.orientation ?? "vertical";
  const gap = args.gap ?? 4;
  const count = labels.length;
  if (count === 0) return [];
  const max = Math.max(1, ...values.map((v) => Math.max(0, v)));
  const lane = (orientation === "vertical" ? plotHeight : plotWidth) / count;
  const stageSize = Math.max(0, lane - gap);
  return labels.map((label, index) => {
    const value = Math.max(0, values[index] ?? 0);
    const previous = index === 0 ? null : Math.max(0, values[index - 1] ?? 0);
    const conversion = previous === null || previous === 0 ? null : value / previous;
    const fraction = value / max;
    const offset = index * lane + gap / 2;
    let points: [number, number][];
    let center: { x: number; y: number };
    if (orientation === "vertical") {
      const half = (fraction * plotWidth) / 2;
      const cx = plotWidth / 2;
      points = [
        [cx - half, offset],
        [cx + half, offset],
        [cx + half, offset + stageSize],
        [cx - half, offset + stageSize],
      ];
      center = { x: cx, y: offset + stageSize / 2 };
    } else {
      const half = (fraction * plotHeight) / 2;
      const cy = plotHeight / 2;
      points = [
        [offset, cy - half],
        [offset + stageSize, cy - half],
        [offset + stageSize, cy + half],
        [offset, cy + half],
      ];
      center = { x: offset + stageSize / 2, y: cy };
    }
    return { label, value, conversion, points, center, fill: seriesColor({}, index) };
  });
}

/** Format a stage conversion fraction as a percentage string. */
export function formatFunnelConversion(conversion: number | null): string {
  if (conversion === null) return "first stage";
  return `${Math.round(conversion * 100)}% of previous`;
}

export interface ChartsFunnelChartProps extends Omit<
  ChartContainerProps,
  "dataset" | "series" | "children"
> {
  /** Stage labels, in funnel order. */
  stages: string[];
  /** Stage values, one per stage label. */
  values: number[];
  /** Layout direction. Defaults to `"vertical"`. */
  orientation?: FunnelOrientation | undefined;
  /** Gap between stages in pixels. Defaults to `4`. */
  gap?: number | undefined;
  /** Accessible summary. Defaults to `"Funnel chart"`. */
  ariaLabel?: string | undefined;
  /** Extra children (surface content such as tooltip). */
  children?: JSX.Element | undefined;
}

/** Props for {@link FunnelStages}. */
export interface FunnelStagesProps {
  /** Stage labels, in funnel order. */
  stages: string[];
  /** Stage values, one per stage label. */
  values: number[];
  /** Layout direction. Defaults to `"vertical"`. */
  orientation?: FunnelOrientation | undefined;
  /** Gap between stages in pixels. Defaults to `4`. */
  gap?: number | undefined;
}

/**
 * Render funnel stage trapezoids from explicit stage props.
 *
 * Must be rendered inside a `ChartSurface`. Drives the highlight store and
 * the shared tooltip anchor on pointer and focus, like series components.
 */
export function FunnelStages(rawProps: ScopedProps<FunnelStagesProps>): JSX.Element {
  const store = useChartContext("FunnelStages", rawProps.__scopeCharts);
  const stages = () =>
    layoutFunnelStages({
      labels: rawProps.stages,
      values: rawProps.values,
      plotWidth: store.plotWidth(),
      plotHeight: store.plotHeight(),
      orientation: rawProps.orientation,
      gap: rawProps.gap,
    });
  const pointsAttr = (stage: FunnelStage): string =>
    stage.points.map(([px, py]) => `${px},${py}`).join(" ");
  return (
    <g
      role="img"
      aria-label={
        stages().length === 0 ? "Empty funnel chart" : `Funnel chart with ${stages().length} stages`
      }
      data-series-id="funnel"
    >
      <For each={stages()}>
        {(stage, index) => {
          const label = () =>
            `${stage.label}: ${stage.value} (${formatFunnelConversion(stage.conversion)})`;
          return (
            <polygon
              points={pointsAttr(stage)}
              fill={stage.fill}
              stroke={stage.fill}
              stroke-width={1}
              stroke-linejoin="round"
              tabindex={0}
              aria-label={label()}
              data-stage={stage.label}
              data-row-index={index()}
              onPointerEnter={(event: PointerEvent) => {
                store.setHighlighted({ seriesId: "funnel", rowIndex: index() });
                const box = (
                  event.currentTarget as unknown as SVGPolygonElement | null
                )?.getBoundingClientRect?.();
                if (box) store.setAnchor({ x: box.left + box.width / 2, y: box.top });
              }}
              onPointerLeave={() => {
                store.setHighlighted(null);
                store.setAnchor(null);
              }}
              onFocus={() => {
                store.setHighlighted({ seriesId: "funnel", rowIndex: index() });
              }}
              onBlur={() => {
                store.setHighlighted(null);
              }}
              onClick={(event: MouseEvent) => {
                store.clickItem({ seriesId: "funnel", rowIndex: index() }, event);
              }}
            />
          );
        }}
      </For>
    </g>
  );
}

/**
 * Composed funnel chart: container, surface, and stage trapezoids.
 *
 * Pass stage labels and values; the container dataset mirrors them so the
 * shared tooltip and highlight stores work unchanged.
 */
export function ChartsFunnelChart(rawProps: ScopedProps<ChartsFunnelChartProps>): JSX.Element {
  const scope = rawProps.__scopeCharts;
  const dataset = () =>
    rawProps.stages.map((label, index) => ({
      [DEFAULT_LABEL_KEY]: label,
      value: rawProps.values[index] ?? 0,
    }));
  const rest = omit(rawProps, "stages", "values", "orientation", "gap", "ariaLabel", "children");
  return (
    <ChartContainer
      {...rest}
      __scopeCharts={scope}
      dataset={dataset()}
      series={[{ id: "funnel", valueKey: "value" }]}
    >
      <ChartSurface __scopeCharts={scope} ariaLabel={rawProps.ariaLabel ?? "Funnel chart"}>
        <FunnelStages
          __scopeCharts={scope}
          stages={rawProps.stages}
          values={rawProps.values}
          orientation={rawProps.orientation}
          gap={rawProps.gap}
        />
        {rawProps.children}
      </ChartSurface>
    </ChartContainer>
  );
}
