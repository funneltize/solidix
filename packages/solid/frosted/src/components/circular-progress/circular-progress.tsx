import { omit, Show, type Component } from "solid-js";
import {
  Progress as HeadlessProgress,
  ProgressIndicator as HeadlessIndicator,
  type ProgressProps as HeadlessProgressProps,
} from "@solidix/progress";
import { cx } from "../../helpers/cx";
import { circularProgressPropDefs, type CircularProgressOwnProps } from "./circular-progress.props";

/** Props for `CircularProgress`: headless root props plus styled prop defs. */
interface CircularProgressProps
  extends Omit<HeadlessProgressProps, "children">, CircularProgressOwnProps {}

/** Size configuration matching the CSS variables. */
const sizeConfig: Record<string, { diameter: number; strokeWidth: number }> = {
  "1": { diameter: 16, strokeWidth: 3 },
  "2": { diameter: 20, strokeWidth: 4 },
  "3": { diameter: 24, strokeWidth: 5 },
  "4": { diameter: 32, strokeWidth: 5 },
  "5": { diameter: 40, strokeWidth: 6 },
  "6": { diameter: 48, strokeWidth: 7 },
  "7": { diameter: 56, strokeWidth: 8 },
  "8": { diameter: 64, strokeWidth: 9 },
  "9": { diameter: 72, strokeWidth: 10 },
};

/**
 * Circular progress meter: the headless progress root rendered as an `svg`
 * (via `asChild`), with a track circle and a dash-offset indicator arc.
 *
 * Upstream: `circular-progress.tsx` at whopio/frosted-ui commit
 * `56787900bfe0`. Base UI `Meter` render props map to headless `asChild`
 * slots; the track circle is plain SVG (neither layer attaches behavior
 * to it).
 */
const CircularProgress: Component<CircularProgressProps> = (props) => {
  const size = () => props.size ?? circularProgressPropDefs.size.default;
  const color = () => props.color ?? circularProgressPropDefs.color.default;
  const highContrast = () => props.highContrast ?? circularProgressPropDefs.highContrast.default;
  const value = () => props.value ?? 0;
  const max = () => props.max ?? 100;
  const rest = omit(props, "size", "color", "highContrast", "class", "value", "max");

  const geometry = () => {
    const { diameter, strokeWidth } = sizeConfig[size()] ?? sizeConfig["3"]!;
    const radius = (diameter - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    return { diameter, strokeWidth, radius, circumference, center: diameter / 2 };
  };

  // Progress clamped to [0, 1].
  const progress = () => Math.max(0, Math.min((value() || 0) / max(), 1));

  // Round caps add visual length beyond the arc endpoints: each cap extends
  // by strokeWidth / 2, so the drawn arc is shortened to compensate, with a
  // minimum arc keeping at least a dot visible when progress > 0.
  const arc = () => {
    const { circumference, strokeWidth } = geometry();
    const targetVisualArc = progress() * circumference;
    const compensatedArc = targetVisualArc - strokeWidth;
    const minArc = progress() > 0 ? 0.1 : 0;
    const actualArcToDraw = Math.max(minArc, compensatedArc);
    const capArcLength = strokeWidth / 2;
    const capAngle = (capArcLength / circumference) * 360;
    return {
      strokeDashoffset: circumference - actualArcToDraw,
      // Rotate to position the start cap's outer edge at 12 o'clock.
      rotation: -90 + capAngle,
    };
  };

  return (
    <HeadlessProgress
      data-accent-color={color()}
      class={cx(
        "fui-CircularProgressRoot",
        props.class,
        highContrast() ? "fui-high-contrast" : undefined,
        `fui-r-size-${size()}`,
      )}
      value={props.value === undefined ? 0 : props.value}
      max={max()}
      {...rest}
      asChild
    >
      <svg
        class="fui-CircularProgressSvg"
        width={geometry().diameter}
        height={geometry().diameter}
        viewBox={`0 0 ${geometry().diameter} ${geometry().diameter}`}
      >
        <circle
          class="fui-CircularProgressTrack"
          cx={geometry().center}
          cy={geometry().center}
          r={geometry().radius}
          stroke-width={geometry().strokeWidth}
          fill="none"
        />
        {/*
         * At full progress the dash draws the complete ring (dash length =
         * circumference, zero offset, butt caps) instead of omitting the
         * dash attributes as upstream does: identical rendering, and Solid
         * SVG types reject conditionally-undefined attributes.
         */}
        <Show when={progress() > 0}>
          <HeadlessIndicator asChild>
            <circle
              class="fui-CircularProgressIndicator"
              cx={geometry().center}
              cy={geometry().center}
              r={geometry().radius}
              stroke-width={geometry().strokeWidth}
              fill="none"
              stroke-dasharray={String(geometry().circumference)}
              stroke-dashoffset={progress() >= 1 ? 0 : arc().strokeDashoffset}
              stroke-linecap={progress() >= 1 ? "butt" : "round"}
              transform={`rotate(${progress() >= 1 ? 0 : arc().rotation} ${geometry().center} ${geometry().center})`}
            />
          </HeadlessIndicator>
        </Show>
      </svg>
    </HeadlessProgress>
  );
};

export { CircularProgress };
export type { CircularProgressProps };
