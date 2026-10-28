import { For, omit, type Component } from "solid-js";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { cx } from "../../helpers/cx";
import type { PropsWithoutColor } from "../../helpers/props";
import { colorProp } from "../../helpers/props/color.prop";
import { Tooltip } from "../tooltip/tooltip";
import { TooltipProvider } from "../tooltip/tooltip-provider";

/** One segment of the stacked bar: label, value, and accent color. */
type StackedHorizontalBarChartData = {
  /** Label or function generating the label from value and percent. */
  label: string | ((value: number, percent: string) => string);
  /** Numeric value for the bar. */
  value: number;
  /** Color for the bar. */
  color: (typeof colorProp.values)[number];
};

/** Props for the `StackedHorizontalBarChart` component. */
interface StackedHorizontalBarChartProps extends Omit<PropsWithoutColor<"div">, "ref"> {
  /** Ref forwarded to the rendered root `div` element. */
  ref?: Ref<HTMLDivElement> | undefined;
  /** Bar segments; widths are proportional to the values' sum. */
  data: StackedHorizontalBarChartData[];
}

/**
 * Horizontal bar split into labeled, tooltip-annotated segments sized by
 * value. Each segment shows its label in a tooltip on hover.
 *
 * Upstream: `stacked-horizontal-bar-chart.tsx`
 * (`StackedHorizontalBarChart`) at whopio/frosted-ui commit `56787900bfe0`.
 */
const StackedHorizontalBarChart: Component<StackedHorizontalBarChartProps> = (props) => {
  const rest = omit(props, "class", "data", "ref");
  const composedRefs = composeRefs(props.ref);

  const sum = () => props.data.reduce((acc, dataPoint) => acc + dataPoint.value, 0);

  return (
    <div {...rest} ref={composedRefs} class={cx("fui-StackedHorizontalBarChart", props.class)}>
      {/*
       * The headless tooltip requires a provider while upstream Base UI
       * tooltips stand alone, so the chart provides its own: segment
       * tooltips work with no setup, matching upstream behavior.
       */}
      <TooltipProvider>
        <For each={props.data}>
          {(dataPoint) => {
            // Round to max 2 decimal places.
            const percent = () => `${Math.round((dataPoint.value / sum()) * 100 * 100) / 100}%`;
            const label = () =>
              typeof dataPoint.label === "string"
                ? dataPoint.label
                : dataPoint.label(dataPoint.value, percent());
            const ariaLabel = () =>
              typeof dataPoint.label === "string" ? `${dataPoint.label} ${percent()}` : label();

            return (
              <Tooltip
                content={label()}
                delay={150}
                class="fui-StackedHorizontalBarChartTooltip"
                data-accent-color={dataPoint.color}
              >
                <div
                  data-accent-color={dataPoint.color}
                  aria-label={ariaLabel()}
                  class="fui-StackedHorizontalBarChartBar"
                  style={{ width: percent() }}
                />
              </Tooltip>
            );
          }}
        </For>
      </TooltipProvider>
    </div>
  );
};

export { StackedHorizontalBarChart };
export type { StackedHorizontalBarChartData, StackedHorizontalBarChartProps };
