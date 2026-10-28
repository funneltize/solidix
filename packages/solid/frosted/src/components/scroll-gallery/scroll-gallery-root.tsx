import { createEffect, createSignal, onCleanup, onSettled, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import {
  ScrollGalleryContext,
  getAbsoluteScrollPosition,
  getScrollBehavior,
  getScrollDistance,
  type ChangeSource,
  type ScrollGalleryContextValue,
  type ScrollGalleryOrientation,
} from "./scroll-gallery-context";

/** Props for `ScrollGallery.Root`. */
interface ScrollGalleryRootProps {
  /** Gallery parts (Viewport, Item, Previous/Next, markers). */
  children?: JSX.Element | undefined;
  /**
   * The initial active item index (uncontrolled mode).
   * @default 0
   */
  defaultValue?: number | undefined;
  /**
   * The active item index (controlled mode). When provided, the component
   * is fully controlled - external changes scroll the viewport to the
   * corresponding item. Use together with `onValueChange` to keep state
   * in sync with user-driven scroll.
   */
  value?: number | undefined;
  /**
   * When true, navigation wraps around at boundaries: Previous/Next
   * buttons don't disable and jump to the other end, and marker group
   * arrow keys wrap instead of clamping.
   * @default false
   */
  loop?: boolean | undefined;
  /**
   * Callback fired when the active item changes (from scrolling or
   * marker clicks). Receives the new index and a `source` field
   * indicating what triggered the change.
   */
  onValueChange?: ((value: number, metadata: { source: ChangeSource }) => void) | undefined;
  /**
   * The scroll orientation of the gallery.
   * @default 'horizontal'
   */
  orientation?: ScrollGalleryOrientation | undefined;
  /**
   * Controls whether programmatic scrolls (navigation, markers, controlled
   * value changes) animate smoothly or jump instantly. Reduced motion
   * always forces `'instant'` regardless of this value.
   * @default 'smooth'
   */
  scrollBehavior?: "smooth" | "instant" | undefined;
  /** Ref receiving the imperative `scrollTo` handle. */
  ref?: Ref<ScrollGalleryRootRef> | undefined;
}

/**
 * Imperative handle exposed via `ref` on `ScrollGallery.Root`.
 *
 * Provides `scrollTo(index)` for programmatic navigation. In uncontrolled
 * mode this is the primary way to navigate programmatically. In controlled
 * mode (`value` prop), simply update the value - the component scrolls
 * automatically.
 */
interface ScrollGalleryRootRef {
  /** Scroll to the item at the given index with marker locking. */
  scrollTo: (index: number, behavior?: ScrollBehavior) => void;
}

/**
 * Context-only provider for the `ScrollGallery` compound (renders no DOM
 * element): owns the active index state, the item registry, boundary
 * flags, and the imperative `scrollTo`.
 *
 * Upstream: `scroll-gallery-root.tsx` (`ScrollGalleryRoot`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const ScrollGalleryRoot: Component<ScrollGalleryRootProps> = (props) => {
  const isControlled = props.value !== undefined;
  const [internalIndex, setInternalIndex] = createSignal(props.defaultValue ?? 0);
  const activeIndex = () => (isControlled ? (props.value as number) : internalIndex());
  const orientation = () => props.orientation ?? "horizontal";
  const scrollBehavior = () => props.scrollBehavior ?? "smooth";
  const loop = () => props.loop ?? false;

  // Last index reported by a native scroll in controlled mode, so the
  // controlled-value effect can skip re-scrolling to it (which would
  // interrupt scroll momentum).
  let lastScrollValue: number | null = null;

  const setActiveIndex = (index: number, source: ChangeSource) => {
    lastScrollValue = source === "scroll" ? index : null;
    if (!isControlled) {
      setInternalIndex(index);
    }
    props.onValueChange?.(index, { source });
  };

  const [canScrollPrev, setCanScrollPrev] = createSignal(false);
  const [canScrollNext, setCanScrollNext] = createSignal(true);
  const viewportRef: { current: HTMLElement | null } = { current: null };
  const itemElements = new Set<HTMLElement>();
  // Written from item ref callbacks (including disposal nulls), so owned
  // writes must be allowed - same as collection registry bookkeeping.
  const [itemsVersion, setItemsVersion] = createSignal(0, { ownedWrite: true });

  // CSS Overflow 5 section 2.1 "current scroll target" - see context for details.
  const scrollTargetRef: { current: number | null } = { current: null };
  const scrollingRef: { current: boolean } = { current: false };

  // Cached sorted item list, invalidated when itemsVersion changes.
  let sortedItems: HTMLElement[] = [];
  let sortedItemsVersion = -1;
  let currentItemsVersion = 0;

  /**
   * Returns registered item elements sorted in DOM order. Uses
   * compareDocumentPosition so the order is always correct regardless
   * of render order or dynamic additions/removals. The result is cached
   * and only re-sorted when itemsVersion changes, avoiding repeated
   * O(N log N) sorts on every scroll event.
   */
  const getItemElements = (): HTMLElement[] => {
    if (sortedItemsVersion !== currentItemsVersion) {
      const elements = [...itemElements];
      elements.sort((a, b) =>
        a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      );
      sortedItems = elements;
      sortedItemsVersion = currentItemsVersion;
    }
    return sortedItems;
  };

  /**
   * Items self-register on mount and unregister on unmount, bumping
   * `itemsVersion` each time. The viewport watches `itemsVersion` to
   * re-setup its IntersectionObserver and boundary detection, ensuring
   * dynamic item changes are always reflected.
   */
  const registerItem = (element: HTMLElement) => {
    itemElements.add(element);
    currentItemsVersion += 1;
    setItemsVersion(currentItemsVersion);
    return () => {
      itemElements.delete(element);
      currentItemsVersion += 1;
      setItemsVersion(currentItemsVersion);
    };
  };

  /**
   * Shared "locked scroll to item" primitive. Scrolls the viewport to
   * bring the item at the given index into view while locking the active
   * marker to that index through the smooth scroll animation.
   */
  const scrollToItem = (index: number, behavior?: ScrollBehavior) => {
    const resolvedBehavior = behavior ?? getScrollBehavior(scrollBehavior());
    const viewport = viewportRef.current;
    if (!viewport) return;

    const items = getItemElements();
    const target = items[index];
    if (!target) return;

    const isHorizontal = orientation() === "horizontal";
    const distance = getScrollDistance(target, viewport, orientation());

    scrollTargetRef.current = index;
    scrollingRef.current = true;

    viewport.scrollBy({
      [isHorizontal ? "left" : "top"]: distance,
      behavior: resolvedBehavior,
    });

    setActiveIndex(index, "indicator");
  };

  const setRef = composeRefs(props.ref);
  setRef({ scrollTo: scrollToItem });
  onCleanup(() => setRef(null));

  // Scroll to the initial item on mount when defaultValue/value is non-zero.
  // Uses getAbsoluteScrollPosition (offsetLeft-based) + scrollTo instead of
  // getScrollDistance (getBoundingClientRect-based) + scrollBy. Mobile Safari
  // returns incorrect getBoundingClientRect values during initial layout
  // inside <dialog> elements, causing scrollBy to land on the wrong snap point.
  const initialValue = isControlled ? (props.value as number) : (props.defaultValue ?? 0);
  onSettled(() => {
    if (initialValue !== 0) {
      const viewport = viewportRef.current;
      const items = getItemElements();
      const target = items[initialValue];
      if (viewport && target) {
        const isHoriz = orientation() === "horizontal";
        const pos = getAbsoluteScrollPosition(target, viewport, orientation());
        viewport.scrollTo({
          [isHoriz ? "left" : "top"]: Math.max(0, pos),
          behavior: "instant",
        });
        scrollTargetRef.current = initialValue;
        scrollingRef.current = true;
        setActiveIndex(initialValue, "indicator");
      }
    }
  });

  // In controlled mode, scroll the viewport when the external value changes.
  // Skip programmatic scrolling only when the new value is the exact one
  // reported by a native scroll - otherwise scroll momentum would be
  // interrupted. If the value is different (e.g. from an external button),
  // always scroll.
  let prevValue = props.value;
  createEffect(
    () => props.value,
    (value) => {
      if (!isControlled) return;
      if (prevValue === value) return;
      prevValue = value;
      if (lastScrollValue === value) {
        lastScrollValue = null;
        return;
      }
      lastScrollValue = null;
      scrollToItem(value as number, getScrollBehavior(scrollBehavior()));
    },
  );

  const contextValue: ScrollGalleryContextValue = {
    activeIndex,
    setActiveIndex,
    orientation,
    scrollBehavior,
    loop,
    canScrollPrev,
    canScrollNext,
    setCanScrollPrev,
    setCanScrollNext,
    registerItem,
    viewportRef,
    getItemElements,
    itemCount: () => itemElements.size,
    itemsVersion,
    scrollTargetRef,
    scrollingRef,
    scrollToItem,
  };

  return (
    <ScrollGalleryContext value={contextValue}>{props.children}</ScrollGalleryContext>
  );
};

export { ScrollGalleryRoot };
export type { ScrollGalleryRootProps, ScrollGalleryRootRef };
