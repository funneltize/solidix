import { For, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useChartContext, type ScopedProps } from "./container";

/** Props for {@link ChartsLegend}. */
export interface ChartsLegendProps extends JSX.HTMLAttributes<HTMLUListElement> {
  /**
   * Called when a legend item is activated (click or Enter/Space). Defaults
   * to toggling the series visibility.
   */
  onToggleSeries?: ((seriesId: string, event: MouseEvent | KeyboardEvent) => void) | undefined;
}

/**
 * Series legend: one toggle per series with a color swatch. Activating an
 * item toggles the series visibility unless `onToggleSeries` handles it.
 */
export const ChartsLegend: Component<ScopedProps<ChartsLegendProps>> = (props) => {
  const rest = omit(props, "__scopeCharts", "onToggleSeries", "children");
  const store = useChartContext("ChartsLegend", props.__scopeCharts);
  return (
    <ul {...(rest as JSX.HTMLAttributes<HTMLUListElement>)}>
      <For each={store.series()}>
        {(s) => (
          <li>
            <button
              type="button"
              aria-pressed={s.visible ? "true" : "false"}
              onClick={(event: MouseEvent) => {
                if (props.onToggleSeries) props.onToggleSeries(s.id, event);
                else store.toggleSeries(s.id);
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: "0.75em",
                  height: "0.75em",
                  "background-color": s.color,
                  opacity: s.visible ? "1" : "0.35",
                }}
              />{" "}
              {s.label}
            </button>
          </li>
        )}
      </For>
    </ul>
  );
};
