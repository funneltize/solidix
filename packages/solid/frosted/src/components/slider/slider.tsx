import { createMemo, For, omit, type Component } from "solid-js";
import { Slider as SliderPrimitive, SliderRange, SliderThumb, SliderTrack } from "@solidix/slider";
import type { SliderProps as SliderPrimitiveProps } from "@solidix/slider";

import { cx } from "../../helpers/cx";
import type { GetPropDefTypes } from "../../helpers/props";
import { sliderPropDefs } from "./slider.props";

/** Props unique to the styled `Slider` (size, color, highContrast). */
type SliderOwnProps = GetPropDefTypes<typeof sliderPropDefs>;

/** Props for the styled `Slider` component. */
type SliderProps = Omit<SliderPrimitiveProps, "children" | "class"> &
  SliderOwnProps & {
    /** Additional CSS classes for the slider root. */
    class?: string | undefined;
  };

/**
 * Styled slider built on `@solidix/slider`.
 *
 * Renders one thumb per value entry inside a track with a range indicator.
 * Deviations from upstream: `inputRef` is not supported (the primitive's
 * thumb has no hidden-input ref passthrough), and Base UI-only
 * `thumbCollisionBehavior` / `thumbAlignment` props are not accepted (the
 * primitive follows the Radix API).
 */
const Slider: Component<SliderProps> = (props) => {
  const size = props.size ?? sliderPropDefs.size.default;
  const color = props.color ?? sliderPropDefs.color.default;
  const highContrast = props.highContrast ?? sliderPropDefs.highContrast.default;
  const rest = omit(props, "class", "size", "color", "highContrast");

  // Normalize value to an array for thumb rendering (upstream parity).
  const values = createMemo(() => {
    const val = (rest.value ?? rest.defaultValue) as number | number[] | undefined;
    if (val === undefined) return [0];
    return Array.isArray(val) ? val : [val];
  });

  return (
    <SliderPrimitive
      data-accent-color={color}
      {...rest}
      class={cx(
        "fui-SliderRoot",
        props.class,
        `fui-r-size-${size}`,
        highContrast && "fui-high-contrast",
      )}
    >
      <div class="fui-SliderControl">
        <SliderTrack class="fui-SliderTrack">
          <SliderRange class={cx("fui-SliderRange", highContrast && "fui-high-contrast")} />
          <For each={values()}>{() => <SliderThumb class="fui-SliderThumb" />}</For>
        </SliderTrack>
      </div>
    </SliderPrimitive>
  );
};

export { Slider };
export type { SliderProps };
