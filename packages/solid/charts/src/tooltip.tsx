import { For, Show, createMemo, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { defaultFormatValue, useChartContext, type ScopedProps } from "./container";
import { resolveSeriesValues } from "./hooks";

/**
 * One line of tooltip content: the highlighted datum with its series color.
 */
export interface TooltipEntry {
  /** Series id. */
  seriesId: string;
  /** Series label. */
  label: string;
  /** Resolved series color. */
  color: string;
  /** Raw cell value. */
  raw: unknown;
  /** Finite number coercion, or `undefined` for a gap. */
  value: number | undefined;
}

/** Props for the default trigger. */
export interface ChartsTooltipTriggerProps extends JSX.HTMLAttributes<HTMLDivElement> {}

/** Props for {@link ChartsTooltip}. */
export interface ChartsTooltipProps {
  /**
   * Render prop for the highlighted datum. Receives the row label, row
   * index, and one entry per visible series. Defaults to a definition list.
   */
  children?:
    | ((entry: { label: string; index: number; entries: readonly TooltipEntry[] }) => JSX.Element)
    | undefined;
}

/**
 * Headless tooltip content: reads the highlight state and renders the
 * highlighted row. Position it next to the chart or inside an overlay.
 */
export const ChartsTooltip: Component<ScopedProps<ChartsTooltipProps>> = (props) => {
  const store = useChartContext("ChartsTooltip", props.__scopeCharts);
  const content = createMemo(() => {
    const item = store.highlighted();
    if (!item || item.rowIndex < 0) return null;
    const dataset = store.dataset();
    const row = dataset[item.rowIndex];
    if (!row) return null;
    const labels = store.labels();
    const entries: TooltipEntry[] = [];
    for (const s of store.series()) {
      if (!s.visible) continue;
      const [resolved] = resolveSeriesValues([row], s);
      entries.push({
        seriesId: s.id,
        label: s.label ?? s.id,
        color: s.color,
        raw: resolved?.raw,
        value: resolved?.value,
      });
    }
    return { label: labels[item.rowIndex] ?? "", index: item.rowIndex, entries };
  });
  return (
    <Show when={content()} keyed>
      {(c) => {
        const render = props.children;
        if (typeof render === "function") return <>{render(c)}</>;
        return (
          <dl>
            <dt>{c.label}</dt>
            <For each={c.entries}>
              {(entry) => {
                // The `For` body runs untracked: resolve the series in a memo
                // so legend toggles re-render the row instead of going stale.
                const series = createMemo(() => store.seriesById(entry.seriesId));
                const text = (): string => {
                  const s = series();
                  return s ? store.formatValue(entry.value, s) : defaultFormatValue(entry.value);
                };
                return (
                  <>
                    <dt>
                      <span
                        aria-hidden="true"
                        style={{
                          display: "inline-block",
                          width: "0.75em",
                          height: "0.75em",
                          "background-color": entry.color,
                        }}
                      />{" "}
                      {entry.label}
                    </dt>
                    <dd>{text()}</dd>
                  </>
                );
              }}
            </For>
          </dl>
        );
      }}
    </Show>
  );
};
