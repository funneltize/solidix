import {
  children,
  createEffect,
  createSignal,
  merge,
  omit,
  onSettled,
  type Component,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import { callEventHandler } from "@solidix/primitive";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { createSlot, createSlottable } from "@solidix/slot";
import { cx } from "../../helpers/cx";
import { composeEventHandlers } from "../../helpers/compose-event-handlers";
import type { PropsWithoutColor } from "../../helpers/props";
import {
  PAGE_SCROLL_FACTOR,
  getScrollBehavior,
  getSnapAlignment,
  useScrollGalleryContext,
  type ScrollGalleryOrientation,
  type SnapAlignment,
} from "./scroll-gallery-context";

/**
 * Tolerance in pixels for scroll boundary comparisons. Accounts for
 * subpixel rounding that browsers apply to scrollLeft/scrollWidth/clientWidth.
 * Without this, buttons might not disable at the exact scroll boundaries.
 */
const SCROLL_TOLERANCE = 1;

/**
 * How long to wait after the last `scroll` event fires before considering
 * a programmatic smooth scroll "settled". A scroll-event debounce is used
 * instead of `scrollend` because browser support is still patchy.
 */
const SETTLE_DELAY = 150;

/** Slot typed for `ScrollGalleryViewport` div props. */
const ViewportSlot = createSlot<HTMLDivElement, Omit<PropsWithoutColor<"div">, "children" | "ref">>(
  "ScrollGalleryViewport",
);
/** Slottable selecting the element-form `render` target for child injection. */
const ViewportSlottable = createSlottable("ScrollGalleryViewport");

/** State exposed to `ScrollGalleryViewport`'s function-form `render` prop. */
interface ScrollGalleryViewportState {
  /** Currently active item index. */
  activeIndex: number;
  /** Gallery orientation. */
  orientation: ScrollGalleryOrientation;
  /** Whether the viewport can scroll further toward the start. */
  canScrollPrev: boolean;
  /** Whether the viewport can scroll further toward the end. */
  canScrollNext: boolean;
  /** True while a scroll is in progress (debounced idle detection). */
  scrolling: boolean;
}

/**
 * Props passed to a function-form `render` prop: the caller's div props
 * with the computed `class`, data attributes, and `children` applied.
 */
type ScrollGalleryViewportRenderProps = PropsWithoutColor<"div"> & {
  /** Active item index written as `data-active-index`. */
  "data-active-index"?: string | undefined;
  /** Orientation written as `data-orientation`. */
  "data-orientation"?: ScrollGalleryOrientation | undefined;
  /** Present while the viewport can scroll toward the start. */
  "data-can-scroll-prev"?: string | undefined;
  /** Present while the viewport can scroll toward the end. */
  "data-can-scroll-next"?: string | undefined;
  /** Present while a scroll is in progress. */
  "data-scrolling"?: string | undefined;
};

/**
 * `render` prop accepted by `ScrollGalleryViewport`, mirroring Base UI
 * `useRender`: an element to render as (merged via `Slot`), or a function
 * receiving the merged props and viewport state.
 */
type ScrollGalleryViewportRenderProp =
  | JSX.Element
  | ((props: ScrollGalleryViewportRenderProps, state: ScrollGalleryViewportState) => JSX.Element);

/** Props for `ScrollGallery.Viewport`. */
interface ScrollGalleryViewportProps extends Omit<PropsWithoutColor<"div">, "ref"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLDivElement> | undefined;
  /** Element or render function overriding the default `div` output. */
  render?: ScrollGalleryViewportRenderProp | undefined;
}

/**
 * Scrollable container of the `ScrollGallery` compound: owns scroll
 * event orchestration (active-index computation, boundary flags, settle
 * detection), resize/visibility observers, and keyboard navigation.
 *
 * Upstream: `scroll-gallery-viewport.tsx` (`ScrollGalleryViewport`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const ScrollGalleryViewport: Component<ScrollGalleryViewportProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "render", "style", "onKeyDown");
  const {
    activeIndex,
    setActiveIndex,
    orientation,
    scrollBehavior,
    loop,
    canScrollPrev,
    canScrollNext,
    setCanScrollPrev,
    setCanScrollNext,
    viewportRef,
    getItemElements,
    itemsVersion,
    scrollTargetRef,
    scrollingRef,
    scrollToItem,
  } = useScrollGalleryContext();

  const [isScrolling, setIsScrolling] = createSignal(false);

  let element: HTMLDivElement | null = null;

  // Cache the resolved scroll-snap-align so getComputedStyle isn't called
  // on every scroll event. Updated when items change (itemsVersion).
  let snapAlign: SnapAlignment = "start";

  const setElement = (node: HTMLDivElement | null) => {
    element = node;
    viewportRef.current = node;
  };
  const composedRefs = composeRefs(setElement, props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  /**
   * Determines whether the Previous/Next buttons should be enabled.
   *
   * Mirrors the native CSS `::scroll-button()` `:disabled` behavior
   * (CSS Overflow 5 section 3.2): "When it is not possible to scroll any
   * further in a particular scroll button's scrolling direction, the
   * button is automatically disabled."
   *
   * Uses direct scroll position properties rather than
   * IntersectionObserver for reliability - IO can miss edge cases with
   * subpixel rounding and smooth scroll timing. Called on every scroll
   * event, initial mount, and ResizeObserver callback.
   */
  const updateBoundaries = (o: ScrollGalleryOrientation = orientation()) => {
    const viewport = element;
    if (!viewport) return;

    const isHorizontal = o === "horizontal";
    const scrollPos = isHorizontal ? viewport.scrollLeft : viewport.scrollTop;
    const scrollSize = isHorizontal ? viewport.scrollWidth : viewport.scrollHeight;
    const clientSize = isHorizontal ? viewport.clientWidth : viewport.clientHeight;

    setCanScrollPrev(scrollPos > SCROLL_TOLERANCE);
    setCanScrollNext(scrollPos + clientSize < scrollSize - SCROLL_TOLERANCE);
  };

  /**
   * Implements the "Calculating the Active Scroll Marker" algorithm from
   * CSS Overflow Level 5, adapted for JavaScript.
   *
   * Reference: https://drafts.csswg.org/css-overflow-5/#scroll-marker-active
   *
   * Step 1 - For each item, compute the scroll position that would perfectly
   * snap it according to its `scroll-snap-align` CSS value, using the cached
   * alignment's matching reference point for both item and viewport.
   *
   * Step 2 - Redistribute unreachable positions. When multiple items share
   * the same scroll position, linearly spread positions within a
   * "distribute range" at the start and end of the scroll range:
   * min(clientSize / 8, scrollRange / 2).
   *
   * Step 3 - Pick the item whose (redistributed) position is nearest to
   * the current scrollPos, so the active marker transitions at midpoints.
   */
  const computeActiveIndex = (o: ScrollGalleryOrientation = orientation()) => {
    const viewport = element;
    if (!viewport) return;

    const items = getItemElements();
    if (items.length === 0) return;

    const isHorizontal = o === "horizontal";
    const scrollPos = isHorizontal ? viewport.scrollLeft : viewport.scrollTop;
    const scrollSize = isHorizontal ? viewport.scrollWidth : viewport.scrollHeight;
    const clientSize = isHorizontal ? viewport.clientWidth : viewport.clientHeight;
    const scrollRange = scrollSize - clientSize;

    if (scrollRange <= 0) {
      setActiveIndex(0, "scroll");
      return;
    }

    const viewportRect = viewport.getBoundingClientRect();

    // Step 1: each item's target scroll position from the cached snap alignment.
    let viewportRefPos: number;
    if (snapAlign === "center") {
      viewportRefPos = isHorizontal
        ? viewportRect.left + viewportRect.width / 2
        : viewportRect.top + viewportRect.height / 2;
    } else if (snapAlign === "end") {
      viewportRefPos = isHorizontal ? viewportRect.right : viewportRect.bottom;
    } else {
      viewportRefPos = isHorizontal ? viewportRect.left : viewportRect.top;
    }

    const positions = items.map((item) => {
      const rect = item.getBoundingClientRect();
      let itemRef: number;
      if (snapAlign === "center") {
        itemRef = isHorizontal ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
      } else if (snapAlign === "end") {
        itemRef = isHorizontal ? rect.right : rect.bottom;
      } else {
        itemRef = isHorizontal ? rect.left : rect.top;
      }
      return itemRef - viewportRefPos + scrollPos;
    });

    // Step 2: redistribute unreachable positions (CSS Overflow 5 spec).
    const distributeRange = Math.min(clientSize / 8, scrollRange / 2);

    // Spread items clustering near the start (scroll position 0).
    const beforeIndices = positions
      .map((pos, i) => ({ pos, i }))
      .filter(({ pos }) => pos < distributeRange);
    if (beforeIndices.length > 1) {
      const minPos = Math.min(...beforeIndices.map((t) => t.pos));
      const denom = distributeRange - minPos;
      if (denom > 0) {
        for (const t of beforeIndices) {
          positions[t.i] = ((t.pos - minPos) / denom) * distributeRange;
        }
      }
    }

    // Spread items clustering near the end (max scroll position).
    const endThreshold = scrollRange - distributeRange;
    const afterIndices = positions
      .map((pos, i) => ({ pos, i }))
      .filter(({ pos }) => pos > endThreshold);
    if (afterIndices.length > 1) {
      const maxPos = Math.max(...afterIndices.map((t) => t.pos));
      const denom = maxPos - endThreshold;
      if (denom > 0) {
        for (const t of afterIndices) {
          positions[t.i] = ((t.pos - endThreshold) / denom) * distributeRange + endThreshold;
        }
      }
    }

    // Step 3: active = nearest item (transitions at midpoints).
    let nextActiveIndex = 0;
    let minDistance = Infinity;
    for (let i = 0; i < positions.length; i++) {
      const distance = Math.abs(positions[i] - scrollPos);
      if (distance < minDistance) {
        minDistance = distance;
        nextActiveIndex = i;
      }
    }

    setActiveIndex(nextActiveIndex, "scroll");
  };

  /**
   * Main scroll-event orchestrator.
   *
   * 1. Always update button enable/disable state (updateBoundaries).
   * 2. If a programmatic animation is in progress (`scrollingRef`):
   *    suppress computeActiveIndex to avoid marker flickering, debounce a
   *    settle handler that clears the scroll target, then return early.
   * 3. If `scrollTargetRef` is set but `scrollingRef` is false, the user
   *    is scrolling manually after an animation: clear the target.
   * 4. Otherwise (pure user scroll): run computeActiveIndex immediately
   *    with no debounce, giving live feedback.
   */
  const handleScroll = () => {
    updateBoundaries();
    setIsScrolling(true);
    clearTimeout(scrollIdleTimeout);
    scrollIdleTimeout = setTimeout(() => setIsScrolling(false), SETTLE_DELAY);

    clearTimeout(settleTimeout);

    // Case 2: programmatic animation in progress (marker click or loop-wrap).
    // Suppress computeActiveIndex to keep the marker locked on the target
    // that was already set via setActiveIndex in the click handler.
    //
    // scrollingRef is intentionally NOT cleared here. It stays true until
    // the user explicitly interacts (wheel/touch/pointer via handleUserInput)
    // or a new button/marker click clears it. This prevents a race where a
    // late scroll event sneaks in right after the settle timeout fires,
    // entering Case 4 with a scroll position that doesn't perfectly match
    // the target - causing a visible flicker: target, wrong, target.
    if (scrollingRef.current) {
      settleTimeout = setTimeout(() => {
        scrollTargetRef.current = null;
      }, SETTLE_DELAY);
      return;
    }

    // Case 3: animation settled, but user is now scrolling.
    if (scrollTargetRef.current !== null) {
      scrollTargetRef.current = null;
    }

    // Case 4: pure user scroll - update active index in real time.
    computeActiveIndex();
  };

  /**
   * User input detection: wheel, touchstart, pointerdown.
   *
   * When the user physically interacts with the viewport during a
   * programmatic smooth scroll, immediately cancel the programmatic
   * state so the active marker reflects where the user is actually
   * scrolling, not the original programmatic target.
   */
  const handleUserInput = () => {
    if (scrollingRef.current || scrollTargetRef.current !== null) {
      scrollingRef.current = false;
      scrollTargetRef.current = null;
      clearTimeout(settleTimeout);
    }
  };

  let settleTimeout: ReturnType<typeof setTimeout>;
  let scrollIdleTimeout: ReturnType<typeof setTimeout>;

  onSettled(() => {
    const viewport = element;
    if (!viewport) return;
    viewport.addEventListener("scroll", handleScroll, { passive: true });
    viewport.addEventListener("wheel", handleUserInput, { passive: true });
    viewport.addEventListener("touchstart", handleUserInput, { passive: true });
    viewport.addEventListener("pointerdown", handleUserInput);
    return () => {
      viewport.removeEventListener("scroll", handleScroll);
      viewport.removeEventListener("wheel", handleUserInput);
      viewport.removeEventListener("touchstart", handleUserInput);
      viewport.removeEventListener("pointerdown", handleUserInput);
      clearTimeout(settleTimeout);
      clearTimeout(scrollIdleTimeout);
    };
  });

  // Compute initial boundaries and recompute when items or layout change.
  // ResizeObserver handles container resize (e.g. window resize, flex changes).
  // The `itemsVersion` dependency ensures re-setup when items are dynamically
  // added/removed. Orientation flows through the compute value so the
  // callback performs no untracked reactive reads.
  createEffect(
    () => ({ version: itemsVersion(), o: orientation() }),
    ({ o }) => {
      const viewport = element;
      if (!viewport) return;

      const items = getItemElements();
      if (items.length === 0) {
        setCanScrollPrev(false);
        setCanScrollNext(false);
        return;
      }

      updateBoundaries(o);
      snapAlign = getSnapAlignment(items[0], o);

      const resizeObserver = new ResizeObserver(() => {
        updateBoundaries();
        // Re-read snap alignment on resize - a media query may have changed it.
        if (items.length > 0) {
          snapAlign = getSnapAlignment(items[0], orientation());
        }
      });
      resizeObserver.observe(viewport);
      return () => resizeObserver.disconnect();
    },
  );

  /**
   * IntersectionObserver for `data-in-view` tracking on individual items.
   *
   * This is a convenience data attribute (not used internally for active
   * index or button state) - consumers can use `[data-in-view]` in CSS
   * for things like fade-in animations as items scroll into view.
   * Separate from the active index logic which uses scroll-position math.
   */
  createEffect(
    () => itemsVersion(),
    () => {
      const viewport = element;
      if (!viewport) return;

      const items = getItemElements();
      if (items.length === 0) return;

      const inViewObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const target = entry.target as HTMLElement;
            if (entry.isIntersecting) {
              target.setAttribute("data-in-view", "");
            } else {
              target.removeAttribute("data-in-view");
            }
          }
        },
        { root: viewport, threshold: 0 },
      );

      for (const item of items) {
        inViewObserver.observe(item);
      }

      return () => inViewObserver.disconnect();
    },
  );

  /**
   * Keyboard navigation on the viewport itself (WAI-ARIA Tabs pattern
   * adapted for scroll containers):
   *
   * - Arrow keys: step by one item, with loop wrap if enabled.
   * - Home / End: jump to first / last item.
   * - Page Up / Page Down: scroll by ~85% of the viewport ("one page"),
   *   matching the CSS Overflow 5 section 3.2 scroll-button spec. These use
   *   real-time marker updates (no scrollTargetRef lock).
   *
   * All handled keys call preventDefault to suppress native scroll.
   */
  const handleKeyDown = (event: KeyboardEvent & { currentTarget: HTMLDivElement }) => {
    const viewport = element;
    if (!viewport) return;

    const isHorizontal = orientation() === "horizontal";
    const count = getItemElements().length;
    if (count === 0) return;

    const index = activeIndex();
    let targetIndex: number | null = null;
    let pageDirection: number | null = null;

    if (event.key === (isHorizontal ? "ArrowRight" : "ArrowDown")) {
      targetIndex = loop() ? (index + 1) % count : Math.min(index + 1, count - 1);
    } else if (event.key === (isHorizontal ? "ArrowLeft" : "ArrowUp")) {
      targetIndex = loop() ? (index - 1 + count) % count : Math.max(index - 1, 0);
    } else if (event.key === "Home") {
      targetIndex = 0;
    } else if (event.key === "End") {
      targetIndex = count - 1;
    } else if (event.key === "PageUp") {
      pageDirection = -1;
    } else if (event.key === "PageDown") {
      pageDirection = 1;
    } else {
      return;
    }

    event.preventDefault();

    if (targetIndex !== null && targetIndex !== index) {
      scrollToItem(targetIndex);
    } else if (pageDirection !== null) {
      scrollTargetRef.current = null;
      scrollingRef.current = false;

      const pageSize = isHorizontal ? viewport.clientWidth : viewport.clientHeight;
      viewport.scrollBy({
        [isHorizontal ? "left" : "top"]: pageDirection * pageSize * PAGE_SCROLL_FACTOR,
        behavior: getScrollBehavior(scrollBehavior()),
      });
    }
  };

  const onKeyDown = composeEventHandlers(
    (event: KeyboardEvent & { currentTarget: HTMLDivElement }) =>
      callEventHandler(props.onKeyDown, event),
    handleKeyDown,
  );

  const classes = () => cx("fui-ScrollGalleryViewport", props.class);

  // Override CSS scroll-behavior when the prop is 'instant' so that
  // CSS-driven scrolls (e.g. snap corrections) also jump immediately.
  const style = (): JSX.CSSProperties | string | undefined => {
    // Solid's wide `style` type admits `false` (attribute removal); normalize it.
    const user = props.style === false ? undefined : props.style;
    if (scrollBehavior() !== "instant") return user;
    if (typeof user === "string" || user === undefined) {
      return user === undefined ? { "scroll-behavior": "auto" } : `scroll-behavior:auto;${user}`;
    }
    return { "scroll-behavior": "auto", ...user };
  };

  const state = (): ScrollGalleryViewportState => ({
    activeIndex: activeIndex(),
    orientation: orientation(),
    canScrollPrev: canScrollPrev(),
    canScrollNext: canScrollNext(),
    scrolling: isScrolling(),
  });

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return classes();
      },
      get style() {
        return style();
      },
      get "data-active-index"() {
        return String(activeIndex());
      },
      get "data-orientation"() {
        return orientation();
      },
      get "data-can-scroll-prev"() {
        return canScrollPrev() ? "" : undefined;
      },
      get "data-can-scroll-next"() {
        return canScrollNext() ? "" : undefined;
      },
      get "data-scrolling"() {
        return isScrolling() ? "" : undefined;
      },
      get onKeyDown() {
        return onKeyDown;
      },
      get children() {
        return resolved();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as ScrollGalleryViewportRenderProps, state());
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it.
    return (
      <ViewportSlot
        {...rest}
        class={classes()}
        style={style()}
        data-active-index={String(activeIndex())}
        data-orientation={orientation()}
        data-can-scroll-prev={canScrollPrev() ? "" : undefined}
        data-can-scroll-next={canScrollNext() ? "" : undefined}
        data-scrolling={isScrolling() ? "" : undefined}
        onKeyDown={onKeyDown}
        ref={composedRefs}
      >
        <ViewportSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </ViewportSlottable>
      </ViewportSlot>
    );
  }

  return (
    <div
      {...rest}
      class={classes()}
      style={style()}
      data-active-index={String(activeIndex())}
      data-orientation={orientation()}
      data-can-scroll-prev={canScrollPrev() ? "" : undefined}
      data-can-scroll-next={canScrollNext() ? "" : undefined}
      data-scrolling={isScrolling() ? "" : undefined}
      onKeyDown={onKeyDown}
      ref={composedRefs}
    >
      {resolved()}
    </div>
  );
};

export { ScrollGalleryViewport };
export type {
  ScrollGalleryViewportProps,
  ScrollGalleryViewportRenderProp,
  ScrollGalleryViewportRenderProps,
  ScrollGalleryViewportState,
};
