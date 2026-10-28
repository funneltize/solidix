// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/lightbox/index.ts
//
// Barrel for the Solid lightbox port. Re-exports the compound parts,
// their prop types, and the prop definition tables from sibling modules.

export {
  Lightbox,
  LightboxCaption,
  LightboxClose,
  LightboxContent,
  LightboxCounter,
  LightboxItem,
  LightboxItemGroup,
  LightboxNext,
  LightboxPrevious,
  LightboxRoot,
  LightboxThumbnail,
  LightboxThumbnailGroup,
  LightboxTrigger,
  LightboxZoom,
  LightboxZoomIn,
  LightboxZoomOut,
} from "./lightbox";
export type {
  LightboxCaptionProps,
  LightboxCloseProps,
  LightboxContentProps,
  LightboxCounterProps,
  LightboxCounterRenderState,
  LightboxItemGroupProps,
  LightboxItemProps,
  LightboxItemRenderState,
  LightboxNavButtonProps,
  LightboxRootProps,
  LightboxThumbnailGroupProps,
  LightboxThumbnailProps,
  LightboxTriggerProps,
  LightboxZoomButtonProps,
  LightboxZoomProps,
  NavigationSource,
} from "./lightbox";
export {
  contentPropDefs,
  itemGroupPropDefs,
  itemPropDefs,
  rootPropDefs,
  thumbnailPropDefs,
  triggerPropDefs,
  zoomPropDefs,
} from "./lightbox.props";
export type {
  LightboxContentOwnProps,
  LightboxItemGroupOwnProps,
  LightboxItemOwnProps,
  LightboxRootOwnProps,
  LightboxThumbnailOwnProps,
  LightboxTriggerOwnProps,
  LightboxZoomOwnProps,
} from "./lightbox.props";
