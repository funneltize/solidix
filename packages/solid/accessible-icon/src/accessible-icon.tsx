import { children as resolveChildren, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createSlot } from "@soldix/slot";
import { Root as VisuallyHidden } from "@soldix/visually-hidden";

interface AccessibleIconProps {
  children?: JSX.Element | undefined;
  /**
   * The accessible label for the icon. This label will be visually hidden but announced to screen
   * reader users, similar to `alt` text for `img` tags.
   */
  label: string;
}

const IconSlot = createSlot<
  Element,
  { "aria-hidden"?: "true" | "false" | undefined; focusable?: string | undefined }
>("AccessibleIcon");

const AccessibleIcon: Component<AccessibleIconProps> = (props) => {
  const resolved = resolveChildren(() => props.children);

  // `React.Children.only` parity: exactly one child element is required.
  const nodes = resolved.toArray();
  if (nodes.length !== 1 || !(nodes[0] instanceof Element)) {
    throw new Error("AccessibleIcon requires exactly one child element.");
  }
  const icon = nodes[0];

  return (
    <>
      <IconSlot
        // accessibility
        aria-hidden="true"
        focusable="false" // See: https://allyjs.io/tutorials/focusing-in-svg.html#making-svg-elements-focusable
      >
        {icon}
      </IconSlot>
      <VisuallyHidden>{props.label}</VisuallyHidden>
    </>
  );
};

/* -----------------------------------------------------------------------------------------------*/

export {
  AccessibleIcon,
  //
  AccessibleIcon as Root,
};
export type { AccessibleIconProps };
