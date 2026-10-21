import { omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Primitive, type PrimitivePropsWithRef } from "@solidix/primitive";

/* -------------------------------------------------------------------------------------------------
 * AspectRatio
 * -----------------------------------------------------------------------------------------------*/

type AspectRatioProps = Omit<PrimitivePropsWithRef<"div">, "style"> & {
  ratio?: number | undefined;
  style?: JSX.CSSProperties | undefined;
};

/** Renders a container that preserves the given width-to-height ratio for its content. */
const AspectRatio: Component<AspectRatioProps> = (props) => {
  const rest = omit(props, "ratio", "style", "ref");
  return (
    <div
      style={{
        // ensures inner element is contained
        position: "relative",
        // ensures padding bottom trick maths works
        width: "100%",
        "padding-bottom": `${100 / (props.ratio ?? 1)}%`,
      }}
      data-radix-aspect-ratio-wrapper=""
    >
      <Primitive.div
        {...rest}
        ref={props.ref}
        style={{
          ...props.style,
          // ensures children expand in ratio
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      />
    </div>
  );
};

/* -----------------------------------------------------------------------------------------------*/

export {
  AspectRatio,
  //
  AspectRatio as Root,
};
export type { AspectRatioProps };
