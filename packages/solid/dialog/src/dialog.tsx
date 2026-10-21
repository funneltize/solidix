import {
  For,
  children,
  createEffect,
  createSignal,
  omit,
  onSettled,
  type Component,
  type Setter,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import { IS_DEVELOPMENT } from "@solidix/env-check/is-development";
import { afterConnected, useComposedRefs, type RefObject } from "@solidix/compose-refs";
import { createContextScope, type Scope } from "@solidix/context";
import {
  DismissableLayer,
  useDismissableLayerSurface,
  type DismissableLayerProps,
} from "@solidix/dismissable-layer";
import {
  FocusScope,
  FocusScopeBranchProvider,
  useFocusScopeBranchRegistry,
  type FocusScopeBranchRegistry,
  type FocusScopeProps,
} from "@solidix/focus-scope";
import { useFocusGuards } from "@solidix/focus-guards";
import { useId } from "@solidix/id";
import { Portal as PortalPrimitive } from "@solidix/portal";
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

/* -------------------------------------------------------------------------------------------------
 * Dialog
 * -----------------------------------------------------------------------------------------------*/

const DIALOG_NAME = "Dialog";

type ScopedProps<P> = P & { __scopeDialog?: Scope | undefined };
/** Creates a dialog scope for nesting multiple independent dialogs. */
const [createDialogContext, createDialogScope] = createContextScope(DIALOG_NAME);

type DialogContentElement = HTMLDivElement;

type DialogContextValue = {
  triggerRef: RefObject<HTMLButtonElement | null>;
  contentRef: RefObject<DialogContentElement | null>;
  contentId: () => string;
  setContentId: Setter<string | undefined>;
  titleId: () => string;
  titlePresent: () => boolean;
  descriptionPresent: () => boolean;
  setTitleCount: Setter<number>;
  setTitleId: Setter<string | undefined>;
  descriptionIds: () => Set<string>;
  setDescriptionIds: Setter<Set<string>>;
  open: () => boolean;
  onOpenChange(open: boolean): void;
  onOpenToggle(): void;
  modal: boolean;
  // Nodes of nested, portalled layers (eg. a non-modal `Popover`) that should
  // be treated as part of this Dialog for focus trapping and scroll locking.
  // See https://github.com/radix-ui/primitives/issues/3423
  branchNodes: () => HTMLElement[];
  branchRegistry: FocusScopeBranchRegistry;
};

const [DialogProvider, useDialogContext] = createDialogContext<DialogContextValue>(DIALOG_NAME);

/** Props for the root container managing the dialog open state. */
type DialogProps = {
  children?: JSX.Element | undefined;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: { bivarianceHack(open: boolean): void }["bivarianceHack"] | undefined;
  modal?: boolean | undefined;
};

/** The root container that manages the dialog open state. */
const Dialog: Component<ScopedProps<DialogProps>> = (props) => {
  const rest = omit(props, "__scopeDialog", "open", "defaultOpen", "onOpenChange", "modal");
  const triggerRef: RefObject<HTMLButtonElement | null> = { current: null };
  const contentRef: RefObject<DialogContentElement | null> = { current: null };
  const { nodes: branchNodes, registry: branchRegistry } = useFocusScopeBranchRegistry();
  const [open, setOpen] = useControllableState({
    prop: () => props.open,
    defaultProp: props.defaultOpen ?? false,
    onChange: (next) => props.onOpenChange?.(next),
    caller: DIALOG_NAME,
  });

  const defaultTitleId = useId();
  const defaultContentId = useId();
  const [titleIdOverride, setTitleId] = createSignal<string | undefined>(undefined);
  const [contentIdOverride, setContentId] = createSignal<string | undefined>(undefined);
  const [descriptionIds, setDescriptionIds] = createSignal<Set<string>>(new Set());

  const [titleCount, setTitleCount] = createSignal(0);
  if (IS_DEVELOPMENT) {
    createEffect(
      () => titleCount() > 1,
      (hasMultipleTitles) => {
        if (hasMultipleTitles) {
          console.warn(
            "Dialog has multiple titles. This is not supported and will lead to accessibility issues.",
          );
        }
      },
    );
  }

  const onOpenToggle = () => setOpen((prevOpen) => !prevOpen);

  return (
    <DialogProvider
      scope={props.__scopeDialog}
      triggerRef={triggerRef}
      contentRef={contentRef}
      contentId={() => contentIdOverride() || defaultContentId}
      setContentId={setContentId}
      titleId={() => titleIdOverride() || defaultTitleId}
      setTitleId={setTitleId}
      descriptionIds={descriptionIds}
      setDescriptionIds={setDescriptionIds}
      titlePresent={() => titleCount() > 0}
      descriptionPresent={() => descriptionIds().size > 0}
      setTitleCount={setTitleCount}
      open={open}
      onOpenChange={setOpen}
      onOpenToggle={onOpenToggle}
      modal={props.modal ?? true}
      branchNodes={branchNodes}
      branchRegistry={branchRegistry}
    >
      {rest.children}
    </DialogProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DialogTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = "DialogTrigger";

/** Props for the button that opens the dialog when activated. */
type DialogTriggerProps = PrimitivePropsWithRef<"button">;

/** The button that opens the dialog when activated. */
const DialogTrigger: Component<ScopedProps<DialogTriggerProps>> = (props) => {
  const rest = omit(props, "__scopeDialog", "onClick", "ref");
  const context = useDialogContext(TRIGGER_NAME, props.__scopeDialog);
  const composedTriggerRef = useComposedRefs(props.ref, context.triggerRef);
  return (
    <Primitive.button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={ariaBoolean(context.open())}
      aria-controls={context.open() ? context.contentId() : undefined}
      data-state={getState(context.open())}
      {...rest}
      ref={composedTriggerRef}
      onClick={composeEventHandlers(
        (event: MouseEvent) => callEventHandler(props.onClick, event),
        context.onOpenToggle,
      )}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * DialogPortal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = "DialogPortal";

type PortalContextValue = { forceMount?: true | undefined };
const [PortalProvider, usePortalContext] = createDialogContext<PortalContextValue>(PORTAL_NAME, {
  forceMount: undefined,
});

/** Props for the portal rendering the dialog outside the DOM hierarchy. */
type DialogPortalProps = {
  children?: JSX.Element | undefined;
  /**
   * Specify a container element to portal the content into.
   */
  container?: Element | DocumentFragment | null | undefined;
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with animation libraries.
   */
  forceMount?: true | undefined;
};

/** Renders the dialog overlay and content into a portal outside the DOM hierarchy. */
const DialogPortal: Component<ScopedProps<DialogPortalProps>> = (props) => {
  const context = useDialogContext(PORTAL_NAME, props.__scopeDialog);
  const resolved = children(() => props.children);
  return (
    <PortalProvider scope={props.__scopeDialog} forceMount={props.forceMount}>
      {/* NOTE: `Presence` sits _inside_ the portal (rather than around it as
          in Radix). Solid portals resolve to a text marker, so a `Presence`
          around the portal cannot resolve the portalled child. Each child
          keeps its own portal, like Radix's `Children.map`. */}
      <For each={resolved.toArray()}>
        {(child) => (
          <PortalPrimitive container={props.container}>
            <Presence present={props.forceMount || context.open()}>{child}</Presence>
          </PortalPrimitive>
        )}
      </For>
    </PortalProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DialogOverlay
 * -----------------------------------------------------------------------------------------------*/

const OVERLAY_NAME = "DialogOverlay";

/** Props for the dimmed layer displayed behind the dialog content. */
type DialogOverlayProps = Omit<PrimitivePropsWithRef<"div">, "style"> & {
  style?: JSX.CSSProperties | undefined;
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with animation libraries.
   */
  forceMount?: true | undefined;
};

/** The dimmed layer displayed behind the dialog content. */
const DialogOverlay: Component<ScopedProps<DialogOverlayProps>> = (props) => {
  const portalContext = usePortalContext(OVERLAY_NAME, props.__scopeDialog);
  const rest = omit(props, "__scopeDialog", "forceMount", "ref");
  const forceMount = () => props.forceMount ?? portalContext.forceMount;
  const context = useDialogContext(OVERLAY_NAME, props.__scopeDialog);
  return context.modal ? (
    <Presence present={forceMount() || context.open()}>
      <DialogOverlayImpl {...rest} __scopeDialog={props.__scopeDialog} ref={props.ref} />
    </Presence>
  ) : null;
};

type DialogOverlayImplProps = Omit<PrimitivePropsWithRef<"div">, "style"> & {
  style?: JSX.CSSProperties | undefined;
};

/** The dimmed layer displayed behind the dialog content, with presence animation. */
const DialogOverlayImpl: Component<ScopedProps<DialogOverlayImplProps>> = (props) => {
  const rest = omit(props, "__scopeDialog", "ref");
  const context = useDialogContext(OVERLAY_NAME, props.__scopeDialog);

  // Register the overlay as a dismiss surface so a consumer calling
  // `stopPropagation` on it (eg. to avoid triggering parent handlers) does not
  // prevent the dialog from closing. See: https://github.com/radix-ui/primitives/issues/3346
  const registerDismissableSurface = useDismissableLayerSurface();
  const composedRefs = useComposedRefs(props.ref, registerDismissableSurface);

  return (
    // Make sure `Content` is scrollable even when it doesn't live inside
    // `RemoveScroll` (eg. when `Overlay` and `Content` are siblings). Nested
    // layers are registered as branches and added as shards so they remain
    // scrollable too. See https://github.com/radix-ui/primitives/issues/3423
    <RemoveScroll
      asChild
      allowPinchZoom
      shards={[context.contentRef, ...context.branchNodes().map((node) => ({ current: node }))]}
    >
      <Primitive.div
        data-state={getState(context.open())}
        {...rest}
        ref={composedRefs}
        // We re-enable pointer-events prevented by `Dialog.Content` to allow scrolling the overlay.
        style={{ "pointer-events": "auto", ...props.style }}
      />
    </RemoveScroll>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DialogContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "DialogContent";

/** Props for the panel containing the dialog content. */
type DialogContentProps = Omit<
  DialogContentTypeProps,
  "trapFocus" | "disableOutsidePointerEvents"
> & {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with animation libraries.
   */
  forceMount?: true | undefined;
};

/** The panel that contains the dialog content, with focus trapping and dismissal. */
const DialogContent: Component<ScopedProps<DialogContentProps>> = (props) => {
  const portalContext = usePortalContext(CONTENT_NAME, props.__scopeDialog);
  const rest = omit(props, "__scopeDialog", "forceMount", "ref");
  const forceMount = () => props.forceMount ?? portalContext.forceMount;
  const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
  return (
    <Presence present={forceMount() || context.open()}>
      {context.modal ? (
        <DialogContentModal {...rest} __scopeDialog={props.__scopeDialog} ref={props.ref} />
      ) : (
        <DialogContentNonModal {...rest} __scopeDialog={props.__scopeDialog} ref={props.ref} />
      )}
    </Presence>
  );
};

/* -----------------------------------------------------------------------------------------------*/

type DialogContentTypeProps = Omit<
  DialogContentImplProps,
  "trapFocus" | "disableOutsidePointerEvents"
>;

const DialogContentModal: Component<ScopedProps<DialogContentTypeProps>> = (props) => {
  const rest = omit(props, "__scopeDialog", "ref");
  const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
  const contentRef: RefObject<HTMLDivElement | null> = { current: null };
  const composedRefs = useComposedRefs(props.ref, context.contentRef, contentRef);

  // aria-hide everything except the content (better supported equivalent to setting aria-modal)
  onSettled(() => {
    const content = contentRef.current;
    if (!content) {
      return;
    }
    // A ref being set does not imply the node is connected yet (slotted children
    // resolve lazily); hiding requires a connected target with a real document.
    return afterConnected(content, () => {
      return hideOthers(new Set<Element>([content]), content.ownerDocument.body);
    });
  });

  return (
    <DialogContentImpl
      {...rest}
      __scopeDialog={props.__scopeDialog}
      ref={composedRefs}
      // we make sure focus isn't trapped once `DialogContent` has been closed
      // (closed !== unmounted when animating out)
      trapFocus={context.open()}
      disableOutsidePointerEvents={context.open()}
      onCloseAutoFocus={composeEventHandlers(
        (event: Event) => callEventHandler(rest.onCloseAutoFocus, event),
        (event) => {
          event.preventDefault();
          context.triggerRef.current?.focus();
        },
      )}
      onPointerDownOutside={composeEventHandlers(
        (event) => callEventHandler(rest.onPointerDownOutside, event),
        (event) => {
          const originalEvent = event.detail.originalEvent as PointerEvent;
          const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
          const isRightClick = originalEvent.button === 2 || ctrlLeftClick;

          // If the event is a right-click, we shouldn't close because
          // it is effectively as if we right-clicked the `Overlay`.
          if (isRightClick) event.preventDefault();
        },
      )}
      // When focus is trapped, a `focusout` event may still happen.
      // We make sure we don't trigger our `onDismiss` in such case.
      onFocusOutside={composeEventHandlers(
        (event) => callEventHandler(rest.onFocusOutside, event),
        (event) => event.preventDefault(),
      )}
    />
  );
};

/* -----------------------------------------------------------------------------------------------*/

const DialogContentNonModal: Component<ScopedProps<DialogContentTypeProps>> = (props) => {
  const rest = omit(props, "__scopeDialog", "ref");
  const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
  const hasInteractedOutsideRef = { current: false };
  const hasPointerDownOutsideRef = { current: false };

  return (
    <DialogContentImpl
      {...rest}
      __scopeDialog={props.__scopeDialog}
      ref={props.ref}
      trapFocus={false}
      disableOutsidePointerEvents={false}
      onCloseAutoFocus={(event) => {
        callEventHandler(rest.onCloseAutoFocus, event);

        if (!event.defaultPrevented) {
          if (!hasInteractedOutsideRef.current) context.triggerRef.current?.focus();
          // Always prevent auto focus because we either focus manually or want user agent focus
          event.preventDefault();
        }

        hasInteractedOutsideRef.current = false;
        hasPointerDownOutsideRef.current = false;
      }}
      onInteractOutside={(event) => {
        callEventHandler(rest.onInteractOutside, event);

        if (!event.defaultPrevented) {
          hasInteractedOutsideRef.current = true;
          if ((event.detail.originalEvent as Event).type === "pointerdown") {
            hasPointerDownOutsideRef.current = true;
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
        if (
          (event.detail.originalEvent as Event).type === "focusin" &&
          hasPointerDownOutsideRef.current
        ) {
          event.preventDefault();
        }
      }}
    />
  );
};

/* -----------------------------------------------------------------------------------------------*/

type DialogContentImplProps = Omit<DismissableLayerProps, "onDismiss"> & {
  /**
   * When `true`, focus cannot escape the `Content` via keyboard,
   * pointer, or a programmatic focus.
   * @defaultValue false
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
};

const DialogContentImpl: Component<ScopedProps<DialogContentImplProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeDialog",
    "trapFocus",
    "onOpenAutoFocus",
    "onCloseAutoFocus",
    "aria-describedby",
    "id",
    "ref",
  );
  const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);

  // Make sure the whole tree has focus guards as our `Dialog` will be
  // the last element in the DOM (because of the `Portal`)
  useFocusGuards();

  createEffect(
    () => props.id,
    (idProp) => {
      context.setContentId(toValidId(idProp) || undefined);
      return () => context.setContentId(undefined);
    },
  );

  return (
    <FocusScopeBranchProvider registry={context.branchRegistry}>
      <FocusScope
        asChild
        loop
        trapped={props.trapFocus}
        branches={context.branchNodes()}
        onMountAutoFocus={props.onOpenAutoFocus}
        onUnmountAutoFocus={props.onCloseAutoFocus}
      >
        <DismissableLayer
          role="dialog"
          id={context.contentId()}
          aria-labelledby={context.titlePresent() ? context.titleId() : undefined}
          aria-describedby={
            context.descriptionPresent()
              ? concatAriaDescribedby(props["aria-describedby"], ...context.descriptionIds())
              : props["aria-describedby"]
          }
          data-state={getState(context.open())}
          {...rest}
          ref={props.ref}
          deferPointerDownOutside
          onDismiss={() => context.onOpenChange(false)}
        >
          {props.children}
        </DismissableLayer>
      </FocusScope>
    </FocusScopeBranchProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DialogTitle
 * -----------------------------------------------------------------------------------------------*/

/** Props for the accessible heading of the dialog. */
type DialogTitleProps = PrimitivePropsWithRef<"h2">;

/** The accessible heading that labels the dialog. */
const DialogTitle: Component<ScopedProps<DialogTitleProps>> = (props) => {
  const rest = omit(props, "__scopeDialog", "id", "ref");
  const context = useDialogContext("DialogTitle", props.__scopeDialog);

  onSettled(() => {
    context.setTitleCount((count) => count + 1);
    return () => context.setTitleCount((count) => count - 1);
  });
  createEffect(
    () => props.id,
    (idProp) => {
      context.setTitleId(toValidId(idProp) || undefined);
      return () => context.setTitleId(undefined);
    },
  );

  return <Primitive.h2 id={context.titleId()} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * DialogDescription
 * -----------------------------------------------------------------------------------------------*/

/** Props for the accessible description of the dialog. */
type DialogDescriptionProps = PrimitivePropsWithRef<"p">;

/** The accessible text that describes the dialog content. */
const DialogDescription: Component<ScopedProps<DialogDescriptionProps>> = (props) => {
  const rest = omit(props, "__scopeDialog", "id", "ref");
  const context = useDialogContext("DialogDescription", props.__scopeDialog);

  const generatedId = useId();
  const id = () => toValidId(props.id) || generatedId;

  createEffect(
    () => id(),
    (currentId) => {
      context.setDescriptionIds((descriptionIds) => {
        if (descriptionIds.has(currentId)) {
          return descriptionIds;
        }

        const newDescriptionIds = new Set(descriptionIds);
        newDescriptionIds.add(currentId);
        return newDescriptionIds;
      });
      return () => {
        context.setDescriptionIds((descriptionIds) => {
          const newDescriptionIds = new Set(descriptionIds);
          newDescriptionIds.delete(currentId);
          return newDescriptionIds.size === descriptionIds.size
            ? descriptionIds
            : newDescriptionIds;
        });
      };
    },
  );

  return <Primitive.p id={id()} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * DialogClose
 * -----------------------------------------------------------------------------------------------*/

const CLOSE_NAME = "DialogClose";

/** Props for the button closing the dialog. */
type DialogCloseProps = PrimitivePropsWithRef<"button">;

/** The button that closes the dialog when activated. */
const DialogClose: Component<ScopedProps<DialogCloseProps>> = (props) => {
  const rest = omit(props, "__scopeDialog", "onClick", "ref");
  const context = useDialogContext(CLOSE_NAME, props.__scopeDialog);
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

/** Noop stand-in kept to avoid breaking changes.
 *
 * @deprecated
 */
const WarningProvider: Component<{
  children?: JSX.Element | undefined;
  contentName: string;
  titleName: string;
  docsSlug: "dialog";
}> = (props) => {
  return <>{props.children}</>;
};

/* -----------------------------------------------------------------------------------------------*/

// TODO: Move to primitive once that package exposed individual sub-modules
function concatAriaDescribedby(...values: unknown[]): string | undefined {
  const ids = new Set<string>();
  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }
    for (const id of value.trim().split(/\s+/)) {
      if (id) {
        ids.add(id);
      }
    }
  }

  return ids.size > 0 ? Array.from(ids).join(" ") : undefined;
}

function getState(open: boolean) {
  return open ? "open" : "closed";
}

function toValidId(value: number | string | false | undefined) {
  // We type id's internally as strings, but in some version of React's types a
  // number can be passed without type errors. Solid additionally allows
  // `id={false}` to remove the attribute, which normalizes to `undefined`.
  if (typeof value === "number") {
    return String(value);
  }
  if (value === false) {
    return undefined;
  }
  return value;
}

export {
  createDialogScope,
  //
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  WarningProvider,
  //
  Dialog as Root,
  DialogTrigger as Trigger,
  DialogPortal as Portal,
  DialogOverlay as Overlay,
  DialogContent as Content,
  DialogTitle as Title,
  DialogDescription as Description,
  DialogClose as Close,
};
export type {
  DialogProps,
  DialogTriggerProps,
  DialogPortalProps,
  DialogOverlayProps,
  DialogContentProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseProps,
};
