import { Show, createSignal, flush } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useChartContext, clampZoomWindow, type ScopedProps } from "./container";

/**
 * Drag-to-zoom brush selection for Cartesian charts.
 *
 * Render `ChartsBrush` inside a `ChartSurface`, after the series marks so the
 * overlay sits on top. Pointer users drag a horizontal range to zoom the
 * shared container window; double-click (or a plain click when `resetOnClick`
 * is set) restores the full domain. Keyboard users zoom with
 * `ChartsZoomControls` instead - the brush is focusable only so `Escape`
 * cancels an in-progress drag, or resets the zoom when idle.
 */

/** Props for {@link ChartsBrush}. */
export interface ChartsBrushProps {
  /** Fill of the selection rectangle. Defaults to `"#3b82f6"`. */
  fill?: string | undefined;
  /** Fill opacity of the selection rectangle. Defaults to `0.15`. */
  fillOpacity?: number | undefined;
  /** Stroke of the selection rectangle. Defaults to `"#3b82f6"`. */
  stroke?: string | undefined;
  /**
   * Minimum drag span, as a fraction of the plot width, that counts as a
   * selection. Smaller drags count as clicks. Defaults to `0.02`.
   */
  minSpan?: number | undefined;
  /**
   * Whether a click without a drag resets the zoom. Defaults to `true`.
   * Double-click always resets.
   */
  resetOnClick?: boolean | undefined;
  /** Accessible label for the brush overlay. */
  ariaLabel?: string | undefined;
}

/**
 * Transparent plot overlay that turns a pointer drag into a zoom window.
 *
 * Must be rendered inside a `ChartSurface` (plot coordinates). Writes the
 * shared container zoom state, so bars, lines, scatter, and the x-axis all
 * follow the selection.
 */
export function ChartsBrush(props: ScopedProps<ChartsBrushProps>) {
  const store = useChartContext("ChartsBrush", props.__scopeCharts);
  const [drag, setDrag] = createSignal<{ from: number; to: number } | null>(null);
  const minSpan = () => props.minSpan ?? 0.02;
  const resetOnClick = () => props.resetOnClick ?? true;

  const toFraction = (event: PointerEvent): number => {
    const target = event.currentTarget as Element | null;
    const svg = target?.closest("svg") ?? null;
    const left = svg?.getBoundingClientRect().left ?? 0;
    const raw = (event.clientX - left - store.margin().left) / store.plotWidth();
    return Math.min(1, Math.max(0, raw));
  };

  const selection = () => {
    const active = drag();
    if (active !== null)
      return { start: Math.min(active.from, active.to), end: Math.max(active.from, active.to) };
    return store.zoom();
  };

  const onPointerDown: JSX.EventHandlerUnion<SVGRectElement, PointerEvent> = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    try {
      (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
    } catch {
      /* Pointer capture is unavailable in some environments - dragging still works. */
    }
    const at = toFraction(event);
    setDrag({ from: at, to: at });
    // Commit the drag state synchronously: the move/up handlers of the same
    // gesture read it, and Solid 2 setters otherwise flush on microtask.
    flush();
  };

  const onPointerMove: JSX.EventHandlerUnion<SVGRectElement, PointerEvent> = (event) => {
    const active = drag();
    if (active === null) return;
    setDrag({ from: active.from, to: toFraction(event) });
    flush();
  };

  const finishDrag = (event: PointerEvent) => {
    const active = drag();
    setDrag(null);
    if (active === null) return;
    const window = clampZoomWindow({ start: active.from, end: active.to });
    if (window.end - window.start >= minSpan()) {
      store.setZoom(window);
    } else if (resetOnClick()) {
      store.resetZoom();
    }
    event.preventDefault();
  };

  const onPointerUp: JSX.EventHandlerUnion<SVGRectElement, PointerEvent> = (event) =>
    finishDrag(event);
  const onPointerCancel: JSX.EventHandlerUnion<SVGRectElement, PointerEvent> = () => setDrag(null);

  const onKeyDown: JSX.EventHandlerUnion<SVGRectElement, KeyboardEvent> = (event) => {
    if (event.key === "Escape") {
      if (drag() === null) store.resetZoom();
      else setDrag(null);
    }
  };

  return (
    <g data-charts-brush>
      <rect
        x={0}
        y={0}
        width={store.plotWidth()}
        height={store.plotHeight()}
        fill="transparent"
        tabindex={0}
        aria-label={
          props.ariaLabel ?? "Brush to zoom. Drag to select a range, double click to reset."
        }
        style={{ "touch-action": "none", cursor: "crosshair" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onDblClick={() => store.resetZoom()}
        onKeyDown={onKeyDown}
        data-charts-brush-overlay
      />
      <Show when={selection()}>
        {(window) => (
          <rect
            x={window().start * store.plotWidth()}
            y={0}
            width={Math.max(0, (window().end - window().start) * store.plotWidth())}
            height={store.plotHeight()}
            fill={props.fill ?? "#3b82f6"}
            fill-opacity={props.fillOpacity ?? 0.15}
            stroke={props.stroke ?? "#3b82f6"}
            stroke-width={1}
            style={{ "pointer-events": "none" }}
            data-charts-brush-selection
          />
        )}
      </Show>
    </g>
  );
}
