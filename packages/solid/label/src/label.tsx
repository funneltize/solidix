import { omit, type Component } from "solid-js";
import { Primitive, callEventHandler, type PrimitivePropsWithRef } from "@solidix/primitive";

/* -------------------------------------------------------------------------------------------------
 * Label
 * -----------------------------------------------------------------------------------------------*/

/** Props accepted by the label element. */
type LabelProps = PrimitivePropsWithRef<"label">;

/** Renders an accessible label that avoids selecting text on mousedown inside itself. */
const Label: Component<LabelProps> = (props) => {
  const rest = omit(props, "onMouseDown", "ref");
  return (
    <Primitive.label
      {...rest}
      ref={props.ref}
      onMouseDown={(event) => {
        // only prevent text selection if clicking inside the label itself
        const target = event.target as HTMLElement;
        if (target.closest("button, input, select, textarea")) return;

        callEventHandler(props.onMouseDown, event);
        // prevent text selection when double clicking label
        if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
      }}
    />
  );
};

/* -----------------------------------------------------------------------------------------------*/

export {
  Label,
  //
  Label as Root,
};
export type { LabelProps };
