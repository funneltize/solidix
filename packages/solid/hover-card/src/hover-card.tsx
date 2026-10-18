import { createEffect, createSignal, omit, onCleanup, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useComposedRefs, type RefObject } from "@solidix/compose-refs";
import { createContextScope, type Scope } from "@solidix/context";
import { DismissableLayer, type DismissableLayerProps } from "@solidix/dismissable-layer";
import { useFocusScopeBranch } from "@solidix/focus-scope";
import {
  Popper,
  PopperAnchor,
  PopperArrow,
  PopperContent,
  createPopperScope,
  type PopperArrowProps,
  type PopperContentProps,
} from "@solidix/popper";
import { Portal as PortalPrimitive, type PortalProps } from "@solidix/portal";
import { Presence } from "@solidix/presence";
import {
  Primitive,
  callEventHandler,
  composeEventHandlers,
  type PrimitivePropsWithRef,
} from "@solidix/primitive";
import { useControllableState } from "@solidix/use-controllable-state";

/* -------------------------------------------------------------------------------------------------
 * HoverCard
 * -----------------------------------------------------------------------------------------------*/

let originalBodyUserSelect: string;

const HOVERCARD_NAME = "HoverCard";

type ScopedProps<P> = P & { __scopeHoverCard?: Scope | undefined };
const [createHoverCardContext, createHoverCardScope] = createContextScope(HOVERCARD_NAME, [
  createPopperScope,
]);
const usePopperScope = createPopperScope();

type HoverCardContextValue = {
  open: () => boolean;
  onOpenChange(open: boolean): void;
  onOpen(): void;
  onClose(): void;
  onDismiss(): void;
  hasSelectionRef: { current: boolean };
  isPointerDownOnContentRef: { current: boolean };
};

const [HoverCardProvider, useHoverCardContext] =
  createHoverCardContext<HoverCardContextValue>(HOVERCARD_NAME);

type HoverCardProps = {
  children?: JSX.Element | undefined;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: { bivarianceHack(open: boolean): void }["bivarianceHack"] | undefined;
  openDelay?: number | undefined;
  closeDelay?: number | undefined;
};

const HoverCard: Component<ScopedProps<HoverCardProps>> = (props) => {
  const popperScope = usePopperScope(props.__scopeHoverCard);
  let openTimer = 0;
  let closeTimer = 0;
  const hasSelectionRef = { current: false };
  const isPointerDownOnContentRef = { current: false };

  const [open, setOpen] = useControllableState({
    prop: () => props.open,
    defaultProp: props.defaultOpen ?? false,
    onChange: props.onOpenChange,
    caller: HOVERCARD_NAME,
  });

  const handleOpen = () => {
    clearTimeout(closeTimer);
    openTimer = window.setTimeout(() => setOpen(true), props.openDelay ?? 700);
  };

  const handleClose = () => {
    clearTimeout(openTimer);
    if (!hasSelectionRef.current && !isPointerDownOnContentRef.current) {
      closeTimer = window.setTimeout(() => setOpen(false), props.closeDelay ?? 300);
    }
  };

  const handleDismiss = () => setOpen(false);

  // cleanup any queued state updates on unmount
  onCleanup(() => {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
  });

  return (
    <HoverCardProvider
      scope={props.__scopeHoverCard}
      open={open}
      onOpenChange={setOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      onDismiss={handleDismiss}
      hasSelectionRef={hasSelectionRef}
      isPointerDownOnContentRef={isPointerDownOnContentRef}
    >
      <Popper {...popperScope}>{props.children}</Popper>
    </HoverCardProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * HoverCardTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = "HoverCardTrigger";

type HoverCardTriggerProps = PrimitivePropsWithRef<"a">;

const HoverCardTrigger: Component<ScopedProps<HoverCardTriggerProps>> = (props) => {
  const rest = omit(props, "__scopeHoverCard", "ref");
  const context = useHoverCardContext(TRIGGER_NAME, props.__scopeHoverCard);
  const popperScope = usePopperScope(props.__scopeHoverCard);
  return (
    <PopperAnchor asChild {...popperScope}>
      <Primitive.a
        data-state={context.open() ? "open" : "closed"}
        {...rest}
        ref={props.ref}
        onPointerEnter={composeEventHandlers(
          (event: PointerEvent) => callEventHandler(props.onPointerEnter, event),
          excludeTouch(context.onOpen),
        )}
        onPointerLeave={composeEventHandlers(
          (event: PointerEvent) => callEventHandler(props.onPointerLeave, event),
          excludeTouch(context.onClose),
        )}
        onFocus={composeEventHandlers(
          (event: FocusEvent) => callEventHandler(props.onFocus, event),
          context.onOpen,
        )}
        onBlur={composeEventHandlers(
          (event: FocusEvent) => callEventHandler(props.onBlur, event),
          context.onClose,
        )}
        // prevent focus event on touch devices
        onTouchStart={composeEventHandlers(
          (event: TouchEvent) => callEventHandler(props.onTouchStart, event),
          (event) => event.preventDefault(),
        )}
      />
    </PopperAnchor>
  );
};

/* -------------------------------------------------------------------------------------------------
 * HoverCardPortal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = "HoverCardPortal";

type PortalContextValue = { forceMount?: true | undefined };
const [PortalProvider, usePortalContext] = createHoverCardContext<PortalContextValue>(PORTAL_NAME, {
  forceMount: undefined,
});

type HoverCardPortalProps = {
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

const HoverCardPortal: Component<ScopedProps<HoverCardPortalProps>> = (props) => {
  const context = useHoverCardContext(PORTAL_NAME, props.__scopeHoverCard);
  // NOTE: Radix nests the portal inside `Presence`; Solidix inverts this.
  // Solid portals resolve to a text marker, so a `Presence` around the
  // portal cannot resolve (or track for exit animations) the portalled
  // content. With `Presence` inside, it resolves the content directly.
  // Deviation: empty portal markers stay in the container while closed.
  return (
    <PortalProvider scope={props.__scopeHoverCard} forceMount={props.forceMount}>
      <PortalPrimitive container={props.container}>
        <Presence present={() => props.forceMount || context.open()}>{props.children}</Presence>
      </PortalPrimitive>
    </PortalProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * HoverCardContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "HoverCardContent";

type HoverCardContentProps = HoverCardContentImplProps & {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true | undefined;
};

const HoverCardContent: Component<ScopedProps<HoverCardContentProps>> = (props) => {
  const rest = omit(props, "forceMount", "ref");
  const portalContext = usePortalContext(CONTENT_NAME, props.__scopeHoverCard);
  const context = useHoverCardContext(CONTENT_NAME, props.__scopeHoverCard);
  const forceMount = () => props.forceMount ?? portalContext.forceMount;
  return (
    <Presence present={() => forceMount() || context.open()}>
      <HoverCardContentImpl
        data-state={context.open() ? "open" : "closed"}
        {...rest}
        onPointerEnter={composeEventHandlers(
          (event: PointerEvent) => callEventHandler(props.onPointerEnter, event),
          excludeTouch(context.onOpen),
        )}
        onPointerLeave={composeEventHandlers(
          (event: PointerEvent) => callEventHandler(props.onPointerLeave, event),
          excludeTouch(context.onClose),
        )}
        ref={props.ref}
      />
    </Presence>
  );
};

/* ---------------------------------------------------------------------------------------------- */

type HoverCardContentImplElement = HTMLDivElement;
type HoverCardContentImplProps = Omit<PopperContentProps, "onPlaced"> & {
  /**
   * Event handler called when the escape key is down.
   * Can be prevented.
   */
  onEscapeKeyDown?: DismissableLayerProps["onEscapeKeyDown"] | undefined;
  /**
   * Event handler called when the a `pointerdown` event happens outside of the `HoverCard`.
   * Can be prevented.
   */
  onPointerDownOutside?: DismissableLayerProps["onPointerDownOutside"] | undefined;
  /**
   * Event handler called when the focus moves outside of the `HoverCard`.
   * Can be prevented.
   */
  onFocusOutside?: DismissableLayerProps["onFocusOutside"] | undefined;
  /**
   * Event handler called when an interaction happens outside the `HoverCard`.
   * Specifically, when a `pointerdown` event happens outside or focus moves outside of it.
   * Can be prevented.
   */
  onInteractOutside?: DismissableLayerProps["onInteractOutside"] | undefined;
};

const HoverCardContentImpl: Component<ScopedProps<HoverCardContentImplProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeHoverCard",
    "onEscapeKeyDown",
    "onPointerDownOutside",
    "onFocusOutside",
    "onInteractOutside",
    "ref",
  );
  const context = useHoverCardContext(CONTENT_NAME, props.__scopeHoverCard);
  const popperScope = usePopperScope(props.__scopeHoverCard);
  const contentRef: RefObject<HoverCardContentImplElement | null> = { current: null };

  // When this `HoverCard` is nested inside a modal layer (eg. a `Dialog`) but portalled outside of
  // it, register its content with the ancestor layer so focus isn't reclaimed and scroll isn't
  // locked for any interactive content within it. No-ops when there is no ancestor layer.
  // See: https://github.com/radix-ui/primitives/issues/3423
  const [branchNode, setBranchNode] = createSignal<HTMLElement | null>(null);
  const composedRefs = useComposedRefs(props.ref, contentRef, setBranchNode);
  useFocusScopeBranch(branchNode);

  const [containSelection, setContainSelection] = createSignal(false);

  createEffect(
    () => containSelection(),
    (shouldContain) => {
      if (shouldContain) {
        const body = document.body;

        // Safari requires prefix
        originalBodyUserSelect = body.style.userSelect || body.style.webkitUserSelect;

        body.style.userSelect = "none";
        body.style.webkitUserSelect = "none";
        return () => {
          body.style.userSelect = originalBodyUserSelect;
          body.style.webkitUserSelect = originalBodyUserSelect;
        };
      }
    },
  );

  createEffect(
    () => contentRef.current,
    (content) => {
      if (content) {
        const handlePointerUp = () => {
          setContainSelection(false);
          context.isPointerDownOnContentRef.current = false;

          // Delay a frame to ensure we always access the latest selection
          setTimeout(() => {
            const hasSelection = document.getSelection()?.toString() !== "";
            if (hasSelection) context.hasSelectionRef.current = true;
          });
        };

        document.addEventListener("pointerup", handlePointerUp);
        return () => {
          document.removeEventListener("pointerup", handlePointerUp);
          context.hasSelectionRef.current = false;
          context.isPointerDownOnContentRef.current = false;
        };
      }
    },
  );

  // Radix runs this after every render (no dep array) so dynamically added
  // tabbables are caught; the node-keyed effect below covers mount (and node
  // swaps), which is the only case that changes the tabbable set without a
  // re-render of this component's own accord.
  createEffect(
    () => branchNode(),
    (node) => {
      if (node) {
        const tabbables = getTabbableNodes(node);
        for (const tabbable of tabbables) tabbable.setAttribute("tabindex", "-1");
      }
    },
  );

  return (
    <DismissableLayer
      asChild
      disableOutsidePointerEvents={false}
      onInteractOutside={props.onInteractOutside}
      onEscapeKeyDown={props.onEscapeKeyDown}
      onPointerDownOutside={props.onPointerDownOutside}
      onFocusOutside={composeEventHandlers(
        (event) => callEventHandler(props.onFocusOutside, event),
        (event) => {
          event.preventDefault();
        },
      )}
      onDismiss={context.onDismiss}
    >
      <PopperContent
        {...popperScope}
        {...rest}
        onPointerDown={composeEventHandlers(
          (event: PointerEvent) => callEventHandler(rest.onPointerDown, event),
          (event) => {
            // Contain selection to current layer
            if ((event.currentTarget as HTMLElement).contains(event.target as HTMLElement)) {
              setContainSelection(true);
            }
            context.hasSelectionRef.current = false;
            context.isPointerDownOnContentRef.current = true;
          },
        )}
        ref={composedRefs}
        style={{
          ...rest.style,
          "user-select": containSelection() ? "text" : undefined,
          // Safari requires prefix
          "-webkit-user-select": containSelection() ? "text" : undefined,
          // re-namespace exposed content custom properties
          "--radix-hover-card-content-transform-origin": "var(--radix-popper-transform-origin)",
          "--radix-hover-card-content-available-width": "var(--radix-popper-available-width)",
          "--radix-hover-card-content-available-height": "var(--radix-popper-available-height)",
          "--radix-hover-card-trigger-width": "var(--radix-popper-anchor-width)",
          "--radix-hover-card-trigger-height": "var(--radix-popper-anchor-height)",
        }}
      />
    </DismissableLayer>
  );
};

/* -------------------------------------------------------------------------------------------------
 * HoverCardArrow
 * -----------------------------------------------------------------------------------------------*/

type HoverCardArrowProps = PopperArrowProps;

const HoverCardArrow: Component<ScopedProps<HoverCardArrowProps>> = (props) => {
  const rest = omit(props, "__scopeHoverCard", "ref");
  const popperScope = usePopperScope(props.__scopeHoverCard);
  return <PopperArrow {...popperScope} {...rest} ref={props.ref} />;
};

/* -----------------------------------------------------------------------------------------------*/

function excludeTouch(eventHandler: () => void) {
  return (event: PointerEvent) => (event.pointerType === "touch" ? undefined : eventHandler());
}

/**
 * Returns a list of nodes that can be in the tab sequence.
 * @see: https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker
 */
function getTabbableNodes(container: HTMLElement) {
  const nodes: HTMLElement[] = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node: unknown) => {
      // `.tabIndex` is not the same as the `tabindex` attribute. It works on the
      // runtime's understanding of tabbability, so this automatically accounts
      // for any kind of element that could be tabbed to.
      return (node as HTMLElement).tabIndex >= 0
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP;
    },
  });
  while (walker.nextNode()) nodes.push(walker.currentNode as HTMLElement);
  return nodes;
}

export {
  createHoverCardScope,
  //
  HoverCard,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent,
  HoverCardArrow,
  //
  HoverCard as Root,
  HoverCardTrigger as Trigger,
  HoverCardPortal as Portal,
  HoverCardContent as Content,
  HoverCardArrow as Arrow,
};
export type {
  HoverCardProps,
  HoverCardTriggerProps,
  HoverCardPortalProps,
  HoverCardContentProps,
  HoverCardArrowProps,
};
