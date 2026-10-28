import { omit, type Component } from "solid-js";
import type { Scope } from "@solidix/context";
import { Primitive, type PrimitivePropsWithRef } from "@solidix/primitive";
import { useChartContext, type ScopedProps } from "./container";
import type { ChartItemRef } from "./types";

/** Options for {@link useHighlight}. */
export interface UseHighlightOptions {
  /** Scope forwarded from the consuming component. */
  scope?: Scope | undefined;
}

/**
 * Read and write the chart highlight state. `highlight` sets the active
 * item (or clears with `null`); `isHighlighted` compares item identity.
 */
export function useHighlight(options: UseHighlightOptions = {}): {
  /** Currently highlighted item, or `null`. */
  highlighted: ChartItemRef | null;
  /** Set or clear the highlight. */
  highlight: (item: ChartItemRef | null) => void;
  /** Whether `item` equals the current highlight. */
  isHighlighted: (item: ChartItemRef) => boolean;
} {
  const store = useChartContext("useHighlight", options.scope);
  return {
    get highlighted() {
      return store.highlighted();
    },
    highlight: (item) => store.setHighlighted(item),
    isHighlighted: (item) => {
      const current = store.highlighted();
      if (!current) return false;
      return current.seriesId === item.seriesId && current.rowIndex === item.rowIndex;
    },
  };
}

/** Props for {@link ChartsHighlightTracker}. */
export interface ChartsHighlightTrackerProps extends PrimitivePropsWithRef<"div"> {
  /**
   * Map a pointer position to a chart item, or `null` to clear. Receives
   * plot-relative coordinates.
   */
  resolveItem?: ((point: { x: number; y: number }) => ChartItemRef | null) | undefined;
}

/**
 * Transparent overlay that translates pointer movement into highlight
 * state. Series hover handlers usually call `useHighlight` directly; use
 * this tracker for plots where empty space should clear the highlight.
 */
export const ChartsHighlightTracker: Component<ScopedProps<ChartsHighlightTrackerProps>> = (
  props,
) => {
  const rest = omit(props, "__scopeCharts", "resolveItem", "children");
  const { highlight } = useHighlight({ scope: props.__scopeCharts });
  return (
    <Primitive.div
      {...rest}
      onPointerMove={(event: PointerEvent) => {
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const resolve = props.resolveItem;
        highlight(
          resolve ? resolve({ x: event.clientX - rect.left, y: event.clientY - rect.top }) : null,
        );
      }}
      onPointerLeave={() => highlight(null)}
      data-chart-highlight-tracker=""
    >
      {props.children}
    </Primitive.div>
  );
};

export type { ChartItemRef };
