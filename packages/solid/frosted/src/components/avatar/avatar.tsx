import { createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  Avatar as HeadlessRoot,
  AvatarFallback as HeadlessFallback,
  AvatarImage as HeadlessImage,
  type AvatarImageProps as HeadlessImageProps,
} from "@solidix/avatar";
import { cx } from "../../helpers/cx";
import { getInitials } from "../../helpers/get-initials";
import { avatarPropDefs, type AvatarOwnProps } from "./avatar.props";

/**
 * Props for `Avatar`: headless image props (src, alt, referrerPolicy, ...)
 * plus the styled prop defs. `style` is narrowed to object form and keeps
 * the intrinsic optional shape so the override stays assignable.
 */
interface AvatarProps extends Omit<HeadlessImageProps, "style">, Omit<AvatarOwnProps, "fallback"> {
  /** Fallback content, required. Strings render as initials. */
  fallback: JSX.Element;
  /** Inline styles for the root element. */
  style?: JSX.CSSProperties;
}

/**
 * User avatar: an image with an initials fallback, in circle or square
 * shapes across ten sizes.
 *
 * Upstream: `avatar.tsx` at whopio/frosted-ui commit `56787900bfe0`. The
 * Base UI `Avatar` maps to the headless `Root`/`Image`/`Fallback`.
 */
const Avatar: Component<AvatarProps> = (props) => {
  const size = () => props.size ?? avatarPropDefs.size.default;
  const color = () => props.color ?? avatarPropDefs.color.default;
  const highContrast = () => props.highContrast ?? avatarPropDefs.highContrast.default;
  const shape = () => props.shape ?? avatarPropDefs.shape.default;
  const rest = omit(
    props,
    "class",
    "style",
    "size",
    "color",
    "highContrast",
    "fallback",
    "shape",
    "onLoadingStatusChange",
  );

  // String fallbacks render as initials; element fallbacks pass through.
  const fallback = createMemo(() => {
    const fallbackProp = props.fallback;
    if (typeof fallbackProp !== "string") {
      return fallbackProp;
    }
    try {
      return getInitials(fallbackProp);
    } catch (error) {
      console.error("Error generating initials:", error);
      return fallbackProp;
    }
  });

  return (
    <HeadlessRoot
      data-accent-color={color()}
      class={cx(
        "fui-AvatarRoot",
        props.class,
        `fui-r-size-${size()}`,
        highContrast() ? "fui-high-contrast" : undefined,
        `fui-shape-${shape()}`,
      )}
      style={props.style}
    >
      <HeadlessImage
        class="fui-AvatarImage"
        onLoadingStatusChange={props.onLoadingStatusChange}
        {...rest}
      />
      <HeadlessFallback
        class={cx(
          "fui-AvatarFallback",
          typeof fallback() === "string" && (fallback() as string).length === 1
            ? "fui-one-letter"
            : undefined,
          typeof fallback() === "string" && (fallback() as string).length === 2
            ? "fui-two-letters"
            : undefined,
        )}
      >
        {fallback()}
      </HeadlessFallback>
    </HeadlessRoot>
  );
};

export { Avatar };
export type { AvatarProps };
