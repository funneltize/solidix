import { children, omit, type Component } from "solid-js";
import type { Ref } from "@solidix/compose-refs";
import { cx } from "../../helpers/cx";
import type { GetPropDefTypes, PropsWithoutColor } from "../../helpers/props";
import { Text, type TextProps, type TextRenderProp } from "../text/text";
import { linkPropDefs } from "./link.props";

/** Own props of `Link` derived from `linkPropDefs` (size, weight, trim, underline, color, highContrast). */
type LinkOwnProps = GetPropDefTypes<typeof linkPropDefs>;

/**
 * Props for the `Link` component: prop-def values plus native anchor props and
 * `render`. `Text` owns the `ref` plumbing; `href` and other anchor props flow
 * through `Text` to the rendered element, as upstream.
 */
interface LinkProps extends PropsWithoutColor<"a">, LinkOwnProps {
  /** Element or render function overriding the default `a` output. */
  render?: TextRenderProp | undefined;
}

/**
 * Themed link: a `Text` with `fui-Link` classes and underline styling, rendered
 * as an anchor by default; `render` swaps the element like Base UI.
 */
const Link: Component<LinkProps> = (props) => {
  const rest = omit(
    props,
    "children",
    "class",
    "ref",
    "render",
    "size",
    "weight",
    "trim",
    "underline",
    "color",
    "highContrast",
  );
  const resolved = children(() => props.children);
  const renderProp = props.render;
  const underline = () => props.underline ?? linkPropDefs.underline.default;

  // Anchor-flavored passthrough (`href`, anchor handlers) into span-typed
  // `Text` props: sound at runtime (the default branch renders an anchor) and
  // upstream-identical (`{...linkProps}` into `Text`, which compiles only
  // because React's `EventHandler` carries a bivariance hack).
  const textProps = rest as unknown as TextProps;
  return (
    <Text
      {...textProps}
      // `Text` forwards `ref` to the rendered element (the anchor in the
      // default branch); the anchor/span mismatch is upstream-identical.
      ref={props.ref as Ref<HTMLSpanElement> | undefined}
      size={props.size}
      weight={props.weight}
      trim={props.trim}
      color={props.color}
      highContrast={props.highContrast}
      render={renderProp ?? <a />}
      class={cx("fui-reset", "fui-Link", props.class, `fui-underline-${underline()}`)}
    >
      {resolved()}
    </Text>
  );
};

export { Link };
export type { LinkProps };
