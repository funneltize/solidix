import { children, merge, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { callEventHandler } from "@solidix/primitive";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { createSlot, createSlottable } from "@solidix/slot";
import { cx } from "../../helpers/cx";
import { composeEventHandlers } from "../../helpers/compose-event-handlers";
import type { PropsWithoutColor } from "../../helpers/props";
import { useScrollButton } from "./use-scroll-button";

/** Slot typed for `ScrollGalleryNext` button props. */
const NextSlot = createSlot<
  HTMLButtonElement,
  Omit<PropsWithoutColor<"button">, "children" | "ref">
>("ScrollGalleryNext");
/** Slottable selecting the element-form `render` target for child injection. */
const NextSlottable = createSlottable("ScrollGalleryNext");

/** State exposed to `ScrollGalleryNext`'s function-form `render` prop. */
interface ScrollGalleryNextState {
  /** Whether the button is disabled. */
  disabled: boolean;
}

/**
 * Props passed to a function-form `render` prop: the caller's button props
 * with the computed `class`, `disabled`, data attributes, and `children` applied.
 */
type ScrollGalleryNextRenderProps = PropsWithoutColor<"button"> & {
  /** Present when the button is disabled. */
  "data-disabled"?: string | undefined;
};

/**
 * `render` prop accepted by `ScrollGalleryNext`, mirroring Base UI
 * `useRender`: an element to render as (merged via `Slot`), or a function
 * receiving the merged props and button state.
 */
type ScrollGalleryNextRenderProp =
  | JSX.Element
  | ((props: ScrollGalleryNextRenderProps, state: ScrollGalleryNextState) => JSX.Element);

/** Props for `ScrollGallery.Next`. */
interface ScrollGalleryNextProps extends Omit<PropsWithoutColor<"button">, "ref"> {
  /** Ref forwarded to the rendered element, in either branch. */
  ref?: Ref<HTMLButtonElement> | undefined;
  /** Element or render function overriding the default `button` output. */
  render?: ScrollGalleryNextRenderProp | undefined;
  /**
   * How many items to scroll by. When set to a number, the button scrolls
   * to bring the item N positions after the current active item into view.
   * When omitted, scrolls by ~85% of the viewport ("one page") per the
   * CSS Overflow 5 section 3.2 spec.
   */
  step?: number | undefined;
}

/**
 * Scrolls the gallery viewport toward the end: by ~85% of the viewport
 * ("one page") by default, or by `step` items when set. Auto-disables at
 * the end boundary unless `loop` is set on the Root (wrapping to the start).
 *
 * Upstream: `scroll-gallery-next.tsx` (`ScrollGalleryNext`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const ScrollGalleryNext: Component<ScrollGalleryNextProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "render", "step", "onClick");
  const { disabled, handleClick } = useScrollButton({
    direction: "next",
    get step() {
      return props.step;
    },
  });

  const composedRefs = composeRefs(props.ref);
  const resolved = children(() => props.children);
  // Read once: an element-form `render` is a JSX expression that
  // re-instantiates on every prop read, and Slot needs one stable child.
  const renderProp = props.render;

  const onClick = composeEventHandlers(
    (event: MouseEvent & { currentTarget: HTMLButtonElement }) =>
      callEventHandler(props.onClick, event),
    handleClick,
  );

  const classes = () => cx("fui-ScrollGalleryNext", props.class);

  if (typeof renderProp === "function") {
    const merged = merge(rest, {
      get class() {
        return classes();
      },
      get type() {
        return "button" as const;
      },
      get disabled() {
        return disabled();
      },
      get "data-disabled"() {
        return disabled() ? "" : undefined;
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
    return renderProp(merged as unknown as ScrollGalleryNextRenderProps, {
      disabled: disabled(),
    });
  }

  if (renderProp) {
    // Base UI `useRender` semantics: the element keeps its own children when
    // it has any, otherwise the component's children render inside it.
    return (
      <NextSlot
        {...rest}
        class={classes()}
        type="button"
        disabled={disabled()}
        data-disabled={disabled() ? "" : undefined}
        onClick={onClick}
        ref={composedRefs}
      >
        <NextSlottable child={renderProp}>
          {(childNodes) => (childNodes.length > 0 ? childNodes : resolved())}
        </NextSlottable>
      </NextSlot>
    );
  }

  return (
    <button
      {...rest}
      class={classes()}
      type="button"
      disabled={disabled()}
      data-disabled={disabled() ? "" : undefined}
      onClick={onClick}
      ref={composedRefs}
    >
      {resolved()}
    </button>
  );
};

export { ScrollGalleryNext };
export type {
  ScrollGalleryNextProps,
  ScrollGalleryNextRenderProp,
  ScrollGalleryNextRenderProps,
  ScrollGalleryNextState,
};
