// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/lightbox/
//
// Only scalar and enum props are expressed as prop defs (dialog precedent).
// Handler props (`onOpenChange`, `onOpenChangeComplete`, `onValueChange`,
// `onZoomChange`), the render-prop `overlay`, and structural props (`container`)
// stay plain TypeScript props on the matching component in `lightbox.tsx`.

import type { GetPropDefTypes, PropDef } from "../../helpers/props";

const morphToValues = ["active", "origin", "closest"] as const;

/**
 * Props for `Lightbox.Root`.
 *
 * Upstream: `lightbox-root.tsx` (`LightboxRootProps`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const rootPropDefs = {
  /** Whether the lightbox is open (controlled). */
  open: { type: "boolean", default: undefined },
  /** Whether the lightbox is open on mount (uncontrolled). */
  defaultOpen: { type: "boolean", default: false },
  /** The active item index (controlled). */
  value: { type: "string | number", default: undefined },
  /** The active item index on mount (uncontrolled). */
  defaultValue: { type: "string | number", default: 0 },
  /** Whether arrow navigation wraps around at the ends. */
  loop: { type: "boolean", default: false },
  /** Whether item changes animate with a view transition. */
  viewTransition: { type: "boolean", default: false },
  /** Which trigger the dialog morphs to on close. */
  morphTo: {
    type: "enum",
    values: morphToValues,
    default: "active",
  },
  /** Wait for the incoming item image to decode before swapping. */
  awaitImageDecode: { type: "boolean", default: true },
} satisfies Record<string, PropDef>;

/**
 * Props for `Lightbox.Content`.
 *
 * Upstream: `lightbox-content.tsx` (`LightboxContentProps`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const contentPropDefs = {
  /** Enable pull-to-dismiss on touch devices. */
  pullToClose: { type: "boolean", default: true },
} satisfies Record<string, PropDef>;

/**
 * Props for `Lightbox.Trigger`.
 *
 * Upstream: `lightbox-trigger.tsx` (`LightboxTriggerProps`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const triggerPropDefs = {
  /** Item index this trigger opens. */
  index: { type: "string | number", default: 0 },
  /** Use a crossfade instead of the morph animation for this trigger. */
  crossfade: { type: "boolean", default: false },
} satisfies Record<string, PropDef>;

/**
 * Props for `Lightbox.ItemGroup`.
 *
 * Upstream: `lightbox-item-group.tsx` (`LightboxItemGroupProps`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const itemGroupPropDefs = {
  /** How many items to preload on each side of the active item. */
  preload: { type: "string | number", default: 1 },
} satisfies Record<string, PropDef>;

/**
 * Props for `Lightbox.Item`.
 *
 * Upstream: `lightbox-item.tsx` (`LightboxItemProps`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const itemPropDefs = {
  /** Item index within the group. */
  index: { type: "string | number", default: 0 },
  /** Caption text registered for this item. */
  caption: { type: "string", default: undefined },
} satisfies Record<string, PropDef>;

/**
 * Props for `Lightbox.Thumbnail`.
 *
 * Upstream: `lightbox-thumbnail.tsx` (`LightboxThumbnailProps`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const thumbnailPropDefs = {
  /** Item index this thumbnail selects. */
  index: { type: "string | number", default: 0 },
} satisfies Record<string, PropDef>;

/**
 * Props for `Lightbox.Zoom`.
 *
 * Upstream: `lightbox-zoom.tsx` (`LightboxZoomProps`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const zoomPropDefs = {
  /** Minimum zoom scale. */
  minZoom: { type: "string | number", default: 1 },
  /** Maximum zoom scale. Defaults to the natural pixel size when known. */
  maxZoom: { type: "string | number", default: undefined },
  /** Scale step for zoom in and zoom out buttons. */
  zoomStep: { type: "string | number", default: 2 },
  /** Enable scroll (wheel) to zoom. */
  scrollToZoom: { type: "boolean", default: false },
  /** Wheel zoom sensitivity multiplier. */
  wheelSensitivity: { type: "string | number", default: 100 },
  /** Pan distance in pixels for keyboard arrows. */
  keyboardPanDistance: { type: "string | number", default: 50 },
  /** Double-click zoom stops. */
  doubleClickMaxStops: { type: "string | number", default: 2 },
  /** Double-click detection delay in milliseconds. */
  doubleClickDelay: { type: "string | number", default: 300 },
  /** Duration of programmatic zoom animations in milliseconds. */
  animationDuration: { type: "string | number", default: 300 },
  /** Class applied to the inner transformed wrapper. */
  wrapperClassName: { type: "string", default: undefined },
} satisfies Record<string, PropDef>;

/** Root props derived from {@link rootPropDefs}. */
type LightboxRootOwnProps = GetPropDefTypes<typeof rootPropDefs>;

/** Content props derived from {@link contentPropDefs}. */
type LightboxContentOwnProps = GetPropDefTypes<typeof contentPropDefs>;

/** Trigger props derived from {@link triggerPropDefs}. */
type LightboxTriggerOwnProps = GetPropDefTypes<typeof triggerPropDefs>;

/** Item group props derived from {@link itemGroupPropDefs}. */
type LightboxItemGroupOwnProps = GetPropDefTypes<typeof itemGroupPropDefs>;

/** Item props derived from {@link itemPropDefs}. */
type LightboxItemOwnProps = GetPropDefTypes<typeof itemPropDefs>;

/** Thumbnail props derived from {@link thumbnailPropDefs}. */
type LightboxThumbnailOwnProps = GetPropDefTypes<typeof thumbnailPropDefs>;

/** Zoom props derived from {@link zoomPropDefs}. */
type LightboxZoomOwnProps = GetPropDefTypes<typeof zoomPropDefs>;

export {
  rootPropDefs,
  contentPropDefs,
  triggerPropDefs,
  itemGroupPropDefs,
  itemPropDefs,
  thumbnailPropDefs,
  zoomPropDefs,
};
export type {
  LightboxContentOwnProps,
  LightboxItemGroupOwnProps,
  LightboxItemOwnProps,
  LightboxRootOwnProps,
  LightboxThumbnailOwnProps,
  LightboxTriggerOwnProps,
  LightboxZoomOwnProps,
};
