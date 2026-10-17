import {
  createContext as createSolidContext,
  createEffect,
  createSignal,
  omit,
  onCleanup,
  untrack,
  useContext as useSolidContext,
  type Component,
} from "solid-js";
import { composeEventHandlers, dispatchDiscreteCustomEvent } from "@soldix/primitive";
import { Primitive, type PrimitivePropsWithRef } from "@soldix/primitive";
import { afterConnected, useComposedRefs } from "@soldix/compose-refs";
import { useCallbackRef } from "@soldix/use-callback-ref";

/* -------------------------------------------------------------------------------------------------
 * DismissableLayer
 * -----------------------------------------------------------------------------------------------*/
const CONTEXT_UPDATE = "dismissableLayer.update";
const POINTER_DOWN_OUTSIDE = "dismissableLayer.pointerDownOutside";
const FOCUS_OUTSIDE = "dismissableLayer.focusOutside";

let originalBodyPointerEvents: string;
let bodyPointerEventsApplied = false;

type DismissableLayerElement = HTMLDivElement;
type DismissableLayerBranchElement = HTMLDivElement;

interface DismissableLayerContextValue {
  layers: Set<DismissableLayerElement>;
  layersWithOutsidePointerEventsDisabled: Set<DismissableLayerElement>;
  branches: Set<DismissableLayerBranchElement>;

  // Outside elements that belong to a layer's own dismiss affordance (eg, a
  // dialog overlay). Pressing them should dismiss the layer regardless of
  // whether or not they stop propagation.
  //
  // See https://github.com/radix-ui/primitives/issues/3346
  dismissableSurfaces: Set<DismissableLayerBranchElement>;
}

const DismissableLayerContext = createSolidContext<DismissableLayerContextValue>({
  layers: new Set<DismissableLayerElement>(),
  layersWithOutsidePointerEventsDisabled: new Set<DismissableLayerElement>(),
  branches: new Set<DismissableLayerBranchElement>(),
  dismissableSurfaces: new Set<DismissableLayerBranchElement>(),
});

type DismissableLayerProps = PrimitivePropsWithRef<"div"> & {
  /**
   * When `true`, hover/focus/click interactions will be disabled on elements outside
   * the `DismissableLayer`. Users will need to click twice on outside elements to
   * interact with them: once to close the `DismissableLayer`, and again to trigger the element.
   */
  disableOutsidePointerEvents?: boolean | undefined;
  /**
   * When `true`, a `'pointerdown'` event outside of the layered element will
   * wait for the interaction's click event before dispatching, allowing
   * third-party code to stop propagation of later events and cancel dismissal.
   */
  deferPointerDownOutside?: boolean | undefined;
  /**
   * Event handler called when the escape key is down.
   * Can be prevented.
   */
  onEscapeKeyDown?: { bivarianceHack(event: KeyboardEvent): void }["bivarianceHack"] | undefined;
  /**
   * Event handler called when the a `pointerdown` event happens outside of the `DismissableLayer`.
   * Can be prevented.
   */
  onPointerDownOutside?:
    | { bivarianceHack(event: PointerDownOutsideEvent): void }["bivarianceHack"]
    | undefined;
  /**
   * Event handler called when the focus moves outside of the `DismissableLayer`.
   * Can be prevented.
   */
  onFocusOutside?: { bivarianceHack(event: FocusOutsideEvent): void }["bivarianceHack"] | undefined;
  /**
   * Event handler called when an interaction happens outside the `DismissableLayer`.
   * Specifically, when a `pointerdown` event happens outside or focus moves outside of it.
   * Can be prevented.
   */
  onInteractOutside?:
    | { bivarianceHack(event: PointerDownOutsideEvent | FocusOutsideEvent): void }["bivarianceHack"]
    | undefined;
  /**
   * Handler called when the `DismissableLayer` should be dismissed
   */
  onDismiss?: (() => void) | undefined;
  /**
   * Capture-phase focus handler on the layer node (the Solid equivalent of
   * React's `onFocusCapture`, which Solid JSX does not provide).
   */
  onFocusCapture?: ((event: FocusEvent) => void) | undefined;
  /**
   * Capture-phase blur handler on the layer node.
   */
  onBlurCapture?: ((event: FocusEvent) => void) | undefined;
  /**
   * Capture-phase pointerdown handler on the layer node.
   */
  onPointerDownCapture?: ((event: PointerEvent) => void) | undefined;
};

const DismissableLayer: Component<DismissableLayerProps> = (props) => {
  const rest = omit(
    props,
    "disableOutsidePointerEvents",
    "deferPointerDownOutside",
    "onEscapeKeyDown",
    "onPointerDownOutside",
    "onFocusOutside",
    "onInteractOutside",
    "onDismiss",
    "onFocusCapture",
    "onBlurCapture",
    "onPointerDownCapture",
    "children",
    "ref",
  );
  const context = useSolidContext(DismissableLayerContext);
  const [node, setNode] = createSignal<DismissableLayerElement | null>(null);
  // Solid JSX has no `onXCapture` props, so capture listeners are attached
  // manually and composed with the user's capture handlers. They attach in
  // the ref callback — synchronously with element creation, like Radix's JSX
  // props — so the inside/outside flag is always correct before any effect
  // (eg. `FocusScope` autofocus) can move focus. Attaching in an effect races:
  // autofocus effects can run before the node signal propagates.
  // NOTE: `focusOutside`/`pointerDownOutside` are defined below; these
  // composed handlers only run on events, after setup completes.
  const handleFocusCapture = composeEventHandlers(
    (event: FocusEvent) => props.onFocusCapture?.(event),
    () => focusOutside.onFocusCapture(),
  );
  const handleBlurCapture = composeEventHandlers(
    (event: FocusEvent) => props.onBlurCapture?.(event),
    () => focusOutside.onBlurCapture(),
  );
  const handlePointerDownCapture = composeEventHandlers(
    (event: PointerEvent) => props.onPointerDownCapture?.(event),
    () => pointerDownOutside.onPointerDownCapture(),
  );
  let captureNode: DismissableLayerElement | null = null;
  const attachCaptureListeners = (next: DismissableLayerElement | null) => {
    if (captureNode === next) return;
    if (captureNode) {
      captureNode.removeEventListener("focus", handleFocusCapture as EventListener, true);
      captureNode.removeEventListener("blur", handleBlurCapture as EventListener, true);
      captureNode.removeEventListener(
        "pointerdown",
        handlePointerDownCapture as EventListener,
        true,
      );
    }
    captureNode = next;
    if (captureNode) {
      captureNode.addEventListener("focus", handleFocusCapture as EventListener, true);
      captureNode.addEventListener("blur", handleBlurCapture as EventListener, true);
      captureNode.addEventListener("pointerdown", handlePointerDownCapture as EventListener, true);
    }
  };
  const composedRefs = useComposedRefs(props.ref, (next: DismissableLayerElement | null) => {
    attachCaptureListeners(next);
    setNode(() => next);
  });
  onCleanup(() => attachCaptureListeners(null));

  // Layer sets mutate without signals; mirror Radix's `force({})` re-render
  // with a version counter that computations read to stay subscribed.
  const [version, setVersion] = createSignal(0);
  if (typeof document !== "undefined") {
    const handleUpdate = () => setVersion((v) => v + 1);
    document.addEventListener(CONTEXT_UPDATE, handleUpdate);
    onCleanup(() => document.removeEventListener(CONTEXT_UPDATE, handleUpdate));
  }

  const ownerDocument = () => node()?.ownerDocument ?? globalThis?.document;
  const layers = () => {
    version();
    return Array.from(context.layers);
  };
  const highestDisabledLayer = () => {
    version();
    return [...context.layersWithOutsidePointerEventsDisabled].slice(-1)[0];
  };
  // Apply the override before the effect disables `body` pointer-events so
  // the layer is never painted while inheriting `none`
  //
  // See https://github.com/radix-ui/primitives/issues/4093
  const isBodyPointerEventsDisabled = () =>
    context.layersWithOutsidePointerEventsDisabled.size > 0 ||
    (props.disableOutsidePointerEvents ?? false);
  const isPointerEventsEnabled = () => {
    const all = layers();
    const highest = highestDisabledLayer();
    const highestIndex = highest ? all.indexOf(highest) : -1;
    const current = node();
    const index = current ? all.indexOf(current) : -1;
    return index >= highestIndex;
  };
  const isHighestLayer = () => {
    const current = node();
    return current ? layers().indexOf(current) === layers().length - 1 : false;
  };
  const isDeferredPointerDownOutsideRef = { current: false };

  const pointerDownOutside = usePointerDownOutside(
    (event) => {
      props.onPointerDownOutside?.(event);
      props.onInteractOutside?.(event);
      if (!event.defaultPrevented) props.onDismiss?.();
    },
    {
      ownerDocument,
      layerNode: node,
      deferPointerDownOutside: () => props.deferPointerDownOutside ?? false,
      isDeferredPointerDownOutsideRef,
      dismissableSurfaces: context.dismissableSurfaces,
      shouldHandlePointerDownOutside: (target: EventTarget | null) => {
        if (!(target instanceof Node)) {
          return false;
        }
        const isPointerDownOnBranch = [...context.branches].some((branch) =>
          branch.contains(target),
        );
        return untrack(isPointerEventsEnabled) && !isPointerDownOnBranch;
      },
    },
  );

  const focusOutside = useFocusOutside(
    (event) => {
      if ((props.deferPointerDownOutside ?? false) && isDeferredPointerDownOutsideRef.current) {
        return;
      }
      const target = event.target as HTMLElement;
      const isFocusInBranch = [...context.branches].some((branch) => branch.contains(target));
      if (isFocusInBranch) return;
      props.onFocusOutside?.(event);
      props.onInteractOutside?.(event);
      if (!event.defaultPrevented) props.onDismiss?.();
    },
    ownerDocument,
    node,
  );

  const handleKeyDown = useCallbackRef((event: KeyboardEvent) => {
    if (event.key !== "Escape") {
      return;
    }

    // An Escape pressed while an IME composition is open cancels the composition or the
    // conversion, so it belongs to the input method, not to the layer. On macOS it arrives
    // with the real key: Chromium sends `key: "Escape"` with `isComposing: true` and
    // `keyCode: 229`, and Safari sends it after `compositionend` with `isComposing: false`
    // and `keyCode: 229`, so the key alone does not tell them apart.
    if (event.isComposing || event.keyCode === 229) {
      return;
    }

    props.onEscapeKeyDown?.(event);
    if (!event.defaultPrevented && props.onDismiss) {
      event.preventDefault();
      props.onDismiss();
    }
  });

  createEffect(
    () => ({ document: ownerDocument(), highest: isHighestLayer(), layer: node() }),
    ({ document, highest, layer }) => {
      if (!highest || !document) return;
      // Wait for insertion when needed: a pre-insertion `ownerDocument` may be a
      // detached template document. Re-read once connected so the listener lands
      // on the layer's real document.
      return afterConnected(layer, () => {
        const target = layer?.ownerDocument ?? globalThis?.document;
        if (!target) return;
        target.addEventListener("keydown", handleKeyDown, { capture: true });
        return () => target.removeEventListener("keydown", handleKeyDown, { capture: true });
      });
    },
  );

  createEffect(
    () => ({
      current: node(),
      document: ownerDocument(),
      disabled: props.disableOutsidePointerEvents ?? false,
    }),
    ({ current, document, disabled }) => {
      if (!current || !document) return;
      const target = current;
      // Layer registration stays synchronous (insertion-agnostic ordering), but the
      // `body` lock needs a connected node: pre-insertion `ownerDocument` may be a
      // detached template document without a `body`.
      let cancelWait: (() => void) | undefined;
      if (disabled) {
        if (context.layersWithOutsidePointerEventsDisabled.size === 0) {
          cancelWait = afterConnected(target, () => {
            const body = target.ownerDocument.body;
            if (!body) return;
            originalBodyPointerEvents = body.style.pointerEvents;
            body.style.pointerEvents = "none";
            bodyPointerEventsApplied = true;
          });
        }
        context.layersWithOutsidePointerEventsDisabled.add(target);
      }
      context.layers.add(target);
      dispatchUpdate();
      return () => {
        cancelWait?.();
        // We must remove this layer from the disabled set whenever
        // `disableOutsidePointerEvents` becomes `false` (eg, when a modal
        // closes but stays mounted during an exit animation) and not only on
        // unmount. Otherwise the `body` `pointer-events` could be left as
        // `none` when multiple layers overlap.
        // See: https://github.com/radix-ui/primitives/issues/3645
        if (disabled) {
          context.layersWithOutsidePointerEventsDisabled.delete(target);
          if (
            bodyPointerEventsApplied &&
            context.layersWithOutsidePointerEventsDisabled.size === 0
          ) {
            bodyPointerEventsApplied = false;
            const body = target.ownerDocument.body;
            if (body) {
              body.style.pointerEvents = originalBodyPointerEvents;
            }
          }
        }
      };
    },
  );

  /**
   * We purposefully prevent combining this cleanup with the `disableOutsidePointerEvents` effect
   * because a change to `disableOutsidePointerEvents` would remove this layer from the stack
   * and add it to the end again so the layering order wouldn't be _creation order_.
   * We only want them to be removed from context stacks when unmounted.
   */
  onCleanup(() => {
    const current = node();
    if (!current) return;
    context.layers.delete(current);
    context.layersWithOutsidePointerEventsDisabled.delete(current);
    dispatchUpdate();
  });

  return (
    <Primitive.div
      {...rest}
      ref={composedRefs}
      style={(() => {
        const disabled = isBodyPointerEventsDisabled();
        const enabled = isPointerEventsEnabled();
        const pointerEvents = disabled ? (enabled ? "auto" : "none") : undefined;
        const user = props.style;
        if (typeof user === "string") {
          return user + (pointerEvents ? `;pointer-events:${pointerEvents}` : "");
        }
        return { "pointer-events": pointerEvents, ...user };
      })()}
    >
      {props.children}
    </Primitive.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DismissableLayerBranch
 * -----------------------------------------------------------------------------------------------*/

type DismissableLayerBranchProps = PrimitivePropsWithRef<"div">;

const DismissableLayerBranch: Component<DismissableLayerBranchProps> = (props) => {
  const rest = omit(props, "children", "ref");
  const context = useSolidContext(DismissableLayerContext);
  const [node, setNode] = createSignal<DismissableLayerBranchElement | null>(null);
  const composedRefs = useComposedRefs(props.ref, (next: DismissableLayerBranchElement | null) =>
    setNode(() => next),
  );

  createEffect(
    () => node(),
    (current) => {
      if (!current) return;
      context.branches.add(current);
      return () => {
        context.branches.delete(current);
      };
    },
  );

  return (
    <Primitive.div {...rest} ref={composedRefs}>
      {props.children}
    </Primitive.div>
  );
};

/* -----------------------------------------------------------------------------------------------*/

const NOOP_CLICK_LISTENER_FOR_IOS_SAFARI_TAPS = () => {};

/**
 * Registers a node as a "dismiss surface" for the enclosing DismissableLayer
 *
 * @internal
 */
function useDismissableLayerSurface(): (node: DismissableLayerBranchElement | null) => void {
  const context = useSolidContext(DismissableLayerContext);
  const [node, setNode] = createSignal<DismissableLayerBranchElement | null>(null);

  createEffect(
    () => node(),
    (current) => {
      if (!current) return;
      context.dismissableSurfaces.add(current);
      current.addEventListener("click", NOOP_CLICK_LISTENER_FOR_IOS_SAFARI_TAPS);
      return () => {
        context.dismissableSurfaces.delete(current);
        current.removeEventListener("click", NOOP_CLICK_LISTENER_FOR_IOS_SAFARI_TAPS);
      };
    },
  );

  return (next) => setNode(() => next);
}

type PointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;
type FocusOutsideEvent = CustomEvent<{ originalEvent: FocusEvent }>;

const IS_TRUE = () => true;

/**
 * Listens for `pointerdown` outside a Solid subtree. We detect the start of the interaction on
 * `pointerdown`, then wait for `click` so external code can intercept later mouse events.
 * Returns props to pass to the node we want to check for outside events.
 */
function usePointerDownOutside(
  onPointerDownOutside: ((event: PointerDownOutsideEvent) => void) | undefined,
  args: {
    ownerDocument: Document | undefined | (() => Document | undefined);
    layerNode: () => Element | null;
    deferPointerDownOutside: boolean | (() => boolean);
    isDeferredPointerDownOutsideRef: { current: boolean };
    dismissableSurfaces: Set<DismissableLayerBranchElement>;
    shouldHandlePointerDownOutside?:
      | { bivarianceHack(target: EventTarget | null): boolean }["bivarianceHack"]
      | undefined;
  },
) {
  const {
    ownerDocument: ownerDocumentOption = globalThis?.document,
    layerNode,
    deferPointerDownOutside: deferOption = false,
    isDeferredPointerDownOutsideRef,
    dismissableSurfaces,
    shouldHandlePointerDownOutside = IS_TRUE,
  } = args;
  const getOwnerDocument =
    typeof ownerDocumentOption === "function"
      ? (ownerDocumentOption as () => Document | undefined)
      : () => ownerDocumentOption;
  const getDefer = typeof deferOption === "function" ? deferOption : () => deferOption;
  const handlePointerDownOutside = useCallbackRef(onPointerDownOutside) as EventListener;
  let isPointerInsideTree = false;
  let isPointerDownOutside = false;
  const interceptedOutsideInteractionEvents = new Map<string, boolean>();
  let handleClickRef: (event: Event) => void = (_event: Event) => {};

  createEffect(
    () => ({ document: getOwnerDocument(), defer: getDefer(), layer: layerNode() }),
    ({ document: currentDocument, defer: deferPointerDownOutside, layer }) => {
      if (!currentDocument) return;
      let doc = currentDocument;
      let isListening = true;
      const timers = new Set<number>();
      function resetOutsideInteraction() {
        isPointerDownOutside = false;
        isDeferredPointerDownOutsideRef.current = false;
        interceptedOutsideInteractionEvents.clear();
      }

      function isOutsideInteractionIntercepted() {
        return Array.from(interceptedOutsideInteractionEvents.values()).some(Boolean);
      }

      function handleInteractionCapture(event: Event) {
        if (!isPointerDownOutside) {
          return;
        }

        const target = event.target;
        const isDismissableSurface =
          target instanceof Node &&
          [...dismissableSurfaces].some((surface) => surface.contains(target as Node));

        if (!isDismissableSurface) {
          interceptedOutsideInteractionEvents.set(event.type, true);
        }

        if (event.type === "click") {
          const timerId = window.setTimeout(() => {
            timers.delete(timerId);
            if (isPointerDownOutside) {
              handleClickRef(event);
            }
          }, 0);
          timers.add(timerId);
        }
      }

      function handleInteractionBubble(event: Event) {
        if (isPointerDownOutside) {
          interceptedOutsideInteractionEvents.set(event.type, false);
        }
      }

      const handlePointerDown = (event: PointerEvent) => {
        if (event.target && !isPointerInsideTree) {
          if (!shouldHandlePointerDownOutside(event.target)) {
            doc.removeEventListener("click", handleClickRef);
            resetOutsideInteraction();
            isPointerInsideTree = false;
            return;
          }

          const eventDetail = { originalEvent: event };
          isPointerDownOutside = true;
          isDeferredPointerDownOutsideRef.current = deferPointerDownOutside && event.button === 0;
          interceptedOutsideInteractionEvents.clear();

          function handleAndDispatchPointerDownOutsideEvent() {
            doc.removeEventListener("click", handleClickRef);
            const wasOutsideInteractionIntercepted = isOutsideInteractionIntercepted();
            resetOutsideInteraction();

            if (!wasOutsideInteractionIntercepted) {
              handleAndDispatchCustomEvent(
                POINTER_DOWN_OUTSIDE,
                handlePointerDownOutside,
                eventDetail,
                { discrete: true },
              );
            }
          }

          /**
           * When deferring, we need to wait for a click event because:
           *
           * 1. On touch devices, browsers implement a ~350ms delay between the
           *    time the user stops touching the display and when the browser
           *    executes events. We need to ensure we don't reactivate
           *    pointer-events within this timeframe otherwise the browser may
           *    execute events that should have been prevented.
           *
           * 2. Browser extensions and other third-party code may call
           *    `stopPropagation` on later mouse events like `mousedown`,
           *    `mouseup`, or `click`. Waiting lets those intercepted events
           *    cancel the outside interaction before we dismiss the layer. See
           *    https://github.com/radix-ui/primitives/issues/2055
           *
           * Additionally, this also lets us deal automatically with cancellations
           * when a click event isn't raised because the page was considered
           * scrolled/drag-scrolled, long-pressed, etc.
           *
           * This is why we also continuously remove the previous listener,
           * because we cannot be certain that it was raised, and therefore
           * cleaned-up.
           *
           * For non-primary buttons, we dispatch the event immediately because we
           * cannot be certain that the event was canceled.
           */
          if (!deferPointerDownOutside || event.button !== 0) {
            handleAndDispatchPointerDownOutsideEvent();
          } else {
            doc.removeEventListener("click", handleClickRef);
            handleClickRef = (event: Event) => {
              if (event.isTrusted) {
                handleAndDispatchPointerDownOutsideEvent();
                return;
              }

              // Programmatic clicks can fire during a commit, where
              // flushing is not allowed.
              // See https://github.com/radix-ui/primitives/issues/4121
              queueMicrotask(() => {
                if (isListening && isPointerDownOutside) {
                  handleAndDispatchPointerDownOutsideEvent();
                }
              });
            };
            doc.addEventListener("click", handleClickRef, { once: true });
          }
        } else {
          // We need to remove the event listener in case the outside click has been canceled.
          // See: https://github.com/radix-ui/primitives/issues/2171
          doc.removeEventListener("click", handleClickRef);
          resetOutsideInteraction();
        }
        isPointerInsideTree = false;
      };

      const outsideInteractionEvents = [
        "pointerup",
        "mousedown",
        "mouseup",
        "touchstart",
        "touchend",
        "click",
      ];

      // Listeners must land on the adopted document: a pre-insertion
      // `ownerDocument` may be a detached template document. `doc` is re-read once
      // connected so handlers and cleanup target the same document the listeners use.
      const cancelWait = afterConnected(layer, () => {
        doc = layer?.ownerDocument ?? currentDocument;
        for (const eventName of outsideInteractionEvents) {
          doc.addEventListener(eventName, handleInteractionCapture, true);
          doc.addEventListener(eventName, handleInteractionBubble);
        }

        /**
         * if this hook executes in a component that mounts via a `pointerdown` event, the event
         * would bubble up to the document and trigger a `pointerDownOutside` event. We avoid
         * this by delaying the event listener registration on the document.
         * This is not Solid specific, but rather how the DOM works, ie:
         * ```
         * button.addEventListener('pointerdown', () => {
         *   console.log('I will log');
         *   document.addEventListener('pointerdown', () => {
         *     console.log('I will also log');
         *   })
         * });
         */
        const timerId = window.setTimeout(() => {
          timers.delete(timerId);
          doc.addEventListener("pointerdown", handlePointerDown);
        }, 0);
        timers.add(timerId);
      });
      return () => {
        cancelWait();
        isListening = false;
        resetOutsideInteraction();
        for (const timer of timers) {
          window.clearTimeout(timer);
        }
        doc.removeEventListener("pointerdown", handlePointerDown);
        doc.removeEventListener("click", handleClickRef);
        for (const eventName of outsideInteractionEvents) {
          doc.removeEventListener(eventName, handleInteractionCapture, true);
          doc.removeEventListener(eventName, handleInteractionBubble);
        }
      };
    },
  );

  return {
    // ensures we check the Solid component tree (not just DOM tree)
    onPointerDownCapture: () => (isPointerInsideTree = true),
  };
}

/**
 * Listens for when focus happens outside a Solid subtree.
 * Returns props to pass to the root (node) of the subtree we want to check.
 */
function useFocusOutside(
  onFocusOutside: ((event: FocusOutsideEvent) => void) | undefined,
  ownerDocument: Document | undefined | (() => Document | undefined) = globalThis?.document,
  layerNode: () => Element | null = () => null,
) {
  const handleFocusOutside = useCallbackRef(onFocusOutside) as EventListener;
  let isFocusInsideTree = false;
  const getOwnerDocument =
    typeof ownerDocument === "function"
      ? (ownerDocument as () => Document | undefined)
      : () => ownerDocument;

  createEffect(
    () => ({ document: getOwnerDocument(), layer: layerNode() }),
    ({ document: doc, layer }) => {
      if (!doc) return;
      const handleFocus = (event: FocusEvent) => {
        if (event.target && !isFocusInsideTree) {
          const eventDetail = { originalEvent: event };
          handleAndDispatchCustomEvent(FOCUS_OUTSIDE, handleFocusOutside, eventDetail, {
            discrete: false,
          });
        }
      };
      // The listener must land on the adopted document (see usePointerDownOutside).
      return afterConnected(layer, () => {
        const target = layer?.ownerDocument ?? doc;
        target.addEventListener("focusin", handleFocus);
        return () => target.removeEventListener("focusin", handleFocus);
      });
    },
  );

  return {
    onFocusCapture: () => (isFocusInsideTree = true),
    onBlurCapture: () => (isFocusInsideTree = false),
  };
}

function dispatchUpdate() {
  if (typeof document === "undefined") return;
  const event = new CustomEvent(CONTEXT_UPDATE);
  document.dispatchEvent(event);
}

function handleAndDispatchCustomEvent<E extends CustomEvent, OriginalEvent extends Event>(
  name: string,
  handler: ((event: E) => void) | undefined,
  detail: { originalEvent: OriginalEvent } & (E extends CustomEvent<infer D> ? D : never),
  { discrete }: { discrete: boolean },
) {
  const target = detail.originalEvent.target;
  const event = new CustomEvent(name, { bubbles: false, cancelable: true, detail });
  if (handler)
    (target as EventTarget).addEventListener(name, handler as EventListener, { once: true });

  if (discrete) {
    dispatchDiscreteCustomEvent(target, event);
  } else {
    (target as EventTarget).dispatchEvent(event);
  }
}

export {
  DismissableLayer,
  DismissableLayerBranch,
  useDismissableLayerSurface,
  //
  DismissableLayer as Root,
  DismissableLayerBranch as Branch,
};
export type { DismissableLayerProps };
