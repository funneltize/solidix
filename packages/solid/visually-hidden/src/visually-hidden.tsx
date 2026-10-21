import { omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Primitive, type PrimitivePropsWithRef } from "@solidix/primitive";

/* -------------------------------------------------------------------------------------------------
 * VisuallyHidden
 * -----------------------------------------------------------------------------------------------*/

/** Frozen style object that hides content visually while keeping it available to assistive technology. */
const VISUALLY_HIDDEN_STYLES = Object.freeze({
  // See: https://github.com/twbs/bootstrap/blob/main/scss/mixins/_visually-hidden.scss
  // Note: lengths are explicit `px` strings - Solid does not append `px` to
  // numeric style values the way React does.
  position: "absolute",
  border: 0,
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  "white-space": "nowrap",
  "word-wrap": "normal",
}) satisfies JSX.CSSProperties;

type VisuallyHiddenProps = Omit<PrimitivePropsWithRef<"span">, "style"> & {
  style?: JSX.CSSProperties | undefined;
};

/** Renders a span that is invisible on screen but still announced by screen readers. */
const VisuallyHidden: Component<VisuallyHiddenProps> = (props) => {
  const rest = omit(props, "style", "children", "ref");
  return (
    <Primitive.span {...rest} ref={props.ref} style={{ ...VISUALLY_HIDDEN_STYLES, ...props.style }}>
      {props.children}
    </Primitive.span>
  );
};

/* -----------------------------------------------------------------------------------------------*/

export {
  VisuallyHidden,
  //
  VisuallyHidden as Root,
  //
  VISUALLY_HIDDEN_STYLES,
};
export type { VisuallyHiddenProps };
