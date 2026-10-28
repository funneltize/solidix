import { omit, type Component } from "solid-js";
import {
  Progress as HeadlessProgress,
  ProgressIndicator as HeadlessIndicator,
  type ProgressProps as HeadlessProgressProps,
} from "@solidix/progress";
import { cx } from "../../helpers/cx";
import { progressPropDefs, type ProgressOwnProps } from "./progress.props";

/** Props for `Progress`: headless root props plus the styled prop defs. */
interface ProgressProps extends Omit<HeadlessProgressProps, "children">, ProgressOwnProps {}

/**
 * Linear progress bar: the headless progress root (a `progressbar` role
 * with value semantics) with a track and a width-driven indicator.
 *
 * Upstream: `progress.tsx` at whopio/frosted-ui commit `56787900bfe0`. The
 * Base UI `Meter` maps to the headless progress `Root`/`Indicator`; the
 * track is a plain `div` (neither layer attaches behavior to it).
 */
const Progress: Component<ProgressProps> = (props) => {
  const size = () => props.size ?? progressPropDefs.size.default;
  const color = () => props.color ?? progressPropDefs.color.default;
  const highContrast = () => props.highContrast ?? progressPropDefs.highContrast.default;
  const value = () => props.value ?? 0;
  const max = () => props.max ?? 100;
  const progress = () => Math.max(0, Math.min((value() || 0) / max(), 1));
  const rest = omit(props, "size", "color", "highContrast", "class", "value", "max");

  return (
    <HeadlessProgress
      data-accent-color={color()}
      class={cx(
        "fui-ProgressRoot",
        props.class,
        highContrast() ? "fui-high-contrast" : undefined,
        `fui-r-size-${size()}`,
      )}
      value={props.value === undefined ? 0 : props.value}
      max={max()}
      {...rest}
    >
      <div class="fui-ProgressTrack">
        <HeadlessIndicator
          class="fui-ProgressIndicator"
          style={{ width: `${progress() * 100}%` }}
        />
      </div>
    </HeadlessProgress>
  );
};

export { Progress };
export type { ProgressProps };
