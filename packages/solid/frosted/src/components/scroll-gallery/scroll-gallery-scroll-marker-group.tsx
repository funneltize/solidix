import { children, createSignal, merge, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { callEventHandler } from "@solidix/primitive";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { createSlot, createSlottable } from "@solidix/slot";
import { cx } from "../../helpers/cx";
import { composeEventHandlers } from "../../helpers/compose-event-handlers";
import type { PropsWithoutColor } from "../../helpers/props";
import { useScrollGalleryContext, type ScrollGalleryOrientation } from "./scroll-gallery-context";

/** Slot typed for `ScrollGalleryScrollMarkerGroup` div props. */
const MarkerGroupSlot = createSlot<
  HTMLDivElement,
  Omit<PropsWithoutColor<"div">, "children" | "ref">
>("ScrollGalleryScrollMarkerGroup");
/** Slottable selecting the element-form `render` target for child injection. */
const MarkerGroupSlottable = createSlottable("ScrollGalleryScrollMarkerGroup");

/** State exposed to `ScrollGalleryScrollMarkerGroup`'s function-form `render` prop. */
interface ScrollGalleryScrollMarkerGroupState {
  /** Gallery orientation. */
  orientation: ScrollGalleryOrientation;
  /** Whether focus is inside the group. */
  focusWithin: boolean;
}

/**
 * Props passed to a function-form `render` prop: the caller's div props
 * with the computed `class`, data attributes, and `children` applied.
 */
type ScrollGalleryScrollMarkerGroupRenderProps = PropsWithoutColor<"div"> & {
  /** Orientation written as `data-orientation`. */
  "data-orientation"?: ScrollGalleryOrientation | undefined;
  /** Present while focus is inside the group. */
  "data-focus-within"?: string | undefined;
};

/**
 * `render` prop accepted by `ScrollGalleryScrollMarkerGroup`, mirroring
 * Base UI `useRender`: an element to render as (merged via `Slot`), or a
 * function receiving the merged props and group state.
 */
type ScrollGalleryScrollMarkerGroupRenderProp =
  | JSX.Element
  | ((
      props: ScrollGalleryScrollMarkerGroupRenderProps,
      state: ScrollGalleryScrollMarkerGroupState,
    ) => JSX.Element);

/** Props for `ScrollGallery.ScrollMarkerGroup`. */
interface ScrollGalleryScrollMarkerGroupProps extends Omit<PropsWithoutColor<"div">, "ref"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLDivElement> | undefined;
  /** Element or render function overriding the default `div` output. */
  render?: ScrollGalleryScrollMarkerGroupRenderProp | undefined;
}

/**
 * Container for ScrollMarker buttons, named after the CSS
 * `::scroll-marker-group` pseudo-element from CSS Overflow Level 5 section 2.
 *
 * Renders with role="tablist" - each child ScrollMarker has role="tab".
 * This pairing follows the WAI-ARIA tablist pattern for accessibility.
 *
 * `aria-roledescription="carousel"` is deliberately omitted because this
 * component is not a carousel - it's a generic scrollable container with
 * navigation. The CSS Overflow 5 spec does not prescribe any special ARIA
 * role for scroll marker groups either; tablist is the closest semantic
 * match for a set of mutually-exclusive navigation indicators.
 *
 * Upstream: `scroll-gallery-scroll-marker-group.tsx`
 * (`ScrollGalleryScrollMarkerGroup`) at whopio/frosted-ui commit `56787900bfe0`.
 */
const ScrollGalleryScrollMarkerGroup: Component<ScrollGalleryScrollMarkerGroupProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "render", "onKeyDown", "onFocus", "onBlur");
  const { loop, orientation } = useScrollGalleryContext();

  const [focusWithin, setFocusWithin] = createSignal(false);

  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  /**
   * Keyboard navigation uses automatic activation (WAI-ARIA Tabs pattern):
   *   - Arrow keys move focus AND activate the marker (scroll to its item)
   *   - Home/End jump to first/last marker and activate
   *   - Orientation-aware: horizontal uses Left/Right, vertical uses Up/Down
   *
   * Automatic activation matches native CSS `::scroll-marker` behavior -
   * navigating between markers with arrow keys immediately scrolls to the
   * corresponding item, without requiring an additional Enter/Space press.
   */
  const handleKeyDown = (event: KeyboardEvent & { currentTarget: HTMLDivElement }) => {
    const group = event.currentTarget;
    const markers = [...group.querySelectorAll<HTMLElement>('[role="tab"][data-index]')];

    if (markers.length === 0) return;

    const currentIndex = markers.findIndex((el) => el === document.activeElement);
    if (currentIndex === -1) return;

    const isHorizontal = orientation() === "horizontal";
    let nextIndex: number | null = null;

    if (event.key === (isHorizontal ? "ArrowRight" : "ArrowDown")) {
      nextIndex = loop() ? (currentIndex + 1) % markers.length : Math.min(currentIndex + 1, markers.length - 1);
    } else if (event.key === (isHorizontal ? "ArrowLeft" : "ArrowUp")) {
      nextIndex = loop()
        ? (currentIndex - 1 + markers.length) % markers.length
        : Math.max(currentIndex - 1, 0);
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = markers.length - 1;
    } else {
      return;
    }

    // If clamped to the same index, nothing to do.
    if (nextIndex === currentIndex) return;

    event.preventDefault();
    markers[nextIndex].focus();
    markers[nextIndex].click();
  };

  const onKeyDown = composeEventHandlers(
    (event: KeyboardEvent & { currentTarget: HTMLDivElement }) =>
      callEventHandler(props.onKeyDown, event),
    handleKeyDown,
  );
  const onFocus = composeEventHandlers(
    (event: FocusEvent & { currentTarget: HTMLDivElement }) =>
      callEventHandler(props.onFocus, event),
    () => setFocusWithin(true),
  );
  const onBlur = composeEventHandlers(
    (event: FocusEvent & { currentTarget: HTMLDivElement }) =>
      callEventHandler(props.onBlur, event),
    (event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        setFocusWithin(false);
      }
    },
  );

  const classes = () => cx("fui-ScrollGalleryScrollMarkerGroup", props.class);

  const state = (): ScrollGalleryScrollMarkerGroupState => ({
    orientation: orientation(),
    focusWithin: focusWithin(),
  });

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return classes();
      },
      get role() {
        return "tablist" as const;
      },
      get "aria-orientation"() {
        return orientation();
      },
      get "data-orientation"() {
        return orientation();
      },
      get "data-focus-within"() {
        return focusWithin() ? "" : undefined;
      },
      get onKeyDown() {
        return onKeyDown;
      },
      get onFocus() {
        return onFocus;
      },
      get onBlur() {
        return onBlur;
      },
      get children() {
        return resolved();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as ScrollGalleryScrollMarkerGroupRenderProps, state());
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it.
    return (
      <MarkerGroupSlot
        {...rest}
        class={classes()}
        role="tablist"
        aria-orientation={orientation()}
        data-orientation={orientation()}
        data-focus-within={focusWithin() ? "" : undefined}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        ref={composedRefs}
      >
        <MarkerGroupSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </MarkerGroupSlottable>
      </MarkerGroupSlot>
    );
  }

  return (
    <div
      {...rest}
      class={classes()}
      role="tablist"
      aria-orientation={orientation()}
      data-orientation={orientation()}
      data-focus-within={focusWithin() ? "" : undefined}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      ref={composedRefs}
    >
      {resolved()}
    </div>
  );
};

export { ScrollGalleryScrollMarkerGroup };
export type {
  ScrollGalleryScrollMarkerGroupProps,
  ScrollGalleryScrollMarkerGroupRenderProp,
  ScrollGalleryScrollMarkerGroupRenderProps,
  ScrollGalleryScrollMarkerGroupState,
};
