// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/lightbox/
//
// Solid port of the frosted-ui Lightbox compound component. Upstream splits
// this across `lightbox-root.tsx`, `lightbox-content.tsx`, `lightbox-item.tsx`,
// `lightbox-item-group.tsx`, `lightbox-trigger.tsx`, `lightbox-close.tsx`,
// `lightbox-previous.tsx`, `lightbox-next.tsx`, `lightbox-counter.tsx`,
// `lightbox-caption.tsx`, `lightbox-thumbnail-group.tsx`,
// `lightbox-thumbnail.tsx`, `lightbox-zoom.tsx`, `lightbox-zoom-in.tsx`,
// `lightbox-zoom-out.tsx`, `lightbox-context.tsx`, `lightbox-zoom-context.tsx`,
// `use-zoom-gestures.ts`, `use-pull-to-dismiss.ts`, `use-zoom-animation.ts`,
// `lightbox.ts`, and `lightbox.css` at whopio/frosted-ui commit `56787900bfe0`.
// This file condenses those parts into one module plus `lightbox.props.ts`
// (prop defs) and `lightbox.css` (fui-* classes, kept verbatim).
//
// Port notes (Base UI -> Solid):
// - Base UI `useRender` follows the frosted overlay convention (dialog,
//   popover, tooltip, hover-card precedent): action parts (Trigger, Close,
//   Previous, Next, Thumbnail, ZoomIn, ZoomOut) always merge onto their
//   single child element via `@solidix/slot`, and container parts render
//   default elements. There is no optional `asChild` prop.
// - `onValueChange` keeps the upstream `(value, { source })` metadata; it is
//   called synchronously from `setActiveIndex` because the shared
//   `useControllableState` helper only forwards the value.
// - `onOpenChangeComplete` fires on a microtask after the open state settles
//   rather than after the exit animation finishes.
// - Zoom is simplified: double-click toggle, keyboard (+/-/0), and the
//   ZoomIn/ZoomOut buttons drive a scale transform. Pinch, wheel zoom, pan,
//   and the zoom animation hooks are not ported.
// - Pull-to-dismiss is a simplified single-touch vertical drag with damping.
// - There is no `LightboxOverlay` element and no `items`/`renderItem` API:
//   upstream renders backdrop + dialog siblings and registers explicit-index
//   `Item` parts, which this port follows.

import {
  children,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  omit,
  Show,
  untrack,
  useContext,
  type Accessor,
  type Component,
} from "solid-js";
import { Portal, type JSX } from "@solidjs/web";
import { ariaBoolean, callEventHandler } from "@solidix/primitive";
import { afterConnected, composeRefs, type Ref } from "@solidix/compose-refs";
import { createSlot } from "@solidix/slot";
import { useControllableState } from "@solidix/use-controllable-state";
import { cx } from "../../helpers/cx";
import { composeEventHandlers } from "../../helpers/compose-event-handlers";
import { Theme } from "../../theme";
import type {
  LightboxContentOwnProps,
  LightboxItemGroupOwnProps,
  LightboxItemOwnProps,
  LightboxRootOwnProps,
  LightboxThumbnailOwnProps,
  LightboxTriggerOwnProps,
  LightboxZoomOwnProps,
} from "./lightbox.props";

/* -------------------------------------------------------------------------------------------------
 * Constants
 * -----------------------------------------------------------------------------------------------*/

/** Default accessible labels for the chrome buttons. */
const DEFAULT_LABELS = {
  close: "Close",
  previous: "Previous",
  next: "Next",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
} as const;

/** Visually-hidden focus-guard style, matching upstream `focusGuardStyle`. */
const FOCUS_GUARD_STYLE = {
  position: "fixed",
  overflow: "hidden",
  width: "1px",
  height: "1px",
  top: "0",
  left: "0",
  padding: "0",
  border: "0",
  clip: "rect(0, 0, 0, 0)",
  "white-space": "nowrap",
} as const;

/** Pull distance in px past which releasing closes the dialog. */
const PULL_THRESHOLD = 120;

/** Props for elements that forward a DOM ref. */
interface RefProp<El extends HTMLElement> {
  /** Ref forwarded to the rendered element. */
  ref?: Ref<El> | undefined;
}

/** What caused an active-index change, matching upstream `NavigationSource`. */
type NavigationSource = "trigger" | "keyboard" | "thumbnail" | "button";

/* -------------------------------------------------------------------------------------------------
 * Root context
 * -----------------------------------------------------------------------------------------------*/

/** Shared state for the lightbox compound, mirroring upstream context. */
interface LightboxContextValue {
  /** Whether the dialog is open. */
  open: Accessor<boolean>;
  /** Set the open state. */
  setOpen: (open: boolean) => void;
  /** Active item index. */
  activeIndex: Accessor<number>;
  /** Set the active item index (clamped or wrapped per `loop`). */
  setActiveIndex: (index: number, source: NavigationSource) => void;
  /** Whether arrow navigation wraps around. */
  loop: Accessor<boolean>;
  /** Whether item changes animate with a view transition. */
  viewTransition: Accessor<boolean>;
  /** Which trigger the dialog morphs to on close. */
  morphTo: Accessor<"active" | "origin" | "closest">;
  /** Number of registered items. */
  itemCount: Accessor<number>;
  /** Register an item index, returns an unregister fn. */
  registerItem: (index: number) => () => void;
  /** Registered caption content by index. */
  captions: Map<number, JSX.Element>;
  /** Tick bumped whenever captions change (maps are not reactive). */
  captionsTick: Accessor<number>;
  /** Register caption content for an index, returns an unregister fn. */
  registerCaption: (index: number, caption: JSX.Element) => () => void;
  /** Registered trigger elements by index. */
  triggerElements: Map<number, HTMLElement>;
  /** Index of the trigger that opened the dialog (`origin` morph target). */
  openingTriggerIndex: Accessor<number>;
  /** Record the trigger index that opened the dialog. */
  setOpeningTriggerIndex: (index: number) => void;
}

const LightboxRootContext = createContext<LightboxContextValue>();

/** Read the root context, throwing the upstream scope error outside a root. */
function useLightboxRootContext(component: string): LightboxContextValue {
  try {
    return useContext(LightboxRootContext);
  } catch {
    throw new Error(`Lightbox.${component} must be used within a Lightbox.Root.`);
  }
}

/** Whether the browser supports animated view transitions. */
function supportsViewTransitions(): boolean {
  return (
    typeof document !== "undefined" &&
    "startViewTransition" in document &&
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Run `update` inside a view transition when supported and enabled, otherwise
 * run it directly.
 */
function withViewTransition(update: () => void, enabled: boolean): void {
  if (!enabled || !supportsViewTransitions()) {
    update();
    return;
  }
  const doc = document as Document & { startViewTransition: (update: () => void) => unknown };
  try {
    doc.startViewTransition(update);
  } catch {
    update();
  }
}

/** Clamp `index` into `[0, count - 1]`, wrapping when `loop` is true. */
function normalizeIndex(index: number, count: number, loop: boolean): number {
  if (count <= 0) {
    return 0;
  }
  if (loop) {
    return ((index % count) + count) % count;
  }
  return Math.min(Math.max(index, 0), count - 1);
}

/* -------------------------------------------------------------------------------------------------
 * Root
 * -----------------------------------------------------------------------------------------------*/

/** Props for `Lightbox.Root`. */
interface LightboxRootProps extends LightboxRootOwnProps {
  /** Lightbox parts (triggers outside, content inside). */
  children?: JSX.Element | undefined;
  /** Called when the open state changes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Called after open state changes have settled. */
  onOpenChangeComplete?: ((open: boolean) => void) | undefined;
  /** Called when the active item index changes. */
  onValueChange?: ((value: number, metadata: { source: NavigationSource }) => void) | undefined;
}

/**
 * Root state holder for the lightbox. Renders no DOM itself; triggers and
 * content consume the shared context.
 *
 * Upstream: `lightbox-root.tsx` at whopio/frosted-ui commit `56787900bfe0`.
 */
const LightboxRoot: Component<LightboxRootProps> = (props) => {
  const [open, setOpenState] = useControllableState<boolean>({
    prop: () => props.open,
    defaultProp: props.defaultOpen ?? false,
    onChange: props.onOpenChange,
    caller: "Lightbox.Root",
  });
  const [value, setValueState] = useControllableState<number>({
    prop: () => (props.value === undefined ? undefined : Number(props.value)),
    defaultProp: Number(props.defaultValue ?? 0),
    caller: "Lightbox.Root",
  });
  // Written from registration effect cleanups (owned scopes), so `ownedWrite`.
  const [itemCount, setItemCount] = createSignal(0, { ownedWrite: true });
  const [captionsTick, setCaptionsTick] = createSignal(0, { ownedWrite: true });
  const [openingTriggerIndex, setOpeningTriggerIndex] = createSignal(0);

  const registeredItems = new Set<number>();
  const captions = new Map<number, JSX.Element>();
  const triggerElements = new Map<number, HTMLElement>();

  const registerItem = (index: number): (() => void) => {
    registeredItems.add(index);
    setItemCount(registeredItems.size);
    return () => {
      registeredItems.delete(index);
      setItemCount(registeredItems.size);
    };
  };

  const registerCaption = (index: number, caption: JSX.Element): (() => void) => {
    captions.set(index, caption);
    setCaptionsTick((tick) => tick + 1);
    return () => {
      captions.delete(index);
      setCaptionsTick((tick) => tick + 1);
    };
  };

  const setActiveIndex = (index: number, source: NavigationSource) => {
    const count = untrack(itemCount);
    const next = normalizeIndex(Math.round(index), Math.max(count, 1), props.loop ?? false);
    if (next === untrack(value)) {
      return;
    }
    if (props.viewTransition ?? false) {
      withViewTransition(() => setValueState(next), true);
    } else {
      setValueState(next);
    }
    props.onValueChange?.(next, { source });
  };

  const setOpen = (next: boolean) => {
    if (next === untrack(open)) {
      return;
    }
    setOpenState(next);
  };

  // `onOpenChangeComplete` fires once the open-state change has settled.
  let settled = false;
  createEffect(
    () => open(),
    (isOpen) => {
      if (!settled) {
        settled = true;
        return;
      }
      const callback = props.onOpenChangeComplete;
      if (callback) {
        queueMicrotask(() => callback(isOpen));
      }
    },
  );

  const contextValue: LightboxContextValue = {
    open,
    setOpen,
    activeIndex: value,
    setActiveIndex,
    loop: () => props.loop ?? false,
    viewTransition: () => props.viewTransition ?? false,
    morphTo: () => (props.morphTo ?? "active") as "active" | "origin" | "closest",
    itemCount,
    registerItem,
    captions,
    captionsTick,
    registerCaption,
    triggerElements,
    openingTriggerIndex,
    setOpeningTriggerIndex,
  };

  return <LightboxRootContext value={contextValue}>{props.children}</LightboxRootContext>;
};

/* -------------------------------------------------------------------------------------------------
 * Trigger
 * -----------------------------------------------------------------------------------------------*/

const TriggerSlot = createSlot<
  HTMLButtonElement,
  JSX.ButtonHTMLAttributes<HTMLButtonElement>
>("Lightbox.Trigger");

/** Props for `Lightbox.Trigger`. */
interface LightboxTriggerProps
  extends LightboxTriggerOwnProps,
    RefProp<HTMLButtonElement>,
    Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "ref"> {
  /** The single element that opens the lightbox at `index` when activated. */
  children: JSX.Element;
}

/**
 * Opens the lightbox at `index` when activated. Merges onto its single child
 * element and registers it so the dialog can morph back to it on close.
 *
 * Upstream: `lightbox-trigger.tsx` at whopio/frosted-ui commit `56787900bfe0`.
 */
const LightboxTrigger: Component<LightboxTriggerProps> = (props) => {
  const context = useLightboxRootContext("Trigger");
  const rest = omit(props, "index", "crossfade", "ref", "children", "onClick", "class");
  const index = createMemo(() => Number(props.index ?? 0));

  const ownRef: Ref<HTMLButtonElement> = (node) => {
    const current = untrack(index);
    if (node) {
      context.triggerElements.set(current, node);
    } else {
      context.triggerElements.delete(current);
    }
  };

  const handleClick = () => {
    const current = untrack(index);
    context.setOpeningTriggerIndex(current);
    context.setActiveIndex(current, "trigger");
    context.setOpen(true);
  };

  const isActive = createMemo(() => context.open() && context.activeIndex() === index());

  const isMorphTarget = createMemo(() => {
    const current = index();
    if (!context.open()) {
      return false;
    }
    const morphTo = context.morphTo();
    if (morphTo === "origin") {
      return current === context.openingTriggerIndex();
    }
    if (morphTo === "closest") {
      const active = context.activeIndex();
      if (context.triggerElements.has(active)) {
        return active === current;
      }
      let best = -1;
      let bestDist = Number.POSITIVE_INFINITY;
      for (const candidate of context.triggerElements.keys()) {
        const dist = Math.abs(candidate - active);
        if (dist < bestDist) {
          bestDist = dist;
          best = candidate;
        }
      }
      return current === best;
    }
    return isActive();
  });

  const composed = composeRefs(ownRef, props.ref);
  const onTriggerClick = composeEventHandlers(
    (event: MouseEvent & { currentTarget: HTMLButtonElement }) =>
      callEventHandler(props.onClick, event),
    () => handleClick(),
  );

  return (
    <TriggerSlot
      {...rest}
      ref={composed}
      type="button"
      class={cx("fui-LightboxTrigger", props.class)}
      data-open={context.open() ? "" : undefined}
      data-active={isActive() ? "" : undefined}
      data-morph-target={isMorphTarget() ? "" : undefined}
      data-crossfade={props.crossfade === true ? "true" : undefined}
      onClick={onTriggerClick}
    >
      {props.children}
    </TriggerSlot>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Content
 * -----------------------------------------------------------------------------------------------*/

/** Props for `Lightbox.Content`. */
interface LightboxContentProps
  extends LightboxContentOwnProps,
    RefProp<HTMLDivElement>,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "ref"> {
  /** Where to portal the dialog. Defaults to `document.body`. */
  container?: Element | undefined;
  /** Keep the dialog mounted when closed. */
  forceMount?: boolean | undefined;
  /** Dialog content parts. */
  children?: JSX.Element | undefined;
}

/** Selector for focusable elements, matching upstream `TABBABLE_SELECTOR`. */
const TABBABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/** Tabbable elements inside `container`, excluding focus guards. */
function getTabbableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute("data-focus-guard"),
  );
}

/**
 * Modal dialog surface, portalled to `container` (or `document.body`). Handles
 * Escape to close, arrow / Home / End navigation, backdrop click to close,
 * scroll locking, focus guards, and pull-to-dismiss.
 *
 * Upstream: `lightbox-content.tsx` at whopio/frosted-ui commit `56787900bfe0`.
 */
const LightboxContent: Component<LightboxContentProps> = (props) => {
  const context = useLightboxRootContext("Content");
  const zoom = useOptionalZoomContext();
  const rest = omit(
    props,
    "pullToClose",
    "container",
    "forceMount",
    "ref",
    "children",
    "class",
    "onClick",
    "onKeyDown",
    "onTouchStart",
    "onTouchMove",
    "onTouchEnd",
    "onTouchCancel",
  );

  // Surface node as a signal so the mount effect re-runs once it resolves.
  // Ref writes need `ownedWrite` (ref detach fires in an owned scope).
  const [surface, setSurface] = createSignal<HTMLDivElement | undefined>(undefined, {
    ownedWrite: true,
  });
  const captureRef: Ref<HTMLDivElement> = (node) => setSurface(node ?? undefined);

  // Mount work runs while open with a resolved surface: focus, scroll lock,
  // Escape handling, and pinch prevention. Teardown restores everything.
  createEffect(
    () => (context.open() ? surface() : undefined),
    (node) => {
      if (!node) {
        return;
      }
      return afterConnected(node, () => {
        const doc = node.ownerDocument;
        const previouslyFocused =
          doc.activeElement instanceof HTMLElement ? doc.activeElement : null;
        node.focus({ preventScroll: true });
        const root = doc.documentElement;
        const previousOverflow = root.style.overflow;
        root.style.overflow = "hidden";
        const handleEscape = (event: KeyboardEvent) => {
          if (event.key === "Escape") {
            event.preventDefault();
            context.setOpen(false);
          }
        };
        doc.addEventListener("keydown", handleEscape);
        const preventPinch = (event: Event) => {
          event.preventDefault();
        };
        doc.addEventListener("gesturestart", preventPinch, { passive: false });
        return () => {
          doc.removeEventListener("keydown", handleEscape);
          doc.removeEventListener("gesturestart", preventPinch);
          root.style.overflow = previousOverflow;
          if (previouslyFocused && previouslyFocused.isConnected) {
            previouslyFocused.focus({ preventScroll: true });
          }
        };
      });
    },
  );

  const focusEdge = (which: "first" | "last") => {
    const node = surface();
    if (!node) {
      return;
    }
    const tabbables = getTabbableElements(node);
    const target =
      which === "first" ? (tabbables[0] ?? node) : (tabbables[tabbables.length - 1] ?? node);
    target.focus();
  };

  const handleKeyDown = (event: KeyboardEvent & { currentTarget: HTMLDivElement }) => {
    const count = context.itemCount();
    if (count === 0) {
      return;
    }
    // When zoomed in, arrow keys pan the image instead of navigating slides.
    if ((zoom?.zoom() ?? 1) > 1 && event.key.startsWith("Arrow")) {
      return;
    }
    const active = context.activeIndex();
    const loop = context.loop();
    let next: number | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown": {
        next = loop ? (active + 1) % count : Math.min(active + 1, count - 1);
        break;
      }
      case "ArrowLeft":
      case "ArrowUp": {
        next = loop ? (active - 1 + count) % count : Math.max(active - 1, 0);
        break;
      }
      case "Home": {
        next = 0;
        break;
      }
      case "End": {
        next = count - 1;
        break;
      }
      default: {
        return;
      }
    }
    if (next !== active) {
      event.preventDefault();
      context.setActiveIndex(next, "keyboard");
    }
  };

  // Clicks on the backdrop or the dialog container itself (not children)
  // close the lightbox, matching native `<dialog>` behavior.
  const handleDismissClick = (event: MouseEvent & { currentTarget: HTMLDivElement }) => {
    if (event.target === event.currentTarget) {
      context.setOpen(false);
    }
  };

  // Pull-to-dismiss: vertical single-touch drag with damping; release past the
  // threshold closes, otherwise the content snaps back.
  const [pulling, setPulling] = createSignal(false);
  let pullStartY: number | null = null;
  let pullStartX: number | null = null;
  let pullTracking = false;

  const handleTouchStart = (event: TouchEvent & { currentTarget: HTMLDivElement }) => {
    if (!(props.pullToClose ?? true) || event.touches.length !== 1) {
      return;
    }
    const touch = event.touches[0]!;
    pullStartY = touch.clientY;
    pullStartX = touch.clientX;
    pullTracking = true;
  };

  const handleTouchMove = (event: TouchEvent & { currentTarget: HTMLDivElement }) => {
    if (!pullTracking || pullStartY === null || pullStartX === null) {
      return;
    }
    const touch = event.touches[0]!;
    const deltaY = touch.clientY - pullStartY;
    const deltaX = touch.clientX - pullStartX;
    if (!untrack(pulling) && Math.abs(deltaX) > Math.abs(deltaY)) {
      pullTracking = false;
      return;
    }
    if (deltaY > 0) {
      // Damped drag: resistance grows with distance.
      const damped = deltaY * (1 / (1 + deltaY / 400));
      setPulling(true);
      const node = event.currentTarget;
      node.style.setProperty("--fui-lightbox-pull", `${damped}px`);
      node.dataset.pulling = "";
    }
  };

  const endPull = (event: TouchEvent & { currentTarget: HTMLDivElement }) => {
    if (!pullTracking && !untrack(pulling)) {
      return;
    }
    pullTracking = false;
    pullStartY = null;
    pullStartX = null;
    const node = event.currentTarget;
    const offset = Number.parseFloat(node.style.getPropertyValue("--fui-lightbox-pull") || "0");
    setPulling(false);
    node.style.removeProperty("--fui-lightbox-pull");
    delete node.dataset.pulling;
    if (offset >= PULL_THRESHOLD) {
      context.setOpen(false);
    }
  };

  const composed = composeRefs(captureRef, props.ref);
  const onDialogClick = composeEventHandlers(
    (event: MouseEvent & { currentTarget: HTMLDivElement }) =>
      callEventHandler(props.onClick, event),
    handleDismissClick,
  );
  const onDialogKeyDown = composeEventHandlers(
    (event: KeyboardEvent & { currentTarget: HTMLDivElement }) =>
      callEventHandler(props.onKeyDown, event),
    handleKeyDown,
  );
  const onDialogTouchStart = composeEventHandlers(
    (event: TouchEvent & { currentTarget: HTMLDivElement }) =>
      callEventHandler(props.onTouchStart, event),
    handleTouchStart,
  );
  const onDialogTouchMove = composeEventHandlers(
    (event: TouchEvent & { currentTarget: HTMLDivElement }) =>
      callEventHandler(props.onTouchMove, event),
    handleTouchMove,
  );
  const onDialogTouchEnd = composeEventHandlers(
    (event: TouchEvent & { currentTarget: HTMLDivElement }) =>
      callEventHandler(props.onTouchEnd, event),
    endPull,
  );
  const onDialogTouchCancel = composeEventHandlers(
    (event: TouchEvent & { currentTarget: HTMLDivElement }) =>
      callEventHandler(props.onTouchCancel, event),
    endPull,
  );

  // Rendered through one function so the optional `container` stays honest:
  // `Portal` without `mount` targets `document.body`, and only one branch
  // below ever evaluates.
  const dialog = () => (
    <Show when={context.open() || (props.forceMount ?? false)}>
      <Theme appearance="dark" hasBackground={false}>
        <div
          class="fui-LightboxBackdrop"
          data-open={context.open() ? "" : undefined}
          aria-hidden="true"
          onClick={handleDismissClick}
        />
        <span
          tabindex={0}
          aria-hidden="true"
          data-focus-guard=""
          style={FOCUS_GUARD_STYLE}
          onFocus={() => focusEdge("last")}
        />
        <div
          {...rest}
          ref={composed}
          role="dialog"
          aria-modal="true"
          tabindex={-1}
          class={cx("fui-LightboxContent", props.class)}
          data-open={context.open() ? "" : undefined}
          data-pulling={pulling() ? "" : undefined}
          onClick={onDialogClick}
          onKeyDown={onDialogKeyDown}
          onTouchStart={onDialogTouchStart}
          onTouchMove={onDialogTouchMove}
          onTouchEnd={onDialogTouchEnd}
          onTouchCancel={onDialogTouchCancel}
        >
          {props.children}
        </div>
        <span
          tabindex={0}
          aria-hidden="true"
          data-focus-guard=""
          style={FOCUS_GUARD_STYLE}
          onFocus={() => focusEdge("first")}
        />
      </Theme>
    </Show>
  );

  return props.container ? (
    <Portal mount={props.container}>{dialog()}</Portal>
  ) : (
    <Portal>{dialog()}</Portal>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Close
 * -----------------------------------------------------------------------------------------------*/

const CloseSlot = createSlot<
  HTMLButtonElement,
  JSX.ButtonHTMLAttributes<HTMLButtonElement>
>("Lightbox.Close");

/** Props for `Lightbox.Close`. */
interface LightboxCloseProps
  extends RefProp<HTMLButtonElement>,
    Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "ref"> {
  /** The single element that closes the lightbox when activated. */
  children: JSX.Element;
}

/**
 * Closes the lightbox when activated. Merges onto its single child element.
 *
 * Upstream: `lightbox-close.tsx` at whopio/frosted-ui commit `56787900bfe0`.
 */
const LightboxClose: Component<LightboxCloseProps> = (props) => {
  const context = useLightboxRootContext("Close");
  const rest = omit(props, "ref", "children", "class", "onClick", "aria-label");
  const composedRef = composeRefs(props.ref);
  const onCloseClick = composeEventHandlers(
    (event: MouseEvent & { currentTarget: HTMLButtonElement }) =>
      callEventHandler(props.onClick, event),
    () => context.setOpen(false),
  );
  return (
    <CloseSlot
      {...rest}
      ref={composedRef}
      type="button"
      aria-label={props["aria-label"] ?? DEFAULT_LABELS.close}
      class={cx("fui-LightboxClose", props.class)}
      onClick={onCloseClick}
    >
      {props.children}
    </CloseSlot>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ItemGroup
 * -----------------------------------------------------------------------------------------------*/

/** Swap-rendering state shared with `Item` parts. */
interface LightboxItemGroupContextValue {
  /** Active item index. */
  activeIndex: Accessor<number>;
  /** Adjacent items kept rendered on each side of the active item. */
  preload: Accessor<number>;
  /** Navigation direction of the last index change. */
  direction: Accessor<"forward" | "backward">;
  /** Whether arrow navigation wraps around. */
  loop: Accessor<boolean>;
  /** Number of registered items. */
  itemCount: Accessor<number>;
}

const LightboxItemGroupContext = createContext<LightboxItemGroupContextValue>();

/** Read the group context, or `undefined` outside an `ItemGroup`. */
function useOptionalItemGroupContext(): LightboxItemGroupContextValue | undefined {
  try {
    return useContext(LightboxItemGroupContext);
  } catch {
    return undefined;
  }
}

/** Props for `Lightbox.ItemGroup`. */
interface LightboxItemGroupProps
  extends LightboxItemGroupOwnProps,
    RefProp<HTMLDivElement>,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "ref"> {
  /** Item elements. */
  children?: JSX.Element | undefined;
}

/**
 * Viewport that clips the sliding track of items. Only the active item plus
 * `preload` adjacent items render; the rest stay unmounted.
 *
 * Upstream: `lightbox-item-group.tsx` at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const LightboxItemGroup: Component<LightboxItemGroupProps> = (props) => {
  const context = useLightboxRootContext("ItemGroup");
  const rest = omit(props, "preload", "ref", "children", "class");
  const composedRef = composeRefs(props.ref);
  const preload = createMemo(() => Number(props.preload ?? 1));

  const [direction, setDirection] = createSignal<"forward" | "backward">("forward");
  let previous: number | undefined;
  createEffect(
    () => context.activeIndex(),
    (next) => {
      if (previous !== undefined && next !== previous) {
        setDirection(next > previous ? "forward" : "backward");
      }
      previous = next;
    },
  );

  const groupValue: LightboxItemGroupContextValue = {
    activeIndex: context.activeIndex,
    preload,
    direction,
    loop: context.loop,
    itemCount: context.itemCount,
  };

  return (
    <LightboxItemGroupContext value={groupValue}>
      <div
        {...rest}
        ref={composedRef}
        role="group"
        class={cx("fui-LightboxItemGroup", props.class)}
        data-active-index={context.activeIndex()}
        data-direction={direction()}
      >
        {props.children}
      </div>
    </LightboxItemGroupContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Item
 * -----------------------------------------------------------------------------------------------*/

/** State passed to `Item` render-prop children. */
interface LightboxItemRenderState {
  /** Whether this item is the active one. */
  active: boolean;
  /** Whether this item is inside the preload window. */
  visible: boolean;
}

/** Props for `Lightbox.Item`. */
interface LightboxItemProps
  extends Omit<LightboxItemOwnProps, "caption">,
    RefProp<HTMLDivElement>,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "ref"> {
  /** Caption content registered for `Caption` to display. */
  caption?: JSX.Element | undefined;
  /** Item content, or a render function receiving `{ active, visible }`. */
  children?: JSX.Element | ((state: LightboxItemRenderState) => JSX.Element) | undefined;
}

/**
 * Single slide in the item group. Registers its index on mount and exposes
 * active state for styling. Renders nothing outside the preload window.
 *
 * Upstream: `lightbox-item.tsx` at whopio/frosted-ui commit `56787900bfe0`.
 */
const LightboxItem: Component<LightboxItemProps> = (props) => {
  const context = useLightboxRootContext("Item");
  const group = useOptionalItemGroupContext();
  const rest = omit(props, "index", "caption", "ref", "children", "class");
  // Render-prop children pass through `children()` uncalled (non-zero arity).
  const resolved = children(() => props.children as JSX.Element);
  const composedRef = composeRefs(props.ref);
  const index = createMemo(() => Number(props.index ?? 0));

  const isActive = createMemo(() => index() === context.activeIndex());
  const isVisible = createMemo(() => {
    if (!group) {
      return true;
    }
    const active = group.activeIndex();
    const current = index();
    const linearDist = Math.abs(current - active);
    const count = group.itemCount();
    const distance =
      group.loop() && count > 0 ? Math.min(linearDist, count - linearDist) : linearDist;
    return distance <= group.preload();
  });

  createEffect(
    () => [index(), props.caption] as const,
    ([current, caption]) => {
      const unregisterItem = context.registerItem(current);
      const unregisterCaption =
        caption === undefined ? undefined : context.registerCaption(current, caption);
      return () => {
        unregisterCaption?.();
        unregisterItem();
      };
    },
  );

  // Invoke the render prop once with accessor-backed state: re-invoking per
  // change would remount the item content on every navigation.
  const content = createMemo(() => {
    const kids = resolved();
    if (typeof kids === "function") {
      return (kids as (state: LightboxItemRenderState) => JSX.Element)({
        get active() {
          return isActive();
        },
        get visible() {
          return isVisible();
        },
      });
    }
    return kids;
  });

  return (
    <Show when={isVisible()}>
      <div
        {...rest}
        ref={composedRef}
        role="tabpanel"
        aria-hidden={ariaBoolean(!isActive())}
        inert={!isActive() ? true : undefined}
        class={cx("fui-LightboxItem", props.class)}
        data-index={index()}
        data-active={isActive() ? "" : undefined}
      >
        {content()}
      </div>
    </Show>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Previous / Next
 * -----------------------------------------------------------------------------------------------*/

const PreviousSlot = createSlot<
  HTMLButtonElement,
  JSX.ButtonHTMLAttributes<HTMLButtonElement>
>("Lightbox.Previous");
const NextSlot = createSlot<
  HTMLButtonElement,
  JSX.ButtonHTMLAttributes<HTMLButtonElement>
>("Lightbox.Next");

/** Props for `Lightbox.Previous` and `Lightbox.Next`. */
interface LightboxNavButtonProps
  extends RefProp<HTMLButtonElement>,
    Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "ref" | "disabled"> {
  /** The single element that navigates when activated. */
  children: JSX.Element;
  /** Whether the button is disabled. Defaults to the boundary state. */
  disabled?: boolean | undefined;
}

/**
 * Moves to the previous item when activated. Merges onto its single child
 * element. Auto-disables at the first item unless `loop` is enabled on Root.
 *
 * Upstream: `lightbox-previous.tsx` at whopio/frosted-ui commit `56787900bfe0`.
 */
const LightboxPrevious: Component<LightboxNavButtonProps> = (props) => {
  const context = useLightboxRootContext("Previous");
  const rest = omit(props, "ref", "children", "class", "disabled", "onClick", "aria-label");
  const composedRef = composeRefs(props.ref);
  const disabled = createMemo(
    () => props.disabled ?? (!context.loop() && context.activeIndex() <= 0),
  );
  const onPreviousClick = composeEventHandlers(
    (event: MouseEvent & { currentTarget: HTMLButtonElement }) =>
      callEventHandler(props.onClick, event),
    () => {
      if (untrack(disabled)) {
        return;
      }
      const active = context.activeIndex();
      const count = context.itemCount();
      const next = context.loop()
        ? (active - 1 + count) % Math.max(count, 1)
        : Math.max(active - 1, 0);
      context.setActiveIndex(next, "button");
    },
  );
  return (
    <PreviousSlot
      {...rest}
      ref={composedRef}
      type="button"
      aria-label={props["aria-label"] ?? DEFAULT_LABELS.previous}
      disabled={disabled()}
      data-disabled={disabled() ? "" : undefined}
      class={cx("fui-LightboxPrevious", props.class)}
      onClick={onPreviousClick}
    >
      {props.children}
    </PreviousSlot>
  );
};

/**
 * Moves to the next item when activated. Merges onto its single child
 * element. Auto-disables at the last item unless `loop` is enabled on Root.
 *
 * Upstream: `lightbox-next.tsx` at whopio/frosted-ui commit `56787900bfe0`.
 */
const LightboxNext: Component<LightboxNavButtonProps> = (props) => {
  const context = useLightboxRootContext("Next");
  const rest = omit(props, "ref", "children", "class", "disabled", "onClick", "aria-label");
  const composedRef = composeRefs(props.ref);
  const disabled = createMemo(
    () => props.disabled ?? (!context.loop() && context.activeIndex() >= context.itemCount() - 1),
  );
  const onNextClick = composeEventHandlers(
    (event: MouseEvent & { currentTarget: HTMLButtonElement }) =>
      callEventHandler(props.onClick, event),
    () => {
      if (untrack(disabled)) {
        return;
      }
      const active = context.activeIndex();
      const count = context.itemCount();
      const next = context.loop()
        ? (active + 1) % Math.max(count, 1)
        : Math.min(active + 1, count - 1);
      context.setActiveIndex(next, "button");
    },
  );
  return (
    <NextSlot
      {...rest}
      ref={composedRef}
      type="button"
      aria-label={props["aria-label"] ?? DEFAULT_LABELS.next}
      disabled={disabled()}
      data-disabled={disabled() ? "" : undefined}
      class={cx("fui-LightboxNext", props.class)}
      onClick={onNextClick}
    >
      {props.children}
    </NextSlot>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Counter
 * -----------------------------------------------------------------------------------------------*/

/** State passed to `Counter` render-prop children. */
interface LightboxCounterRenderState {
  /** One-based position of the active item. */
  current: number;
  /** Total number of registered items. */
  total: number;
}

/** Props for `Lightbox.Counter`. */
interface LightboxCounterProps
  extends RefProp<HTMLDivElement>,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "ref"> {
  /** Render function for custom counter format. Defaults to "1 / 12". */
  children?: ((state: LightboxCounterRenderState) => JSX.Element) | undefined;
}

/**
 * Displays the active item position ("1 / 12"), and serves as an aria-live
 * region for screen reader announcements.
 *
 * Upstream: `lightbox-counter.tsx` at whopio/frosted-ui commit `56787900bfe0`.
 */
const LightboxCounter: Component<LightboxCounterProps> = (props) => {
  const context = useLightboxRootContext("Counter");
  const rest = omit(props, "ref", "children", "class");
  // The render prop passes through `children()` uncalled (non-zero arity).
  const resolved = children(() => props.children as JSX.Element);
  const composedRef = composeRefs(props.ref);
  // Invoke the render prop once with accessor-backed state: re-invoking per
  // change would remount the counter content on every navigation.
  const content = createMemo(() => {
    const renderProp = resolved() as
      | ((state: LightboxCounterRenderState) => JSX.Element)
      | undefined;
    if (typeof renderProp === "function") {
      return renderProp({
        get current() {
          return context.activeIndex() + 1;
        },
        get total() {
          return context.itemCount();
        },
      });
    }
    return (
      <>
        {context.activeIndex() + 1} / {context.itemCount()}
      </>
    );
  });
  return (
    <div
      {...rest}
      ref={composedRef}
      aria-live="polite"
      aria-atomic="true"
      class={cx("fui-LightboxCounter", props.class)}
    >
      {content()}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Caption
 * -----------------------------------------------------------------------------------------------*/

/** Props for `Lightbox.Caption`. */
interface LightboxCaptionProps
  extends RefProp<HTMLDivElement>,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "ref"> {}

/**
 * Renders the caption for the active item from the registry populated by
 * each `Item`'s `caption` prop. Stays in the DOM (empty) when the active
 * item has no caption.
 *
 * Upstream: `lightbox-caption.tsx` at whopio/frosted-ui commit `56787900bfe0`.
 */
const LightboxCaption: Component<LightboxCaptionProps> = (props) => {
  const context = useLightboxRootContext("Caption");
  const rest = omit(props, "ref", "class");
  const composedRef = composeRefs(props.ref);
  const caption = createMemo(() => {
    // Track the tick: the captions map itself is not reactive.
    context.captionsTick();
    return context.captions.get(context.activeIndex());
  });
  const hasCaption = createMemo(() => caption() !== undefined);
  return (
    <div
      {...rest}
      ref={composedRef}
      aria-live="polite"
      aria-atomic="true"
      class={cx("fui-LightboxCaption", props.class)}
      data-has-caption={hasCaption() ? "" : undefined}
    >
      {caption()}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ThumbnailGroup / Thumbnail
 * -----------------------------------------------------------------------------------------------*/

/** Props for `Lightbox.ThumbnailGroup`. */
interface LightboxThumbnailGroupProps
  extends RefProp<HTMLDivElement>,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "ref"> {
  /** Thumbnail buttons. */
  children?: JSX.Element | undefined;
}

/**
 * Tablist container for thumbnails, with arrow-key navigation between tabs.
 *
 * Upstream: `lightbox-thumbnail-group.tsx` at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const LightboxThumbnailGroup: Component<LightboxThumbnailGroupProps> = (props) => {
  const context = useLightboxRootContext("ThumbnailGroup");
  const rest = omit(props, "ref", "children", "class", "onKeyDown", "onFocus", "onBlur");
  const composedRef = composeRefs(props.ref);
  const [focusWithin, setFocusWithin] = createSignal(false);

  const focusTab = (group: HTMLElement, index: number) => {
    const tab = group.querySelector<HTMLElement>(`[data-index="${index}"]`);
    tab?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent & { currentTarget: HTMLDivElement }) => {
    const count = context.itemCount();
    if (count === 0) {
      return;
    }
    const active = context.activeIndex();
    let next: number | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown": {
        next = (active + 1) % count;
        break;
      }
      case "ArrowLeft":
      case "ArrowUp": {
        next = (active - 1 + count) % count;
        break;
      }
      case "Home": {
        next = 0;
        break;
      }
      case "End": {
        next = count - 1;
        break;
      }
      default: {
        return;
      }
    }
    event.preventDefault();
    context.setActiveIndex(next, "thumbnail");
    focusTab(event.currentTarget, next);
  };

  const onGroupKeyDown = composeEventHandlers(
    (event: KeyboardEvent & { currentTarget: HTMLDivElement }) =>
      callEventHandler(props.onKeyDown, event),
    handleKeyDown,
  );
  const onGroupFocus = composeEventHandlers(
    (event: FocusEvent & { currentTarget: HTMLDivElement }) =>
      callEventHandler(props.onFocus, event),
    () => setFocusWithin(true),
  );
  const onGroupBlur = composeEventHandlers(
    (event: FocusEvent & { currentTarget: HTMLDivElement }) =>
      callEventHandler(props.onBlur, event),
    (event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        setFocusWithin(false);
      }
    },
  );

  return (
    <div
      {...rest}
      ref={composedRef}
      role="tablist"
      class={cx("fui-LightboxThumbnailGroup", props.class)}
      data-focus-within={focusWithin() ? "" : undefined}
      onKeyDown={onGroupKeyDown}
      onFocus={onGroupFocus}
      onBlur={onGroupBlur}
    >
      {props.children}
    </div>
  );
};

const ThumbnailSlot = createSlot<
  HTMLButtonElement,
  JSX.ButtonHTMLAttributes<HTMLButtonElement>
>("Lightbox.Thumbnail");

/** Props for `Lightbox.Thumbnail`. */
interface LightboxThumbnailProps
  extends Omit<LightboxThumbnailOwnProps, "index">,
    RefProp<HTMLButtonElement>,
    Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "ref"> {
  /**
   * Index of the item the thumbnail selects. Defaults to the thumbnail's
   * position among its siblings.
   */
  index?: number | undefined;
  /** The single element that selects the item when activated. */
  children: JSX.Element;
}

/**
 * Tab button selecting an item by thumbnail, with roving tabindex. Merges
 * onto its single child element.
 *
 * Upstream: `lightbox-thumbnail.tsx` at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const LightboxThumbnail: Component<LightboxThumbnailProps> = (props) => {
  const context = useLightboxRootContext("Thumbnail");
  const rest = omit(props, "index", "ref", "children", "class", "onClick");
  let ownNode: HTMLButtonElement | undefined;
  const ownRef: Ref<HTMLButtonElement> = (node) => {
    ownNode = node ?? undefined;
  };
  const thumbnailIndex = createMemo(() => {
    if (props.index !== undefined) {
      return props.index;
    }
    const node = ownNode;
    if (!node?.parentElement) {
      return 0;
    }
    return Array.prototype.indexOf.call(node.parentElement.children, node) as number;
  });
  const selected = createMemo(() => context.activeIndex() === thumbnailIndex());
  const composed = composeRefs(ownRef, props.ref);
  const onThumbnailClick = composeEventHandlers(
    (event: MouseEvent & { currentTarget: HTMLButtonElement }) =>
      callEventHandler(props.onClick, event),
    () => context.setActiveIndex(untrack(thumbnailIndex), "thumbnail"),
  );
  return (
    <ThumbnailSlot
      {...rest}
      ref={composed}
      type="button"
      role="tab"
      aria-selected={ariaBoolean(selected())}
      tabindex={selected() ? 0 : -1}
      data-selected={selected() ? "" : undefined}
      data-active={selected() ? "" : undefined}
      data-index={thumbnailIndex()}
      class={cx("fui-LightboxThumbnail", props.class)}
      onClick={onThumbnailClick}
    >
      {props.children}
    </ThumbnailSlot>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Zoom / ZoomIn / ZoomOut
 * -----------------------------------------------------------------------------------------------*/

/** Zoom state and actions shared with the zoom buttons. */
interface LightboxZoomContextValue {
  /** Current zoom level (1 means no zoom). */
  zoom: Accessor<number>;
  /** Maximum zoom level. */
  maxZoom: Accessor<number>;
  /** Whether zooming in further is possible. */
  canZoomIn: Accessor<boolean>;
  /** Whether zooming out further is possible. */
  canZoomOut: Accessor<boolean>;
  /** Zoom in by one step. */
  zoomIn: () => void;
  /** Zoom out by one step. */
  zoomOut: () => void;
  /** Zoom to an exact level, clamped to the min/max range. */
  zoomTo: (target: number) => void;
  /** Reset zoom to the minimum. */
  reset: () => void;
}

const LightboxZoomContext = createContext<LightboxZoomContextValue>();

/** Read the zoom context, or `undefined` outside a `Zoom`. */
function useOptionalZoomContext(): LightboxZoomContextValue | undefined {
  try {
    return useContext(LightboxZoomContext);
  } catch {
    return undefined;
  }
}

/** Props for `Lightbox.Zoom`. */
interface LightboxZoomProps
  extends LightboxZoomOwnProps,
    RefProp<HTMLDivElement>,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "ref"> {
  /** Zoomable content. */
  children?: JSX.Element | undefined;
  /** Called when the zoom level changes. */
  onZoomChange?: ((zoom: number) => void) | undefined;
}

/**
 * Pannable, zoomable wrapper for the active item. Double-click toggles
 * between minimum and maximum zoom; `+`/`-` step the zoom and `0` resets it.
 *
 * Upstream: `lightbox-zoom.tsx` at whopio/frosted-ui commit `56787900bfe0`.
 * Pinch, wheel zoom, pan, and the zoom animation hooks are not ported.
 */
const LightboxZoom: Component<LightboxZoomProps> = (props) => {
  const context = useLightboxRootContext("Zoom");
  void context;
  const rest = omit(
    props,
    "minZoom",
    "maxZoom",
    "zoomStep",
    "scrollToZoom",
    "wheelSensitivity",
    "keyboardPanDistance",
    "doubleClickMaxStops",
    "doubleClickDelay",
    "animationDuration",
    "wrapperClassName",
    "ref",
    "children",
    "class",
    "onZoomChange",
  );
  const [zoomNode, setZoomNode] = createSignal<HTMLDivElement | undefined>(undefined, {
    ownedWrite: true,
  });
  const captureRef: Ref<HTMLDivElement> = (node) => setZoomNode(node ?? undefined);

  const minZoom = createMemo(() => Number(props.minZoom ?? 1));
  const maxZoom = createMemo(() => Number(props.maxZoom ?? 3));
  const zoomStep = createMemo(() => Number(props.zoomStep ?? 2));
  const [zoom, setZoom] = createSignal(1);

  const applyZoom = (node: HTMLDivElement, scale: number, origin?: string) => {
    node.style.setProperty("transform", `scale(${scale})`);
    if (origin !== undefined) {
      node.style.setProperty("transform-origin", origin);
    }
    node.style.setProperty("transition", "transform 160ms ease-out");
  };

  const zoomTo = (target: number, origin?: string) => {
    const next = Math.min(Math.max(target, untrack(minZoom)), untrack(maxZoom));
    setZoom(next);
    const node = zoomNode();
    if (node) {
      applyZoom(node, next, origin);
    }
    props.onZoomChange?.(next);
  };

  const zoomValue: LightboxZoomContextValue = {
    zoom,
    maxZoom,
    canZoomIn: createMemo(() => zoom() < maxZoom()),
    canZoomOut: createMemo(() => zoom() > minZoom()),
    zoomIn: () => zoomTo(untrack(zoom) + untrack(zoomStep)),
    zoomOut: () => zoomTo(untrack(zoom) - untrack(zoomStep)),
    zoomTo: (target: number) => zoomTo(target),
    reset: () => zoomTo(untrack(minZoom)),
  };

  createEffect(
    () => zoomNode(),
    (node) => {
      if (!node) {
        return;
      }
      const onDoubleClick = (event: globalThis.MouseEvent) => {
        const target =
          event.target instanceof HTMLElement
            ? event.target
            : (event.currentTarget as HTMLElement | null);
        if (!target) {
          return;
        }
        const rect = target.getBoundingClientRect();
        const x = rect.width === 0 ? 50 : ((event.clientX - rect.left) / rect.width) * 100;
        const y = rect.height === 0 ? 50 : ((event.clientY - rect.top) / rect.height) * 100;
        const current = untrack(zoom);
        zoomTo(current > 1 ? untrack(minZoom) : untrack(maxZoom), `${x}% ${y}%`);
      };
      const onKeyDown = (event: globalThis.KeyboardEvent) => {
        if (event.key === "+") {
          zoomValue.zoomIn();
        } else if (event.key === "-") {
          zoomValue.zoomOut();
        } else if (event.key === "0") {
          zoomValue.reset();
        }
      };
      node.addEventListener("dblclick", onDoubleClick);
      node.addEventListener("keydown", onKeyDown);
      return () => {
        node.removeEventListener("dblclick", onDoubleClick);
        node.removeEventListener("keydown", onKeyDown);
      };
    },
  );

  const composed = composeRefs(captureRef, props.ref);

  return (
    <LightboxZoomContext value={zoomValue}>
      <div {...rest} ref={composed} class={cx("fui-LightboxZoom", props.class)}>
        {props.children}
      </div>
    </LightboxZoomContext>
  );
};

const ZoomInSlot = createSlot<
  HTMLButtonElement,
  JSX.ButtonHTMLAttributes<HTMLButtonElement>
>("Lightbox.ZoomIn");
const ZoomOutSlot = createSlot<
  HTMLButtonElement,
  JSX.ButtonHTMLAttributes<HTMLButtonElement>
>("Lightbox.ZoomOut");

/** Props for `Lightbox.ZoomIn` and `Lightbox.ZoomOut`. */
interface LightboxZoomButtonProps
  extends RefProp<HTMLButtonElement>,
    Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "ref"> {
  /** The single element that zooms when activated. */
  children: JSX.Element;
}

/**
 * Zooms in on the active item when activated. Merges onto its single child
 * element. Disabled outside a `Zoom`.
 *
 * Upstream: `lightbox-zoom-in.tsx` at whopio/frosted-ui commit `56787900bfe0`.
 */
const LightboxZoomIn: Component<LightboxZoomButtonProps> = (props) => {
  const context = useLightboxRootContext("ZoomIn");
  void context;
  const zoom = useOptionalZoomContext();
  const rest = omit(props, "ref", "children", "class", "onClick", "aria-label");
  const composedRef = composeRefs(props.ref);
  const disabled = createMemo(() => !zoom || !zoom.canZoomIn());
  const onZoomInClick = composeEventHandlers(
    (event: MouseEvent & { currentTarget: HTMLButtonElement }) =>
      callEventHandler(props.onClick, event),
    () => zoom?.zoomIn(),
  );
  return (
    <ZoomInSlot
      {...rest}
      ref={composedRef}
      type="button"
      aria-label={props["aria-label"] ?? DEFAULT_LABELS.zoomIn}
      disabled={disabled()}
      data-disabled={disabled() ? "" : undefined}
      class={cx("fui-LightboxZoomIn", props.class)}
      onClick={onZoomInClick}
    >
      {props.children}
    </ZoomInSlot>
  );
};

/**
 * Zooms out of the active item when activated. Merges onto its single child
 * element. Disabled outside a `Zoom`.
 *
 * Upstream: `lightbox-zoom-out.tsx` at whopio/frosted-ui commit `56787900bfe0`.
 */
const LightboxZoomOut: Component<LightboxZoomButtonProps> = (props) => {
  const context = useLightboxRootContext("ZoomOut");
  void context;
  const zoom = useOptionalZoomContext();
  const rest = omit(props, "ref", "children", "class", "onClick", "aria-label");
  const composedRef = composeRefs(props.ref);
  const disabled = createMemo(() => !zoom || !zoom.canZoomOut());
  const onZoomOutClick = composeEventHandlers(
    (event: MouseEvent & { currentTarget: HTMLButtonElement }) =>
      callEventHandler(props.onClick, event),
    () => zoom?.zoomOut(),
  );
  return (
    <ZoomOutSlot
      {...rest}
      ref={composedRef}
      type="button"
      aria-label={props["aria-label"] ?? DEFAULT_LABELS.zoomOut}
      disabled={disabled()}
      data-disabled={disabled() ? "" : undefined}
      class={cx("fui-LightboxZoomOut", props.class)}
      onClick={onZoomOutClick}
    >
      {props.children}
    </ZoomOutSlot>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Namespace exports
 * -----------------------------------------------------------------------------------------------*/

/** Frosted styled lightbox namespace, matching the upstream `* as Lightbox`. */
const Lightbox = {
  Root: LightboxRoot,
  Trigger: LightboxTrigger,
  Content: LightboxContent,
  Close: LightboxClose,
  ItemGroup: LightboxItemGroup,
  Item: LightboxItem,
  Previous: LightboxPrevious,
  Next: LightboxNext,
  Counter: LightboxCounter,
  Caption: LightboxCaption,
  ThumbnailGroup: LightboxThumbnailGroup,
  Thumbnail: LightboxThumbnail,
  Zoom: LightboxZoom,
  ZoomIn: LightboxZoomIn,
  ZoomOut: LightboxZoomOut,
};

export {
  Lightbox,
  LightboxRoot,
  LightboxTrigger,
  LightboxContent,
  LightboxClose,
  LightboxItemGroup,
  LightboxItem,
  LightboxPrevious,
  LightboxNext,
  LightboxCounter,
  LightboxCaption,
  LightboxThumbnailGroup,
  LightboxThumbnail,
  LightboxZoom,
  LightboxZoomIn,
  LightboxZoomOut,
};

export type {
  LightboxRootProps,
  LightboxTriggerProps,
  LightboxContentProps,
  LightboxCloseProps,
  LightboxItemGroupProps,
  LightboxItemProps,
  LightboxItemRenderState,
  LightboxNavButtonProps,
  LightboxCounterProps,
  LightboxCounterRenderState,
  LightboxCaptionProps,
  LightboxThumbnailGroupProps,
  LightboxThumbnailProps,
  LightboxZoomProps,
  LightboxZoomButtonProps,
  NavigationSource,
};
