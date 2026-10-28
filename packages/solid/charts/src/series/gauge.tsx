import { omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Primitive, type PrimitivePropsWithRef } from "@solidix/primitive";
import { PALETTE_FALLBACKS } from "../types";

/** 2D point in SVG coordinates. */
export interface GaugePoint {
  /** X coordinate. */
  x: number;
  /** Y coordinate. */
  y: number;
}

/** Props for {@link Gauge}. */
export interface GaugeProps extends PrimitivePropsWithRef<"svg"> {
  /**
   * Dial shape: `"arc"` renders the circular dial, `"bar"` a linear meter.
   * Angles and the pointer apply to the arc variant only. Defaults to `"arc"`.
   */
  variant?: "arc" | "bar" | undefined;
  /**
   * Bar direction for `variant="bar"`: horizontal fills left to right,
   * vertical bottom to top. Ignored for the arc variant. Defaults to
   * `"horizontal"`.
   */
  orientation?: "horizontal" | "vertical" | undefined;
  /** Current value shown on the dial. */
  value: number;
  /** Minimum of the dial. Defaults to `0`. */
  min?: number | undefined;
  /** Maximum of the dial. Defaults to `100`. */
  max?: number | undefined;
  /**
   * Start angle in degrees, `0` pointing up and positive values running
   * clockwise. Defaults to `-120`.
   */
  startAngle?: number | undefined;
  /** End angle in degrees. Defaults to `120`. */
  endAngle?: number | undefined;
  /** SVG width in pixels. Defaults to `120`. */
  width?: number | undefined;
  /** SVG height in pixels. Defaults to `120`. */
  height?: number | undefined;
  /** Track thickness in pixels (arc stroke or bar height). Defaults to `10`. */
  trackWidth?: number | undefined;
  /** Value arc stroke width in pixels. Arc variant only. Defaults to `trackWidth`. */
  valueWidth?: number | undefined;
  /** Value arc color. Defaults to the first palette color. */
  color?: string | undefined;
  /** Track color. Defaults to a neutral gray. */
  trackColor?: string | undefined;
  /** Render the needle pointer. Defaults to `true`. */
  showPointer?: boolean | undefined;
  /** Pointer length as a fraction of the radius. Defaults to `0.8`. */
  pointerLength?: number | undefined;
  /** Pointer hub radius in pixels. Defaults to `4`. */
  pointerWidth?: number | undefined;
  /** Center text, rendered as SVG text. */
  text?: string | undefined;
  /** Accessible name for the meter. */
  ariaLabel?: string | undefined;
  /** SVG overlay children rendered above the arcs. */
  children?: JSX.Element | undefined;
}

/**
 * Dial for a single value between `min` and `max`: the arc variant renders a
 * track arc, a value arc, and an optional needle pointer; the bar variant
 * renders a linear track with a proportional fill. Announced as a `meter`.
 */
export const Gauge: Component<GaugeProps> = (rawProps) => {
  const rest = omit(
    rawProps,
    "variant",
    "orientation",
    "value",
    "min",
    "max",
    "startAngle",
    "endAngle",
    "width",
    "height",
    "trackWidth",
    "valueWidth",
    "color",
    "trackColor",
    "showPointer",
    "pointerLength",
    "pointerWidth",
    "text",
    "ariaLabel",
    "children",
  );
  const variant = (): "arc" | "bar" => rawProps.variant ?? "arc";
  const vertical = (): boolean => variant() === "bar" && rawProps.orientation === "vertical";
  const min = (): number => rawProps.min ?? 0;
  const max = (): number => rawProps.max ?? 100;
  const startAngle = (): number => rawProps.startAngle ?? -120;
  const endAngle = (): number => rawProps.endAngle ?? 120;
  const width = (): number => rawProps.width ?? 120;
  const height = (): number => rawProps.height ?? 120;
  const trackWidth = (): number => rawProps.trackWidth ?? 10;
  const valueWidth = (): number => rawProps.valueWidth ?? trackWidth();
  const radius = (): number =>
    Math.max(0, Math.min(width(), height()) / 2 - Math.max(trackWidth(), valueWidth()) / 2);
  const center = (): GaugePoint => ({ x: width() / 2, y: height() / 2 });
  const fraction = (): number => {
    const span = max() - min();
    if (!(span > 0)) return 0;
    return Math.min(1, Math.max(0, (rawProps.value - min()) / span));
  };
  const valueAngle = (): number => startAngle() + fraction() * (endAngle() - startAngle());
  const label = (): string =>
    rawProps.ariaLabel ?? `Gauge showing ${rawProps.value} out of ${min()} to ${max()}`;
  const showPointer = (): boolean => variant() === "arc" && rawProps.showPointer !== false;
  /** Bar track rect: full length, `trackWidth` thick, centered. */
  const barTrack = (): { x: number; y: number; width: number; height: number } => {
    const thickness = trackWidth();
    if (vertical()) {
      return { x: (width() - thickness) / 2, y: 0, width: thickness, height: height() };
    }
    return { x: 0, y: (height() - thickness) / 2, width: width(), height: thickness };
  };
  /** Bar value rect: the track scaled by the clamped fraction. */
  const barValue = (): { x: number; y: number; width: number; height: number } => {
    const track = barTrack();
    if (vertical()) {
      const filled = track.height * fraction();
      return { ...track, y: track.y + track.height - filled, height: filled };
    }
    return { ...track, width: track.width * fraction() };
  };
  return (
    <Primitive.svg
      {...rest}
      width={width()}
      height={height()}
      viewBox={`0 0 ${width()} ${height()}`}
      role="meter"
      aria-valuemin={min()}
      aria-valuemax={max()}
      aria-valuenow={rawProps.value}
      aria-label={label()}
      data-chart-gauge=""
      data-variant={variant()}
    >
      {variant() === "bar" ? (
        <>
          <rect
            x={barTrack().x}
            y={barTrack().y}
            width={barTrack().width}
            height={barTrack().height}
            rx={Math.min(barTrack().width, barTrack().height) / 2}
            fill={rawProps.trackColor ?? "#e0e0e0"}
            data-chart-gauge-track=""
          />
          <rect
            x={barValue().x}
            y={barValue().y}
            width={Math.max(0, barValue().width)}
            height={Math.max(0, barValue().height)}
            rx={Math.min(Math.max(0, barValue().width), Math.max(0, barValue().height)) / 2}
            fill={rawProps.color ?? PALETTE_FALLBACKS[0] ?? "#1976d2"}
            data-chart-gauge-value=""
          />
        </>
      ) : (
        <>
          <path
            d={arcPath(center(), radius(), startAngle(), endAngle())}
            fill="none"
            stroke={rawProps.trackColor ?? "#e0e0e0"}
            stroke-width={trackWidth()}
            stroke-linecap="round"
            data-chart-gauge-track=""
          />
          <path
            d={arcPath(center(), radius(), startAngle(), valueAngle())}
            fill="none"
            stroke={rawProps.color ?? PALETTE_FALLBACKS[0] ?? "#1976d2"}
            stroke-width={valueWidth()}
            stroke-linecap="round"
            data-chart-gauge-value=""
          />
          {showPointer() ? (
            <g data-chart-gauge-pointer="">
              <line
                x1={center().x}
                y1={center().y}
                x2={
                  polarPoint(center(), radius() * (rawProps.pointerLength ?? 0.8), valueAngle()).x
                }
                y2={
                  polarPoint(center(), radius() * (rawProps.pointerLength ?? 0.8), valueAngle()).y
                }
                stroke="currentColor"
                stroke-width={rawProps.pointerWidth ?? 4}
                stroke-linecap="round"
              />
              <circle
                cx={center().x}
                cy={center().y}
                r={rawProps.pointerWidth ?? 4}
                fill="currentColor"
              />
            </g>
          ) : null}
        </>
      )}
      {rawProps.text === undefined ? null : (
        <text
          x={center().x}
          y={variant() === "bar" ? center().y : center().y + radius() * 0.45}
          text-anchor="middle"
          dominant-baseline="middle"
          data-chart-gauge-text=""
        >
          {rawProps.text}
        </text>
      )}
      {rawProps.children}
    </Primitive.svg>
  );
};

/**
 * Point on a circle: `angle` in degrees, `0` pointing up and positive values
 * running clockwise.
 */
function polarPoint(center: GaugePoint, radius: number, angle: number): GaugePoint {
  const radians = ((angle - 90) * Math.PI) / 180;
  return { x: center.x + radius * Math.cos(radians), y: center.y + radius * Math.sin(radians) };
}

/**
 * SVG path for a circular arc. A zero-width sweep renders as a dot-sized
 * path so the value arc stays mounted at the minimum.
 */
function arcPath(center: GaugePoint, radius: number, from: number, to: number): string {
  const start = polarPoint(center, radius, from);
  const end = polarPoint(center, radius, to);
  const sweep = (((to - from) % 360) + 360) % 360;
  if (sweep === 0) {
    return `M ${start.x} ${start.y} L ${start.x} ${start.y}`;
  }
  const large = sweep > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${large} 1 ${end.x} ${end.y}`;
}
