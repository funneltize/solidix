import { omit, type Component } from "solid-js";
import { Primitive, type PrimitivePropsWithRef } from "@solidix/primitive";

/* -------------------------------------------------------------------------------------------------
 * Separator
 * -----------------------------------------------------------------------------------------------*/

const Orientation = {
  Horizontal: "horizontal",
  Vertical: "vertical",
} as const;

const DEFAULT_ORIENTATION = Orientation.Horizontal;
const ORIENTATIONS = Object.values(Orientation);

type Orientation = (typeof Orientation)[keyof typeof Orientation];

/** Props accepted by the separator. */
type SeparatorProps = PrimitivePropsWithRef<"div"> & {
  /**
   * Either `vertical` or `horizontal`. Defaults to `horizontal`.
   */
  orientation?: Orientation | undefined;
  /**
   * Whether or not the component is purely decorative. When true, accessibility-related attributes
   * are updated so that the rendered element is removed from the accessibility tree.
   */
  decorative?: boolean | undefined;
};

/** Renders a horizontal or vertical divider that separates content sections. */
const Separator: Component<SeparatorProps> = (props) => {
  const rest = omit(props, "decorative", "orientation", "ref");
  const orientation = () => {
    const orientationProp = props.orientation ?? DEFAULT_ORIENTATION;
    return isValidOrientation(orientationProp) ? orientationProp : DEFAULT_ORIENTATION;
  };
  // `aria-orientation` defaults to `horizontal` so we only need it if `orientation` is vertical
  const ariaOrientation = () =>
    orientation() === Orientation.Vertical ? orientation() : undefined;

  return (
    <Primitive.div
      data-orientation={orientation()}
      role={props.decorative ? "none" : "separator"}
      aria-orientation={props.decorative ? undefined : ariaOrientation()}
      {...rest}
      ref={props.ref}
    />
  );
};

/* -----------------------------------------------------------------------------------------------*/

function isValidOrientation(orientation: unknown): orientation is Orientation {
  return (ORIENTATIONS as ReadonlyArray<unknown>).includes(orientation);
}

export {
  Separator,
  //
  Separator as Root,
};
export type { SeparatorProps };
