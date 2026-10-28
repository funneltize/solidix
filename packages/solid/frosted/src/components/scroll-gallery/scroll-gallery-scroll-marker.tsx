import { children, merge, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { ariaBoolean, callEventHandler } from "@solidix/primitive";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { createSlot, createSlottable } from "@solidix/slot";
import { cx } from "../../helpers/cx";
import { composeEventHandlers } from "../../helpers/compose-event-handlers";
import type { PropsWithoutColor } from "../../helpers/props";
import { useScrollGalleryContext } from "./scroll-gallery-context";

/** Slot typed for `ScrollGalleryScrollMarker` button props. */
const MarkerSlot = createSlot<
  HTMLButtonElement,
  Omit<PropsWithoutColor<"button">, "children" | "ref">
>("ScrollGalleryScrollMarker");
/** Slottable selecting the element-form `render` target for child injection. */
const MarkerSlottable = createSlottable("ScrollGalleryScrollMarker");

/** State exposed to `ScrollGalleryScrollMarker`'s function-form `render` prop. */
interface ScrollGalleryScrollMarkerState {
  /** Whether this marker's item is the active item. */
  active: boolean;
  /** The index of the item this scroll marker controls. */
  index: number;
}

/**
 * Props passed to a function-form `render` prop: the caller's button props
 * with the computed `class`, data attributes, and `children` applied.
 */
type ScrollGalleryScrollMarkerRenderProps = PropsWithoutColor<"button"> & {
  /** Present when this marker's item is the active item. */
  "data-active"?: string | undefined;
  /** The index of the item this scroll marker controls. */
  "data-index"?: string | undefined;
};

/**
 * `render` prop accepted by `ScrollGalleryScrollMarker`, mirroring Base UI
 * `useRender`: an element to render as (merged via `Slot`), or a function
 * receiving the merged props and marker state.
 */
type ScrollGalleryScrollMarkerRenderProp =
  | JSX.Element
  | ((props: ScrollGalleryScrollMarkerRenderProps, state: ScrollGalleryScrollMarkerState) => JSX.Element);

/** Props for `ScrollGallery.ScrollMarker`. */
interface ScrollGalleryScrollMarkerProps extends Omit<PropsWithoutColor<"button">, "ref"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLButtonElement> | undefined;
  /** Element or render function overriding the default `button` output. */
  render?: ScrollGalleryScrollMarkerRenderProp | undefined;
  /** The index of the item this scroll marker controls. */
  index: number;
}

/**
 * Individual marker button controlling one gallery item. Clicking a marker
 * sets the scroll container's "current scroll target" to the linked item
 * (making that marker immediately active) and smooth-scrolls the item
 * into view.
 *
 * ARIA: role="tab" + aria-selected follows the WAI-ARIA tablist pattern
 * (the marker group uses role="tablist"). Only the active marker has
 * tabIndex=0 (roving tabindex pattern); inactive markers have tabIndex=-1
 * so arrow keys move between them.
 *
 * No `aria-label` or `aria-roledescription` is set - this is a headless
 * primitive that can't assume the consumer's language. Consumers should
 * provide their own `aria-label` via props.
 *
 * Upstream: `scroll-gallery-scroll-marker.tsx` (`ScrollGalleryScrollMarker`)
 * at whopio/frosted-ui commit `56787900bfe0`.
 */
const ScrollGalleryScrollMarker: Component<ScrollGalleryScrollMarkerProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "render", "index", "onClick");
  const { activeIndex, scrollToItem } = useScrollGalleryContext();

  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const isActive = () => props.index === activeIndex();

  const handleClick = () => {
    scrollToItem(props.index);
  };

  const onClick = composeEventHandlers(
    (event: MouseEvent & { currentTarget: HTMLButtonElement }) =>
      callEventHandler(props.onClick, event),
    handleClick,
  );

  const classes = () => cx("fui-ScrollGalleryScrollMarker", props.class);

  const state = (): ScrollGalleryScrollMarkerState => ({ active: isActive(), index: props.index });

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return classes();
      },
      get type() {
        return "button" as const;
      },
      get role() {
        return "tab" as const;
      },
      get "aria-selected"() {
        return ariaBoolean(isActive());
      },
      get tabindex() {
        return isActive() ? 0 : -1;
      },
      get "data-active"() {
        return isActive() ? "" : undefined;
      },
      get "data-index"() {
        return String(props.index);
      },
      get onClick() {
        return onClick;
      },
      get children() {
        return resolved();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as ScrollGalleryScrollMarkerRenderProps, state());
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it.
    return (
      <MarkerSlot
        {...rest}
        class={classes()}
        type="button"
        role="tab"
        aria-selected={ariaBoolean(isActive())}
        tabindex={isActive() ? 0 : -1}
        data-active={isActive() ? "" : undefined}
        data-index={String(props.index)}
        onClick={onClick}
        ref={composedRefs}
      >
        <MarkerSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </MarkerSlottable>
      </MarkerSlot>
    );
  }

  return (
    <button
      {...rest}
      class={classes()}
      type="button"
      role="tab"
      aria-selected={ariaBoolean(isActive())}
      tabindex={isActive() ? 0 : -1}
      data-active={isActive() ? "" : undefined}
      data-index={String(props.index)}
      onClick={onClick}
      ref={composedRefs}
    >
      {resolved()}
    </button>
  );
};

export { ScrollGalleryScrollMarker };
export type {
  ScrollGalleryScrollMarkerProps,
  ScrollGalleryScrollMarkerRenderProp,
  ScrollGalleryScrollMarkerRenderProps,
  ScrollGalleryScrollMarkerState,
};
