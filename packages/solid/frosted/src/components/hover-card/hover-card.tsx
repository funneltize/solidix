// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/hover-card/hover-card.tsx
// Base UI PreviewCard parts (Root, Trigger, Portal, Positioner, Popup) map onto
// @solidix/hover-card (HoverCard, Trigger, Portal, Content). Upstream `Positioner`
// (the `fui-HoverCardPositioner` wrapper) and `Popup` (the `fui-HoverCardContent`
// panel) are one element here: the solidix content carries both the
// `fui-HoverCardPositioner` class (kept as a styling hook) and the
// `fui-HoverCardContent` classes. Delays live on the root (`openDelay` /
// `closeDelay`) rather than on the trigger; the trigger's upstream `delay` (200)
// and `closeDelay` (150) become the root defaults. Upstream `handle` / `payload`
// are dropped with the Base UI handle API, and there is no custom-anchor escape
// hatch (the headless package exports no anchor part).

import { omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  HoverCard as HoverCardPrimitive,
  HoverCardContent as HoverCardContentPrimitive,
  HoverCardPortal as HoverCardPortalPrimitive,
  HoverCardTrigger as HoverCardTriggerPrimitive,
  type HoverCardContentProps as HoverCardContentPrimitiveProps,
  type HoverCardPortalProps as HoverCardPortalPrimitiveProps,
  type HoverCardProps as HoverCardPrimitiveProps,
  type HoverCardTriggerProps as HoverCardTriggerPrimitiveProps,
} from "@solidix/hover-card";
import { cx } from "../../helpers/cx";
import { Theme } from "../../theme";
import {
  hoverCardContentPropDefs,
  type HoverCardContentOwnProps,
} from "./hover-card.props";

/* --- Root --- */

/**
 * Props accepted by the `Root` component.
 *
 * Upstream `handle` / `payload` are dropped with the Base UI handle API; the
 * delay defaults shift to the upstream trigger values (`openDelay` 200,
 * `closeDelay` 150) since solidix delays live on the root.
 */
interface HoverCardRootProps extends HoverCardPrimitiveProps {}

/** The root container that manages the hover card open state and hover delays. */
const HoverCardRoot: Component<HoverCardRootProps> = (props) => {
  const rest = omit(props, "openDelay", "closeDelay");
  return (
    <HoverCardPrimitive
      {...rest}
      openDelay={props.openDelay ?? 200}
      closeDelay={props.closeDelay ?? 150}
    />
  );
};

/* --- Trigger --- */

/**
 * Props accepted by the `Trigger` component.
 * `children` is the single element the trigger behavior is slotted onto.
 */
interface HoverCardTriggerProps
  extends Omit<HoverCardTriggerPrimitiveProps, "asChild"> {
  /** The single element that receives the trigger behavior. */
  children: JSX.Element;
}

/**
 * The element that opens the hover card on hover or focus, slotted onto its
 * single child element.
 */
const HoverCardTrigger: Component<HoverCardTriggerProps> = (props) => {
  const rest = omit(props, "children");
  return (
    <HoverCardTriggerPrimitive asChild {...rest}>
      {props.children}
    </HoverCardTriggerPrimitive>
  );
};

/* --- Content --- */

/** Props accepted by the `Content` component. */
interface HoverCardContentProps
  extends HoverCardContentOwnProps,
    Omit<
      HoverCardContentPrimitiveProps,
      "asChild" | "align" | "side" | "sticky"
    > {
  /** Container element to portal the content into. Passed to the portal. */
  container?: HoverCardPortalPrimitiveProps["container"] | undefined;
  /** Keeps the portal mounted when closed. Passed to the portal as `forceMount`. */
  keepMounted?: boolean | undefined;
  /** Preferred side of the anchor to render against. Defaults to `"bottom"`. */
  side?: HoverCardContentPrimitiveProps["side"] | undefined;
  /** Preferred alignment against the anchor. Defaults to `"center"`. */
  align?: HoverCardContentPrimitiveProps["align"] | undefined;
  /**
   * Whether the content sticks to the anchor while it is partially out of view.
   * Bridges onto the popper `sticky` mode: `true` selects `"partial"` (shift
   * with the `limitShift` limiter), while `false` or omitted selects `"always"`
   * (shift without the limiter), matching the Base UI default-off behavior.
   */
  sticky?: boolean | undefined;
}

/** The hover card panel, portalled with theme, size, and variant classes. */
const HoverCardContent: Component<HoverCardContentProps> = (props) => {
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
  );
  const size = () => props.size ?? hoverCardContentPropDefs.size.default;
  const variant = () =>
    props.variant ?? hoverCardContentPropDefs.variant.default;
  return (
    <HoverCardPortalPrimitive
      container={props.container}
      forceMount={props.keepMounted ? true : undefined}
    >
      <Theme>
        <HoverCardContentPrimitive
          class={cx(
            "fui-HoverCardPositioner",
            "fui-HoverCardContent",
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
          forceMount={props.forceMount ?? props.keepMounted ? true : undefined}
          {...rest}
        >
          {props.children}
        </HoverCardContentPrimitive>
      </Theme>
    </HoverCardPortalPrimitive>
  );
};

/* --- Namespace --- */

/**
 * Namespaced `HoverCard` export grouping every hover card part
 * (`Root`, `Trigger`, `Content`).
 */
const HoverCard = {
  Content: HoverCardContent,
  Root: HoverCardRoot,
  Trigger: HoverCardTrigger,
};

export { HoverCard, HoverCardContent, HoverCardRoot, HoverCardTrigger };
export type {
  HoverCardContentProps,
  HoverCardRootProps,
  HoverCardTriggerProps,
};
