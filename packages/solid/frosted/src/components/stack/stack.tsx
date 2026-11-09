import { children, omit } from "solid-js";
import type { Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { composeRefs } from "@solidix/compose-refs";
import type { Ref } from "@solidix/compose-refs";
import { cx } from "../../helpers/cx";
import type { GetPropDefTypes } from "../../helpers/props/prop-def";
import { stackPropDefs } from "./stack.props";

/** Props for the `Stack` component. */
export type StackProps = Omit<JSX.IntrinsicElements["div"], "ref"> &
  GetPropDefTypes<typeof stackPropDefs> & {
    /** Ref forwarded to the underlying div element. */
    ref?: Ref<HTMLDivElement> | undefined;
  };

/**
 * A vertical flex column that owns the spacing between its children.
 * Children carry no vertical margins of their own: the `gap` prop, keyed
 * to the `--space-*` scale, is the one place rhythm is set. For the
 * horizontal form, see `Row`.
 */
const Stack: Component<StackProps> = (props) => {
  const resolved = children(() => props.children);
  return (
    <div
      {...omit(props, "class", "gap", "align", "justify", "ref", "children")}
      ref={composeRefs(props.ref)}
      class={cx(
        "fui-Stack",
        props.class,
        `fui-r-gap-${props.gap ?? stackPropDefs.gap.default}`,
        `fui-r-align-${props.align ?? stackPropDefs.align.default}`,
        `fui-r-justify-${props.justify ?? stackPropDefs.justify.default}`,
      )}
    >
      {resolved()}
    </div>
  );
};

export { Stack };
