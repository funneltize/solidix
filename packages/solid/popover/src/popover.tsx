import { Show, createSignal, omit, onSettled, type Component, type Setter } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useComposedRefs, type RefObject } from "@solidix/compose-refs";
import { createContextScope, type Scope } from "@solidix/context";
import { DismissableLayer, type DismissableLayerProps } from "@solidix/dismissable-layer";
import { useFocusGuards } from "@solidix/focus-guards";
import {
  FocusScope,
  FocusScopeBranchProvider,
  useFocusScopeBranch,
  useFocusScopeBranchRegistry,
  type FocusScopeBranchRegistry,
  type FocusScopeProps,
} from "@solidix/focus-scope";
import { useId } from "@solidix/id";
import {
  Popper,
  PopperAnchor,
  PopperArrow,
  PopperContent,
  createPopperScope,
  type PopperAnchorProps,
  type PopperArrowProps,
  type PopperContentProps,
} from "@solidix/popper";
import { Portal as PortalPrimitive, type PortalProps } from "@solidix/portal";
import { Presence } from "@solidix/presence";
import {
  Primitive,
  ariaBoolean,
  callEventHandler,
  composeEventHandlers,
  hideOthers,
  type PrimitivePropsWithRef,
} from "@solidix/primitive";
import { RemoveScroll } from "@solidix/remove-scroll";
import { useControllableState } from "@solidix/use-controllable-state";
import { useLayoutEffect } from "@solidix/use-layout-effect";

/* -------------------------------------------------------------------------------------------------
 * Popover
 * -----------------------------------------------------------------------------------------------*/

const POPOVER_NAME = "Popover";

type ScopedProps<P> = P & { __scopePopover?: Scope | undefined };
/** Creates a scope so composed `Popover` parts resolve their own contexts. */
const [createPopoverContext, createPopoverScope] = createContextScope(POPOVER_NAME, [
  createPopperScope,
]);
const usePopperScope = createPopperScope();

type PopoverContextValue = {
  triggerRef: RefObject<HTMLButtonElement | null>;
  contentId: string;
  titleId: string;
  descriptionId: string;
  titlePresent: () => boolean;
  descriptionPresent: () => boolean;
  setTitleCount: Setter<number>;
  setDescriptionCount: Setter<number>;
  open: () => boolean;
  onOpenChange(open: boolean): void;
  onOpenToggle(): void;
  hasCustomAnchor: () => boolean;
  onCustomAnchorAdd(): void;
  onCustomAnchorRemove(): void;
  modal: () => boolean;
};

const [PopoverProvider, usePopoverContext] =
  createPopoverContext<PopoverContextValue>(POPOVER_NAME);

/** Props for the `Popover` root component, including the controlled open state. */
type PopoverProps = {
  children?: JSX.Element | undefined;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: { bivarianceHack(open: boolean): void }["bivarianceHack"] | undefined;
  modal?: boolean | undefined;
};

/** `Popover` contains the open state and context shared by all popover parts. */
const Popover: Component<ScopedProps<PopoverProps>> = (props) => {
  const popperScope = usePopperScope(props.__scopePopover);
  const triggerRef: RefObject<HTMLButtonElement | null> = { current: null };
  const [hasCustomAnchor, setHasCustomAnchor] = createSignal(false);
  const [titleCount, setTitleCount] = createSignal(0);
  const [descriptionCount, setDescriptionCount] = createSignal(0);
  const contentId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const [open, setOpen] = useControllableState({
    prop: () => props.open,
    defaultProp: props.defaultOpen ?? false,
    onChange: props.onOpenChange,
    caller: POPOVER_NAME,
  });

  return (
    <Popper {...popperScope}>
      <PopoverProvider
        scope={props.__scopePopover}
        contentId={contentId}
        titleId={titleId}
        descriptionId={descriptionId}
        titlePresent={() => titleCount() > 0}
        descriptionPresent={() => descriptionCount() > 0}
        setTitleCount={setTitleCount}
        setDescriptionCount={setDescriptionCount}
        triggerRef={triggerRef}
        open={open}
        onOpenChange={setOpen}
        onOpenToggle={() => setOpen((prevOpen) => !prevOpen)}
        hasCustomAnchor={hasCustomAnchor}
        onCustomAnchorAdd={() => setHasCustomAnchor(true)}
        onCustomAnchorRemove={() => setHasCustomAnchor(false)}
        modal={() => props.modal ?? false}
      >
        {props.children}
      </PopoverProvider>
    </Popper>
  );
};

/* -------------------------------------------------------------------------------------------------
 * PopoverAnchor
 * -----------------------------------------------------------------------------------------------*/

const ANCHOR_NAME = "PopoverAnchor";

/** Props for the `PopoverAnchor` element used to position the content. */
type PopoverAnchorProps = PopperAnchorProps;

/** `PopoverAnchor` is the optional element the popover positions itself against. */
const PopoverAnchor: Component<ScopedProps<PopoverAnchorProps>> = (props) => {
  const rest = omit(props, "__scopePopover", "ref");
  const context = usePopoverContext(ANCHOR_NAME, props.__scopePopover);
  const popperScope = usePopperScope(props.__scopePopover);

  onSettled(() => {
    context.onCustomAnchorAdd();
    return () => context.onCustomAnchorRemove();
  });

  return <PopperAnchor {...popperScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * PopoverTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = "PopoverTrigger";

/** Props for the `PopoverTrigger` button that toggles the popover. */
type PopoverTriggerProps = PrimitivePropsWithRef<"button">;

/** `PopoverTrigger` is the button that toggles the popover open and closed. */
const PopoverTrigger: Component<ScopedProps<PopoverTriggerProps>> = (props) => {
  const rest = omit(props, "__scopePopover", "onClick", "ref");
  const context = usePopoverContext(TRIGGER_NAME, props.__scopePopover);
  const popperScope = usePopperScope(props.__scopePopover);
  const composedTriggerRef = useComposedRefs(props.ref, context.triggerRef);

  const trigger = () => (
    <Primitive.button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={ariaBoolean(context.open())}
      aria-controls={context.open() ? context.contentId : undefined}
      data-state={getState(context.open())}
      {...rest}
      ref={composedTriggerRef}
      onClick={composeEventHandlers(
        (event: MouseEvent) => callEventHandler(props.onClick, event),
        context.onOpenToggle,
      )}
    />
  );

  return (
    <Show
      when={context.hasCustomAnchor()}
      fallback={
        <PopperAnchor asChild {...popperScope}>
          {trigger()}
        </PopperAnchor>
      }
    >
      {trigger()}
    </Show>
  );
};

/* -------------------------------------------------------------------------------------------------
 * PopoverPortal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = "PopoverPortal";

type PortalContextValue = { forceMount?: true | undefined };
const [PortalProvider, usePortalContext] = createPopoverContext<PortalContextValue>(PORTAL_NAME, {
  forceMount: undefined,
});

/** Props for the `PopoverPortal` element that renders content elsewhere in the DOM. */
type PopoverPortalProps = {
  children?: JSX.Element | undefined;
  /**
   * Specify a container element to portal the content into.
   */
  container?: PortalProps["container"] | undefined;
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with CSS (see the Animation guide).
   */
  forceMount?: true | undefined;
};

/** `PopoverPortal` portals the popover content outside the DOM hierarchy. */
const PopoverPortal: Component<ScopedProps<PopoverPortalProps>> = (props) => {
  const context = usePopoverContext(PORTAL_NAME, props.__scopePopover);
  // NOTE: Radix nests the portal inside `Presence`; Solidix inverts this.
  // Solid portals resolve to a text marker, so a `Presence` around the
  // portal cannot resolve (or track for exit animations) the portalled
  // content. With `Presence` inside, it resolves the content directly.
  // Deviation: empty portal markers stay in the container while closed.
  return (
    <PortalProvider scope={props.__scopePopover} forceMount={props.forceMount}>
      <PortalPrimitive container={props.container}>
        <Presence present={() => props.forceMount || context.open()}>{props.children}</Presence>
      </PortalPrimitive>
    </PortalProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * PopoverContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "PopoverContent";

/** Props for the `PopoverContent` element, including modal and non-modal options. */
type PopoverContentProps = PopoverContentTypeProps & {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with CSS (see the Animation guide).
   */
  forceMount?: true | undefined;
};

/** `PopoverContent` is the component that appears when the popover is open. */
const PopoverContent: Component<ScopedProps<PopoverContentProps>> = (props) => {
  const rest = omit(props, "forceMount", "ref");
  const portalContext = usePortalContext(CONTENT_NAME, props.__scopePopover);
  const context = usePopoverContext(CONTENT_NAME, props.__scopePopover);
  const forceMount = () => props.forceMount ?? portalContext.forceMount;
  return (
    <Presence present={() => forceMount() || context.open()}>
      <Show when={context.modal()} fallback={<PopoverContentNonModal {...rest} ref={props.ref} />}>
        <PopoverContentModal {...rest} ref={props.ref} />
      </Show>
    </Presence>
  );
};

/* -----------------------------------------------------------------------------------------------*/

type PopoverContentTypeProps = Omit<
  PopoverContentImplProps,
  "trapFocus" | "disableOutsidePointerEvents" | "branchRegistry" | "branchNodes"
>;

const PopoverContentModal: Component<ScopedProps<PopoverContentTypeProps>> = (props) => {
  const rest = omit(
    props,
    "__scopePopover",
    "onCloseAutoFocus",
    "onPointerDownOutside",
    "onFocusOutside",
    "ref",
  );
  const context = usePopoverContext(CONTENT_NAME, props.__scopePopover);
  const contentRef: RefObject<HTMLDivElement | null> = { current: null };
  const composedRefs = useComposedRefs(props.ref, contentRef);
  let isRightClickOutside = false;

  // Allows nested portalled layers to register themselves as branches of this
  // modal `Popover` so focus isn't reclaimed and scroll isn't locked for
  // them. See: https://github.com/radix-ui/primitives/issues/3423
  const { nodes: branchNodes, registry: branchRegistry } = useFocusScopeBranchRegistry();

  // aria-hide everything except the content (better supported equivalent to setting aria-modal)
  onSettled(() => {
    const content = contentRef.current;
    if (content) {
      return hideOthers(new Set([content]), content.ownerDocument.body);
    }
  });

  const shards = () => [contentRef, ...branchNodes().map((node) => ({ current: node }))];

  return (
    <RemoveScroll asChild allowPinchZoom shards={shards()}>
      <PopoverContentImpl
        {...rest}
        ref={composedRefs}
        branchNodes={branchNodes()}
        branchRegistry={branchRegistry}
        // we make sure we're not trapping once it's been closed
        // (closed !== unmounted when animating out)
        trapFocus={context.open()}
        disableOutsidePointerEvents
        onCloseAutoFocus={composeEventHandlers(
          (event: Event) => callEventHandler(props.onCloseAutoFocus, event),
          (event) => {
            event.preventDefault();
            if (!isRightClickOutside) context.triggerRef.current?.focus();
          },
        )}
        onPointerDownOutside={composeEventHandlers(
          (event) => callEventHandler(props.onPointerDownOutside, event),
          (event) => {
            const originalEvent = event.detail.originalEvent as PointerEvent;
            const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
            const isRightClick = originalEvent.button === 2 || ctrlLeftClick;

            isRightClickOutside = isRightClick;
          },
          { checkForDefaultPrevented: false },
        )}
        // When focus is trapped, a `focusout` event may still happen.
        // We make sure we don't trigger our `onDismiss` in such case.
        onFocusOutside={composeEventHandlers(
          (event) => callEventHandler(props.onFocusOutside, event),
          (event) => event.preventDefault(),
          { checkForDefaultPrevented: false },
        )}
      />
    </RemoveScroll>
  );
};

const PopoverContentNonModal: Component<ScopedProps<PopoverContentTypeProps>> = (props) => {
  const rest = omit(props, "__scopePopover", "onCloseAutoFocus", "onInteractOutside", "ref");
  const context = usePopoverContext(CONTENT_NAME, props.__scopePopover);
  let hasInteractedOutside = false;
  let hasPointerDownOutside = false;

  return (
    <PopoverContentImpl
      {...rest}
      ref={props.ref}
      trapFocus={false}
      disableOutsidePointerEvents={false}
      onCloseAutoFocus={(event) => {
        callEventHandler(props.onCloseAutoFocus, event);

        if (!event.defaultPrevented) {
          if (!hasInteractedOutside) context.triggerRef.current?.focus();
          // Always prevent auto focus because we either focus manually or want user agent focus
          event.preventDefault();
        }

        hasInteractedOutside = false;
        hasPointerDownOutside = false;
      }}
      onInteractOutside={(event) => {
        callEventHandler(props.onInteractOutside, event);

        if (!event.defaultPrevented) {
          hasInteractedOutside = true;
          if ((event.detail.originalEvent as Event).type === "pointerdown") {
            hasPointerDownOutside = true;
          }
        }

        // Prevent dismissing when clicking the trigger.
        // As the trigger is already setup to close, without doing so would
        // cause it to close and immediately open.
        const target = event.target as HTMLElement;
        const targetIsTrigger = context.triggerRef.current?.contains(target);
        if (targetIsTrigger) event.preventDefault();

        // On Safari if the trigger is inside a container with tabIndex={0}, when clicked
        // we will get the pointer down outside event on the trigger, but then a subsequent
        // focus outside event on the container, we ignore any focus outside event when we've
        // already had a pointer down outside event.
        if ((event.detail.originalEvent as Event).type === "focusin" && hasPointerDownOutside) {
          event.preventDefault();
        }
      }}
    />
  );
};

/* -----------------------------------------------------------------------------------------------*/

type PopoverContentImplProps = Omit<PopperContentProps, "onPlaced"> &
  Omit<DismissableLayerProps, "onDismiss" | "style"> & {
    // Object-only (not `string`) so it can merge with the re-namespaced
    // content custom properties, matching `@solidix/popper` and
    // `@solidix/visually-hidden`.
    style?: JSX.CSSProperties | undefined;
    /**
     * Whether focus should be trapped within the `Popover`
     * (default: false)
     */
    trapFocus?: FocusScopeProps["trapped"] | undefined;

    /**
     * Event handler called when auto-focusing on open.
     * Can be prevented.
     */
    onOpenAutoFocus?: FocusScopeProps["onMountAutoFocus"] | undefined;

    /**
     * Event handler called when auto-focusing on close.
     * Can be prevented.
     */
    onCloseAutoFocus?: FocusScopeProps["onUnmountAutoFocus"] | undefined;

    /**
     * Branch nodes registered by nested, portalled layers. Passed to the trapped
     * `FocusScope` so focus isn't reclaimed from them. Only provided by the modal
     * variant.
     * @internal
     */
    branchNodes?: HTMLElement[] | undefined;

    /**
     * Registry that nested, portalled layers use to register themselves as branches of this modal
     * `Popover`. Only provided by the modal variant.
     * @internal
     */
    branchRegistry?: FocusScopeBranchRegistry | undefined;
  };

const PopoverContentImpl: Component<ScopedProps<PopoverContentImplProps>> = (props) => {
  const rest = omit(
    props,
    "__scopePopover",
    "trapFocus",
    "onOpenAutoFocus",
    "onCloseAutoFocus",
    "disableOutsidePointerEvents",
    "onEscapeKeyDown",
    "onPointerDownOutside",
    "onFocusOutside",
    "onInteractOutside",
    "aria-describedby",
    "branchNodes",
    "branchRegistry",
    "style",
    "ref",
  );
  const context = usePopoverContext(CONTENT_NAME, props.__scopePopover);
  const popperScope = usePopperScope(props.__scopePopover);

  // When this `Popover` is nested inside a modal layer (eg. a `Dialog`) but
  // portalled outside of it, register its content with the ancestor layer so
  // focus isn't reclaimed and scroll isn't locked for it. No-ops when there
  // is no ancestor layer. See:
  // https://github.com/radix-ui/primitives/issues/3423
  const [contentNode, setContentNode] = createSignal<HTMLDivElement | null>(null);
  const composedRefs = useComposedRefs(props.ref, setContentNode);
  useFocusScopeBranch(contentNode);

  // Make sure the whole tree has focus guards as our `Popover` may be
  // the last element in the DOM (because of the `Portal`)
  useFocusGuards();

  return (
    <FocusScopeBranchProvider registry={props.branchRegistry}>
      <FocusScope
        asChild
        loop
        trapped={props.trapFocus}
        branches={props.branchNodes}
        onMountAutoFocus={props.onOpenAutoFocus}
        onUnmountAutoFocus={props.onCloseAutoFocus}
      >
        <DismissableLayer
          asChild
          disableOutsidePointerEvents={props.disableOutsidePointerEvents}
          onInteractOutside={props.onInteractOutside}
          onEscapeKeyDown={props.onEscapeKeyDown}
          onPointerDownOutside={props.onPointerDownOutside}
          onFocusOutside={props.onFocusOutside}
          onDismiss={() => context.onOpenChange(false)}
          deferPointerDownOutside
        >
          <PopperContent
            data-state={getState(context.open())}
            role="dialog"
            id={context.contentId}
            aria-labelledby={context.titlePresent() ? context.titleId : undefined}
            aria-describedby={
              context.descriptionPresent()
                ? concatAriaDescribedby(props["aria-describedby"], context.descriptionId)
                : props["aria-describedby"]
            }
            {...popperScope}
            {...rest}
            ref={composedRefs}
            style={{
              ...props.style,
              // re-namespace exposed content custom properties
              "--radix-popover-content-transform-origin": "var(--radix-popper-transform-origin)",
              "--radix-popover-content-available-width": "var(--radix-popper-available-width)",
              "--radix-popover-content-available-height": "var(--radix-popper-available-height)",
              "--radix-popover-trigger-width": "var(--radix-popper-anchor-width)",
              "--radix-popover-trigger-height": "var(--radix-popper-anchor-height)",
            }}
          />
        </DismissableLayer>
      </FocusScope>
    </FocusScopeBranchProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * PopoverTitle
 * -----------------------------------------------------------------------------------------------*/

/** Props for the `PopoverTitle` heading that labels the popover. */
type PopoverTitleProps = PrimitivePropsWithRef<"h2">;

/** `PopoverTitle` is the accessible title announced for the popover. */
const PopoverTitle: Component<ScopedProps<PopoverTitleProps>> = (props) => {
  const rest = omit(props, "__scopePopover", "ref");
  const context = usePopoverContext("PopoverTitle", props.__scopePopover);
  const setTitleCount = context.setTitleCount;
  useLayoutEffect(() => {
    setTitleCount((count) => count + 1);
    return () => setTitleCount((count) => count - 1);
  });

  return <Primitive.h2 id={context.titleId} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * PopoverDescription
 * -----------------------------------------------------------------------------------------------*/

/** Props for the `PopoverDescription` paragraph that describes the popover. */
type PopoverDescriptionProps = PrimitivePropsWithRef<"p">;

/** `PopoverDescription` is the accessible description announced for the popover. */
const PopoverDescription: Component<ScopedProps<PopoverDescriptionProps>> = (props) => {
  const rest = omit(props, "__scopePopover", "ref");
  const context = usePopoverContext("PopoverDescription", props.__scopePopover);
  const setDescriptionCount = context.setDescriptionCount;
  useLayoutEffect(() => {
    setDescriptionCount((count) => count + 1);
    return () => setDescriptionCount((count) => count - 1);
  });

  return <Primitive.p id={context.descriptionId} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * PopoverClose
 * -----------------------------------------------------------------------------------------------*/

const CLOSE_NAME = "PopoverClose";

/** Props for the `PopoverClose` button that closes the popover. */
type PopoverCloseProps = PrimitivePropsWithRef<"button">;

/** `PopoverClose` is the button that closes the popover. */
const PopoverClose: Component<ScopedProps<PopoverCloseProps>> = (props) => {
  const rest = omit(props, "__scopePopover", "onClick", "ref");
  const context = usePopoverContext(CLOSE_NAME, props.__scopePopover);
  return (
    <Primitive.button
      type="button"
      {...rest}
      ref={props.ref}
      onClick={composeEventHandlers(
        (event: MouseEvent) => callEventHandler(props.onClick, event),
        () => context.onOpenChange(false),
      )}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * PopoverArrow
 * -----------------------------------------------------------------------------------------------*/

/** Props for the `PopoverArrow` element that points at the anchor. */
type PopoverArrowProps = PopperArrowProps;

/** `PopoverArrow` is the arrow pointing at the popover anchor. */
const PopoverArrow: Component<ScopedProps<PopoverArrowProps>> = (props) => {
  const rest = omit(props, "__scopePopover", "ref");
  const popperScope = usePopperScope(props.__scopePopover);
  return <PopperArrow {...popperScope} {...rest} ref={props.ref} />;
};

/* -----------------------------------------------------------------------------------------------*/

function getState(open: boolean) {
  return open ? "open" : "closed";
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

export {
  createPopoverScope,
  //
  Popover,
  PopoverAnchor,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
  PopoverArrow,
  //
  Popover as Root,
  PopoverAnchor as Anchor,
  PopoverTrigger as Trigger,
  PopoverPortal as Portal,
  PopoverContent as Content,
  PopoverTitle as Title,
  PopoverDescription as Description,
  PopoverClose as Close,
  PopoverArrow as Arrow,
};
export type {
  PopoverProps,
  PopoverAnchorProps,
  PopoverTriggerProps,
  PopoverPortalProps,
  PopoverContentProps,
  PopoverTitleProps,
  PopoverDescriptionProps,
  PopoverCloseProps,
  PopoverArrowProps,
};
