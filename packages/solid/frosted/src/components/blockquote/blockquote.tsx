import { children, omit, type Component } from "solid-js";
import type { Ref } from "@solidix/compose-refs";
import { cx } from "../../helpers/cx";
import type { GetPropDefTypes, PropsWithoutColor } from "../../helpers/props";
import { Text, type TextProps } from "../text/text";
import { blockquotePropDefs } from "./blockquote.props";

/** Own props of `Blockquote` derived from `blockquotePropDefs` (size, weight, color, highContrast). */
type BlockquoteOwnProps = GetPropDefTypes<typeof blockquotePropDefs>;

/**
 * Props for the `Blockquote` component: prop-def values plus native
 * blockquote props. `size`, `weight`, `color`, and `highContrast` flow through
 * to the inner `Text`, as upstream.
 */
interface BlockquoteProps extends PropsWithoutColor<"blockquote">, BlockquoteOwnProps {}

/**
 * Themed blockquote: a `Text` rendered as a `blockquote` element with
 * `fui-Blockquote` classes, as upstream.
 */
const Blockquote: Component<BlockquoteProps> = (props) => {
  const rest = omit(props, "children", "class", "ref");
  const resolved = children(() => props.children);

  // Blockquote-flavored passthrough (`cite`, blockquote handlers) into
  // span-typed `Text` props: sound at runtime (the `render` branch forwards
  // to the blockquote) and upstream-identical (`{...blockquoteProps}` into
  // `Text`, which compiles only because React's `EventHandler` carries a
  // bivariance hack). Link precedent.
  const textProps = rest as unknown as TextProps;

  return (
    <Text
      {...textProps}
      // `Text` forwards `ref` to the rendered element (the blockquote here);
      // the blockquote/span mismatch is upstream-identical.
      ref={props.ref as Ref<HTMLSpanElement> | undefined}
      render={<blockquote />}
      class={cx("fui-Blockquote", props.class)}
    >
      {resolved()}
    </Text>
  );
};

export { Blockquote };
export type { BlockquoteProps };
