import {
  Show,
  createEffect,
  createMemo,
  createSignal,
  omit,
  onCleanup,
  type Component,
} from "solid-js";
import { Portal as SolidPortal } from "@solidjs/web";
import { createCollection } from "@solidix/collection";
import { useComposedRefs, type RefObject } from "@solidix/compose-refs";
import { createContextScope, type Scope } from "@solidix/context";
import {
  Branch as DismissableLayerBranch,
  Root as DismissableLayerRoot,
  type DismissableLayerProps,
} from "@solidix/dismissable-layer";
import { Portal } from "@solidix/portal";
import { Presence } from "@solidix/presence";
import {
  Primitive,
  callEventHandler,
  composeEventHandlers,
  dispatchDiscreteCustomEvent,
  type PrimitivePropsWithRef,
} from "@solidix/primitive";
import { useCallbackRef } from "@solidix/use-callback-ref";
import { useControllableState } from "@solidix/use-controllable-state";
import { useLayoutEffect } from "@solidix/use-layout-effect";
import { VisuallyHidden, type VisuallyHiddenProps } from "@solidix/visually-hidden";
import type { JSX } from "@solidjs/web";

/* -------------------------------------------------------------------------------------------------
 * ToastProvider
 * -----------------------------------------------------------------------------------------------*/

const PROVIDER_NAME = "ToastProvider";

const [Collection, useCollection, createCollectionScope] = createCollection<ToastElement>("Toast");

const SwipeDirection = {
  Up: "up",
  Down: "down",
  Left: "left",
  Right: "right",
} as const;

const ToastType = {
  Foreground: "foreground",
  Background: "background",
} as const;

type SwipeDirection = (typeof SwipeDirection)[keyof typeof SwipeDirection];
type ToastType = (typeof ToastType)[keyof typeof ToastType];

type ToastProviderContextValue = {
  label: string;
  duration: number;
  swipeDirection: SwipeDirection;
  swipeThreshold: number;
  toastCount: () => number;
  viewport: () => ToastViewportElement | null;
  onViewportChange(viewport: ToastViewportElement | null): void;
  onToastAdd(): void;
  onToastRemove(): void;
  isClosePausedRef: RefObject<boolean>;
  announcerContainer?: Element | DocumentFragment | undefined;
};

type ScopedProps<P> = P & { __scopeToast?: Scope | undefined };
/** Creates the toast context and the scope subtree that isolates nested toasts. */
const [createToastContext, createToastScope] = createContextScope("Toast", [createCollectionScope]);
const [ToastProviderProvider, useToastProviderContext] =
  createToastContext<ToastProviderContextValue>(PROVIDER_NAME);

/** Props configuring toast duration and swipe direction for the provider. */
type ToastProviderProps = {
  children?: JSX.Element | undefined;
  /**
   * An author-localized label for each toast. Used to help screen reader users
   * associate the interruption with a toast.
   * @defaultValue 'Notification'
   */
  label?: string | undefined;
  /**
   * Time in milliseconds that each toast should remain visible for.
   * @defaultValue 5000
   */
  duration?: number | undefined;
  /**
   * Direction of pointer swipe that should close the toast.
   * @defaultValue 'right'
   */
  swipeDirection?: SwipeDirection | undefined;
  /**
   * Distance in pixels that the swipe must pass before a close is triggered.
   * @defaultValue 50
   */
  swipeThreshold?: number | undefined;
  /**
   * An optional container where the toast announcements should be appended.
   * This is useful when working with focus traps or modal dialogs that make
   * other elements inert.
   * @defaultValue document.body
   */
  announcerContainer?: Element | DocumentFragment | undefined;
};

/** Provides toast state, duration, and viewport registration to viewports and toasts. */
const ToastProvider: Component<ScopedProps<ToastProviderProps>> = (props) => {
  const label = () => props.label ?? "Notification";
  const duration = () => props.duration ?? 5000;
  const swipeDirection = () => props.swipeDirection ?? SwipeDirection.Right;
  const swipeThreshold = () => props.swipeThreshold ?? 50;
  const [viewport, setViewport] = createSignal<ToastViewportElement | null>(null);
  const [toastCount, setToastCount] = createSignal(0);
  const isClosePausedRef: RefObject<boolean> = { current: false };
  const onViewportChange = (node: ToastViewportElement | null) => {
    // Radix publishes this as a transition so hydration can finish first
    // (see https://github.com/radix-ui/primitives/issues/3301); Solid has no
    // `startTransition` in this RC, so updates apply directly.
    setViewport(() => node);
  };
  const onToastAdd = () => setToastCount((prevCount) => prevCount + 1);
  const onToastRemove = () => setToastCount((prevCount) => prevCount - 1);

  if (!label().trim()) {
    console.error(
      `Invalid prop \`label\` supplied to \`${PROVIDER_NAME}\`. Expected non-empty \`string\`.`,
    );
  }

  return (
    <Collection.Provider scope={props.__scopeToast}>
      <ToastProviderProvider
        scope={props.__scopeToast}
        label={label()}
        duration={duration()}
        swipeDirection={swipeDirection()}
        swipeThreshold={swipeThreshold()}
        toastCount={toastCount}
        viewport={viewport}
        onViewportChange={onViewportChange}
        onToastAdd={onToastAdd}
        onToastRemove={onToastRemove}
        isClosePausedRef={isClosePausedRef}
        announcerContainer={props.announcerContainer}
      >
        {props.children}
      </ToastProviderProvider>
    </Collection.Provider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ToastViewport
 * -----------------------------------------------------------------------------------------------*/

const VIEWPORT_NAME = "ToastViewport";
const VIEWPORT_DEFAULT_HOTKEY = ["F8"];
const VIEWPORT_PAUSE = "toast.viewportPause";
const VIEWPORT_RESUME = "toast.viewportResume";

type ToastViewportElement = HTMLOListElement;
/** Props for the fixed region that renders the toast list. */
type ToastViewportProps = PrimitivePropsWithRef<"ol"> & {
  /**
   * The keys to use as the keyboard shortcut that will move focus to the toast viewport.
   * @defaultValue ['F8']
   */
  hotkey?: string[] | undefined;
  /**
   * An author-localized label for the toast viewport to provide context for screen reader users
   * when navigating page landmarks. The available `{hotkey}` placeholder will be replaced for you.
   * @defaultValue 'Notifications ({hotkey})'
   */
  label?: string | undefined;
};

/** Region that renders the toast list, manages focus order, and handles the focus hotkey. */
const ToastViewport: Component<ScopedProps<ToastViewportProps>> = (props) => {
  const rest = omit(props, "__scopeToast", "hotkey", "label", "ref");
  const context = useToastProviderContext(VIEWPORT_NAME, props.__scopeToast);
  const getItems = useCollection(props.__scopeToast);
  const wrapperRef: RefObject<HTMLDivElement | null> = { current: null };
  const headFocusProxyRef: RefObject<FocusProxyElement | null> = { current: null };
  const tailFocusProxyRef: RefObject<FocusProxyElement | null> = { current: null };
  const viewportRef: RefObject<ToastViewportElement | null> = { current: null };
  const composedRefs = useComposedRefs(props.ref, viewportRef, context.onViewportChange);
  const hotkey = () => props.hotkey ?? VIEWPORT_DEFAULT_HOTKEY;
  const label = () => props.label ?? "Notifications ({hotkey})";
  const hotkeyLabel = () => hotkey().join("+").replace(/Key/g, "").replace(/Digit/g, "");
  const hasToasts = () => context.toastCount() > 0;

  createEffect(
    () => hotkey(),
    (currentHotkey) => {
      const handleKeyDown = (event: KeyboardEvent) => {
        // we use `event.code` as it is consistent regardless of meta keys that were pressed.
        // for example, `event.key` for `Control+Alt+t` is `†` and `t !== †`
        const isHotkeyPressed =
          currentHotkey.length !== 0 &&
          currentHotkey.every(
            (key) => (event as unknown as Record<string, unknown>)[key] || event.code === key,
          );
        if (isHotkeyPressed) viewportRef.current?.focus();
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    },
  );

  createEffect(
    () => hasToasts(),
    (hasToastsNow) => {
      const wrapper = wrapperRef.current;
      const viewport = viewportRef.current;
      if (hasToastsNow && wrapper && viewport) {
        const handlePause = () => {
          if (!context.isClosePausedRef.current) {
            const pauseEvent = new CustomEvent(VIEWPORT_PAUSE);
            viewport.dispatchEvent(pauseEvent);
            context.isClosePausedRef.current = true;
          }
        };

        const handleResume = () => {
          if (context.isClosePausedRef.current) {
            const resumeEvent = new CustomEvent(VIEWPORT_RESUME);
            viewport.dispatchEvent(resumeEvent);
            context.isClosePausedRef.current = false;
          }
        };

        const handleFocusOutResume = (event: FocusEvent) => {
          const isFocusMovingOutside = !wrapper.contains(event.relatedTarget as HTMLElement);
          if (isFocusMovingOutside) handleResume();
        };

        const handlePointerLeaveResume = () => {
          const isFocusInside = wrapper.contains(document.activeElement);
          if (!isFocusInside) handleResume();
        };

        // Toasts are not in the viewport React tree so we need to bind DOM events
        wrapper.addEventListener("focusin", handlePause);
        wrapper.addEventListener("focusout", handleFocusOutResume);
        wrapper.addEventListener("pointermove", handlePause);
        wrapper.addEventListener("pointerleave", handlePointerLeaveResume);
        window.addEventListener("blur", handlePause);
        window.addEventListener("focus", handleResume);
        return () => {
          wrapper.removeEventListener("focusin", handlePause);
          wrapper.removeEventListener("focusout", handleFocusOutResume);
          wrapper.removeEventListener("pointermove", handlePause);
          wrapper.removeEventListener("pointerleave", handlePointerLeaveResume);
          window.removeEventListener("blur", handlePause);
          window.removeEventListener("focus", handleResume);
        };
      }
    },
  );

  const getSortedTabbableCandidates = ({
    tabbingDirection,
  }: {
    tabbingDirection: "forwards" | "backwards";
  }) => {
    const toastItems = getItems();
    const tabbableCandidates = toastItems.map((toastItem) => {
      const toastNode = toastItem.ref.current!;
      const toastTabbableCandidates = [toastNode, ...getTabbableCandidates(toastNode)];
      return tabbingDirection === "forwards"
        ? toastTabbableCandidates
        : toastTabbableCandidates.reverse();
    });
    return (
      tabbingDirection === "forwards" ? tabbableCandidates.reverse() : tabbableCandidates
    ).flat();
  };

  createEffect(
    () => viewportRef.current,
    (viewport) => {
      // We programmatically manage tabbing as we are unable to influence
      // the source order with portals, this allows us to reverse the
      // tab order so that it runs from most recent toast to least
      if (!viewport) return;
      const handleKeyDown = (event: KeyboardEvent) => {
        const isMetaKey = event.altKey || event.ctrlKey || event.metaKey;
        const isTabKey = event.key === "Tab" && !isMetaKey;

        if (isTabKey) {
          const focusedElement = document.activeElement;
          const isTabbingBackwards = event.shiftKey;
          const targetIsViewport = event.target === viewport;

          // If we're back tabbing after jumping to the viewport then we simply
          // proxy focus out to the preceding document
          if (targetIsViewport && isTabbingBackwards) {
            headFocusProxyRef.current?.focus();
            return;
          }

          const tabbingDirection = isTabbingBackwards ? "backwards" : "forwards";
          const sortedCandidates = getSortedTabbableCandidates({ tabbingDirection });
          const index = sortedCandidates.findIndex((candidate) => candidate === focusedElement);
          if (focusFirst(sortedCandidates.slice(index + 1))) {
            event.preventDefault();
          } else {
            // If we can't focus that means we're at the edges so we
            // proxy to the corresponding exit point and let the browser handle
            // tab/shift+tab keypress and implicitly pass focus to the next valid element in the document
            if (isTabbingBackwards) {
              headFocusProxyRef.current?.focus();
            } else {
              tailFocusProxyRef.current?.focus();
            }
          }
        }
      };

      // Toasts are not in the viewport React tree so we need to bind DOM events
      viewport.addEventListener("keydown", handleKeyDown);
      return () => viewport.removeEventListener("keydown", handleKeyDown);
    },
  );

  return (
    <DismissableLayerBranch
      ref={wrapperRef}
      role="region"
      aria-label={label().replace("{hotkey}", hotkeyLabel())}
      // Ensure virtual cursor from landmarks menus triggers focus/blur for pause/resume
      tabindex={-1}
      // incase list has size when empty (e.g. padding), we remove pointer events so
      // it doesn't prevent interactions with page elements that it overlays
      style={{ "pointer-events": hasToasts() ? undefined : "none" }}
    >
      <Show when={hasToasts()}>
        <FocusProxy
          ref={headFocusProxyRef}
          onFocusFromOutsideViewport={() => {
            const tabbableCandidates = getSortedTabbableCandidates({
              tabbingDirection: "forwards",
            });
            focusFirst(tabbableCandidates);
          }}
        />
      </Show>
      {/**
       * tabindex on the list so that it can be focused when items are removed. we focus
       * the list instead of the viewport so it announces number of items remaining.
       */}
      <Collection.Slot scope={props.__scopeToast}>
        <Primitive.ol tabindex={-1} {...rest} ref={composedRefs} />
      </Collection.Slot>
      <Show when={hasToasts()}>
        <FocusProxy
          ref={tailFocusProxyRef}
          onFocusFromOutsideViewport={() => {
            const tabbableCandidates = getSortedTabbableCandidates({
              tabbingDirection: "backwards",
            });
            focusFirst(tabbableCandidates);
          }}
        />
      </Show>
    </DismissableLayerBranch>
  );
};

/* -----------------------------------------------------------------------------------------------*/

const FOCUS_PROXY_NAME = "ToastFocusProxy";

type FocusProxyElement = HTMLSpanElement;
type FocusProxyProps = VisuallyHiddenProps & {
  onFocusFromOutsideViewport(): void;
};

const FocusProxy: Component<ScopedProps<FocusProxyProps>> = (props) => {
  const rest = omit(props, "__scopeToast", "onFocusFromOutsideViewport", "ref");
  const context = useToastProviderContext(FOCUS_PROXY_NAME, props.__scopeToast);

  return (
    <VisuallyHidden
      tabindex={0}
      {...rest}
      ref={props.ref}
      // Avoid page scrolling when focus is on the focus proxy
      style={{ position: "fixed" }}
      onFocus={(event) => {
        callEventHandler(rest.onFocus, event);
        const prevFocusedElement = event.relatedTarget as HTMLElement | null;
        const isFocusFromOutsideViewport = !context.viewport()?.contains(prevFocusedElement);
        if (isFocusFromOutsideViewport) props.onFocusFromOutsideViewport();
      }}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * Toast
 * -----------------------------------------------------------------------------------------------*/

const TOAST_NAME = "Toast";
const TOAST_SWIPE_START = "toast.swipeStart";
const TOAST_SWIPE_MOVE = "toast.swipeMove";
const TOAST_SWIPE_CANCEL = "toast.swipeCancel";
const TOAST_SWIPE_END = "toast.swipeEnd";

type ToastElement = ToastImplElement;
/** Props configuring one toast: open state, timing, and swipe behavior. */
type ToastProps = Omit<ToastImplProps, keyof ToastImplPrivateProps> & {
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: { bivarianceHack(open: boolean): void }["bivarianceHack"] | undefined;
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with animation libraries.
   */
  forceMount?: true | undefined;
};

/** Controlled notification with swipe gestures, auto-close timing, and pause on interaction. */
const Toast: Component<ScopedProps<ToastProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeToast",
    "forceMount",
    "open",
    "defaultOpen",
    "onOpenChange",
    "ref",
  );
  const [open, setOpen] = useControllableState({
    prop: () => props.open,
    defaultProp: props.defaultOpen ?? true,
    onChange: (next) => props.onOpenChange?.(next),
    caller: TOAST_NAME,
  });
  const onPause = useCallbackRef(() => props.onPause?.());
  const onResume = useCallbackRef(() => props.onResume?.());
  return (
    <Presence present={props.forceMount || open()}>
      <ToastImpl
        __scopeToast={props.__scopeToast}
        open={open()}
        {...rest}
        ref={props.ref}
        onClose={() => setOpen(false)}
        onPause={onPause}
        onResume={onResume}
        onSwipeStart={composeEventHandlers(props.onSwipeStart, (event) => {
          event.currentTarget.setAttribute("data-swipe", "start");
        })}
        onSwipeMove={composeEventHandlers(props.onSwipeMove, (event) => {
          const { x, y } = event.detail.delta;
          event.currentTarget.setAttribute("data-swipe", "move");
          event.currentTarget.style.setProperty("--radix-toast-swipe-move-x", `${x}px`);
          event.currentTarget.style.setProperty("--radix-toast-swipe-move-y", `${y}px`);
        })}
        onSwipeCancel={composeEventHandlers(props.onSwipeCancel, (event) => {
          event.currentTarget.setAttribute("data-swipe", "cancel");
          event.currentTarget.style.removeProperty("--radix-toast-swipe-move-x");
          event.currentTarget.style.removeProperty("--radix-toast-swipe-move-y");
          event.currentTarget.style.removeProperty("--radix-toast-swipe-end-x");
          event.currentTarget.style.removeProperty("--radix-toast-swipe-end-y");
        })}
        onSwipeEnd={composeEventHandlers(props.onSwipeEnd, (event) => {
          const { x, y } = event.detail.delta;
          event.currentTarget.setAttribute("data-swipe", "end");
          event.currentTarget.style.removeProperty("--radix-toast-swipe-move-x");
          event.currentTarget.style.removeProperty("--radix-toast-swipe-move-y");
          event.currentTarget.style.setProperty("--radix-toast-swipe-end-x", `${x}px`);
          event.currentTarget.style.setProperty("--radix-toast-swipe-end-y", `${y}px`);
          setOpen(false);
        })}
      />
    </Presence>
  );
};

/* -----------------------------------------------------------------------------------------------*/

type SwipeEvent = { currentTarget: EventTarget & ToastElement } & Omit<
  CustomEvent<{ originalEvent: PointerEvent; delta: { x: number; y: number } }>,
  "currentTarget"
>;

const [ToastInteractiveProvider, useToastInteractiveContext] = createToastContext(TOAST_NAME, {
  onClose() {},
});

type ToastImplElement = HTMLLIElement;
type ToastImplPrivateProps = { open: boolean; onClose(): void };
type ToastImplProps = ToastImplPrivateProps &
  Omit<PrimitivePropsWithRef<"li">, "style"> & {
    style?: JSX.CSSProperties | undefined;
    type?: ToastType | undefined;
    /**
     * Time in milliseconds that toast should remain visible for. Overrides value
     * given to `ToastProvider`.
     */
    duration?: number | undefined;
    onEscapeKeyDown?: DismissableLayerProps["onEscapeKeyDown"] | undefined;
    onPause?: (() => void) | undefined;
    onResume?: (() => void) | undefined;
    onSwipeStart?: { bivarianceHack(event: SwipeEvent): void }["bivarianceHack"] | undefined;
    onSwipeMove?: { bivarianceHack(event: SwipeEvent): void }["bivarianceHack"] | undefined;
    onSwipeCancel?: { bivarianceHack(event: SwipeEvent): void }["bivarianceHack"] | undefined;
    onSwipeEnd?: { bivarianceHack(event: SwipeEvent): void }["bivarianceHack"] | undefined;
  };

const ToastImpl: Component<ScopedProps<ToastImplProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeToast",
    "type",
    "duration",
    "open",
    "onClose",
    "onEscapeKeyDown",
    "onPause",
    "onResume",
    "onSwipeStart",
    "onSwipeMove",
    "onSwipeCancel",
    "onSwipeEnd",
    "ref",
  );
  const context = useToastProviderContext(TOAST_NAME, props.__scopeToast);
  const getItems = useCollection(props.__scopeToast);
  const [node, setNode] = createSignal<ToastImplElement | null>(null);
  const composedRefs = useComposedRefs(props.ref, setNode);
  const pointerStartRef: RefObject<{ x: number; y: number } | null> = { current: null };
  const swipeDeltaRef: RefObject<{ x: number; y: number } | null> = { current: null };
  const duration = () => props.duration || context.duration;
  const closeTimerStartTimeRef: RefObject<number> = { current: 0 };
  const closeTimerRemainingTimeRef: RefObject<number> = { current: duration() };
  const closeTimerRef: RefObject<number> = { current: 0 };
  const handleClose = useCallbackRef(() => {
    // focus viewport if focus is within toast to read the remaining toast
    // count to SR users and ensure focus isn't lost
    const currentNode = node();
    const isFocusInToast = currentNode?.contains(document.activeElement);
    if (isFocusInToast) context.viewport()?.focus();
    props.onClose();
  });

  const startTimer = (timerDuration: number) => {
    if (!timerDuration || timerDuration === Infinity) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerStartTimeRef.current = new Date().getTime();
    closeTimerRef.current = window.setTimeout(handleClose, timerDuration);
  };

  createEffect(
    () => ({ viewport: context.viewport(), duration: duration() }),
    ({ viewport }) => {
      if (viewport) {
        const handleResume = () => {
          startTimer(closeTimerRemainingTimeRef.current);
          props.onResume?.();
        };
        const handlePause = () => {
          const elapsedTime = new Date().getTime() - closeTimerStartTimeRef.current;
          closeTimerRemainingTimeRef.current = closeTimerRemainingTimeRef.current - elapsedTime;
          window.clearTimeout(closeTimerRef.current);
          props.onPause?.();
        };
        viewport.addEventListener(VIEWPORT_PAUSE, handlePause);
        viewport.addEventListener(VIEWPORT_RESUME, handleResume);
        return () => {
          viewport.removeEventListener(VIEWPORT_PAUSE, handlePause);
          viewport.removeEventListener(VIEWPORT_RESUME, handleResume);
        };
      }
    },
  );

  // start timer when toast opens or duration changes.
  // we include `open` in deps because closed !== unmounted when animating
  // so it could reopen before being completely unmounted
  createEffect(
    () => ({ open: props.open, duration: duration() }),
    ({ open, duration: currentDuration }) => {
      // Reset the remaining time to the duration so a stale value isn't reused
      // when the timer resumes. Without this, a toast that was paused while its
      // duration was `Infinity` (eg. a loading toast) would keep that
      // remaining time after being updated to a finite duration, so it would
      // never close on resume.
      // See https://github.com/radix-ui/primitives/issues/2233
      closeTimerRemainingTimeRef.current = currentDuration;
      if (open && !context.isClosePausedRef.current) {
        startTimer(currentDuration);
      }
    },
  );

  // Clear close timer on unmount to prevent memory leaks and errors in test environments
  onCleanup(() => {
    window.clearTimeout(closeTimerRef.current);
  });

  useLayoutEffect(() => {
    context.onToastAdd();
    return () => context.onToastRemove();
  });

  const announceTextContent = createMemo(() => {
    const currentNode = node();
    return currentNode ? getAnnounceTextContent(currentNode) : null;
  });

  return (
    <Show when={context.viewport()}>
      {(viewport) => (
        <>
          <Show when={announceTextContent()}>
            {(textContent) => (
              <ToastAnnounce
                __scopeToast={props.__scopeToast}
                // Toasts are always role=status to avoid stuttering issues with role=alert in SRs.
                role="status"
                aria-live={props.type === ToastType.Background ? "polite" : "assertive"}
              >
                {textContent()}
              </ToastAnnounce>
            )}
          </Show>

          <ToastInteractiveProvider scope={props.__scopeToast} onClose={handleClose}>
            {/*
             * Portalled directly (no `@solidix/portal` wrapper) so the `li`
             * stays a direct child of the viewport `ol`, exactly like Radix.
             */}
            <SolidPortal mount={viewport()}>
              <Collection.ItemSlot scope={props.__scopeToast}>
                <DismissableLayerRoot
                  asChild
                  onEscapeKeyDown={composeEventHandlers(props.onEscapeKeyDown, (event) => {
                    // Only the highest layer (most recent toast) registers the
                    // escape listener, and it runs in the capture phase. If the
                    // key press originated from within a focused toast, that
                    // toast closes itself via `onKeyDown` below, so we must not
                    // also close this (top-most) toast. Otherwise, close it.
                    // See: https://github.com/radix-ui/primitives/issues/2906
                    const isFocusInToast = getItems().some((item) =>
                      item.ref.current?.contains(event.target as Node | null),
                    );
                    if (!isFocusInToast) {
                      handleClose();
                    }
                  })}
                >
                  <Primitive.li
                    tabindex={0}
                    data-state={props.open ? "open" : "closed"}
                    data-swipe-direction={context.swipeDirection}
                    {...rest}
                    ref={composedRefs}
                    style={{ "user-select": "none", "touch-action": "none", ...props.style }}
                    onKeyDown={composeEventHandlers(
                      (event) => callEventHandler(props.onKeyDown, event),
                      (event) => {
                        if (event.key !== "Escape") return;
                        callEventHandler(props.onEscapeKeyDown, event);
                        if (!event.defaultPrevented) {
                          handleClose();
                        }
                      },
                    )}
                    onPointerDown={composeEventHandlers(
                      (event) => callEventHandler(props.onPointerDown, event),
                      (event) => {
                        if (event.button !== 0) return;
                        pointerStartRef.current = { x: event.clientX, y: event.clientY };
                      },
                    )}
                    onPointerMove={composeEventHandlers(
                      (event) => callEventHandler(props.onPointerMove, event),
                      (event) => {
                        if (!pointerStartRef.current) return;
                        const x = event.clientX - pointerStartRef.current.x;
                        const y = event.clientY - pointerStartRef.current.y;
                        const hasSwipeMoveStarted = Boolean(swipeDeltaRef.current);
                        const isHorizontalSwipe = ["left", "right"].includes(
                          context.swipeDirection,
                        );
                        const clamp = ["left", "up"].includes(context.swipeDirection)
                          ? Math.min
                          : Math.max;
                        const clampedX = isHorizontalSwipe ? clamp(0, x) : 0;
                        const clampedY = !isHorizontalSwipe ? clamp(0, y) : 0;
                        const moveStartBuffer = event.pointerType === "touch" ? 10 : 2;
                        const delta = { x: clampedX, y: clampedY };
                        const eventDetail = { originalEvent: event, delta };
                        if (hasSwipeMoveStarted) {
                          swipeDeltaRef.current = delta;
                          handleAndDispatchCustomEvent(
                            TOAST_SWIPE_MOVE,
                            props.onSwipeMove,
                            eventDetail,
                            {
                              discrete: false,
                            },
                          );
                        } else if (
                          isDeltaInDirection(delta, context.swipeDirection, moveStartBuffer)
                        ) {
                          swipeDeltaRef.current = delta;
                          handleAndDispatchCustomEvent(
                            TOAST_SWIPE_START,
                            props.onSwipeStart,
                            eventDetail,
                            {
                              discrete: false,
                            },
                          );
                          (event.target as HTMLElement).setPointerCapture(event.pointerId);
                        } else if (Math.abs(x) > moveStartBuffer || Math.abs(y) > moveStartBuffer) {
                          // User is swiping in wrong direction so we disable swipe gesture
                          // for the current pointer down interaction
                          pointerStartRef.current = null;
                        }
                      },
                    )}
                    onPointerUp={composeEventHandlers(
                      (event) => callEventHandler(props.onPointerUp, event),
                      (event) => {
                        const delta = swipeDeltaRef.current;
                        const target = event.target as HTMLElement;
                        if (target.hasPointerCapture(event.pointerId)) {
                          target.releasePointerCapture(event.pointerId);
                        }
                        swipeDeltaRef.current = null;
                        pointerStartRef.current = null;
                        if (delta) {
                          const toast = event.currentTarget;
                          const eventDetail = { originalEvent: event, delta };
                          if (
                            isDeltaInDirection(
                              delta,
                              context.swipeDirection,
                              context.swipeThreshold,
                            )
                          ) {
                            handleAndDispatchCustomEvent(
                              TOAST_SWIPE_END,
                              props.onSwipeEnd,
                              eventDetail,
                              {
                                discrete: true,
                              },
                            );
                          } else {
                            handleAndDispatchCustomEvent(
                              TOAST_SWIPE_CANCEL,
                              props.onSwipeCancel,
                              eventDetail,
                              {
                                discrete: true,
                              },
                            );
                          }
                          // Prevent click event from triggering on items within the toast when
                          // pointer up is part of a swipe gesture
                          toast.addEventListener("click", (event) => event.preventDefault(), {
                            once: true,
                          });
                        }
                      },
                    )}
                  />
                </DismissableLayerRoot>
              </Collection.ItemSlot>
            </SolidPortal>
          </ToastInteractiveProvider>
        </>
      )}
    </Show>
  );
};

/* -----------------------------------------------------------------------------------------------*/

type ToastAnnounceProps = Omit<VisuallyHiddenProps, "children"> & {
  children: string[];
};

const ToastAnnounce: Component<ScopedProps<ToastAnnounceProps>> = (props) => {
  const rest = omit(props, "__scopeToast", "children");
  const context = useToastProviderContext(TOAST_NAME, props.__scopeToast);
  const [renderAnnounceText, setRenderAnnounceText] = createSignal(false);
  const [isAnnounced, setIsAnnounced] = createSignal(false);

  // render text content in the next frame to ensure toast is announced in NVDA
  useNextFrame(() => setRenderAnnounceText(true));

  // cleanup after announcing
  useLayoutEffect(() => {
    const timer = window.setTimeout(() => setIsAnnounced(true), 1000);
    return () => window.clearTimeout(timer);
  });

  return (
    <Show when={!isAnnounced()}>
      <Portal container={context.announcerContainer || undefined}>
        <VisuallyHidden {...rest}>
          <Show when={renderAnnounceText()}>
            <>
              {context.label} {props.children}
            </>
          </Show>
        </VisuallyHidden>
      </Portal>
    </Show>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ToastTitle
 * -----------------------------------------------------------------------------------------------*/

/** Props for the toast title element. */
type ToastTitleProps = PrimitivePropsWithRef<"div">;

/** Title heading announced to screen readers when the toast opens. */
const ToastTitle: Component<ScopedProps<ToastTitleProps>> = (props) => {
  const rest = omit(props, "__scopeToast", "ref");
  return <Primitive.div {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * ToastDescription
 * -----------------------------------------------------------------------------------------------*/

/** Props for the toast description element. */
type ToastDescriptionProps = PrimitivePropsWithRef<"div">;

/** Description text announced alongside the toast title. */
const ToastDescription: Component<ScopedProps<ToastDescriptionProps>> = (props) => {
  const rest = omit(props, "__scopeToast", "ref");
  return <Primitive.div {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * ToastAction
 * -----------------------------------------------------------------------------------------------*/

const ACTION_NAME = "ToastAction";

/** Props for the toast action button. */
type ToastActionProps = ToastCloseProps & {
  /**
   * A short description for an alternate way to carry out the action. For screen reader users
   * who will not be able to navigate to the button easily/quickly.
   * @example <ToastAction altText="Goto account settings to upgrade">Upgrade</ToastAction>
   * @example <ToastAction altText="Undo (Alt+U)">Undo</ToastAction>
   */
  altText: string;
};

/** Action button that announces its alt text instead of its label to screen readers. */
const ToastAction: Component<ScopedProps<ToastActionProps>> = (props) => {
  if (!props.altText.trim()) {
    console.error(
      `Invalid prop \`altText\` supplied to \`${ACTION_NAME}\`. Expected non-empty \`string\`.`,
    );
    return null;
  }

  return (
    <ToastAnnounceExclude altText={props.altText} asChild>
      <ToastClose {...omit(props, "__scopeToast", "altText")} />
    </ToastAnnounceExclude>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ToastClose
 * -----------------------------------------------------------------------------------------------*/

const CLOSE_NAME = "ToastClose";

/** Props for the toast close button. */
type ToastCloseProps = PrimitivePropsWithRef<"button">;

/** Close button that dismisses the toast. */
const ToastClose: Component<ScopedProps<ToastCloseProps>> = (props) => {
  const rest = omit(props, "__scopeToast", "ref");
  const interactiveContext = useToastInteractiveContext(CLOSE_NAME, props.__scopeToast);

  return (
    <ToastAnnounceExclude asChild>
      <Primitive.button
        type="button"
        {...rest}
        ref={props.ref}
        onClick={composeEventHandlers(
          (event) => callEventHandler(props.onClick, event),
          interactiveContext.onClose,
        )}
      />
    </ToastAnnounceExclude>
  );
};

/* ---------------------------------------------------------------------------------------------- */

type ToastAnnounceExcludeProps = PrimitivePropsWithRef<"div"> & {
  altText?: string | undefined;
};

const ToastAnnounceExclude: Component<ScopedProps<ToastAnnounceExcludeProps>> = (props) => {
  const rest = omit(props, "__scopeToast", "altText", "ref");

  return (
    <Primitive.div
      data-radix-toast-announce-exclude=""
      data-radix-toast-announce-alt={props.altText || undefined}
      {...rest}
      ref={props.ref}
    />
  );
};

function getAnnounceTextContent(container: HTMLElement) {
  const textContent: string[] = [];
  const childNodes = Array.from(container.childNodes);

  childNodes.forEach((node) => {
    if (node.nodeType === node.TEXT_NODE && node.textContent) textContent.push(node.textContent);
    if (isHTMLElement(node)) {
      const isHidden = node.ariaHidden || node.hidden || node.style.display === "none";
      const isExcluded = node.dataset.radixToastAnnounceExclude === "";

      if (!isHidden) {
        if (isExcluded) {
          const altText = node.dataset.radixToastAnnounceAlt;
          if (altText) textContent.push(altText);
        } else {
          textContent.push(...getAnnounceTextContent(node));
        }
      }
    }
  });

  // We return a collection of text rather than a single concatenated string.
  // This allows SR VO to naturally pause break between nodes while announcing.
  return textContent;
}

/* ---------------------------------------------------------------------------------------------- */

function handleAndDispatchCustomEvent<E extends CustomEvent, NativeEvent extends Event>(
  name: string,
  handler: ((event: E) => void) | undefined,
  detail: { originalEvent: NativeEvent } & (E extends CustomEvent<infer D> ? D : never),
  { discrete }: { discrete: boolean },
) {
  const currentTarget = detail.originalEvent.currentTarget as HTMLElement;
  const event = new CustomEvent(name, { bubbles: true, cancelable: true, detail });
  if (handler) currentTarget.addEventListener(name, handler as EventListener, { once: true });

  if (discrete) {
    dispatchDiscreteCustomEvent(currentTarget, event);
  } else {
    currentTarget.dispatchEvent(event);
  }
}

const isDeltaInDirection = (
  delta: { x: number; y: number },
  direction: SwipeDirection,
  threshold = 0,
) => {
  const deltaX = Math.abs(delta.x);
  const deltaY = Math.abs(delta.y);
  const isDeltaX = deltaX > deltaY;
  if (direction === SwipeDirection.Left || direction === SwipeDirection.Right) {
    return isDeltaX && deltaX > threshold;
  } else {
    return !isDeltaX && deltaY > threshold;
  }
};

function useNextFrame(callback: () => void = () => {}) {
  const fn = useCallbackRef(callback);
  useLayoutEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    raf1 = window.requestAnimationFrame(() => (raf2 = window.requestAnimationFrame(fn)));
    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  });
}

function isHTMLElement(node: unknown): node is HTMLElement {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as Node).nodeType === (node as Node).ELEMENT_NODE
  );
}

/**
 * Returns a list of potential tabbable candidates.
 *
 * NOTE: This is only a close approximation. For example it doesn't take into account cases like when
 * elements are not visible. This cannot be worked out easily by just reading a property, but rather
 * necessitate runtime knowledge (computed styles, etc). We deal with these cases separately.
 *
 * See: https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker
 * Credit: https://github.com/discord/focus-layers/blob/master/src/util/wrapFocus.tsx#L1
 */
function getTabbableCandidates(container: HTMLElement) {
  const nodes: HTMLElement[] = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node: Element) => {
      const isHiddenInput =
        node.tagName === "INPUT" && (node as HTMLInputElement).type === "hidden";
      if ((node as HTMLInputElement).disabled || (node as HTMLElement).hidden || isHiddenInput) {
        return NodeFilter.FILTER_SKIP;
      }
      // `.tabIndex` is not the same as the `tabindex` attribute. It works on the
      // runtime's understanding of tabbability, so this automatically accounts
      // for any kind of element that could be tabbed to.
      return (node as HTMLElement).tabIndex >= 0
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP;
    },
  });
  while (walker.nextNode()) nodes.push(walker.currentNode as HTMLElement);
  // we do not take into account the order of nodes with positive `tabIndex` as it
  // hinders accessibility to have tab order different from visual order.
  return nodes;
}

function focusFirst(candidates: HTMLElement[]) {
  const previouslyFocusedElement = document.activeElement;
  return candidates.some((candidate) => {
    // if focus is already where we want to go, we don't want to keep going through the candidates
    if (candidate === previouslyFocusedElement) return true;
    candidate.focus();
    return document.activeElement !== previouslyFocusedElement;
  });
}

export {
  createToastScope,
  //
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  //
  ToastProvider as Provider,
  ToastViewport as Viewport,
  Toast as Root,
  ToastTitle as Title,
  ToastDescription as Description,
  ToastAction as Action,
  ToastClose as Close,
};
export type {
  ToastProviderProps,
  ToastViewportProps,
  ToastProps,
  ToastTitleProps,
  ToastDescriptionProps,
  ToastActionProps,
  ToastCloseProps,
};
