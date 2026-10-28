import { createContext, useContext } from "solid-js";

/**
 * Identifies what initiated an active index change. Consumers receive this
 * in the `onValueChange` callback so they can respond differently to
 * programmatic vs user-driven changes.
 */
type ChangeSource = "scroll" | "indicator";

/** ScrollGallery orientation. */
type ScrollGalleryOrientation = "horizontal" | "vertical";

/** Snap alignment axis value used by the scroll math. */
type SnapAlignment = "start" | "center" | "end";

/** Value shared by the `ScrollGallery` compound parts. */
interface ScrollGalleryContextValue {
  /** Currently active item index. */
  activeIndex: () => number;
  /** Set the active index, firing `onValueChange` with the change source. */
  setActiveIndex: (index: number, source: ChangeSource) => void;
  /** Gallery orientation. */
  orientation: () => ScrollGalleryOrientation;
  /**
   * The scroll behavior used by all programmatic scrolls (navigation,
   * markers, controlled value changes). Reduced motion always forces
   * `'instant'` regardless of this value.
   */
  scrollBehavior: () => ScrollBehavior;
  /**
   * When true, navigation wraps around at boundaries: Previous/Next
   * buttons don't disable and jump to the other end, and marker group
   * arrow keys wrap instead of clamping.
   */
  loop: () => boolean;
  /**
   * Mirrors the native CSS `::scroll-button()` `:disabled` pseudo-class
   * (CSS Overflow 5 section 3.2): a scroll button is disabled when its
   * scroll container can't be scrolled further in that direction.
   */
  canScrollPrev: () => boolean;
  /** Whether the viewport can scroll further toward the end. */
  canScrollNext: () => boolean;
  /** Update the previous-boundary flag. */
  setCanScrollPrev: (value: boolean) => void;
  /** Update the next-boundary flag. */
  setCanScrollNext: (value: boolean) => void;
  /** Register/unregister an Item DOM element. Returns a cleanup function. */
  registerItem: (element: HTMLElement) => () => void;
  /** Ref object holding the viewport element. */
  viewportRef: { current: HTMLElement | null };
  /** Returns item elements sorted in DOM order via compareDocumentPosition. */
  getItemElements: () => HTMLElement[];
  /** Number of registered items. */
  itemCount: () => number;
  /** Increments when items register/unregister, used to re-trigger observer setup. */
  itemsVersion: () => number;
  /**
   * Implements the CSS Overflow 5 section 2.1 "current scroll target"
   * concept: when a scroll marker is clicked, its index is locked as the
   * active marker through the smooth scroll animation until the user
   * initiates a manual scroll (which resets it to null).
   */
  scrollTargetRef: { current: number | null };
  /**
   * True while a programmatic smooth scroll is animating. Used by the
   * viewport's scroll handler to suppress active-index recomputation
   * during animations. Cleared after scroll events stop firing.
   */
  scrollingRef: { current: boolean };
  /**
   * Scroll the viewport to bring the item at the given index into view,
   * locking the active marker to that index through the smooth scroll
   * animation. The shared "locked scroll to item" primitive used by
   * markers, viewport arrow keys, scroll button loop-wrap, and the
   * public imperative `scrollTo` API.
   */
  scrollToItem: (index: number, behavior?: ScrollBehavior) => void;
}

/** Context shared by the `ScrollGallery` compound parts. */
const ScrollGalleryContext = createContext<ScrollGalleryContextValue>();

/**
 * Reads the `ScrollGallery` context. Throws when used outside a
 * `ScrollGallery.Root`.
 */
function useScrollGalleryContext(): ScrollGalleryContextValue {
  try {
    return useContext(ScrollGalleryContext);
  } catch {
    throw new Error("ScrollGallery compound components must be used within a ScrollGallery.Root");
  }
}

/**
 * Resolves the scroll behavior to use for programmatic scrolls.
 * Returns `'instant'` when the user prefers reduced motion, otherwise
 * returns the requested behavior. This complements the CSS
 * `scroll-behavior: auto` rule in `scroll-gallery.css` - the CSS property
 * only affects CSS-triggered scrolls, while `scrollTo`/`scrollBy`
 * calls pass an explicit `behavior` option that overrides it.
 */
function getScrollBehavior(preferred: ScrollBehavior = "smooth"): ScrollBehavior {
  if (typeof window === "undefined") return preferred;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : preferred;
}

/**
 * Reads the resolved `scroll-snap-align` from an element and returns the
 * relevant axis value. Falls back to `'start'` when no snap alignment is
 * set (`'none'`) or on SSR.
 *
 * CSS syntax: `scroll-snap-align: [block] [inline]`. One value sets both axes.
 */
function getSnapAlignment(item: HTMLElement, orientation: ScrollGalleryOrientation): SnapAlignment {
  try {
    const raw = getComputedStyle(item).scrollSnapAlign;
    const parts = raw.split(" ");
    const align =
      orientation === "horizontal" ? (parts.length > 1 ? parts[1] : parts[0]) : parts[0];
    if (align === "center") return "center";
    if (align === "end") return "end";
  } catch {
    // SSR or getComputedStyle unavailable
  }
  return "start";
}

/**
 * Computes the absolute scroll position to snap a target item within
 * its scroll container. Uses `offsetLeft`/`offsetTop` (relative to the
 * offset parent) instead of `getBoundingClientRect` - the latter returns
 * unreliable values on mobile Safari during initial layout inside
 * `<dialog>` elements (before the top-layer promotion has fully settled).
 *
 * Use this for initial/mount scrolling where `scrollTo` with an absolute
 * position is appropriate. For runtime scrolling (marker clicks, keyboard
 * navigation) where layout is stable, use `getScrollDistance` + `scrollBy`.
 */
function getAbsoluteScrollPosition(
  target: HTMLElement,
  viewport: HTMLElement,
  orientation: ScrollGalleryOrientation,
): number {
  const isHorizontal = orientation === "horizontal";
  const snapAlign = getSnapAlignment(target, orientation);
  const itemOffset = isHorizontal ? target.offsetLeft : target.offsetTop;
  const itemSize = isHorizontal ? target.offsetWidth : target.offsetHeight;
  const viewportSize = isHorizontal ? viewport.clientWidth : viewport.clientHeight;

  if (snapAlign === "center") {
    return itemOffset - (viewportSize - itemSize) / 2;
  }
  if (snapAlign === "end") {
    return itemOffset - viewportSize + itemSize;
  }
  return itemOffset;
}

/**
 * Computes the scroll distance (delta) to bring a target item to its
 * snap position within the viewport. Uses `getBoundingClientRect` for
 * visual-position-based calculation - accurate for runtime scrolling
 * when layout is fully established.
 */
function getScrollDistance(
  target: HTMLElement,
  viewport: HTMLElement,
  orientation: ScrollGalleryOrientation,
): number {
  const isHorizontal = orientation === "horizontal";
  const snapAlign = getSnapAlignment(target, orientation);
  const targetRect = target.getBoundingClientRect();
  const viewportRect = viewport.getBoundingClientRect();

  let targetRef: number;
  let viewportRefPos: number;

  if (snapAlign === "center") {
    targetRef = isHorizontal
      ? targetRect.left + targetRect.width / 2
      : targetRect.top + targetRect.height / 2;
    viewportRefPos = isHorizontal
      ? viewportRect.left + viewportRect.width / 2
      : viewportRect.top + viewportRect.height / 2;
  } else if (snapAlign === "end") {
    targetRef = isHorizontal ? targetRect.right : targetRect.bottom;
    viewportRefPos = isHorizontal ? viewportRect.right : viewportRect.bottom;
  } else {
    targetRef = isHorizontal ? targetRect.left : targetRect.top;
    viewportRefPos = isHorizontal ? viewportRect.left : viewportRect.top;
  }

  return targetRef - viewportRefPos;
}

/**
 * CSS Overflow 5 section 3.2: scroll buttons scroll by "one page" in their
 * direction - "similar to pressing PgUp/PgDn keys. (Usually, this will
 * be about 85% of the scrollport size.)"
 */
const PAGE_SCROLL_FACTOR = 0.85;

export {
  getAbsoluteScrollPosition,
  getScrollBehavior,
  getScrollDistance,
  getSnapAlignment,
  PAGE_SCROLL_FACTOR,
  ScrollGalleryContext,
  useScrollGalleryContext,
};
export type { ChangeSource, ScrollGalleryContextValue, ScrollGalleryOrientation, SnapAlignment };
