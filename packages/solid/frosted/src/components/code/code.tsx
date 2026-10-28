import { children, omit, type Component } from "solid-js";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { cx } from "../../helpers/cx";
import type { GetPropDefTypes, PropsWithoutColor } from "../../helpers/props";
import { codePropDefs } from "./code.props";

/** Own props of `Code` derived from `codePropDefs` (size, variant, weight, color, highContrast). */
type CodeOwnProps = GetPropDefTypes<typeof codePropDefs>;

/**
 * Props for the `Code` component: prop-def values plus native `code` props.
 * `ref` is narrowed to the compose-refs callback form (remove-scroll precedent).
 */
interface CodeProps extends CodeOwnProps, Omit<PropsWithoutColor<"code">, "ref"> {
  /** Ref forwarded to the rendered `code` element. */
  ref?: Ref<HTMLElement> | undefined;
}

/**
 * Themed inline code: a `code` element with `fui-Code` sizing, variant, weight,
 * and accent color classes. Upstream has no `render` prop, so neither does this.
 */
const Code: Component<CodeProps> = (props) => {
  const rest = omit(
    props,
    "children",
    "class",
    "ref",
    "size",
    "variant",
    "weight",
    "color",
    "highContrast",
  );
  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);

  const size = () => props.size ?? codePropDefs.size.default;
  const variant = () => props.variant ?? codePropDefs.variant.default;
  const weight = () => props.weight ?? codePropDefs.weight.default;
  const color = () => props.color ?? codePropDefs.color.default;
  const highContrast = () => props.highContrast ?? codePropDefs.highContrast.default;

  return (
    <code
      {...rest}
      class={cx(
        "fui-Code",
        props.class,
        size() ? `fui-r-size-${size()}` : undefined,
        variant() ? `fui-variant-${variant()}` : undefined,
        weight() ? `fui-r-weight-${weight()}` : undefined,
        highContrast() ? "fui-high-contrast" : undefined,
      )}
      data-accent-color={color()}
      ref={composedRefs}
    >
      {resolved()}
    </code>
  );
};

export { Code };
export type { CodeProps };
