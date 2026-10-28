import { Show, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  ScrollArea as HeadlessRoot,
  ScrollAreaContent as HeadlessContent,
  ScrollAreaCorner as HeadlessCorner,
  ScrollAreaScrollbar as HeadlessScrollbar,
  ScrollAreaThumb as HeadlessThumb,
  ScrollAreaViewport as HeadlessViewport,
  type ScrollAreaProps as HeadlessRootProps,
} from "@solidix/scroll-area";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { cx } from "../../helpers/cx";
import { scrollAreaPropDefs, type ScrollAreaOwnProps } from "./scroll-area.props";

/**
 * Props for `ScrollArea`: headless root props (type passthrough included)
 * plus the styled prop defs. `style` is narrowed to object form.
 */
interface ScrollAreaProps
  extends
    Omit<HeadlessRootProps, "asChild" | "class" | "style" | "ref" | "children">,
    ScrollAreaOwnProps {
  /** Scrollable content. */
  children?: JSX.Element | undefined;
  /** Additional class names for the root element. */
  class?: string | undefined;
  /** Inline styles for the root element. */
  style?: JSX.CSSProperties | undefined;
  /** Ref forwarded to the viewport element (upstream placement). */
  ref?: Ref<HTMLDivElement> | undefined;
}

/** Viewport overflow for each `scrollbars` value. */
const viewportOverflowStyle = {
  both: "scroll",
  vertical: "hidden scroll",
  horizontal: "scroll hidden",
} as const;

/**
 * Themed scroll container with custom scrollbars: the headless scroll-area
 * root with a viewport, an explicit content wrapper, orientation-filtered
 * scrollbars, and a corner.
 *
 * Upstream: `scroll-area.tsx` at whopio/frosted-ui commit `56787900bfe0`.
 * The headless viewport sets no `tabIndex`, matching upstream's explicit
 * `tabIndex={undefined}` override (native focusable-scroller behavior).
 */
const ScrollArea: Component<ScrollAreaProps> = (props) => {
  const size = () => props.size ?? scrollAreaPropDefs.size.default;
  const scrollbars = () => props.scrollbars ?? scrollAreaPropDefs.scrollbars.default;
  const type = () => props.type ?? scrollAreaPropDefs.type.default;
  const rest = omit(props, "class", "style", "children", "ref", "size", "scrollbars", "type");
  const composedRefs = composeRefs(props.ref);

  return (
    <HeadlessRoot
      {...rest}
      type={type()}
      class={cx("fui-ScrollAreaRoot", props.class)}
      style={props.style}
    >
      <HeadlessViewport
        ref={composedRefs}
        class="fui-ScrollAreaViewport"
        style={{ overflow: viewportOverflowStyle[scrollbars()] }}
        disableImplicitContentElement
      >
        <HeadlessContent
          style={scrollbars() === "vertical" ? { "min-width": 0, width: "100%" } : {}}
        >
          {props.children}
        </HeadlessContent>
      </HeadlessViewport>

      <Show when={scrollbars() !== "vertical"}>
        <HeadlessScrollbar
          orientation="horizontal"
          class={cx("fui-ScrollAreaScrollbar", `fui-r-size-${size()}`)}
          data-type={type()}
        >
          <HeadlessThumb class="fui-ScrollAreaThumb" />
        </HeadlessScrollbar>
      </Show>

      <Show when={scrollbars() !== "horizontal"}>
        <HeadlessScrollbar
          orientation="vertical"
          class={cx("fui-ScrollAreaScrollbar", `fui-r-size-${size()}`)}
          data-type={type()}
        >
          <HeadlessThumb class="fui-ScrollAreaThumb" />
        </HeadlessScrollbar>
      </Show>

      <Show when={scrollbars() === "both"}>
        <HeadlessCorner class="fui-ScrollAreaCorner" />
      </Show>
    </HeadlessRoot>
  );
};

export { ScrollArea };
export type { ScrollAreaProps };
