import { clamp } from "@solidix/number";
import { callEventHandler, composeEventHandlers } from "@solidix/primitive";
import { useComposedRefs } from "@solidix/compose-refs";
import { createContextScope } from "@solidix/context";
import { useDirection } from "@solidix/direction";
import { IS_DEVELOPMENT } from "@solidix/env-check/is-development";
import { Presence } from "@solidix/presence";
import { Primitive } from "@solidix/primitive";
import { createSlottable } from "@solidix/slot";
import { useCallbackRef } from "@solidix/use-callback-ref";
import { useLayoutEffect } from "@solidix/use-layout-effect";
import { children, createEffect, createSignal, onCleanup, Show, type Component } from "solid-js";
import { omit } from "solid-js";
import type { JSX } from "@solidjs/web";

import type { Scope } from "@solidix/context";
import type { PrimitivePropsWithRef } from "@solidix/primitive";

const ScrollAreaType = {
  Auto: "auto",
  Always: "always",
  Scroll: "scroll",
  Hover: "hover",
} as const;

const Orientation = {
  Vertical: "vertical",
  Horizontal: "horizontal",
} as const;

const Direction = {
  LTR: "ltr",
  RTL: "rtl",
} as const;

type ScrollAreaType = (typeof ScrollAreaType)[keyof typeof ScrollAreaType];
type Orientation = (typeof Orientation)[keyof typeof Orientation];
type Direction = (typeof Direction)[keyof typeof Direction];

type Sizes = {
  content: number;
  viewport: number;
  scrollbar: {
    size: number;
    paddingStart: number;
    paddingEnd: number;
  };
};

/** Shared div props for scroll-area parts. `style` is object-only: parts
 * merge their own base styles into it, which string styles cannot
 * participate in. */
type PrimitiveDivProps = Omit<PrimitivePropsWithRef<"div">, "style"> & {
  style?: JSX.CSSProperties | undefined;
};

/** Solid native-event equivalent of the handler event type, for composing
 * optional consumer handlers (which may also be `[handler, data]` tuples). */
type DivEvent<E extends Event> = E & { currentTarget: HTMLDivElement; target: Element };

/* -------------------------------------------------------------------------------------------------
 * ScrollArea
 * -----------------------------------------------------------------------------------------------*/

const SCROLL_AREA_NAME = "ScrollArea";

type ScopedProps<P> = P & { __scopeScrollArea?: Scope | undefined };
/** Creates the context and scope factories shared by the scroll-area parts. */
const [createScrollAreaContext, createScrollAreaScope] = createContextScope(SCROLL_AREA_NAME);

type ScrollAreaContextValue = {
  type: ScrollAreaType;
  dir: Direction;
  scrollHideDelay: number;
  scrollArea: () => ScrollAreaElement | null;
  viewport: () => ScrollAreaViewportElement | null;
  onViewportChange(viewport: ScrollAreaViewportElement | null): void;
  content: () => HTMLDivElement | null;
  onContentChange(content: HTMLDivElement | null): void;
  scrollbarX: () => ScrollAreaScrollbarElement | null;
  onScrollbarXChange(scrollbar: ScrollAreaScrollbarElement | null): void;
  scrollbarXEnabled: () => boolean;
  onScrollbarXEnabledChange(rendered: boolean): void;
  scrollbarY: () => ScrollAreaScrollbarElement | null;
  onScrollbarYChange(scrollbar: ScrollAreaScrollbarElement | null): void;
  scrollbarYEnabled: () => boolean;
  onScrollbarYEnabledChange(rendered: boolean): void;
  onCornerWidthChange(width: number): void;
  onCornerHeightChange(height: number): void;
};

const [ScrollAreaProvider, useScrollAreaContext] =
  createScrollAreaContext<ScrollAreaContextValue>(SCROLL_AREA_NAME);

type ScrollAreaElement = HTMLDivElement;
export interface ScrollAreaProps extends PrimitiveDivProps {
  type?: ScrollAreaContextValue["type"] | undefined;
  dir?: ScrollAreaContextValue["dir"] | undefined;
  scrollHideDelay?: number | undefined;
}

/** Root element providing scroll-area context to the viewport, scrollbars, and corner. */
const ScrollArea: Component<ScopedProps<ScrollAreaProps>> = (props) => {
  const rest = omit(props, "__scopeScrollArea", "type", "dir", "scrollHideDelay", "ref", "style");
  const type = () => props.type ?? ScrollAreaType.Hover;
  const scrollHideDelay = () => props.scrollHideDelay ?? 600;
  const [scrollArea, setScrollArea] = createSignal<ScrollAreaElement | null>(null);
  const [viewport, setViewport] = createSignal<ScrollAreaViewportElement | null>(null);
  const [content, setContent] = createSignal<HTMLDivElement | null>(null);
  const [scrollbarX, setScrollbarX] = createSignal<ScrollAreaScrollbarElement | null>(null);
  const [scrollbarY, setScrollbarY] = createSignal<ScrollAreaScrollbarElement | null>(null);
  const [cornerWidth, setCornerWidth] = createSignal(0);
  const [cornerHeight, setCornerHeight] = createSignal(0);
  const [scrollbarXEnabled, setScrollbarXEnabled] = createSignal(false);
  const [scrollbarYEnabled, setScrollbarYEnabled] = createSignal(false);
  const composedRefs = useComposedRefs(props.ref, setScrollArea);
  const direction = useDirection(props.dir);

  return (
    <ScrollAreaProvider
      scope={props.__scopeScrollArea}
      type={type()}
      dir={direction}
      scrollHideDelay={scrollHideDelay()}
      scrollArea={scrollArea}
      viewport={viewport}
      onViewportChange={setViewport}
      content={content}
      onContentChange={setContent}
      scrollbarX={scrollbarX}
      onScrollbarXChange={setScrollbarX}
      scrollbarXEnabled={scrollbarXEnabled}
      onScrollbarXEnabledChange={setScrollbarXEnabled}
      scrollbarY={scrollbarY}
      onScrollbarYChange={setScrollbarY}
      scrollbarYEnabled={scrollbarYEnabled}
      onScrollbarYEnabledChange={setScrollbarYEnabled}
      onCornerWidthChange={setCornerWidth}
      onCornerHeightChange={setCornerHeight}
    >
      <Primitive.div
        dir={direction}
        {...rest}
        ref={composedRefs}
        style={{
          position: "relative",
          // Pass corner sizes as CSS vars to reduce re-renders of context consumers
          "--radix-scroll-area-corner-width": `${cornerWidth()}px`,
          "--radix-scroll-area-corner-height": `${cornerHeight()}px`,
          ...props.style,
        }}
      />
    </ScrollAreaProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ScrollAreaViewport
 * -----------------------------------------------------------------------------------------------*/

const VIEWPORT_NAME = "ScrollAreaViewport";
const Slottable = createSlottable(VIEWPORT_NAME);

type ScrollAreaViewportElement = HTMLDivElement;
export interface ScrollAreaViewportProps extends PrimitiveDivProps {
  nonce?: string | undefined;
  /**
   * Disables implicit rendering of an additional wrapper element that measures
   * the content size. When `true`, a child `<ScrollArea.Content>` must be
   * rendered as a direct child of the viewport.
   *
   * Implicit rendering of the content element will be removed in the next major
   * release.
   */
  disableImplicitContentElement?: boolean | undefined;
}

/** Scrollable viewport tracking content size to drive scrollbar geometry. */
const ScrollAreaViewport: Component<ScopedProps<ScrollAreaViewportProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeScrollArea",
    "children",
    "nonce",
    "disableImplicitContentElement",
    "ref",
    "style",
  );
  const context = useScrollAreaContext(VIEWPORT_NAME, props.__scopeScrollArea);
  const ref: { current: ScrollAreaViewportElement | null } = { current: null };
  const composedRefs = useComposedRefs(props.ref, ref, context.onViewportChange);

  // Resolved once: the branches below read the children, and every raw
  // `props.children` read would re-instantiate the subtree. Safe to memoize
  // here - the viewport provides no context of its own.
  const resolvedChildren = children(() => props.children);

  // `Slot` can only redirect props onto a single element, so `asChild` can
  // only reach the consumer's element when `children` is one.
  const childNodes = () => resolvedChildren.toArray();
  const canSlotOntoChildren = () => {
    const nodes = childNodes();
    return nodes.length === 1 && nodes[0] instanceof Element;
  };

  useLayoutEffect(() => {
    if (!IS_DEVELOPMENT) return;
    const shouldWarn =
      props.asChild === true && !props.disableImplicitContentElement && !canSlotOntoChildren();
    if (shouldWarn) {
      console.warn(
        `${VIEWPORT_NAME}: \`asChild\` expects a single element child, so its props have been applied to the implicitly rendered content element instead. Wrap the children in a single element, or opt into \`disableImplicitContentElement\` and render a \`ScrollArea.Content\` inside the viewport.`,
      );
    }
  });

  return (
    <>
      <ScrollAreaViewportStyle nonce={props.nonce} />
      <Primitive.div
        data-radix-scroll-area-viewport=""
        {...rest}
        ref={composedRefs}
        style={{
          /**
           * We don't support `visible` because the intention is to have at least one scrollbar
           * if this component is used and `visible` will behave like `auto` in that case
           * https://developer.mozilla.org/en-US/docs/Web/CSS/overflow#description
           *
           * We don't handle `auto` because the intention is for the native implementation
           * to be hidden if using this component. We just want to ensure the node is scrollable
           * so could have used either `scroll` or `auto` here. We picked `scroll` to prevent
           * the browser from having to work out whether to render native scrollbars or not,
           * we tell it to with the intention of hiding them in CSS.
           */
          "overflow-x": context.scrollbarXEnabled() ? "scroll" : "hidden",
          "overflow-y": context.scrollbarYEnabled() ? "scroll" : "hidden",
          ...props.style,
        }}
      >
        {/*
         * Nested `Slottable` keeps the content-measuring wrapper inside the
         * slotted element when `asChild` is set. Without it, `Slot` would
         * target that wrapper and drop every prop on the consumer's element.
         *
         * See: https://github.com/radix-ui/primitives/issues/1666.
         */}
        {props.disableImplicitContentElement ? (
          resolvedChildren()
        ) : props.asChild && canSlotOntoChildren() ? (
          <Slottable child={resolvedChildren()}>
            {(slottable) => (
              <ScrollAreaContent __scopeScrollArea={props.__scopeScrollArea}>
                {slottable}
              </ScrollAreaContent>
            )}
          </Slottable>
        ) : (
          // When `children` isn't a single element there is nothing for
          // `Slot` to redirect onto, so target the wrapper. This mirrors the
          // old [incorrect] behavior, but it's better than throwing on a
          // patch update.
          <Slottable>
            <ScrollAreaContent __scopeScrollArea={props.__scopeScrollArea}>
              {resolvedChildren()}
            </ScrollAreaContent>
          </Slottable>
        )}
      </Primitive.div>
    </>
  );
};

const ScrollAreaViewportStyle: Component<{ nonce?: string | undefined }> = (props) => {
  return (
    // Hide scrollbars cross-browser and enable momentum scroll for touch devices
    <style nonce={props.nonce}>
      {`[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}`}
    </style>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ScrollAreaContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "ScrollAreaContent";

export type ScrollAreaContentProps = PrimitiveDivProps;

/** Content wrapper matching its children so scrollbar geometry can be measured. */
const ScrollAreaContent: Component<ScopedProps<ScrollAreaContentProps>> = (props) => {
  const rest = omit(props, "__scopeScrollArea", "children", "ref", "style");
  const context = useScrollAreaContext(CONTENT_NAME, props.__scopeScrollArea);
  const composedRefs = useComposedRefs(props.ref, context.onContentChange);
  return (
    // `display: table` ensures our content div will match the size of its
    // children in both horizontal and vertical axis so we can determine if
    // scroll width/height changed and recalculate thumb sizes. This doesn't
    // account for children with *percentage* widths that change. We'll wait to
    // see what use-cases consumers come up with there before trying to resolve
    // it.
    <Primitive.div
      role="presentation"
      {...rest}
      ref={composedRefs}
      style={{ "min-width": "100%", display: "table", ...props.style }}
    >
      {props.children}
    </Primitive.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ScrollAreaScrollbar
 * -----------------------------------------------------------------------------------------------*/

const SCROLLBAR_NAME = "ScrollAreaScrollbar";

type ScrollAreaScrollbarElement = ScrollAreaScrollbarVisibleElement;
export interface ScrollAreaScrollbarProps extends ScrollAreaScrollbarVisibleProps {
  forceMount?: true | undefined;
}

/** Scrollbar shell rendering the hover, scroll, or auto variant for its orientation. */
const ScrollAreaScrollbar: Component<ScopedProps<ScrollAreaScrollbarProps>> = (props) => {
  const rest = omit(props, "__scopeScrollArea", "forceMount", "ref", "orientation");
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const isHorizontal = () => props.orientation === Orientation.Horizontal;

  createEffect(
    () => ({
      horizontal: isHorizontal(),
      onX: context.onScrollbarXEnabledChange,
      onY: context.onScrollbarYEnabledChange,
    }),
    ({ horizontal, onX, onY }) => {
      if (horizontal) onX(true);
      else onY(true);
      return () => {
        if (horizontal) onX(false);
        else onY(false);
      };
    },
  );

  // `type` is static, so only one branch ever renders.
  if (context.type === ScrollAreaType.Hover) {
    return (
      <ScrollAreaScrollbarHover
        __scopeScrollArea={props.__scopeScrollArea}
        orientation={props.orientation}
        {...rest}
        ref={props.ref}
        forceMount={props.forceMount}
      />
    );
  }
  if (context.type === ScrollAreaType.Scroll) {
    return (
      <ScrollAreaScrollbarScroll
        __scopeScrollArea={props.__scopeScrollArea}
        orientation={props.orientation}
        {...rest}
        ref={props.ref}
        forceMount={props.forceMount}
      />
    );
  }
  if (context.type === ScrollAreaType.Auto) {
    return (
      <ScrollAreaScrollbarAuto
        __scopeScrollArea={props.__scopeScrollArea}
        orientation={props.orientation}
        {...rest}
        ref={props.ref}
        forceMount={props.forceMount}
      />
    );
  }
  if (context.type === ScrollAreaType.Always) {
    return (
      <ScrollAreaScrollbarVisible
        __scopeScrollArea={props.__scopeScrollArea}
        orientation={props.orientation}
        {...rest}
        ref={props.ref}
        data-state="visible"
      />
    );
  }
  return null;
};

/* -----------------------------------------------------------------------------------------------*/

export interface ScrollAreaScrollbarHoverProps extends ScrollAreaScrollbarAutoProps {
  forceMount?: true | undefined;
}

const ScrollAreaScrollbarHover: Component<ScopedProps<ScrollAreaScrollbarHoverProps>> = (props) => {
  const rest = omit(props, "__scopeScrollArea", "forceMount", "ref", "orientation");
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [visible, setVisible] = createSignal(false);

  createEffect(
    () => ({ scrollArea: context.scrollArea(), scrollHideDelay: context.scrollHideDelay }),
    ({ scrollArea, scrollHideDelay }) => {
      if (!scrollArea) return;
      let hideTimer = 0;
      const handlePointerEnter = () => {
        window.clearTimeout(hideTimer);
        setVisible(true);
      };
      const handlePointerLeave = () => {
        hideTimer = window.setTimeout(() => setVisible(false), scrollHideDelay);
      };
      scrollArea.addEventListener("pointerenter", handlePointerEnter);
      scrollArea.addEventListener("pointerleave", handlePointerLeave);
      return () => {
        window.clearTimeout(hideTimer);
        scrollArea.removeEventListener("pointerenter", handlePointerEnter);
        scrollArea.removeEventListener("pointerleave", handlePointerLeave);
      };
    },
  );

  return (
    <Presence present={props.forceMount || visible()}>
      <ScrollAreaScrollbarAuto
        __scopeScrollArea={props.__scopeScrollArea}
        orientation={props.orientation}
        data-state={visible() ? "visible" : "hidden"}
        {...rest}
        ref={props.ref}
      />
    </Presence>
  );
};

export interface ScrollAreaScrollbarScrollProps extends ScrollAreaScrollbarVisibleProps {
  forceMount?: true | undefined;
}

const ScrollAreaScrollbarScroll: Component<ScopedProps<ScrollAreaScrollbarScrollProps>> = (
  props,
) => {
  const rest = omit(props, "__scopeScrollArea", "forceMount", "ref", "orientation");
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const isHorizontal = () => props.orientation === Orientation.Horizontal;
  const debounceScrollEnd = useDebounceCallback(() => send("SCROLL_END"), 100);
  const [state, send] = useStateMachine("hidden", {
    hidden: {
      SCROLL: "scrolling",
    },
    scrolling: {
      SCROLL_END: "idle",
      POINTER_ENTER: "interacting",
    },
    interacting: {
      SCROLL: "interacting",
      POINTER_LEAVE: "idle",
    },
    idle: {
      HIDE: "hidden",
      SCROLL: "scrolling",
      POINTER_ENTER: "interacting",
    },
  });

  createEffect(
    () => ({ state: state(), scrollHideDelay: context.scrollHideDelay }),
    ({ state, scrollHideDelay }) => {
      if (state === "idle") {
        const hideTimer = window.setTimeout(() => send("HIDE"), scrollHideDelay);
        return () => window.clearTimeout(hideTimer);
      }
    },
  );

  createEffect(
    () => ({ viewport: context.viewport(), horizontal: isHorizontal() }),
    ({ viewport, horizontal }) => {
      if (!viewport) return;
      const scrollDirection = horizontal ? "scrollLeft" : "scrollTop";
      let prevScrollPos = viewport[scrollDirection];
      const handleScroll = () => {
        const scrollPos = viewport[scrollDirection];
        const hasScrollInDirectionChanged = prevScrollPos !== scrollPos;
        if (hasScrollInDirectionChanged) {
          send("SCROLL");
          debounceScrollEnd();
        }
        prevScrollPos = scrollPos;
      };
      viewport.addEventListener("scroll", handleScroll);
      return () => viewport.removeEventListener("scroll", handleScroll);
    },
  );

  return (
    <Presence present={props.forceMount || state() !== "hidden"}>
      <ScrollAreaScrollbarVisible
        __scopeScrollArea={props.__scopeScrollArea}
        orientation={props.orientation}
        data-state={state() === "hidden" ? "hidden" : "visible"}
        {...rest}
        ref={props.ref}
        onPointerEnter={composeEventHandlers(
          (event: DivEvent<PointerEvent>) => callEventHandler(rest.onPointerEnter, event),
          () => send("POINTER_ENTER"),
        )}
        onPointerLeave={composeEventHandlers(
          (event: DivEvent<PointerEvent>) => callEventHandler(rest.onPointerLeave, event),
          () => send("POINTER_LEAVE"),
        )}
      />
    </Presence>
  );
};

export interface ScrollAreaScrollbarAutoProps extends ScrollAreaScrollbarVisibleProps {
  forceMount?: true | undefined;
}

const ScrollAreaScrollbarAuto: Component<ScopedProps<ScrollAreaScrollbarAutoProps>> = (props) => {
  const rest = omit(props, "__scopeScrollArea", "forceMount", "ref", "orientation");
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [visible, setVisible] = createSignal(false);
  const isHorizontal = () => props.orientation === Orientation.Horizontal;
  const handleResize = useDebounceCallback(() => {
    const viewport = context.viewport();
    if (viewport) {
      const isOverflowX = viewport.offsetWidth < viewport.scrollWidth;
      const isOverflowY = viewport.offsetHeight < viewport.scrollHeight;
      setVisible(isHorizontal() ? isOverflowX : isOverflowY);
    }
  }, 10);

  useResizeObserver(context.viewport, handleResize);
  useResizeObserver(context.content, handleResize);

  return (
    <Presence present={props.forceMount || visible()}>
      <ScrollAreaScrollbarVisible
        __scopeScrollArea={props.__scopeScrollArea}
        orientation={props.orientation}
        data-state={visible() ? "visible" : "hidden"}
        {...rest}
        ref={props.ref}
      />
    </Presence>
  );
};

/* -----------------------------------------------------------------------------------------------*/

type ScrollAreaScrollbarVisibleElement = ScrollAreaScrollbarAxisElement;
export interface ScrollAreaScrollbarVisibleProps extends Omit<
  ScrollAreaScrollbarAxisProps,
  keyof ScrollAreaScrollbarAxisPrivateProps
> {
  orientation?: Orientation | undefined;
}

const ScrollAreaScrollbarVisible: Component<ScopedProps<ScrollAreaScrollbarVisibleProps>> = (
  props,
) => {
  const rest = omit(props, "__scopeScrollArea", "orientation", "ref");
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const orientation = props.orientation ?? Orientation.Vertical;
  const thumbRef: { current: ScrollAreaThumbElement | null } = { current: null };
  const pointerOffsetRef = { current: 0 };
  const [sizes, setSizes] = createSignal<Sizes>({
    content: 0,
    viewport: 0,
    scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 },
  });
  const thumbRatio = () => getThumbRatio(sizes().viewport, sizes().content);
  const hasThumb = () => thumbRatio() > 0 && thumbRatio() < 1;

  const getScrollPosition = (pointerPos: number, dir?: Direction) => {
    return getScrollPositionFromPointer(pointerPos, pointerOffsetRef.current, sizes(), dir);
  };

  const handleThumbChange = (thumb: ScrollAreaThumbElement | null) => {
    thumbRef.current = thumb;
  };
  const handleThumbPointerUp = () => {
    pointerOffsetRef.current = 0;
  };
  const handleThumbPointerDown = (pointerPos: number) => {
    pointerOffsetRef.current = pointerPos;
  };

  if (orientation === Orientation.Horizontal) {
    return (
      <ScrollAreaScrollbarX
        __scopeScrollArea={props.__scopeScrollArea}
        {...rest}
        ref={props.ref}
        sizes={sizes}
        onSizesChange={setSizes}
        hasThumb={hasThumb}
        onThumbChange={handleThumbChange}
        onThumbPointerUp={handleThumbPointerUp}
        onThumbPointerDown={handleThumbPointerDown}
        onThumbPositionChange={() => {
          const viewport = context.viewport();
          if (viewport && thumbRef.current) {
            const scrollPos = viewport.scrollLeft;
            const offset = getThumbOffsetFromScroll(scrollPos, sizes(), context.dir);
            thumbRef.current.style.transform = `translate3d(${offset}px, 0, 0)`;
          }
        }}
        onWheelScroll={(scrollPos) => {
          const viewport = context.viewport();
          if (viewport) viewport.scrollLeft = scrollPos;
        }}
        onDragScroll={(pointerPos) => {
          const viewport = context.viewport();
          if (viewport) {
            viewport.scrollLeft = getScrollPosition(pointerPos, context.dir);
          }
        }}
      />
    );
  }

  if (orientation === Orientation.Vertical) {
    return (
      <ScrollAreaScrollbarY
        __scopeScrollArea={props.__scopeScrollArea}
        {...rest}
        ref={props.ref}
        sizes={sizes}
        onSizesChange={setSizes}
        hasThumb={hasThumb}
        onThumbChange={handleThumbChange}
        onThumbPointerUp={handleThumbPointerUp}
        onThumbPointerDown={handleThumbPointerDown}
        onThumbPositionChange={() => {
          const viewport = context.viewport();
          if (viewport && thumbRef.current) {
            const scrollPos = viewport.scrollTop;
            const offset = getThumbOffsetFromScroll(scrollPos, sizes());
            thumbRef.current.style.transform = `translate3d(0, ${offset}px, 0)`;
          }
        }}
        onWheelScroll={(scrollPos) => {
          const viewport = context.viewport();
          if (viewport) viewport.scrollTop = scrollPos;
        }}
        onDragScroll={(pointerPos) => {
          const viewport = context.viewport();
          if (viewport) {
            viewport.scrollTop = getScrollPosition(pointerPos);
          }
        }}
      />
    );
  }

  return null;
};

/* -----------------------------------------------------------------------------------------------*/

type ScrollAreaScrollbarAxisPrivateProps = {
  // Passed as getters: sizes change after mount and Solid props freeze at setup.
  hasThumb: () => boolean;
  sizes: () => Sizes;
  onSizesChange(sizes: Sizes): void;
  onThumbChange(thumb: ScrollAreaThumbElement | null): void;
  onThumbPointerDown(pointerPos: number): void;
  onThumbPointerUp(): void;
  onThumbPositionChange(): void;
  onWheelScroll(scrollPos: number): void;
  onDragScroll(pointerPos: number): void;
};

type ScrollAreaScrollbarAxisElement = ScrollAreaScrollbarImplElement;
export interface ScrollAreaScrollbarAxisProps
  extends
    Omit<ScrollAreaScrollbarImplProps, keyof ScrollAreaScrollbarImplPrivateProps>,
    ScrollAreaScrollbarAxisPrivateProps {}

const ScrollAreaScrollbarX: Component<ScopedProps<ScrollAreaScrollbarAxisProps>> = (props) => {
  const rest = omit(props, "__scopeScrollArea", "sizes", "onSizesChange", "ref", "style");
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [computedStyle, setComputedStyle] = createSignal<CSSStyleDeclaration>();
  const ref: { current: ScrollAreaScrollbarAxisElement | null } = { current: null };
  const composeRefs = useComposedRefs(props.ref, ref, context.onScrollbarXChange);

  useLayoutEffect(() => {
    if (ref.current) setComputedStyle(getComputedStyle(ref.current));
  });

  return (
    <ScrollAreaScrollbarImpl
      __scopeScrollArea={props.__scopeScrollArea}
      data-orientation="horizontal"
      {...rest}
      ref={composeRefs}
      sizes={props.sizes}
      style={{
        bottom: 0,
        left: context.dir === Direction.RTL ? "var(--radix-scroll-area-corner-width)" : 0,
        right: context.dir === Direction.LTR ? "var(--radix-scroll-area-corner-width)" : 0,
        "--radix-scroll-area-thumb-width": `${getThumbSize(props.sizes())}px`,
        ...props.style,
      }}
      onThumbPointerDown={(pointerPos) => props.onThumbPointerDown(pointerPos.x)}
      onDragScroll={(pointerPos) => props.onDragScroll(pointerPos.x)}
      onWheelScroll={(event, maxScrollPos) => {
        const viewport = context.viewport();
        if (viewport) {
          const scrollPos = viewport.scrollLeft + event.deltaX;
          props.onWheelScroll(scrollPos);
          // prevent window scroll when wheeling on scrollbar
          if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
            event.preventDefault();
          }
        }
      }}
      onResize={() => {
        const style = computedStyle();
        const viewport = context.viewport();
        if (ref.current && viewport && style) {
          props.onSizesChange({
            content: viewport.scrollWidth,
            viewport: viewport.offsetWidth,
            scrollbar: {
              size: ref.current.clientWidth,
              paddingStart: toInt(style.paddingLeft),
              paddingEnd: toInt(style.paddingRight),
            },
          });
        }
      }}
    />
  );
};

const ScrollAreaScrollbarY: Component<ScopedProps<ScrollAreaScrollbarAxisProps>> = (props) => {
  const rest = omit(props, "__scopeScrollArea", "sizes", "onSizesChange", "ref", "style");
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [computedStyle, setComputedStyle] = createSignal<CSSStyleDeclaration>();
  const ref: { current: ScrollAreaScrollbarAxisElement | null } = { current: null };
  const composeRefs = useComposedRefs(props.ref, ref, context.onScrollbarYChange);

  useLayoutEffect(() => {
    if (ref.current) setComputedStyle(getComputedStyle(ref.current));
  });

  return (
    <ScrollAreaScrollbarImpl
      __scopeScrollArea={props.__scopeScrollArea}
      data-orientation="vertical"
      {...rest}
      ref={composeRefs}
      sizes={props.sizes}
      style={{
        top: 0,
        right: context.dir === Direction.LTR ? 0 : undefined,
        left: context.dir === Direction.RTL ? 0 : undefined,
        bottom: "var(--radix-scroll-area-corner-height)",
        "--radix-scroll-area-thumb-height": `${getThumbSize(props.sizes())}px`,
        ...props.style,
      }}
      onThumbPointerDown={(pointerPos) => props.onThumbPointerDown(pointerPos.y)}
      onDragScroll={(pointerPos) => props.onDragScroll(pointerPos.y)}
      onWheelScroll={(event, maxScrollPos) => {
        const viewport = context.viewport();
        if (viewport) {
          const scrollPos = viewport.scrollTop + event.deltaY;
          props.onWheelScroll(scrollPos);
          // prevent window scroll when wheeling on scrollbar
          if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
            event.preventDefault();
          }
        }
      }}
      onResize={() => {
        const style = computedStyle();
        const viewport = context.viewport();
        if (ref.current && viewport && style) {
          props.onSizesChange({
            content: viewport.scrollHeight,
            viewport: viewport.offsetHeight,
            scrollbar: {
              size: ref.current.clientHeight,
              paddingStart: toInt(style.paddingTop),
              paddingEnd: toInt(style.paddingBottom),
            },
          });
        }
      }}
    />
  );
};

/* -----------------------------------------------------------------------------------------------*/

type ScrollbarContext = {
  hasThumb: () => boolean;
  scrollbar: () => ScrollAreaScrollbarElement | null;
  onThumbChange(thumb: ScrollAreaThumbElement | null): void;
  onThumbPointerUp(): void;
  onThumbPointerDown(pointerPos: { x: number; y: number }): void;
  onThumbPositionChange(): void;
};

const [ScrollbarProvider, useScrollbarContext] =
  createScrollAreaContext<ScrollbarContext>(SCROLLBAR_NAME);

type ScrollAreaScrollbarImplPrivateProps = {
  sizes: () => Sizes;
  hasThumb: () => boolean;
  onThumbChange: ScrollbarContext["onThumbChange"];
  onThumbPointerUp: ScrollbarContext["onThumbPointerUp"];
  onThumbPointerDown: ScrollbarContext["onThumbPointerDown"];
  onThumbPositionChange: ScrollbarContext["onThumbPositionChange"];
  onWheelScroll(event: WheelEvent, maxScrollPos: number): void;
  onDragScroll(pointerPos: { x: number; y: number }): void;
  onResize(): void;
};
type ScrollAreaScrollbarImplElement = HTMLDivElement;
export interface ScrollAreaScrollbarImplProps
  extends
    Omit<PrimitiveDivProps, keyof ScrollAreaScrollbarImplPrivateProps>,
    ScrollAreaScrollbarImplPrivateProps {}

const ScrollAreaScrollbarImpl: Component<ScopedProps<ScrollAreaScrollbarImplProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeScrollArea",
    "sizes",
    "hasThumb",
    "onThumbChange",
    "onThumbPointerUp",
    "onThumbPointerDown",
    "onThumbPositionChange",
    "onDragScroll",
    "onWheelScroll",
    "onResize",
    "ref",
    "style",
  );
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [scrollbar, setScrollbar] = createSignal<ScrollAreaScrollbarElement | null>(null);
  const composeRefs = useComposedRefs(props.ref, setScrollbar);
  const rectRef: { current: DOMRect | null } = { current: null };
  const prevWebkitUserSelectRef = { current: "" };
  const maxScrollPos = () => props.sizes().content - props.sizes().viewport;
  const handleWheelScroll = useCallbackRef(props.onWheelScroll);
  const handleThumbPositionChange = useCallbackRef(props.onThumbPositionChange);
  const handleResize = useDebounceCallback(props.onResize, 10);

  function handleDragScroll(event: DivEvent<PointerEvent>) {
    if (rectRef.current) {
      const x = event.clientX - rectRef.current.left;
      const y = event.clientY - rectRef.current.top;
      props.onDragScroll({ x, y });
    }
  }

  /**
   * We bind wheel event imperatively so we can switch off passive
   * mode for document wheel event to allow it to be prevented
   */
  createEffect(
    () => ({ viewport: context.viewport(), scrollbar: scrollbar(), max: maxScrollPos() }),
    ({ scrollbar, max }) => {
      const handleWheel = (event: WheelEvent) => {
        const element = event.target as HTMLElement;
        const isScrollbarWheel = scrollbar?.contains(element);
        if (isScrollbarWheel) handleWheelScroll(event, max);
      };
      document.addEventListener("wheel", handleWheel, { passive: false });
      return () => document.removeEventListener("wheel", handleWheel);
    },
  );

  /**
   * Update thumb position on sizes change
   */
  createEffect(
    () => props.sizes(),
    () => {
      handleThumbPositionChange();
    },
  );

  useResizeObserver(scrollbar, handleResize);
  useResizeObserver(context.content, handleResize);

  const onThumbChange = useCallbackRef(props.onThumbChange);
  const onThumbPointerUp = useCallbackRef(props.onThumbPointerUp);
  const onThumbPointerDown = useCallbackRef(props.onThumbPointerDown);

  return (
    <ScrollbarProvider
      scope={props.__scopeScrollArea}
      scrollbar={scrollbar}
      hasThumb={props.hasThumb}
      onThumbChange={onThumbChange}
      onThumbPointerUp={onThumbPointerUp}
      onThumbPositionChange={handleThumbPositionChange}
      onThumbPointerDown={onThumbPointerDown}
    >
      <Primitive.div
        {...rest}
        ref={composeRefs}
        style={{ position: "absolute", ...props.style }}
        onPointerDown={composeEventHandlers(
          (event: DivEvent<PointerEvent>) => callEventHandler(rest.onPointerDown, event),
          (event) => {
            const mainPointer = 0;
            if (event.button === mainPointer) {
              const scrollbarNode = scrollbar();
              const element = event.target as HTMLElement;
              element.setPointerCapture(event.pointerId);
              if (scrollbarNode) rectRef.current = scrollbarNode.getBoundingClientRect();
              // pointer capture doesn't prevent text selection in Safari
              // so we remove text selection manually when scrolling
              prevWebkitUserSelectRef.current = document.body.style.webkitUserSelect;
              document.body.style.webkitUserSelect = "none";
              const viewport = context.viewport();
              if (viewport) viewport.style.scrollBehavior = "auto";
              handleDragScroll(event);
            }
          },
        )}
        onPointerMove={composeEventHandlers(
          (event: DivEvent<PointerEvent>) => callEventHandler(rest.onPointerMove, event),
          (event) => handleDragScroll(event),
        )}
        onPointerUp={composeEventHandlers(
          (event: DivEvent<PointerEvent>) => callEventHandler(rest.onPointerUp, event),
          (event) => {
            const element = event.target as HTMLElement;
            if (element.hasPointerCapture(event.pointerId)) {
              element.releasePointerCapture(event.pointerId);
            }
            document.body.style.webkitUserSelect = prevWebkitUserSelectRef.current;
            const viewport = context.viewport();
            if (viewport) viewport.style.scrollBehavior = "";
            rectRef.current = null;
          },
        )}
      />
    </ScrollbarProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ScrollAreaThumb
 * -----------------------------------------------------------------------------------------------*/

const THUMB_NAME = "ScrollAreaThumb";

type ScrollAreaThumbElement = ScrollAreaThumbImplElement;
export interface ScrollAreaThumbProps extends ScrollAreaThumbImplProps {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with animation libraries.
   */
  forceMount?: true | undefined;
}

/** Draggable scrollbar thumb shown while the scrollbar has a thumb to render. */
const ScrollAreaThumb: Component<ScopedProps<ScrollAreaThumbProps>> = (props) => {
  const rest = omit(props, "__scopeScrollArea", "forceMount", "ref");
  const scrollbarContext = useScrollbarContext(THUMB_NAME, props.__scopeScrollArea);
  return (
    <Presence present={props.forceMount || scrollbarContext.hasThumb()}>
      <ScrollAreaThumbImpl __scopeScrollArea={props.__scopeScrollArea} {...rest} ref={props.ref} />
    </Presence>
  );
};

type ScrollAreaThumbImplElement = HTMLDivElement;
export interface ScrollAreaThumbImplProps extends PrimitiveDivProps {
  // Solid JSX provides no `onPointerDownCapture` (see `@solidix/dismissable-layer`):
  // accepted explicitly and attached imperatively below.
  onPointerDownCapture?: JSX.EventHandlerUnion<HTMLDivElement, PointerEvent> | undefined;
}

const ScrollAreaThumbImpl: Component<ScopedProps<ScrollAreaThumbImplProps>> = (props) => {
  const rest = omit(props, "__scopeScrollArea", "style", "ref", "onPointerDownCapture");
  const scrollAreaContext = useScrollAreaContext(THUMB_NAME, props.__scopeScrollArea);
  const scrollbarContext = useScrollbarContext(THUMB_NAME, props.__scopeScrollArea);
  const { onThumbPositionChange } = scrollbarContext;

  // Capture-phase pointerdown (the Solid equivalent of React's
  // `onPointerDownCapture`): attached imperatively on the thumb node, following
  // the `@solidix/dismissable-layer` pattern.
  const handlePointerDownCapture = (event: PointerEvent) => {
    callEventHandler(props.onPointerDownCapture, event);
    if (event.defaultPrevented) return;
    const thumb = event.target as HTMLElement;
    const thumbRect = thumb.getBoundingClientRect();
    const x = event.clientX - thumbRect.left;
    const y = event.clientY - thumbRect.top;
    scrollbarContext.onThumbPointerDown({ x, y });
  };
  let captureNode: ScrollAreaThumbImplElement | null = null;
  const attachCaptureListener = (next: ScrollAreaThumbImplElement | null) => {
    if (captureNode) {
      captureNode.removeEventListener("pointerdown", handlePointerDownCapture, true);
    }
    captureNode = next;
    if (captureNode) {
      captureNode.addEventListener("pointerdown", handlePointerDownCapture, true);
    }
  };

  const composedRef = useComposedRefs(
    props.ref,
    scrollbarContext.onThumbChange,
    (node: ScrollAreaThumbImplElement | null) => {
      attachCaptureListener(node);
    },
  );
  onCleanup(() => attachCaptureListener(null));

  const removeUnlinkedScrollListenerRef: { current: (() => void) | undefined } = {
    current: undefined,
  };
  const debounceScrollEnd = useDebounceCallback(() => {
    if (removeUnlinkedScrollListenerRef.current) {
      removeUnlinkedScrollListenerRef.current();
      removeUnlinkedScrollListenerRef.current = undefined;
    }
  }, 100);

  createEffect(
    () => scrollAreaContext.viewport(),
    (viewport) => {
      if (!viewport) return;
      /**
       * We only bind to native scroll event so we know when scroll starts and ends.
       * When scroll starts we start a requestAnimationFrame loop that checks for
       * changes to scroll position. That rAF loop triggers our thumb position change
       * when relevant to avoid scroll-linked effects. We cancel the loop when scroll ends.
       * https://developer.mozilla.org/en-US/docs/Mozilla/Performance/Scroll-linked_effects
       */
      const handleScroll = () => {
        debounceScrollEnd();
        if (!removeUnlinkedScrollListenerRef.current) {
          const listener = addUnlinkedScrollListener(viewport, onThumbPositionChange);
          removeUnlinkedScrollListenerRef.current = listener;
          onThumbPositionChange();
        }
      };
      onThumbPositionChange();
      viewport.addEventListener("scroll", handleScroll);
      return () => viewport.removeEventListener("scroll", handleScroll);
    },
  );

  return (
    <Primitive.div
      data-state={scrollbarContext.hasThumb() ? "visible" : "hidden"}
      {...rest}
      ref={composedRef}
      style={{
        width: "var(--radix-scroll-area-thumb-width)",
        height: "var(--radix-scroll-area-thumb-height)",
        ...props.style,
      }}
      onPointerUp={composeEventHandlers(
        (event: DivEvent<PointerEvent>) => callEventHandler(rest.onPointerUp, event),
        scrollbarContext.onThumbPointerUp,
      )}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * ScrollAreaCorner
 * -----------------------------------------------------------------------------------------------*/

const CORNER_NAME = "ScrollAreaCorner";

export type ScrollAreaCornerProps = ScrollAreaCornerImplProps;

/** Corner element rendered where the horizontal and vertical scrollbars meet. */
const ScrollAreaCorner: Component<ScopedProps<ScrollAreaCornerProps>> = (props) => {
  const context = useScrollAreaContext(CORNER_NAME, props.__scopeScrollArea);
  const hasBothScrollbarsVisible = () => Boolean(context.scrollbarX() && context.scrollbarY());
  const hasCorner = () => context.type !== ScrollAreaType.Scroll && hasBothScrollbarsVisible();
  return (
    <Show when={hasCorner()}>
      <ScrollAreaCornerImpl {...props} />
    </Show>
  );
};

/* -----------------------------------------------------------------------------------------------*/

export type ScrollAreaCornerImplProps = PrimitiveDivProps;

const ScrollAreaCornerImpl: Component<ScopedProps<ScrollAreaCornerImplProps>> = (props) => {
  const rest = omit(props, "__scopeScrollArea", "ref", "style");
  const context = useScrollAreaContext(CORNER_NAME, props.__scopeScrollArea);
  const [width, setWidth] = createSignal(0);
  const [height, setHeight] = createSignal(0);
  const hasSize = () => Boolean(width() && height());

  useResizeObserver(context.scrollbarX, () => {
    const nextHeight = context.scrollbarX()?.offsetHeight || 0;
    context.onCornerHeightChange(nextHeight);
    setHeight(nextHeight);
  });

  useResizeObserver(context.scrollbarY, () => {
    const nextWidth = context.scrollbarY()?.offsetWidth || 0;
    context.onCornerWidthChange(nextWidth);
    setWidth(nextWidth);
  });

  // Reset the corner sizes when the corner unmounts (eg. when one of the
  // scrollbars is no longer visible) so the exposed CSS variables don't stick
  // around and leave a gap on the remaining scrollbar.
  // https://github.com/radix-ui/primitives/issues/2383
  useLayoutEffect(() => {
    return () => {
      context.onCornerWidthChange(0);
      context.onCornerHeightChange(0);
    };
  });

  return (
    <Show when={hasSize()}>
      <Primitive.div
        {...rest}
        ref={props.ref}
        style={{
          // Solid does not append `px` to numeric style values the way React does.
          width: `${width()}px`,
          height: `${height()}px`,
          position: "absolute",
          right: context.dir === Direction.LTR ? 0 : undefined,
          left: context.dir === Direction.RTL ? 0 : undefined,
          bottom: 0,
          ...props.style,
        }}
      />
    </Show>
  );
};

/* -----------------------------------------------------------------------------------------------*/

function toInt(value?: string) {
  return value ? parseInt(value, 10) : 0;
}

function getThumbRatio(viewportSize: number, contentSize: number) {
  const ratio = viewportSize / contentSize;
  return isNaN(ratio) ? 0 : ratio;
}

function getThumbSize(sizes: Sizes) {
  const ratio = getThumbRatio(sizes.viewport, sizes.content);
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const thumbSize = (sizes.scrollbar.size - scrollbarPadding) * ratio;
  // minimum of 18 matches macOS minimum
  return Math.max(thumbSize, 18);
}

function getScrollPositionFromPointer(
  pointerPos: number,
  pointerOffset: number,
  sizes: Sizes,
  dir: Direction = Direction.LTR,
) {
  const thumbSizePx = getThumbSize(sizes);
  const thumbCenter = thumbSizePx / 2;
  const offset = pointerOffset || thumbCenter;
  const thumbOffsetFromEnd = thumbSizePx - offset;
  const minPointerPos = sizes.scrollbar.paddingStart + offset;
  const maxPointerPos = sizes.scrollbar.size - sizes.scrollbar.paddingEnd - thumbOffsetFromEnd;
  const maxScrollPos = sizes.content - sizes.viewport;
  const scrollRange = dir === Direction.LTR ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
  const interpolate = linearScale([minPointerPos, maxPointerPos], scrollRange as [number, number]);
  return interpolate(pointerPos);
}

function getThumbOffsetFromScroll(scrollPos: number, sizes: Sizes, dir: Direction = Direction.LTR) {
  const thumbSizePx = getThumbSize(sizes);
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const scrollbar = sizes.scrollbar.size - scrollbarPadding;
  const maxScrollPos = sizes.content - sizes.viewport;
  const maxThumbPos = scrollbar - thumbSizePx;
  const scrollClampRange = dir === Direction.LTR ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
  const scrollWithoutMomentum = clamp(scrollPos, scrollClampRange as [number, number]);
  const interpolate = linearScale([0, maxScrollPos], [0, maxThumbPos]);
  return interpolate(scrollWithoutMomentum);
}

// https://github.com/tmcw-up-for-adoption/simple-linear-scale/blob/master/index.js
function linearScale(input: readonly [number, number], output: readonly [number, number]) {
  return (value: number) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0];
    const ratio = (output[1] - output[0]) / (input[1] - input[0]);
    return output[0] + ratio * (value - input[0]);
  };
}

function isScrollingWithinScrollbarBounds(scrollPos: number, maxScrollPos: number) {
  return scrollPos > 0 && scrollPos < maxScrollPos;
}

// Custom scroll handler to avoid scroll-linked effects
// https://developer.mozilla.org/en-US/docs/Mozilla/Performance/Scroll-linked_effects
const addUnlinkedScrollListener = (node: HTMLElement, handler = () => {}) => {
  let prevPosition = { left: node.scrollLeft, top: node.scrollTop };
  let rAF = 0;
  function loop() {
    const position = { left: node.scrollLeft, top: node.scrollTop };
    const isHorizontalScroll = prevPosition.left !== position.left;
    const isVerticalScroll = prevPosition.top !== position.top;
    if (isHorizontalScroll || isVerticalScroll) handler();
    prevPosition = position;
    rAF = window.requestAnimationFrame(loop);
  }
  loop();
  return () => window.cancelAnimationFrame(rAF);
};

function useDebounceCallback(callback: () => void, delay: number) {
  const handleCallback = useCallbackRef(callback);
  const debounceTimerRef = { current: 0 };
  onCleanup(() => window.clearTimeout(debounceTimerRef.current));
  return () => {
    window.clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(handleCallback, delay);
  };
}

function useResizeObserver(element: () => HTMLElement | null, onResize: () => void) {
  const handleResize = useCallbackRef(onResize);
  createEffect(
    () => element(),
    (current) => {
      if (!current) return;
      const target = current;
      let rAF = 0;
      /**
       * Resize Observer will throw an often benign error that says `ResizeObserver loop
       * completed with undelivered notifications`. This means that ResizeObserver was not
       * able to deliver all observations within a single animation frame, so we use
       * `requestAnimationFrame` to ensure we don't deliver unnecessary observations.
       * Further reading: https://github.com/WICG/resize-observer/issues/38
       */
      const resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(rAF);
        rAF = window.requestAnimationFrame(handleResize);
      });
      resizeObserver.observe(target);
      return () => {
        window.cancelAnimationFrame(rAF);
        resizeObserver.unobserve(target);
      };
    },
  );
}

function useStateMachine<State extends string, Event extends string>(
  initialState: State,
  machine: Record<State, Partial<Record<Event, State>>>,
) {
  const [state, setState] = createSignal<State>(initialState as Exclude<State, Function>);
  const send = (event: Event) => {
    setState((prev) => machine[prev][event] ?? prev);
  };
  return [state, send] as const;
}

/* -----------------------------------------------------------------------------------------------*/

export {
  createScrollAreaScope,
  //
  ScrollArea,
  ScrollAreaViewport,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaCorner,
  //
  ScrollArea as Root,
  ScrollAreaViewport as Viewport,
  ScrollAreaContent as Content,
  ScrollAreaScrollbar as Scrollbar,
  ScrollAreaThumb as Thumb,
  ScrollAreaCorner as Corner,
};
