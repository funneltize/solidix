import { useChartContext, clampZoomWindow, type ScopedProps, type ZoomWindow } from "./container";

/**
 * Zoom helpers and keyboard-accessible zoom/pan controls for Cartesian charts.
 *
 * The container owns a fractional {@link ZoomWindow} (`0` - `1` over the row
 * domain). These pure helpers derive the next window; the store setters apply
 * it. All three are safe to call with a `null` window (fully zoomed out).
 */

/**
 * Zoom one step toward the data: shrink the window around its center.
 *
 * A `null` window zooms from the full domain to a centered window.
 *
 * @param window The current fractional window, or `null` when zoomed out.
 * @param step The fraction of the current span to remove, `0` - `1`. Defaults to `0.5`.
 * @returns The next window, or the input when already at minimum span.
 */
export function zoomInWindow(window: ZoomWindow | null, step = 0.5): ZoomWindow | null {
  if (window === null) {
    const margin = step / 2;
    return clampZoomWindow({ start: margin, end: 1 - margin });
  }
  const span = window.end - window.start;
  const next = span * (1 - step);
  if (next <= 0.001) return window;
  const center = (window.start + window.end) / 2;
  return clampZoomWindow({ start: center - next / 2, end: center + next / 2 });
}

/**
 * Zoom one step away from the data: grow the window around its center.
 *
 * Returns `null` (fully zoomed out) once the window covers the domain.
 *
 * @param window The current fractional window, or `null` when zoomed out.
 * @param step The fraction of the current span to add, `0` - `1`. Defaults to `0.5`.
 * @returns The next window, or `null` when the domain is fully visible.
 */
export function zoomOutWindow(window: ZoomWindow | null, step = 0.5): ZoomWindow | null {
  if (window === null) return null;
  const span = window.end - window.start;
  const next = span * (1 + step);
  if (next >= 1) return null;
  const center = (window.start + window.end) / 2;
  return clampZoomWindow({ start: center - next / 2, end: center + next / 2 });
}

/**
 * Pan the window left or right by a fraction of its span, clamped to `0` - `1`.
 *
 * @param window The current fractional window, or `null` when zoomed out.
 * @param direction `-1` to pan toward the start, `1` toward the end.
 * @param panStep The fraction of the span to move, `0` - `1`. Defaults to `0.5`.
 * @returns The panned window, or `null` when zoomed out.
 */
export function panWindow(
  window: ZoomWindow | null,
  direction: 1 | -1,
  panStep = 0.5,
): ZoomWindow | null {
  if (window === null) return null;
  const span = window.end - window.start;
  const delta = span * panStep * direction;
  let start = window.start + delta;
  let end = window.end + delta;
  if (start < 0) {
    end -= start;
    start = 0;
  }
  if (end > 1) {
    start -= end - 1;
    end = 1;
  }
  return clampZoomWindow({ start, end });
}

/** Accessible labels for {@link ChartsZoomControls} buttons. */
export interface ChartsZoomControlsLabels {
  /** Label for the zoom-in button. Defaults to `"Zoom in"`. */
  zoomIn?: string | undefined;
  /** Label for the zoom-out button. Defaults to `"Zoom out"`. */
  zoomOut?: string | undefined;
  /** Label for the pan-toward-start button. Defaults to `"Pan left"`. */
  panLeft?: string | undefined;
  /** Label for the pan-toward-end button. Defaults to `"Pan right"`. */
  panRight?: string | undefined;
  /** Label for the reset button. Defaults to `"Reset"`. */
  reset?: string | undefined;
}

/** Props for {@link ChartsZoomControls}. */
export interface ChartsZoomControlsProps {
  /** Fraction of the span to add or remove per zoom click. Defaults to `0.5`. */
  step?: number | undefined;
  /** Fraction of the span to move per pan click. Defaults to `0.5`. */
  panStep?: number | undefined;
  /** Accessible labels for the buttons. */
  labels?: ChartsZoomControlsLabels | undefined;
  /** Extra class for the controls group. */
  class?: string | undefined;
}

/**
 * Keyboard-accessible zoom and pan buttons for a Cartesian chart.
 *
 * Must be rendered inside a `ChartContainer`. Buttons are disabled while the
 * chart is fully zoomed out (except zoom-in), and `Reset` restores the
 * full domain. This is the keyboard path for zooming; pointer users can also
 * drag a range with `ChartsBrush`.
 */
export function ChartsZoomControls(props: ScopedProps<ChartsZoomControlsProps>) {
  const store = useChartContext("ChartsZoomControls", props.__scopeCharts);
  const step = () => props.step ?? 0.5;
  const panStep = () => props.panStep ?? 0.5;
  const labels = (): Required<ChartsZoomControlsLabels> => ({
    zoomIn: props.labels?.zoomIn ?? "Zoom in",
    zoomOut: props.labels?.zoomOut ?? "Zoom out",
    panLeft: props.labels?.panLeft ?? "Pan left",
    panRight: props.labels?.panRight ?? "Pan right",
    reset: props.labels?.reset ?? "Reset",
  });
  return (
    <div
      role="group"
      aria-label="Chart zoom controls"
      class={props.class}
      data-charts-zoom-controls
    >
      <button
        type="button"
        aria-label={labels().zoomIn}
        onClick={() => store.setZoom(zoomInWindow(store.zoom(), step()))}
      >
        {"+"}
      </button>
      <button
        type="button"
        aria-label={labels().zoomOut}
        disabled={store.zoom() === null}
        onClick={() => store.setZoom(zoomOutWindow(store.zoom(), step()))}
      >
        {"-"}
      </button>
      <button
        type="button"
        aria-label={labels().panLeft}
        disabled={store.zoom() === null}
        onClick={() => store.setZoom(panWindow(store.zoom(), -1, panStep()))}
      >
        {"<"}
      </button>
      <button
        type="button"
        aria-label={labels().panRight}
        disabled={store.zoom() === null}
        onClick={() => store.setZoom(panWindow(store.zoom(), 1, panStep()))}
      >
        {">"}
      </button>
      <button
        type="button"
        aria-label={labels().reset}
        disabled={store.zoom() === null}
        onClick={() => store.resetZoom()}
      >
        {"Reset"}
      </button>
    </div>
  );
}
