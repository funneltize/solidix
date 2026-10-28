import { For, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useChartContext, type ScopedProps } from "./container";
import { formatNumber } from "./format";

/** Props shared by axis components. */
interface AxisBaseProps extends JSX.SvgSVGAttributes<SVGGElement> {
  /** Tick label formatter. Defaults to grouped numbers for y, labels for x. */
  formatTick?: ((value: number, index: number) => string) | undefined;
}

/** Props for {@link ChartsXAxis}. */
export interface ChartsXAxisProps extends AxisBaseProps {
  /**
   * Which category labels get a tick. Defaults to every label. Pass a
   * predicate to thin dense axes.
   */
  tickFilter?: ((label: string, index: number) => boolean) | undefined;
}

/**
 * Bottom category axis: one tick per dataset label, centered on its band.
 * Rendered inside the plot group, so coordinates are plot-relative.
 */
export const ChartsXAxis: Component<ScopedProps<ChartsXAxisProps>> = (props) => {
  const rest = omit(props, "__scopeCharts", "formatTick", "tickFilter", "children");
  const store = useChartContext("ChartsXAxis", props.__scopeCharts);
  const ticks = () => {
    const labels = store.labels();
    const x = store.x();
    const filter = props.tickFilter;
    const out: { label: string; center: number; index: number }[] = [];
    labels.forEach((label, index) => {
      if (filter && !filter(label, index)) return;
      if (!store.isRowVisible(index)) return;
      const start = x(label) ?? 0;
      out.push({ label, center: start + x.bandwidth() / 2, index });
    });
    return out;
  };
  return (
    <g aria-hidden="true" {...(rest as JSX.SvgSVGAttributes<SVGGElement>)}>
      <line
        x1={0}
        x2={store.plotWidth()}
        y1={store.plotHeight()}
        y2={store.plotHeight()}
        stroke="currentColor"
      />
      <For each={ticks()}>
        {(tick) => (
          <text
            x={tick.center}
            y={store.plotHeight() + 14}
            text-anchor="middle"
            font-size="11"
            fill="currentColor"
          >
            {props.formatTick ? props.formatTick(tick.index, tick.index) : tick.label}
          </text>
        )}
      </For>
    </g>
  );
};

/** Props for {@link ChartsYAxis}. */
export interface ChartsYAxisProps extends AxisBaseProps {
  /** Approximate tick count. Defaults to `5`. */
  tickCount?: number | undefined;
  /** Fixed width reserved for labels. Defaults to `0` (no offset). */
  width?: number | undefined;
}

/**
 * Left value axis: ticks from the y scale with grouped-number labels.
 * Rendered inside the plot group, so coordinates are plot-relative.
 */
export const ChartsYAxis: Component<ScopedProps<ChartsYAxisProps>> = (props) => {
  const rest = omit(props, "__scopeCharts", "formatTick", "tickCount", "width", "children");
  const store = useChartContext("ChartsYAxis", props.__scopeCharts);
  return (
    <g aria-hidden="true" {...(rest as JSX.SvgSVGAttributes<SVGGElement>)}>
      <line x1={0} x2={0} y1={0} y2={store.plotHeight()} stroke="currentColor" />
      <For each={store.yTicks(props.tickCount)}>
        {(tick, index) => (
          <text
            x={-6}
            y={store.y()(tick)}
            dy="0.32em"
            text-anchor="end"
            font-size="11"
            fill="currentColor"
          >
            {props.formatTick ? props.formatTick(tick, index()) : formatNumber(tick)}
          </text>
        )}
      </For>
    </g>
  );
};
