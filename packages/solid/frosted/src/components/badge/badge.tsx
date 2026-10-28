import { children, omit, type Component } from "solid-js";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { cx } from "../../helpers/cx";
import type { PropsWithoutColor } from "../../helpers/props";
import { badgePropDefs, type BadgeOwnProps } from "./badge.props";

/**
 * Props for the `Badge` component: prop-def values plus native `span` props.
 * `ref` is narrowed to the compose-refs callback form. Upstream has no
 * `render` prop, so neither does this.
 */
interface BadgeProps extends BadgeOwnProps, Omit<PropsWithoutColor<"span">, "ref"> {
  /** Ref forwarded to the rendered `span` element. */
  ref?: Ref<HTMLSpanElement> | undefined;
}

/**
 * Themed status pill: a `span` with `fui-Badge` sizing, variant, and accent
 * color classes.
 *
 * Upstream: `badge.tsx` at whopio/frosted-ui commit `56787900bfe0`.
 */
const Badge: Component<BadgeProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "size", "variant", "color", "highContrast");
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);

  const size = () => props.size ?? badgePropDefs.size.default;
  const variant = () => props.variant ?? badgePropDefs.variant.default;
  const color = () => props.color ?? badgePropDefs.color.default;
  const highContrast = () => props.highContrast ?? badgePropDefs.highContrast.default;

  return (
    <span
      data-accent-color={color()}
      {...rest}
      class={cx(
        "fui-Badge",
        props.class,
        `fui-r-size-${size()}`,
        `fui-variant-${variant()}`,
        highContrast() ? "fui-high-contrast" : undefined,
      )}
      ref={composedRefs}
    >
      {resolved()}
    </span>
  );
};

export { Badge };
export type { BadgeProps };
