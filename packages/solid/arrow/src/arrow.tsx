import { omit, type Component } from "solid-js";
import { Primitive, type PrimitivePropsWithRef } from "@solidix/primitive";

/* -------------------------------------------------------------------------------------------------
 * Arrow
 * -----------------------------------------------------------------------------------------------*/

type ArrowProps = PrimitivePropsWithRef<"svg">;

const Arrow: Component<ArrowProps> = (props) => {
  const rest = omit(props, "width", "height", "children", "ref");
  return (
    <Primitive.svg
      {...rest}
      ref={props.ref}
      width={props.width ?? 10}
      height={props.height ?? 5}
      viewBox="0 0 30 10"
      preserveAspectRatio="none"
    >
      {/* We use their children if they're slotting to replace the whole svg */}
      {props.asChild ? props.children : <polygon points="0,0 30,0 15,10" />}
    </Primitive.svg>
  );
};

/* -----------------------------------------------------------------------------------------------*/

export {
  Arrow,
  //
  Arrow as Root,
};
export type { ArrowProps };
