import {
  PAGE_SCROLL_FACTOR,
  getScrollBehavior,
  getScrollDistance,
  getSnapAlignment,
  useScrollGalleryContext,
} from "./scroll-gallery-context";

/** Options for `useScrollButton`. */
interface UseScrollButtonOptions {
  /** Which direction the button scrolls. */
  direction: "previous" | "next";
  /**
   * How many items to scroll by. When set to a number, the button scrolls
   * to bring the item N positions away from the current anchor into view.
   * When omitted, scrolls by ~85% of the viewport ("one page") per the
   * CSS Overflow 5 section 3.2 spec.
   */
  step?: number | undefined;
}

/** Return value of `useScrollButton`. */
interface UseScrollButtonReturn {
  /** Whether the button is disabled (reactive). */
  disabled: () => boolean;
  /** Click handler performing the scroll. */
  handleClick: () => void;
}

/**
 * Shared behavior for `ScrollGallery.Previous` and `ScrollGallery.Next`:
 * boundary-derived disabled state and page- or step-based scrolling.
 *
 * Upstream: `use-scroll-button.ts` (`useScrollButton`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
function useScrollButton(options: UseScrollButtonOptions): UseScrollButtonReturn {
  // Read `step` lazily (not destructured): callers pass a getter so
  // prop updates propagate to the click handler.
  const direction = options.direction;
  const {
    canScrollPrev,
    canScrollNext,
    getItemElements,
    loop,
    orientation,
    scrollBehavior,
    scrollingRef,
    scrollTargetRef,
    scrollToItem,
    viewportRef,
  } = useScrollGalleryContext();

  const isPrev = direction === "previous";
  const disabled = () => (loop() ? false : isPrev ? !canScrollPrev() : !canScrollNext());
  const sign = isPrev ? -1 : 1;

  const handleClick = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const isHorizontal = orientation() === "horizontal";
    const items = getItemElements();
    const canScroll = isPrev ? canScrollPrev() : canScrollNext();

    // When looping and already at the boundary, wrap to the other end.
    // Delegates to scrollToItem which handles target-locking and
    // immediate active-index update (same behavior as a marker click).
    if (loop() && !canScroll) {
      const wrapIndex = isPrev ? items.length - 1 : 0;
      scrollToItem(wrapIndex);
      return;
    }

    if (disabled()) return;

    // Clear any lingering programmatic scroll state from a prior marker
    // click. Both refs must be cleared so that scroll events go through
    // Case 4 (real-time computeActiveIndex), giving smooth marker
    // transitions during the button's scroll animation.
    scrollTargetRef.current = null;
    scrollingRef.current = false;

    const step = options.step;
    if (step != null) {
      // Step mode: find the currently snapped item (anchor) and scroll to
      // the one N positions away. The anchor is the item whose snap
      // reference point is closest to the viewport's matching reference.
      const snapAlign = items.length > 0 ? getSnapAlignment(items[0], orientation()) : "start";
      const viewportRect = viewport.getBoundingClientRect();

      let vpRef: number;
      if (snapAlign === "center") {
        vpRef = isHorizontal
          ? viewportRect.left + viewportRect.width / 2
          : viewportRect.top + viewportRect.height / 2;
      } else if (snapAlign === "end") {
        vpRef = isHorizontal ? viewportRect.right : viewportRect.bottom;
      } else {
        vpRef = isHorizontal ? viewportRect.left : viewportRect.top;
      }

      let anchorIndex = 0;
      let minDist = Infinity;
      for (let i = 0; i < items.length; i++) {
        const rect = items[i].getBoundingClientRect();
        let itemRef: number;
        if (snapAlign === "center") {
          itemRef = isHorizontal ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
        } else if (snapAlign === "end") {
          itemRef = isHorizontal ? rect.right : rect.bottom;
        } else {
          itemRef = isHorizontal ? rect.left : rect.top;
        }
        const dist = Math.abs(itemRef - vpRef);
        if (dist < minDist) {
          minDist = dist;
          anchorIndex = i;
        }
      }

      const targetIndex = isPrev
        ? Math.max(0, anchorIndex - step)
        : Math.min(items.length - 1, anchorIndex + step);
      const target = items[targetIndex];
      if (!target) return;

      const distance = getScrollDistance(target, viewport, orientation());

      viewport.scrollBy({
        [isHorizontal ? "left" : "top"]: distance,
        behavior: getScrollBehavior(scrollBehavior()),
      });
    } else {
      // Page mode (default): scroll by ~85% of the viewport.
      const pageSize = isHorizontal ? viewport.clientWidth : viewport.clientHeight;

      viewport.scrollBy({
        [isHorizontal ? "left" : "top"]: sign * pageSize * PAGE_SCROLL_FACTOR,
        behavior: getScrollBehavior(scrollBehavior()),
      });
    }
  };

  return { disabled, handleClick };
}

export { useScrollButton };
export type { UseScrollButtonOptions, UseScrollButtonReturn };
