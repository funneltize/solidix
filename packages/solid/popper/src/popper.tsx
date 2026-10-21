import { createEffect, createSignal, omit, onSettled, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  autoUpdate,
  arrow as floatingUIarrow,
  flip,
  hide,
  limitShift,
  offset,
  shift,
  size,
  computePosition,
  type Middleware,
  type Placement,
} from "@floating-ui/dom";
import { Arrow as ArrowPrimitive, type ArrowProps } from "@solidix/arrow";
import { useComposedRefs, type RefObject } from "@solidix/compose-refs";
import { createContextScope, type Scope } from "@solidix/context";
import { Primitive, type PrimitivePropsWithRef } from "@solidix/primitive";
import { createSlottable } from "@solidix/slot";
import { useCallbackRef } from "@solidix/use-callback-ref";
import { useSize } from "@solidix/use-size";
import type { Measurable } from "@solidix/rect";

/** The allowed placement sides (`"top" | "right" | "bottom" | "left"`). */
const SIDE_OPTIONS = ["top", "right", "bottom", "left"] as const;
/** The allowed placement alignments (`"start" | "center" | "end"`). */
const ALIGN_OPTIONS = ["start", "center", "end"] as const;

type Side = (typeof SIDE_OPTIONS)[number];
type Align = (typeof ALIGN_OPTIONS)[number];

const Sticky = {
  Partial: "partial",
  Always: "always",
} as const;

const UpdatePositionStrategy = {
  Optimized: "optimized",
  Always: "always",
} as const;

type Sticky = (typeof Sticky)[keyof typeof Sticky];
type UpdatePositionStrategy = (typeof UpdatePositionStrategy)[keyof typeof UpdatePositionStrategy];

/* -------------------------------------------------------------------------------------------------
 * Popper
 * -----------------------------------------------------------------------------------------------*/

const POPPER_NAME = "Popper";

type ScopedProps<P> = P & { __scopePopper?: Scope | undefined };
/** Creates a popper scope for composing popper parts across nested trees. */
const [createPopperContext, createPopperScope] = createContextScope(POPPER_NAME);

type PopperContextValue = {
  anchor: () => Measurable | null;
  onAnchorChange(anchor: Measurable | null): void;
  placementState: () => Placement | undefined;
  setPlacementState(placement: Placement | undefined): void;
};
const [PopperProvider, usePopperContext] = createPopperContext<PopperContextValue>(POPPER_NAME);

/** Props for the root state provider that anchors floating content. */
interface PopperProps {
  children?: JSX.Element | undefined;
}
/** Root state provider that anchors floating content to a reference element. */
const Popper: Component<ScopedProps<PopperProps>> = (props) => {
  const [anchor, setAnchor] = createSignal<Measurable | null>(null);
  const [placementState, setPlacementState] = createSignal<Placement | undefined>(undefined);
  return (
    <PopperProvider
      scope={props.__scopePopper}
      anchor={anchor}
      onAnchorChange={setAnchor}
      placementState={placementState}
      setPlacementState={setPlacementState}
    >
      {props.children}
    </PopperProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * PopperAnchor
 * -----------------------------------------------------------------------------------------------*/

const ANCHOR_NAME = "PopperAnchor";

type PopperAnchorElement = HTMLDivElement;
/** Props for the reference element the floating content is positioned against. */
interface PopperAnchorProps extends Omit<PrimitivePropsWithRef<"div">, "ref"> {
  ref?: PrimitivePropsWithRef<"div">["ref"] | undefined;
  virtualRef?: RefObject<Measurable | null> | (() => Measurable | null) | undefined;
}

/** The reference element the floating content is positioned against. */
const PopperAnchor: Component<ScopedProps<PopperAnchorProps>> = (props) => {
  const anchorProps = omit(props, "__scopePopper", "virtualRef", "children", "ref");
  const context = usePopperContext(ANCHOR_NAME, props.__scopePopper);

  const callbackRef = (node: PopperAnchorElement | null) => {
    if (node) {
      context.onAnchorChange(node);
    }
  };
  const composedRefs = useComposedRefs(props.ref, callbackRef);

  if (props.virtualRef) {
    if (typeof props.virtualRef === "function") {
      const getVirtual = props.virtualRef;
      createEffect(
        () => getVirtual(),
        (current) => {
          context.onAnchorChange(current);
        },
      );
    } else {
      const virtualRef = props.virtualRef;
      onSettled(() => {
        // The ref object's `.current` is not reactive; sync it once settled.
        // (Pass a getter instead for values that change over time.)
        context.onAnchorChange(virtualRef.current);
      });
    }
  }

  const placedSide = () => {
    const placement = context.placementState();
    return placement && getSideAndAlignFromPlacement(placement)[0];
  };
  const placedAlign = () => {
    const placement = context.placementState();
    return placement && getSideAndAlignFromPlacement(placement)[1];
  };

  return props.virtualRef ? null : (
    <Primitive.div
      data-radix-popper-side={placedSide()}
      data-radix-popper-align={placedAlign()}
      {...anchorProps}
      ref={composedRefs}
    >
      {props.children}
    </Primitive.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * PopperContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "PopperContent";

const Slottable = createSlottable(CONTENT_NAME);

type Boundary = Element | null;
type PopperContentElement = HTMLDivElement;
/** Props for the floating element positioned relative to the anchor. */
interface PopperContentProps extends Omit<PrimitivePropsWithRef<"div">, "ref" | "style"> {
  ref?: PrimitivePropsWithRef<"div">["ref"] | undefined;
  style?: JSX.CSSProperties | undefined;
  side?: Side | undefined;
  sideOffset?: number | undefined;
  align?: Align | undefined;
  alignOffset?: number | undefined;
  arrowPadding?: number | undefined;
  avoidCollisions?: boolean | undefined;
  collisionBoundary?: Boundary | Boundary[] | undefined;
  collisionPadding?: number | Record<Partial<Side>, number> | undefined;
  sticky?: Sticky | undefined;
  hideWhenDetached?: boolean | undefined;
  updatePositionStrategy?: UpdatePositionStrategy | undefined;
  onPlaced?: (() => void) | undefined;
}

/** The floating element positioned relative to the anchor. */
const PopperContent: Component<ScopedProps<PopperContentProps>> = (props) => {
  const contentProps = omit(
    props,
    "__scopePopper",
    "side",
    "sideOffset",
    "align",
    "alignOffset",
    "arrowPadding",
    "avoidCollisions",
    "collisionBoundary",
    "collisionPadding",
    "sticky",
    "hideWhenDetached",
    "updatePositionStrategy",
    "onPlaced",
    "children",
    "ref",
    "style",
  );
  const context = usePopperContext(CONTENT_NAME, props.__scopePopper);
  const [content, setContent] = createSignal<PopperContentElement | null>(null);
  const [wrapper, setWrapper] = createSignal<HTMLDivElement | null>(null);
  const composedRefs = useComposedRefs(props.ref, (node: PopperContentElement | null) => {
    setContent(() => node);
  });
  const [arrow, setArrow] = createSignal<HTMLElement | null>(null);
  const arrowSize = useSize(() => arrow());
  const arrowWidth = () => arrowSize()?.width ?? 0;
  const arrowHeight = () => arrowSize()?.height ?? 0;

  const side = () => props.side ?? "bottom";
  const align = () => props.align ?? "center";
  const desiredPlacement = () =>
    (side() + (align() !== "center" ? "-" + align() : "")) as Placement;
  const collisionPadding = () => {
    const collisionPaddingProp = props.collisionPadding ?? 0;
    if (typeof collisionPaddingProp === "number") return collisionPaddingProp;
    const { top = 0, right = 0, bottom = 0, left = 0 } = collisionPaddingProp;
    return { top, right, bottom, left };
  };

  const boundary = () => {
    const collisionBoundary = props.collisionBoundary ?? [];
    return Array.isArray(collisionBoundary) ? collisionBoundary : [collisionBoundary];
  };
  const hasExplicitBoundaries = () => boundary().length > 0;

  const detectOverflowOptions = () => ({
    padding: collisionPadding(),
    boundary: boundary().filter(isNotNull),
    // with `strategy: 'fixed'`, this is the only way to get it to respect boundaries
    altBoundary: hasExplicitBoundaries(),
  });

  const transformOrigin = (options: { arrowWidth: number; arrowHeight: number }): Middleware => ({
    name: "transformOrigin",
    options,
    fn(data: any) {
      const { placement, rects, middlewareData } = data;
      const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0;
      const isArrowHidden = cannotCenterArrow;
      const arrowWidth = isArrowHidden ? 0 : options.arrowWidth;
      const arrowHeight = isArrowHidden ? 0 : options.arrowHeight;
      const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement);
      const noArrowAlign: Record<typeof placedAlign, string> = {
        start: "0%",
        center: "50%",
        end: "100%",
      };
      const arrowXCenter = (middlewareData.arrow?.x ?? 0) + arrowWidth / 2;
      const arrowYCenter = (middlewareData.arrow?.y ?? 0) + arrowHeight / 2;

      let x = "";
      let y = "";
      if (placedSide === "bottom") {
        x = isArrowHidden ? noArrowAlign[placedAlign] : `${arrowXCenter}px`;
        y = `${-arrowHeight}px`;
      } else if (placedSide === "top") {
        x = isArrowHidden ? noArrowAlign[placedAlign] : `${arrowXCenter}px`;
        y = `${rects.floating.height + arrowHeight}px`;
      } else if (placedSide === "right") {
        x = `${-arrowHeight}px`;
        y = isArrowHidden ? noArrowAlign[placedAlign] : `${arrowYCenter}px`;
      } else if (placedSide === "left") {
        x = `${rects.floating.width + arrowHeight}px`;
        y = isArrowHidden ? noArrowAlign[placedAlign] : `${arrowYCenter}px`;
      }
      return { data: { x, y } };
    },
  });

  interface Position {
    x: number;
    y: number;
    placement: Placement;
    middlewareData: Record<string, any>;
  }
  const [position, setPosition] = createSignal<Position | null>(null);

  createEffect(
    () => ({
      anchor: context.anchor(),
      floating: wrapper(),
      placement: desiredPlacement(),
      side: side(),
      align: align(),
      sideOffset: props.sideOffset ?? 0,
      alignOffset: props.alignOffset ?? 0,
      arrowPadding: props.arrowPadding ?? 0,
      avoidCollisions: props.avoidCollisions ?? true,
      boundary: boundary(),
      hasExplicitBoundaries: hasExplicitBoundaries(),
      collisionPadding: collisionPadding(),
      arrow: arrow(),
      sticky: props.sticky ?? "partial",
      hideWhenDetached: props.hideWhenDetached ?? false,
      updatePositionStrategy: props.updatePositionStrategy ?? "optimized",
      arrowW: arrowWidth(),
      arrowH: arrowHeight(),
    }),
    (opts) => {
      const { anchor, floating } = opts;
      if (!anchor || !floating) return;

      const arrowPaddingValue = opts.arrowPadding;
      const overflowOptions = detectOverflowOptions();
      const middleware: Middleware[] = [
        offset({ mainAxis: opts.sideOffset + opts.arrowH, alignmentAxis: opts.alignOffset }),
        opts.avoidCollisions &&
          shift({
            mainAxis: true,
            crossAxis: false,
            // Spread rather than passing `limiter: undefined`, which
            // `exactOptionalPropertyTypes` rejects for Floating UI's optional option.
            ...(opts.sticky === Sticky.Partial ? { limiter: limitShift() } : {}),
            ...overflowOptions,
          }),
        opts.avoidCollisions && flip({ ...overflowOptions }),
        size({
          ...overflowOptions,
          apply: ({ elements, rects, availableWidth, availableHeight }) => {
            const { width: anchorWidth, height: anchorHeight } = rects.reference;
            const contentStyle = (elements.floating as HTMLElement).style;
            contentStyle.setProperty("--radix-popper-available-width", `${availableWidth}px`);
            contentStyle.setProperty("--radix-popper-available-height", `${availableHeight}px`);
            contentStyle.setProperty("--radix-popper-anchor-width", `${anchorWidth}px`);
            contentStyle.setProperty("--radix-popper-anchor-height", `${anchorHeight}px`);
          },
        }),
        opts.arrow && floatingUIarrow({ element: opts.arrow, padding: arrowPaddingValue }),
        transformOrigin({ arrowWidth: opts.arrowW, arrowHeight: opts.arrowH }),
        opts.hideWhenDetached &&
          // `hide` detects whether the anchor (reference) is clipped, so when
          // no explicit `collisionBoundary` is set we omit `boundary` entirely
          // and fall back to Floating UI's default clipping ancestors (e.g. a
          // scrollable menu). This lets an occluded submenu hide once its anchor
          // scrolls out of view (#3237). The collision/size middlewares
          // deliberately keep the viewport-based default to avoid clamping
          // content rendered inside transformed or overflow-clipping portal
          // containers. The key is omitted rather than set to `undefined`
          // because `exactOptionalPropertyTypes` rejects the explicit value.
          hide(
            opts.hasExplicitBoundaries
              ? { strategy: "referenceHidden", ...overflowOptions }
              : {
                  strategy: "referenceHidden",
                  padding: overflowOptions.padding,
                  altBoundary: overflowOptions.altBoundary,
                },
          ),
      ].filter((entry): entry is Middleware => Boolean(entry));

      const update = () => {
        computePosition(anchor, floating, {
          strategy: "fixed",
          placement: opts.placement,
          middleware,
        }).then(({ x, y, placement, middlewareData }) => {
          setPosition({ x, y, placement, middlewareData: middlewareData as Record<string, any> });
        });
      };

      return autoUpdate(anchor, floating, update, {
        animationFrame: opts.updatePositionStrategy === "always",
      });
    },
  );

  const isPositioned = () => position() !== null;
  const placementValue = () => position()?.placement ?? desiredPlacement();
  const middlewareData = () => position()?.middlewareData ?? {};
  const placedSideAlign = () => getSideAndAlignFromPlacement(placementValue());
  const placedSide = () => placedSideAlign()[0];
  const placedAlign = () => placedSideAlign()[1];
  const arrowX = () => middlewareData().arrow?.x as number | undefined;
  const arrowY = () => middlewareData().arrow?.y as number | undefined;
  const cannotCenterArrow = () => middlewareData().arrow?.centerOffset !== 0;

  const [contentZIndex, setContentZIndex] = createSignal<string | undefined>(undefined);
  createEffect(
    () => content(),
    (current) => {
      if (current) setContentZIndex(window.getComputedStyle(current).zIndex);
    },
  );

  const handlePlaced = useCallbackRef(() => props.onPlaced?.());
  createEffect(
    () => isPositioned(),
    (positioned) => {
      if (positioned) handlePlaced();
    },
  );

  createEffect(
    () => placementValue(),
    (placement) => {
      context.setPlacementState(placement);
      return () => context.setPlacementState(undefined);
    },
  );

  return (
    <PopperContentProvider
      scope={props.__scopePopper}
      placedSide={placedSide}
      placedAlign={placedAlign}
      onArrowChange={setArrow}
      arrowX={arrowX}
      arrowY={arrowY}
      shouldHideArrow={cannotCenterArrow}
    >
      <div
        ref={(node: HTMLDivElement | null) => setWrapper(() => node)}
        data-radix-popper-content-wrapper=""
        style={{
          position: "fixed",
          left: "0",
          top: "0",
          transform: isPositioned()
            ? `translate(${position()?.x}px, ${position()?.y}px)`
            : "translate(0, -200%)",
          "min-width": "max-content",
          "z-index": contentZIndex(),
          "--radix-popper-transform-origin": [
            middlewareData().transformOrigin?.x,
            middlewareData().transformOrigin?.y,
          ].join(" "),
          // hide the content if using the hide middleware and should be hidden
          // set visibility to hidden and disable pointer events so the UI behaves
          // as if the PopperContent isn't there at all
          visibility: middlewareData().hide?.referenceHidden ? "hidden" : undefined,
          "pointer-events": middlewareData().hide?.referenceHidden ? "none" : undefined,
          animation: !isPositioned() ? "none" : undefined,
        }}
        dir={props.dir}
      >
        {/*
          Mark the inner element as the slot target: like Radix (whose slot
          props flow through as component props), props from any `Slot` above
          this content (eg. roving-focus `tabindex`) belong on the content
          element, not the positioning wrapper.
        */}
        <Slottable>
          <Primitive.div
            data-side={placedSide()}
            data-align={placedAlign()}
            {...contentProps}
            ref={composedRefs}
            style={{
              // if the PopperContent hasn't been placed yet (not all measurements done)
              // we prevent animations so that users's animation don't kick in too early referring wrong sides
              animation: !isPositioned() ? "none" : undefined,
              ...props.style,
            }}
            data-floating-ui-inert={!isPositioned() ? "" : undefined}
          >
            {props.children}
          </Primitive.div>
        </Slottable>
      </div>
    </PopperContentProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * PopperArrow
 * -----------------------------------------------------------------------------------------------*/

const ARROW_NAME = "PopperArrow";

const OPPOSITE_SIDE: Record<Side, Side> = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
};

/** Props for the arrow pointing from the floating content toward the anchor. */
interface PopperArrowProps extends ArrowProps {}

/** An arrow pointing from the floating content toward the anchor. */
const PopperArrow: Component<ScopedProps<PopperArrowProps>> = (props) => {
  const arrowProps = omit(props, "__scopePopper", "ref", "style");
  const contentContext = useContentContext(ARROW_NAME, props.__scopePopper);
  const baseSide = () => OPPOSITE_SIDE[contentContext.placedSide()];

  return (
    // we have to use an extra wrapper because `ResizeObserver` (used by `useSize`)
    // doesn't report size as expected if SVG is the element being measured.
    // https://github.com/radix-ui/primitives/issues/2173
    <span
      ref={contentContext.onArrowChange}
      style={{
        position: "absolute",
        left: contentContext.arrowX() != null ? `${contentContext.arrowX()}px` : undefined,
        top: contentContext.arrowY() != null ? `${contentContext.arrowY()}px` : undefined,
        [baseSide()]: 0,
        "transform-origin": {
          top: "",
          right: "0 0",
          bottom: "center 0",
          left: "100% 0",
        }[contentContext.placedSide()],
        transform: {
          top: "translateY(100%)",
          right: "translateY(50%) rotate(90deg) translateX(-50%)",
          bottom: `rotate(180deg)`,
          left: "translateY(50%) rotate(-90deg) translateX(50%)",
        }[contentContext.placedSide()],
        visibility: contentContext.shouldHideArrow() ? "hidden" : undefined,
      }}
    >
      <ArrowPrimitive
        {...arrowProps}
        ref={props.ref}
        style={{
          ...(typeof props.style === "object" ? props.style : undefined),
          display: "block",
        }}
      />
    </span>
  );
};

/* -----------------------------------------------------------------------------------------------*/

type PopperContentContextValue = {
  placedSide: () => Side;
  placedAlign: () => Align;
  onArrowChange: (node: HTMLElement | null) => void;
  arrowX: () => number | undefined;
  arrowY: () => number | undefined;
  shouldHideArrow: () => boolean;
};

const [PopperContentProvider, useContentContext] =
  createPopperContext<PopperContentContextValue>(CONTENT_NAME);

function isNotNull<T>(value: T | undefined | null): value is T {
  return value != null;
}

function getSideAndAlignFromPlacement(placement: Placement) {
  const [side, align = "center"] = placement.split("-");
  return [side as Side, align as Align] as const;
}

export {
  createPopperScope,
  //
  Popper,
  PopperAnchor,
  PopperContent,
  PopperArrow,
  //
  Popper as Root,
  PopperAnchor as Anchor,
  PopperContent as Content,
  PopperArrow as Arrow,
  //
  SIDE_OPTIONS,
  ALIGN_OPTIONS,
};
export type { PopperProps, PopperAnchorProps, PopperContentProps, PopperArrowProps };
