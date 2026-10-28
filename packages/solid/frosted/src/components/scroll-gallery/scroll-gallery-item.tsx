import { children, createMemo, merge, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { createSlot, createSlottable } from "@solidix/slot";
import { cx } from "../../helpers/cx";
import type { PropsWithoutColor } from "../../helpers/props";
import { useScrollGalleryContext } from "./scroll-gallery-context";

/** Slot typed for `ScrollGalleryItem` div props. */
const ItemSlot = createSlot<HTMLDivElement, Omit<PropsWithoutColor<"div">, "children" | "ref">>(
  "ScrollGalleryItem",
);
/** Slottable selecting the element-form `render` target for child injection. */
const ItemSlottable = createSlottable("ScrollGalleryItem");

/** State exposed to `ScrollGalleryItem`'s function-form `render` prop. */
interface ScrollGalleryItemState {
  /** Whether this item is the active item. */
  active: boolean;
  /** This item's index in DOM order. */
  index: number;
}

/**
 * Props passed to a function-form `render` prop: the caller's div props
 * with the computed `class`, data attributes, and `children` applied.
 */
type ScrollGalleryItemRenderProps = PropsWithoutColor<"div"> & {
  /** Present when this item is the active item. */
  "data-active"?: string | undefined;
  /** This item's index in DOM order. */
  "data-index"?: string | undefined;
};

/**
 * `render` prop accepted by `ScrollGalleryItem`, mirroring Base UI
 * `useRender`: an element to render as (merged via `Slot`), or a function
 * receiving the merged props and item state.
 */
type ScrollGalleryItemRenderProp =
  | JSX.Element
  | ((props: ScrollGalleryItemRenderProps, state: ScrollGalleryItemState) => JSX.Element);

/** Props for `ScrollGallery.Item`. */
interface ScrollGalleryItemProps extends Omit<PropsWithoutColor<"div">, "ref"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLDivElement> | undefined;
  /** Element or render function overriding the default `div` output. */
  render?: ScrollGalleryItemRenderProp | undefined;
}

/**
 * Individual gallery item. Self-registers with the Root context on mount.
 *
 * Deliberately does NOT set `role="group"` or `aria-roledescription="slide"`.
 * The CSS Overflow 5 spec treats scroll items as plain elements - they have
 * no special semantic role. Consumers can add ARIA attributes via props if
 * their specific use case requires it.
 *
 * Provides `data-active` and `data-in-view` attributes for consumer styling.
 * The `data-in-view` attribute is managed by the Viewport's
 * IntersectionObserver.
 *
 * Upstream: `scroll-gallery-item.tsx` (`ScrollGalleryItem`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const ScrollGalleryItem: Component<ScrollGalleryItemProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "render");
  const { activeIndex, registerItem, getItemElements, itemsVersion } =
    useScrollGalleryContext();

  // Registration is insertion-agnostic bookkeeping, so it runs
  // synchronously in the ref callback (not an effect): Root's mount
  // work then sees every item regardless of effect order.
  let registeredElement: HTMLDivElement | null = null;
  let unregister: (() => void) | null = null;
  const setElement = (node: HTMLDivElement | null) => {
    if (node) {
      if (registeredElement !== node) {
        unregister?.();
        registeredElement = node;
        unregister = registerItem(node);
      }
    } else {
      unregister?.();
      unregister = null;
      registeredElement = null;
    }
  };
  const composedRefs = composeRefs(setElement, props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const index = createMemo(() => {
    itemsVersion();
    const el = registeredElement;
    if (!el) return -1;
    return getItemElements().indexOf(el);
  });

  const isActive = () => index() === activeIndex();
  const classes = () => cx("fui-ScrollGalleryItem", props.class);

  const state = (): ScrollGalleryItemState => ({ active: isActive(), index: index() });

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return classes();
      },
      get "data-active"() {
        return isActive() ? "" : undefined;
      },
      get "data-index"() {
        return String(index());
      },
      get children() {
        return resolved();
      },
      get ref() {
        return composedRefs;
      },
    });
    return renderProp(merged as unknown as ScrollGalleryItemRenderProps, state());
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it.
    return (
      <ItemSlot
        {...rest}
        class={classes()}
        data-active={isActive() ? "" : undefined}
        data-index={String(index())}
        ref={composedRefs}
      >
        <ItemSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </ItemSlottable>
      </ItemSlot>
    );
  }

  return (
    <div
      {...rest}
      class={classes()}
      data-active={isActive() ? "" : undefined}
      data-index={String(index())}
      ref={composedRefs}
    >
      {resolved()}
    </div>
  );
};

export { ScrollGalleryItem };
export type {
  ScrollGalleryItemProps,
  ScrollGalleryItemRenderProp,
  ScrollGalleryItemRenderProps,
  ScrollGalleryItemState,
};
