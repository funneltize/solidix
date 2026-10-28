// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/tooltip/tooltip.tsx
// Base UI Tooltip parts (Root, Trigger, Portal, Positioner, Popup, Arrow) map onto
// @solidix/tooltip (Tooltip, TooltipTrigger, TooltipPortal, TooltipContent,
// TooltipArrow). Upstream `Positioner` (the `fui-TooltipPositioner` wrapper) and
// `Popup` (the `fui-TooltipContent` panel) are one element here: the solidix
// content carries both the `fui-TooltipPositioner` class (kept as a styling
// hook) and the `fui-TooltipContent` classes. Upstream `ReversedTheme` becomes
// the plain frosted `Theme` (the headless package has no theme concept). Delays
// live on the root: upstream `delay` (400) becomes `delayDuration`; the
// trigger-level `closeDelay` has no headless equivalent and is dropped.
// `disableHoverablePopup` maps onto `disableHoverableContent`, and the boolean
// `sticky` selects the popper `"partial"` / `"always"` mode. `closeOnClick`
// defaults to `true` like upstream; passing `false` prevents the trigger click
// default, which the headless trigger honors by skipping its close. Dropped
// with the Base UI API: `disabled`, `trackCursorAxis`, `actionsRef`,
// `closeDelay`, `onOpenChangeComplete`.

import { omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  Tooltip as TooltipPrimitive,
  TooltipArrow as TooltipArrowPrimitive,
  TooltipContent as TooltipContentPrimitive,
  TooltipPortal as TooltipPortalPrimitive,
  TooltipTrigger as TooltipTriggerPrimitive,
  type TooltipContentProps as TooltipContentPrimitiveProps,
  type TooltipPortalProps as TooltipPortalPrimitiveProps,
} from "@solidix/tooltip";
import { cx } from "../../helpers/cx";
import { Theme } from "../../theme";
import { Text } from "../text/text";
import { type TooltipOwnProps } from "./tooltip.props";

/** Props accepted by the `Tooltip` component. */
export interface TooltipProps extends TooltipOwnProps {
  /** The single element that opens the tooltip on hover or focus. */
  children: JSX.Element;
  /** Controlled open state. */
  open?: boolean | undefined;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean | undefined;
  /** Called when the open state changes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Delay in ms before the tooltip opens. Defaults to `400`. */
  delay?: number | undefined;
  /** Whether clicking the trigger closes the tooltip. Defaults to `true`. */
  closeOnClick?: boolean | undefined;
  /** Whether hovering the tooltip content keeps it open. */
  disableHoverablePopup?: boolean | undefined;
  /** Container element to portal the content into. */
  container?: TooltipPortalPrimitiveProps["container"] | undefined;
  /** Keeps the portal mounted when the tooltip is closed. */
  keepMounted?: boolean | undefined;
  /** Preferred side of the trigger to render against. */
  side?: TooltipContentPrimitiveProps["side"] | undefined;
  /** Offset in px from the trigger. Defaults to `4`. */
  sideOffset?: number | undefined;
  /** Preferred alignment against the trigger. */
  align?: TooltipContentPrimitiveProps["align"] | undefined;
  /** Offset in px along the alignment axis. */
  alignOffset?: number | undefined;
  /** Minimum distance in px from viewport edges. Defaults to `10`. */
  collisionPadding?: TooltipContentPrimitiveProps["collisionPadding"] | undefined;
  /** Whether the content sticks to the trigger while partially out of view. */
  sticky?: boolean | undefined;
  /** Additional class names for the tooltip content. */
  class?: string | undefined;
  /** Inline styles for the tooltip content. */
  style?: JSX.CSSProperties | undefined;
}

/**
 * A styled tooltip: hovering or focusing the trigger reveals a small labeled
 * popup. The `content` prop is rendered as `Text` inside the popup.
 */
const Tooltip: Component<TooltipProps> = (props) => {
  const rest = omit(
    props,
    "children",
    "content",
    "class",
    "style",
    "open",
    "defaultOpen",
    "onOpenChange",
    "delay",
    "closeOnClick",
    "disableHoverablePopup",
    "container",
    "keepMounted",
    "side",
    "sideOffset",
    "align",
    "alignOffset",
    "collisionPadding",
    "sticky",
  );
  return (
    <TooltipPrimitive
      open={props.open}
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
      delayDuration={props.delay ?? 400}
      disableHoverableContent={props.disableHoverablePopup}
    >
      <TooltipTriggerPrimitive
        asChild
        onClick={(event: MouseEvent) => {
          if (props.closeOnClick === false) event.preventDefault();
        }}
      >
        {props.children}
      </TooltipTriggerPrimitive>
      <TooltipPortalPrimitive
        container={props.container}
        forceMount={props.keepMounted ? true : undefined}
      >
        <Theme>
          <TooltipContentPrimitive
            {...rest}
            class={cx("fui-TooltipPositioner", "fui-TooltipContent", props.class)}
            style={props.style}
            side={props.side}
            sideOffset={props.sideOffset ?? 4}
            align={props.align}
            alignOffset={props.alignOffset}
            collisionPadding={props.collisionPadding ?? 10}
            sticky={props.sticky ? "partial" : "always"}
            forceMount={props.keepMounted ? true : undefined}
          >
            <Text render={<p />} class="fui-TooltipText" size="2">
              {props.content}
            </Text>
            <TooltipArrowPrimitive class="fui-TooltipArrow" />
          </TooltipContentPrimitive>
        </Theme>
      </TooltipPortalPrimitive>
    </TooltipPrimitive>
  );
};

export { Tooltip };
