import { omit, type Component } from "solid-js";

import { cx } from "../../helpers/cx.js";
import type { PropsWithoutColor } from "../../helpers/props/index.js";
import { textAreaPropDefs } from "./text-area.props.js";

/**
 * Props for `TextArea`: all native `textarea` props except `size` (taken over
 * by the styling scale) plus the `size`, `variant`, and `color` style props.
 * Upstream forwards no ref, so `ref` is omitted rather than silently dropped.
 */
type TextAreaProps = Omit<PropsWithoutColor<"textarea">, "size" | "ref"> & {
  size?: (typeof textAreaPropDefs.size.values)[number] | undefined;
  variant?: (typeof textAreaPropDefs.variant.values)[number] | undefined;
  color?: (typeof textAreaPropDefs.color.values)[number] | undefined;
};

/**
 * Multi-line text input: a styled root wrapping a native `textarea` plus a
 * chrome layer that paints the border and background behind the text.
 */
const TextArea: Component<TextAreaProps> = (props) => {
  const rest = omit(props, "class", "size", "variant", "color", "style", "children");
  const size = () => props.size ?? textAreaPropDefs.size.default;
  const variant = () => props.variant ?? textAreaPropDefs.variant.default;
  const color = () => props.color ?? textAreaPropDefs.color.default;
  return (
    <div
      data-accent-color={color()}
      style={props.style}
      class={cx(
        "fui-TextAreaRoot",
        props.class,
        `fui-r-size-${size()}`,
        `fui-variant-${variant()}`,
      )}
    >
      <textarea class="fui-TextAreaInput" {...rest} />
      <div class="fui-TextAreaChrome" />
    </div>
  );
};

export { TextArea };
export type { TextAreaProps };
