import { children, omit } from "solid-js";
import type { Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { composeRefs } from "@solidix/compose-refs";
import type { Ref } from "@solidix/compose-refs";
import { cx } from "../../helpers/cx";
import type { GetPropDefTypes } from "../../helpers/props/prop-def";
import { rowPropDefs } from "./stack.props";

/** Props for the `Row` component. */
export type RowProps = Omit<JSX.IntrinsicElements["div"], "ref"> &
  GetPropDefTypes<typeof rowPropDefs> & {
    /** Ref forwarded to the underlying div element. */
    ref?: Ref<HTMLDivElement> | undefined;
  };

/**
 * A horizontal flex row that owns the spacing between its children, the
 * horizontal form of `Stack`. Children carry no horizontal margins of
 * their own: the `gap` prop, keyed to the `--space-*` scale, is the one
 * place rhythm is set. Items center on the cross axis by default.
 */
const Row: Component<RowProps> = (props) => {
  const resolved = children(() => props.children);
  return (
    <div
      {...omit(props, "class", "gap", "align", "justify", "ref", "children")}
      ref={composeRefs(props.ref)}
      class={cx(
        "fui-Row",
        props.class,
        `fui-r-gap-${props.gap ?? rowPropDefs.gap.default}`,
        `fui-r-align-${props.align ?? rowPropDefs.align.default}`,
        `fui-r-justify-${props.justify ?? rowPropDefs.justify.default}`,
      )}
    >
      {resolved()}
    </div>
  );
};

export { Row };
