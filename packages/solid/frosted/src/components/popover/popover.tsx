// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/popover/popover.tsx
// Base UI Popover parts (Root, Trigger, Portal, Positioner, Popup, Close) map onto
// @solidix/popover (Popover, Trigger, Portal, Content, Close). Upstream `Positioner`
// (the `fui-PopoverPositioner` anchor-tracking wrapper) and `Popup` (the
// `fui-PopoverContent` panel) are one element here: the solidix content carries
// both `fui-PopoverPositioner` (kept as a styling hook, it has no rules of its own)
// and the `fui-PopoverContent` classes. The CSS anchors bridge: upstream rules read
// `--anchor-width` and `--transform-origin`; see popover.css for the aliases onto
// the `--radix-popper-*` variables solidix sets, and the `data-starting-style` /
// `data-ending-style` mapping onto `data-state`.

import { createMemo, omit, Show, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { RefObject } from "@solidix/compose-refs";
import {
  Popover as PopoverPrimitive,
  PopoverAnchor as PopoverAnchorPrimitive,
  PopoverClose as PopoverClosePrimitive,
  PopoverContent as PopoverContentPrimitive,
  PopoverPortal as PopoverPortalPrimitive,
  PopoverTrigger as PopoverTriggerPrimitive,
  type PopoverAnchorProps as PopoverAnchorPrimitiveProps,
  type PopoverCloseProps as PopoverClosePrimitiveProps,
  type PopoverContentProps as PopoverContentPrimitiveProps,
  type PopoverPortalProps as PopoverPortalPrimitiveProps,
  type PopoverProps as PopoverPrimitiveProps,
  type PopoverTriggerProps as PopoverTriggerPrimitiveProps,
} from "@solidix/popover";
import { cx } from "../../helpers/cx";
import { Theme } from "../../theme";
import { popoverContentPropDefs, type PopoverContentOwnProps } from "./popover.props";

/* -------------------------------------------------------------------------------------------------
 * PopoverRoot
 * -----------------------------------------------------------------------------------------------*/

/**
 * Props accepted by the `Root` component.
 *
 * Upstream `handle` / `payload` are dropped with the Base UI handle API; this is a
 * plain open-state passthrough onto the solidix root.
 */
interface PopoverRootProps extends PopoverPrimitiveProps {}

/** The root container that manages the popover open state. Not modal by default. */
const PopoverRoot: Component<PopoverRootProps> = (props) => <PopoverPrimitive {...props} />;

/* -------------------------------------------------------------------------------------------------
 * PopoverTrigger
 * -----------------------------------------------------------------------------------------------*/

/** Props accepted by the `Trigger` component. `children` is the single slotted element. */
interface PopoverTriggerProps extends Omit<PopoverTriggerPrimitiveProps, "asChild"> {
  /** The single element that receives the trigger behavior. */
  children: JSX.Element;
}

/** The button that opens the popover, slotted onto its single child element. */
const PopoverTrigger: Component<PopoverTriggerProps> = (props) => {
  const rest = omit(props, "children");
  return (
    <PopoverTriggerPrimitive asChild {...rest}>
      {props.children}
    </PopoverTriggerPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * PopoverContent
 * -----------------------------------------------------------------------------------------------*/

/**
 * Anchor for custom positioning: an element, a ref object holding one, or a
 * zero-arg getter returning one. Upstream `anchor` takes Base UI `Measurable`,
 * which additionally admits virtual elements; those have no solidix equivalent
 * and narrow to the getter form here.
 */
type PopoverAnchor = Element | RefObject<Element | null> | (() => Element | null);

/** Props accepted by the `Content` component. */
interface PopoverContentProps
  extends
    PopoverContentOwnProps,
    Omit<PopoverContentPrimitiveProps, "asChild" | "align" | "side" | "sticky" | "anchor"> {
  /** Container element to portal the content into. Passed to the portal. */
  container?: PopoverPortalPrimitiveProps["container"] | undefined;
  /** Keeps the portal mounted when closed. Passed to the portal as `forceMount`. */
  keepMounted?: boolean | undefined;
  /** Preferred side of the anchor to render against. Defaults to `"bottom"`. */
  side?: PopoverContentPrimitiveProps["side"] | undefined;
  /** Preferred alignment against the anchor. Defaults to `"center"`. */
  align?: PopoverContentPrimitiveProps["align"] | undefined;
  /**
   * Whether the content sticks to the anchor while it is partially out of view.
   * Bridges onto the popper `sticky` mode: `true` selects `"partial"` (shift with
   * the `limitShift` limiter), while `false` or omitted selects `"always"` (shift
   * without the limiter), matching the Base UI default-off behavior.
   */
  sticky?: boolean | undefined;
  /** An element, ref object, or getter used as the positioning anchor instead of the trigger. */
  anchor?: PopoverAnchor | undefined;
}

/** The popover panel, portalled with theme, size, and variant classes. */
const PopoverContent: Component<PopoverContentProps> = (props) => {
  const rest = omit(
    props,
    "size",
    "variant",
    "class",
    "children",
    "container",
    "keepMounted",
    "forceMount",
    "side",
    "align",
    "sideOffset",
    "alignOffset",
    "collisionPadding",
    "sticky",
    "arrowPadding",
    "anchor",
  );
  const size = () => props.size ?? popoverContentPropDefs.size.default;
  const variant = () => props.variant ?? popoverContentPropDefs.variant.default;
  const anchorRef = createMemo<(() => Element | null) | undefined>(() => {
    const resolved = props.anchor;
    if (resolved === undefined) return undefined;
    if (typeof resolved === "function") return resolved;
    if ("current" in resolved) {
      const ref = resolved;
      return () => ref.current;
    }
    const element = resolved;
    return () => element;
  });
  return (
    <PopoverPortalPrimitive
      container={props.container}
      forceMount={props.keepMounted ? true : undefined}
    >
      <Theme>
        <Show when={anchorRef()} keyed>
          {(getter) => <PopoverAnchorPrimitive virtualRef={getter} />}
        </Show>
        <PopoverContentPrimitive
          class={cx(
            "fui-PopoverPositioner",
            "fui-PopoverContent",
            `fui-variant-${variant()}`,
            `fui-r-size-${size()}`,
            props.class,
          )}
          side={props.side ?? "bottom"}
          align={props.align ?? "center"}
          sideOffset={props.sideOffset ?? 8}
          alignOffset={props.alignOffset}
          collisionPadding={props.collisionPadding ?? 10}
          sticky={props.sticky ? "partial" : "always"}
          arrowPadding={props.arrowPadding}
          forceMount={(props.forceMount ?? props.keepMounted) ? true : undefined}
          {...rest}
        >
          {props.children}
        </PopoverContentPrimitive>
      </Theme>
    </PopoverPortalPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * PopoverClose
 * -----------------------------------------------------------------------------------------------*/

/** Props accepted by the `Close` component. `children` is the single slotted element. */
interface PopoverCloseProps extends Omit<PopoverClosePrimitiveProps, "asChild"> {
  /** The single element that receives the close behavior. */
  children: JSX.Element;
}

/** A button that closes the popover, slotted onto its single child element. */
const PopoverClose: Component<PopoverCloseProps> = (props) => {
  const rest = omit(props, "children");
  return (
    <PopoverClosePrimitive asChild {...rest}>
      {props.children}
    </PopoverClosePrimitive>
  );
};

/* -----------------------------------------------------------------------------------------------*/

/**
 * Namespaced `Popover` export grouping every popover part
 * (`Root`, `Trigger`, `Content`, `Close`).
 */
const Popover = {
  Close: PopoverClose,
  Content: PopoverContent,
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
};

export { Popover, PopoverClose, PopoverContent, PopoverRoot, PopoverTrigger };
export type {
  PopoverAnchor,
  PopoverAnchorPrimitiveProps,
  PopoverCloseProps,
  PopoverContentProps,
  PopoverRootProps,
  PopoverTriggerProps,
};
