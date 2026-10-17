import { createEffect, createSignal, omit, onCleanup, type Component, type Setter } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useComposedRefs } from "@soldix/compose-refs";
import { createContextScope, type Scope } from "@soldix/context";
import { DismissableLayer, type DismissableLayerProps } from "@soldix/dismissable-layer";
import { useFocusScopeBranch } from "@soldix/focus-scope";
import { useId } from "@soldix/id";
import {
  Popper,
  PopperAnchor,
  PopperArrow,
  PopperContent,
  createPopperScope,
  type PopperArrowProps,
  type PopperContentProps,
} from "@soldix/popper";
import { Portal as PortalPrimitive, type PortalProps } from "@soldix/portal";
import { Presence } from "@soldix/presence";
import {
  Primitive,
  callEventHandler,
  composeEventHandlers,
  type PrimitivePropsWithRef,
} from "@soldix/primitive";
import { createSlottable } from "@soldix/slot";
import { useControllableState } from "@soldix/use-controllable-state";
import { Root as VisuallyHidden } from "@soldix/visually-hidden";

/* -------------------------------------------------------------------------------------------------
 * TooltipProvider
 * -----------------------------------------------------------------------------------------------*/

const PROVIDER_NAME = "TooltipProvider";
const DEFAULT_DELAY_DURATION = 700;
const TOOLTIP_OPEN = "tooltip.open";

type ScopedProps<P> = P & { __scopeTooltip?: Scope | undefined };
const [createTooltipContext, createTooltipScope] = createContextScope(PROVIDER_NAME, [
  createPopperScope,
]);
const usePopperScope = createPopperScope();

type TooltipProviderContextValue = {
  isOpenDelayedRef: { current: boolean };
  delayDuration: () => number;
  onOpen(): void;
  onClose(): void;
  onPointerInTransitChange(inTransit: boolean): void;
  isPointerInTransitRef: { current: boolean };
  disableHoverableContent: () => boolean;
};

const [TooltipProviderContextProvider, useTooltipProviderContext] =
  createTooltipContext<TooltipProviderContextValue>(PROVIDER_NAME);

type TooltipProviderProps = {
  children: JSX.Element;
  /**
   * The duration from when the pointer enters the trigger until the tooltip gets opened.
   * @defaultValue 700
   */
  delayDuration?: number | undefined;
  /**
   * How much time a user has to enter another trigger without incurring a delay again.
   * @defaultValue 300
   */
  skipDelayDuration?: number | undefined;
  /**
   * When `true`, trying to hover the content will result in the tooltip closing as the pointer leaves the trigger.
   * @defaultValue false
   */
  disableHoverableContent?: boolean | undefined;
};

const TooltipProvider: Component<ScopedProps<TooltipProviderProps>> = (props) => {
  const isOpenDelayedRef = { current: true };
  const isPointerInTransitRef = { current: false };
  let skipDelayTimer = 0;

  onCleanup(() => window.clearTimeout(skipDelayTimer));

  const skipDelayDuration = () => props.skipDelayDuration ?? 300;

  return (
    <TooltipProviderContextProvider
      scope={props.__scopeTooltip}
      isOpenDelayedRef={isOpenDelayedRef}
      delayDuration={() => props.delayDuration ?? DEFAULT_DELAY_DURATION}
      onOpen={() => {
        if (skipDelayDuration() <= 0) return;
        window.clearTimeout(skipDelayTimer);
        isOpenDelayedRef.current = false;
      }}
      onClose={() => {
        if (skipDelayDuration() <= 0) return;
        window.clearTimeout(skipDelayTimer);
        skipDelayTimer = window.setTimeout(
          () => (isOpenDelayedRef.current = true),
          skipDelayDuration(),
        );
      }}
      isPointerInTransitRef={isPointerInTransitRef}
      onPointerInTransitChange={(inTransit: boolean) => {
        isPointerInTransitRef.current = inTransit;
      }}
      disableHoverableContent={() => props.disableHoverableContent ?? false}
    >
      {props.children}
    </TooltipProviderContextProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Tooltip
 * -----------------------------------------------------------------------------------------------*/

const TOOLTIP_NAME = "Tooltip";

type TooltipContextValue = {
  contentId: () => string;
  open: () => boolean;
  stateAttribute: () => "closed" | "delayed-open" | "instant-open";
  trigger: () => TooltipTriggerElement | null;
  onTriggerChange(trigger: TooltipTriggerElement | null): void;
  onTriggerEnter(): void;
  onTriggerLeave(): void;
  onOpen(): void;
  onClose(): void;
  disableHoverableContent: () => boolean;
  setContentId: Setter<string | undefined>;
};

const [TooltipContextProvider, useTooltipContext] =
  createTooltipContext<TooltipContextValue>(TOOLTIP_NAME);

type TooltipProps = {
  children?: JSX.Element | undefined;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: { bivarianceHack(open: boolean): void }["bivarianceHack"] | undefined;
  /**
   * The duration from when the pointer enters the trigger until the tooltip gets opened. This will
   * override the prop with the same name passed to Provider.
   * @defaultValue 700
   */
  delayDuration?: number | undefined;
  /**
   * When `true`, trying to hover the content will result in the tooltip closing as the pointer leaves the trigger.
   * @defaultValue false
   */
  disableHoverableContent?: boolean | undefined;
};

const Tooltip: Component<ScopedProps<TooltipProps>> = (props) => {
  const providerContext = useTooltipProviderContext(TOOLTIP_NAME, props.__scopeTooltip);
  const popperScope = usePopperScope(props.__scopeTooltip);
  const [trigger, setTrigger] = createSignal<TooltipTriggerElement | null>(null);
  const [contentIdState, setContentId] = createSignal<string | undefined>(undefined);
  const generatedContentId = useId();
  let openTimer = 0;
  const disableHoverableContent = () =>
    props.disableHoverableContent ?? providerContext.disableHoverableContent();
  const delayDuration = () => props.delayDuration ?? providerContext.delayDuration();
  let wasOpenDelayed = false;
  const [open, setOpen] = useControllableState({
    prop: () => props.open,
    defaultProp: props.defaultOpen ?? false,
    onChange: (isOpen) => {
      if (isOpen) {
        providerContext.onOpen();

        // as `onChange` is called within a lifecycle method we
        // avoid dispatching via `dispatchDiscreteCustomEvent`.
        document.dispatchEvent(new CustomEvent(TOOLTIP_OPEN));
      } else {
        providerContext.onClose();
      }
      props.onOpenChange?.(isOpen);
    },
    caller: TOOLTIP_NAME,
  });
  const stateAttribute = (): "closed" | "delayed-open" | "instant-open" =>
    open() ? (wasOpenDelayed ? "delayed-open" : "instant-open") : "closed";

  const handleOpen = () => {
    window.clearTimeout(openTimer);
    openTimer = 0;
    wasOpenDelayed = false;
    setOpen(true);
  };

  const handleClose = () => {
    window.clearTimeout(openTimer);
    openTimer = 0;
    setOpen(false);
  };

  const handleDelayedOpen = () => {
    window.clearTimeout(openTimer);
    openTimer = window.setTimeout(() => {
      wasOpenDelayed = true;
      setOpen(true);
      openTimer = 0;
    }, delayDuration());
  };

  onCleanup(() => {
    if (openTimer) {
      window.clearTimeout(openTimer);
      openTimer = 0;
    }
  });

  const contentId = () => contentIdState() ?? generatedContentId;

  return (
    <Popper {...popperScope}>
      <TooltipContextProvider
        scope={props.__scopeTooltip}
        contentId={contentId}
        setContentId={setContentId}
        open={open}
        stateAttribute={stateAttribute}
        trigger={trigger}
        onTriggerChange={setTrigger}
        onTriggerEnter={() => {
          if (providerContext.isOpenDelayedRef.current) handleDelayedOpen();
          else handleOpen();
        }}
        onTriggerLeave={() => {
          if (disableHoverableContent()) {
            handleClose();
          } else {
            // Clear the timer in case the pointer leaves the trigger before the tooltip is opened.
            window.clearTimeout(openTimer);
            openTimer = 0;
          }
        }}
        onOpen={handleOpen}
        onClose={handleClose}
        disableHoverableContent={disableHoverableContent}
      >
        {props.children}
      </TooltipContextProvider>
    </Popper>
  );
};

/* -------------------------------------------------------------------------------------------------
 * TooltipTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = "TooltipTrigger";

type TooltipTriggerElement = HTMLButtonElement;
type TooltipTriggerProps = PrimitivePropsWithRef<"button">;

const TooltipTrigger: Component<ScopedProps<TooltipTriggerProps>> = (props) => {
  const rest = omit(props, "__scopeTooltip", "aria-describedby", "ref");
  const context = useTooltipContext(TRIGGER_NAME, props.__scopeTooltip);
  const providerContext = useTooltipProviderContext(TRIGGER_NAME, props.__scopeTooltip);
  const popperScope = usePopperScope(props.__scopeTooltip);
  const composedRefs = useComposedRefs(props.ref, context.onTriggerChange);
  const isPointerDownRef = { current: false };
  const hasPointerMoveOpenedRef = { current: false };
  const handlePointerUp = () => (isPointerDownRef.current = false);

  onCleanup(() => document.removeEventListener("pointerup", handlePointerUp));

  return (
    <PopperAnchor asChild {...popperScope}>
      <Primitive.button
        // We purposefully avoid adding `type=button` here because tooltip triggers are also
        // commonly anchors and the anchor `type` attribute signifies MIME type.
        aria-describedby={
          context.open()
            ? concatAriaDescribedby(props["aria-describedby"], context.contentId())
            : props["aria-describedby"]
        }
        data-state={context.stateAttribute()}
        {...rest}
        ref={composedRefs}
        onPointerMove={composeEventHandlers(
          (event: PointerEvent) => callEventHandler(props.onPointerMove, event),
          (event) => {
            if (event.pointerType === "touch") return;
            if (
              !hasPointerMoveOpenedRef.current &&
              !providerContext.isPointerInTransitRef.current
            ) {
              context.onTriggerEnter();
              hasPointerMoveOpenedRef.current = true;
            }
          },
        )}
        onPointerLeave={composeEventHandlers(
          (event: PointerEvent) => callEventHandler(props.onPointerLeave, event),
          () => {
            context.onTriggerLeave();
            hasPointerMoveOpenedRef.current = false;
          },
        )}
        onPointerDown={composeEventHandlers(
          (event: PointerEvent) => callEventHandler(props.onPointerDown, event),
          () => {
            if (context.open()) {
              context.onClose();
            }
            isPointerDownRef.current = true;
            document.addEventListener("pointerup", handlePointerUp, { once: true });
          },
        )}
        onFocus={composeEventHandlers(
          (event: FocusEvent) => callEventHandler(props.onFocus, event),
          () => {
            if (!isPointerDownRef.current) context.onOpen();
          },
        )}
        onBlur={composeEventHandlers(
          (event: FocusEvent) => callEventHandler(props.onBlur, event),
          () => context.onClose(),
        )}
        onClick={composeEventHandlers(
          (event: MouseEvent) => callEventHandler(props.onClick, event),
          () => context.onClose(),
        )}
      />
    </PopperAnchor>
  );
};

/* -------------------------------------------------------------------------------------------------
 * TooltipPortal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = "TooltipPortal";

type PortalContextValue = { forceMount?: true | undefined };
const [PortalProvider, usePortalContext] = createTooltipContext<PortalContextValue>(PORTAL_NAME, {
  forceMount: undefined,
});

type TooltipPortalProps = {
  children?: JSX.Element | undefined;
  /**
   * Specify a container element to portal the content into.
   */
  container?: PortalProps["container"] | undefined;
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true | undefined;
};

const TooltipPortal: Component<ScopedProps<TooltipPortalProps>> = (props) => {
  const context = useTooltipContext(PORTAL_NAME, props.__scopeTooltip);
  // NOTE: Radix nests the portal inside `Presence`; Soldix inverts this.
  // Solid portals resolve to a text marker, so a `Presence` around the
  // portal cannot resolve (or track for exit animations) the portalled
  // content. With `Presence` inside, it resolves the content directly.
  // Deviation: empty portal markers stay in the container while closed.
  return (
    <PortalProvider scope={props.__scopeTooltip} forceMount={props.forceMount}>
      <PortalPrimitive container={props.container}>
        <Presence present={() => props.forceMount || context.open()}>{props.children}</Presence>
      </PortalPrimitive>
    </PortalProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * TooltipContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "TooltipContent";

type TooltipContentProps = TooltipContentImplProps & {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true | undefined;
};

const TooltipContent: Component<ScopedProps<TooltipContentProps>> = (props) => {
  const rest = omit(props, "forceMount", "side", "ref");
  const portalContext = usePortalContext(CONTENT_NAME, props.__scopeTooltip);
  const context = useTooltipContext(CONTENT_NAME, props.__scopeTooltip);
  const forceMount = () => props.forceMount ?? portalContext.forceMount;

  return (
    <Presence present={() => forceMount() || context.open()}>
      {context.disableHoverableContent() ? (
        <TooltipContentImpl side={props.side ?? "top"} {...rest} ref={props.ref} />
      ) : (
        <TooltipContentHoverable side={props.side ?? "top"} {...rest} ref={props.ref} />
      )}
    </Presence>
  );
};

type Point = { x: number; y: number };
type Polygon = Point[];

type TooltipContentHoverableProps = TooltipContentImplProps;

const TooltipContentHoverable: Component<ScopedProps<TooltipContentHoverableProps>> = (props) => {
  const context = useTooltipContext(CONTENT_NAME, props.__scopeTooltip);
  const providerContext = useTooltipProviderContext(CONTENT_NAME, props.__scopeTooltip);
  const [content, setContent] = createSignal<TooltipContentImplElement | null>(null);
  const composedRefs = useComposedRefs(props.ref, setContent);
  // `ownedWrite`: the unmount cleanup clears the grace area, which also
  // runs when `Presence` disposes its setup-time probe of this subtree.
  const [pointerGraceArea, setPointerGraceArea] = createSignal<Polygon | null>(null, {
    ownedWrite: true,
  });

  const handleRemoveGraceArea = () => {
    setPointerGraceArea(null);
    providerContext.onPointerInTransitChange(false);
  };

  const handleCreateGraceArea = (event: PointerEvent, hoverTarget: HTMLElement) => {
    const currentTarget = event.currentTarget as HTMLElement;
    const exitPoint = { x: event.clientX, y: event.clientY };
    const exitSide = getExitSideFromRect(exitPoint, currentTarget.getBoundingClientRect());
    const paddedExitPoints = getPaddedExitPoints(exitPoint, exitSide);
    const hoverTargetPoints = getPointsFromRect(hoverTarget.getBoundingClientRect());
    const graceArea = getHull([...paddedExitPoints, ...hoverTargetPoints]);
    setPointerGraceArea(graceArea);
    providerContext.onPointerInTransitChange(true);
  };

  onCleanup(handleRemoveGraceArea);

  createEffect(
    () => ({ trigger: context.trigger(), content: content() }),
    ({ trigger, content: currentContent }) => {
      if (trigger && currentContent) {
        const handleTriggerLeave = (event: PointerEvent) =>
          handleCreateGraceArea(event, currentContent);
        const handleContentLeave = (event: PointerEvent) => handleCreateGraceArea(event, trigger);

        trigger.addEventListener("pointerleave", handleTriggerLeave);
        currentContent.addEventListener("pointerleave", handleContentLeave);
        return () => {
          trigger.removeEventListener("pointerleave", handleTriggerLeave);
          currentContent.removeEventListener("pointerleave", handleContentLeave);
        };
      }
    },
  );

  createEffect(
    () => ({
      trigger: context.trigger(),
      content: content(),
      pointerGraceArea: pointerGraceArea(),
    }),
    ({ trigger, content: currentContent, pointerGraceArea: area }) => {
      if (area) {
        const handleTrackPointerGrace = (event: PointerEvent) => {
          const target = event.target as HTMLElement;
          const pointerPosition = { x: event.clientX, y: event.clientY };
          const hasEnteredTarget = trigger?.contains(target) || currentContent?.contains(target);
          const isPointerOutsideGraceArea = !isPointInPolygon(pointerPosition, area);

          if (hasEnteredTarget) {
            handleRemoveGraceArea();
          } else if (isPointerOutsideGraceArea) {
            handleRemoveGraceArea();
            context.onClose();
          }
        };
        document.addEventListener("pointermove", handleTrackPointerGrace);
        return () => document.removeEventListener("pointermove", handleTrackPointerGrace);
      }
    },
  );

  return <TooltipContentImpl {...props} ref={composedRefs} />;
};

type TooltipContentImplElement = HTMLDivElement;
type TooltipContentImplProps = Omit<PopperContentProps, "onPlaced"> & {
  /**
   * A more descriptive label for accessibility purpose
   */
  "aria-label"?: string | undefined;

  /**
   * Event handler called when the escape key is down.
   * Can be prevented.
   */
  onEscapeKeyDown?: DismissableLayerProps["onEscapeKeyDown"] | undefined;
  /**
   * Event handler called when the a `pointerdown` event happens outside of the `Tooltip`.
   * Can be prevented.
   */
  onPointerDownOutside?: DismissableLayerProps["onPointerDownOutside"] | undefined;
};

const Slottable = createSlottable("TooltipContent");

const TooltipContentImpl: Component<ScopedProps<TooltipContentImplProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeTooltip",
    "children",
    "aria-label",
    "id",
    "onEscapeKeyDown",
    "onPointerDownOutside",
    "ref",
  );
  const context = useTooltipContext(CONTENT_NAME, props.__scopeTooltip);
  const popperScope = usePopperScope(props.__scopeTooltip);

  // When this `Tooltip` is nested inside a modal layer (eg. a `Dialog`) but
  // portalled outside of it, register its content with the ancestor layer so
  // focus isn't reclaimed by the Dialog's FocusScope when tabbing away from
  // focusable content inside the tooltip. No-ops when there is no ancestor
  // layer. See: https://github.com/radix-ui/primitives/issues/3185
  const [contentNode, setContentNode] = createSignal<TooltipContentImplElement | null>(null);
  const composedRefs = useComposedRefs(props.ref, setContentNode);
  useFocusScopeBranch(contentNode);

  // Close this tooltip if another one opens. Attached in an effect (not
  // setup): the opener dispatches during its own open flush, and attaching
  // earlier would close this tooltip on its own open.
  createEffect(
    () => context.onClose,
    (onClose) => {
      document.addEventListener(TOOLTIP_OPEN, onClose);
      return () => document.removeEventListener(TOOLTIP_OPEN, onClose);
    },
  );

  // Close the tooltip if the trigger is scrolled
  createEffect(
    () => context.trigger(),
    (trigger) => {
      if (trigger) {
        const handleScroll = (event: Event) => {
          if (event.target instanceof Node && event.target.contains(trigger)) {
            context.onClose();
          }
        };
        window.addEventListener("scroll", handleScroll, { capture: true });
        return () => window.removeEventListener("scroll", handleScroll, { capture: true });
      }
    },
  );

  createEffect(
    // Solid DOM types admit `false` for `id`; only strings identify content.
    () => (typeof props.id === "string" ? props.id : undefined),
    (id) => {
      context.setContentId(id);
      return () => {
        context.setContentId(undefined);
      };
    },
  );

  return (
    <DismissableLayer
      asChild
      disableOutsidePointerEvents={false}
      onEscapeKeyDown={props.onEscapeKeyDown}
      onPointerDownOutside={props.onPointerDownOutside}
      onFocusOutside={(event) => event.preventDefault()}
      onDismiss={context.onClose}
    >
      <PopperContent
        data-state={context.stateAttribute()}
        // Following the ARIA tooltip pattern, the visible content acts as the
        // accessible description (referenced by the trigger's
        // `aria-describedby`) when no `aria-label` override is provided. This
        // lets `children` render a single time instead of being duplicated
        // into a visually hidden copy.
        role={props["aria-label"] ? undefined : "tooltip"}
        id={props["aria-label"] ? undefined : context.contentId()}
        {...popperScope}
        {...rest}
        ref={composedRefs}
        style={{
          ...props.style,
          // re-namespace exposed content custom properties
          "--radix-tooltip-content-transform-origin": "var(--radix-popper-transform-origin)",
          "--radix-tooltip-content-available-width": "var(--radix-popper-available-width)",
          "--radix-tooltip-content-available-height": "var(--radix-popper-available-height)",
          "--radix-tooltip-trigger-width": "var(--radix-popper-anchor-width)",
          "--radix-tooltip-trigger-height": "var(--radix-popper-anchor-height)",
        }}
      >
        <Slottable>{props.children}</Slottable>
        {props["aria-label"] ? (
          <VisuallyHidden id={context.contentId()} role="tooltip">
            {props["aria-label"]}
          </VisuallyHidden>
        ) : null}
      </PopperContent>
    </DismissableLayer>
  );
};

/* -------------------------------------------------------------------------------------------------
 * TooltipArrow
 * -----------------------------------------------------------------------------------------------*/

type TooltipArrowProps = PopperArrowProps;

const TooltipArrow: Component<ScopedProps<TooltipArrowProps>> = (props) => {
  const rest = omit(props, "__scopeTooltip", "ref");
  const popperScope = usePopperScope(props.__scopeTooltip);
  return <PopperArrow {...popperScope} {...rest} ref={props.ref} />;
};

/* -----------------------------------------------------------------------------------------------*/

type Side = NonNullable<TooltipContentProps["side"]>;

function getExitSideFromRect(point: Point, rect: DOMRect): Side {
  const top = Math.abs(rect.top - point.y);
  const bottom = Math.abs(rect.bottom - point.y);
  const right = Math.abs(rect.right - point.x);
  const left = Math.abs(rect.left - point.x);

  switch (Math.min(top, bottom, right, left)) {
    case left:
      return "left";
    case right:
      return "right";
    case top:
      return "top";
    case bottom:
      return "bottom";
    default:
      throw new Error("unreachable");
  }
}

function getPaddedExitPoints(exitPoint: Point, exitSide: Side, padding = 5) {
  const paddedExitPoints: Point[] = [];
  switch (exitSide) {
    case "top":
      paddedExitPoints.push(
        { x: exitPoint.x - padding, y: exitPoint.y + padding },
        { x: exitPoint.x + padding, y: exitPoint.y + padding },
      );
      break;
    case "bottom":
      paddedExitPoints.push(
        { x: exitPoint.x - padding, y: exitPoint.y - padding },
        { x: exitPoint.x + padding, y: exitPoint.y - padding },
      );
      break;
    case "left":
      paddedExitPoints.push(
        { x: exitPoint.x + padding, y: exitPoint.y - padding },
        { x: exitPoint.x + padding, y: exitPoint.y + padding },
      );
      break;
    case "right":
      paddedExitPoints.push(
        { x: exitPoint.x - padding, y: exitPoint.y - padding },
        { x: exitPoint.x - padding, y: exitPoint.y + padding },
      );
      break;
  }
  return paddedExitPoints;
}

function getPointsFromRect(rect: DOMRect) {
  const { top, right, bottom, left } = rect;
  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ];
}

// Determine if a point is inside of a polygon.
// Based on https://github.com/substack/point-in-polygon
function isPointInPolygon(point: Point, polygon: Polygon) {
  const { x, y } = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const ii = polygon[i]!;
    const jj = polygon[j]!;
    const xi = ii.x;
    const yi = ii.y;
    const xj = jj.x;
    const yj = jj.y;

    // oxfmt-ignore
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

// Returns a new array of points representing the convex hull of the given set of points.
// https://www.nayuki.io/page/convex-hull-algorithm
function getHull<P extends Point>(points: Readonly<Array<P>>): Array<P> {
  const newPoints: Array<P> = points.slice();
  newPoints.sort((a: Point, b: Point) => {
    if (a.x < b.x) return -1;
    else if (a.x > b.x) return +1;
    else if (a.y < b.y) return -1;
    else if (a.y > b.y) return +1;
    else return 0;
  });
  return getHullPresorted(newPoints);
}

// Returns the convex hull, assuming that each points[i] <= points[i + 1]. Runs in O(n) time.
function getHullPresorted<P extends Point>(points: Readonly<Array<P>>): Array<P> {
  if (points.length <= 1) return points.slice();

  const upperHull: Array<P> = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i]!;
    while (upperHull.length >= 2) {
      const q = upperHull[upperHull.length - 1]!;
      const r = upperHull[upperHull.length - 2]!;
      if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) upperHull.pop();
      else break;
    }
    upperHull.push(p);
  }
  upperHull.pop();

  const lowerHull: Array<P> = [];
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i]!;
    while (lowerHull.length >= 2) {
      const q = lowerHull[lowerHull.length - 1]!;
      const r = lowerHull[lowerHull.length - 2]!;
      if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) lowerHull.pop();
      else break;
    }
    lowerHull.push(p);
  }
  lowerHull.pop();

  if (
    upperHull.length === 1 &&
    lowerHull.length === 1 &&
    upperHull[0]!.x === lowerHull[0]!.x &&
    upperHull[0]!.y === lowerHull[0]!.y
  ) {
    return upperHull;
  } else {
    return upperHull.concat(lowerHull);
  }
}

// TODO: Move to primitive once that package exposed individual sub-modules
function concatAriaDescribedby(...values: unknown[]): string | undefined {
  const ids = new Set<string>();
  for (const value of values) {
    if (typeof value !== "string") continue;
    for (const id of String(value).trim().split(/\s+/)) {
      if (id) ids.add(id);
    }
  }

  return ids.size > 0 ? Array.from(ids).join(" ") : undefined;
}

/* -----------------------------------------------------------------------------------------------*/

export {
  createTooltipScope,
  //
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent,
  TooltipArrow,
  //
  TooltipProvider as Provider,
  Tooltip as Root,
  TooltipTrigger as Trigger,
  TooltipPortal as Portal,
  TooltipContent as Content,
  TooltipArrow as Arrow,
};
export type {
  TooltipProviderProps,
  TooltipProps,
  TooltipTriggerProps,
  TooltipPortalProps,
  TooltipContentProps,
  TooltipArrowProps,
};
