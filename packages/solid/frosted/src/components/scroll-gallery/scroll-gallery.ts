import { ScrollGalleryItem } from "./scroll-gallery-item";
import { ScrollGalleryNext } from "./scroll-gallery-next";
import { ScrollGalleryPrevious } from "./scroll-gallery-previous";
import { ScrollGalleryRoot } from "./scroll-gallery-root";
import { ScrollGalleryScrollMarker } from "./scroll-gallery-scroll-marker";
import { ScrollGalleryScrollMarkerGroup } from "./scroll-gallery-scroll-marker-group";
import { ScrollGalleryViewport } from "./scroll-gallery-viewport";

/**
 * ScrollGallery - a headless, unstyled compound component for scrollable
 * navigation galleries. Inspired by the CSS Overflow Level 5 spec's
 * `::scroll-button()`, `::scroll-marker`, and `::scroll-marker-group`
 * pseudo-elements, implemented as a Solid primitive.
 *
 * Sub-components:
 *   Root            - Context-only provider (no DOM element), active index state, imperative scrollTo
 *   Viewport        - Scrollable container, scroll event orchestration
 *   Item            - Individual gallery item, self-registering
 *   Previous/Next   - Scroll buttons (page-based, auto-disable at boundaries)
 *   ScrollMarkerGroup - Container for markers (role="tablist")
 *   ScrollMarker    - Individual marker button (role="tab")
 *
 * Upstream: `scroll-gallery.ts` at whopio/frosted-ui commit `56787900bfe0`.
 */
const ScrollGallery = {
  Root: ScrollGalleryRoot,
  Viewport: ScrollGalleryViewport,
  Item: ScrollGalleryItem,
  Previous: ScrollGalleryPrevious,
  Next: ScrollGalleryNext,
  ScrollMarkerGroup: ScrollGalleryScrollMarkerGroup,
  ScrollMarker: ScrollGalleryScrollMarker,
};

export { ScrollGallery };
