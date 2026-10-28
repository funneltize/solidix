import { children, omit } from "solid-js";
import type { Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { composeRefs } from "@solidix/compose-refs";
import type { Ref } from "@solidix/compose-refs";
import { cx } from "../../helpers/cx";
import type { GetPropDefTypes } from "../../helpers/props/prop-def";
import { insetPropDefs } from "./inset.props";

/** Props for the `Inset` component. */
export type InsetProps = Omit<JSX.IntrinsicElements["div"], "ref"> &
  GetPropDefTypes<typeof insetPropDefs> & {
    /** Ref forwarded to the underlying div element. */
    ref?: Ref<HTMLDivElement> | undefined;
  };

/**
 * Insets content within a padded parent. Renders a `div` with the `fui-Inset`
 * class and side, clip, and padding modifier classes.
 */
const Inset: Component<InsetProps> = (props) => {
  const resolved = children(() => props.children);
  return (
    <div
      {...omit(
        props,
        "class",
        "side",
        "clip",
        "p",
        "px",
        "py",
        "pt",
        "pr",
        "pb",
        "pl",
        "ref",
        "children",
      )}
      ref={composeRefs(props.ref)}
      class={cx(
        "fui-Inset",
        props.class,
        `fui-r-side-${props.side ?? insetPropDefs.side.default}`,
        `fui-r-clip-${props.clip ?? insetPropDefs.clip.default}`,
        props.p ? `fui-r-p-${props.p}` : undefined,
        props.px ? `fui-r-px-${props.px}` : undefined,
        props.py ? `fui-r-py-${props.py}` : undefined,
        props.pt ? `fui-r-pt-${props.pt}` : undefined,
        props.pr ? `fui-r-pr-${props.pr}` : undefined,
        props.pb ? `fui-r-pb-${props.pb}` : undefined,
        props.pl ? `fui-r-pl-${props.pl}` : undefined,
      )}
    >
      {resolved()}
    </div>
  );
};

export { Inset };
