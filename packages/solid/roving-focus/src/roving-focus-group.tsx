import { createEffect, createSignal, omit, onSettled, untrack, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { callEventHandler, composeEventHandlers } from "@solidix/primitive";
import { createCollection } from "@solidix/collection";
import { useComposedRefs } from "@solidix/compose-refs";
import { createContextScope, type Scope } from "@solidix/context";
import { useId } from "@solidix/id";
import { Primitive, type PrimitivePropsWithRef } from "@solidix/primitive";
import { useCallbackRef } from "@solidix/use-callback-ref";
import { useControllableState } from "@solidix/use-controllable-state";
import { useDirection } from "@solidix/direction";
import { useIsHydrated } from "@solidix/use-is-hydrated";

const ENTRY_FOCUS = "rovingFocusGroup.onEntryFocus";
const EVENT_OPTIONS = { bubbles: false, cancelable: true };

/* -------------------------------------------------------------------------------------------------
 * RovingFocusGroup
 * -----------------------------------------------------------------------------------------------*/

const GROUP_NAME = "RovingFocusGroup";

type ItemData = { id: string; focusable: boolean; active: boolean };
const [Collection, useCollection, createCollectionScope] = createCollection<
  HTMLSpanElement,
  ItemData
>(GROUP_NAME);

type ScopedProps<P> = P & { __scopeRovingFocusGroup?: Scope | undefined };
const [createRovingFocusGroupContext, createRovingFocusGroupScope] = createContextScope(
  GROUP_NAME,
  [createCollectionScope],
);

const Orientation = {
  Vertical: "vertical",
  Horizontal: "horizontal",
} as const;

const Direction = {
  LTR: "ltr",
  RTL: "rtl",
} as const;

type Orientation = (typeof Orientation)[keyof typeof Orientation];
type Direction = (typeof Direction)[keyof typeof Direction];

interface RovingFocusGroupOptions {
  /**
   * The orientation of the group.
   * Mainly so arrow navigation is done accordingly (left & right vs. up & down)
   */
  orientation?: Orientation | undefined;
  /**
   * The direction of navigation between items.
   */
  dir?: Direction | undefined;
  /**
   * Whether keyboard navigation should loop around
   * @defaultValue false
   */
  loop?: boolean | undefined;
}

type RovingContextValue = RovingFocusGroupOptions & {
  currentTabStopId: () => string | null;
  onItemFocus(tabStopId: string): void;
  onItemShiftTab(): void;
  onFocusableItemAdd(): void;
  onFocusableItemRemove(): void;
};

const [RovingFocusProvider, useRovingFocusContext] =
  createRovingFocusGroupContext<RovingContextValue>(GROUP_NAME);

type RovingFocusGroupElement = HTMLDivElement;
interface RovingFocusGroupProps extends RovingFocusGroupImplProps {}

const RovingFocusGroup: Component<ScopedProps<RovingFocusGroupProps>> = (props) => {
  return (
    <Collection.Provider scope={props.__scopeRovingFocusGroup}>
      <Collection.Slot scope={props.__scopeRovingFocusGroup}>
        <RovingFocusGroupImpl {...props} />
      </Collection.Slot>
    </Collection.Provider>
  );
};

/* -----------------------------------------------------------------------------------------------*/

interface RovingFocusGroupImplProps
  extends Omit<PrimitivePropsWithRef<"div">, "dir">, RovingFocusGroupOptions {
  currentTabStopId?: string | null | undefined;
  defaultCurrentTabStopId?: string | undefined;
  onCurrentTabStopIdChange?:
    | { bivarianceHack(tabStopId: string | null): void }["bivarianceHack"]
    | undefined;
  onEntryFocus?: { bivarianceHack(event: Event): void }["bivarianceHack"] | undefined;
  preventScrollOnEntryFocus?: boolean | undefined;
}

const RovingFocusGroupImpl: Component<ScopedProps<RovingFocusGroupImplProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeRovingFocusGroup",
    "orientation",
    "loop",
    "dir",
    "currentTabStopId",
    "defaultCurrentTabStopId",
    "onCurrentTabStopIdChange",
    "onEntryFocus",
    "preventScrollOnEntryFocus",
    "children",
    "ref",
    "style",
    "onMouseDown",
    "onFocus",
    "onBlur",
  );
  const refObject = { current: null as RovingFocusGroupElement | null };
  const composedRefs = useComposedRefs(props.ref, refObject);
  const direction = useDirection(props.dir);
  const [currentTabStopId, setCurrentTabStopId] = useControllableState<string | null>({
    prop: () => props.currentTabStopId,
    defaultProp: props.defaultCurrentTabStopId ?? null,
    onChange: props.onCurrentTabStopIdChange,
    caller: GROUP_NAME,
  });
  const [isTabbingBackOut, setIsTabbingBackOut] = createSignal(false);
  const handleEntryFocus = useCallbackRef((event: Event) =>
    callEventHandler(props.onEntryFocus, event),
  );
  const getItems = useCollection(props.__scopeRovingFocusGroup);
  let isClickFocus = false;
  const [focusableItemsCount, setFocusableItemsCount] = createSignal(0);

  onSettled(() => {
    const node = refObject.current;
    if (node) {
      node.addEventListener(ENTRY_FOCUS, handleEntryFocus as EventListener);
      return () => node.removeEventListener(ENTRY_FOCUS, handleEntryFocus as EventListener);
    }
  });

  const handleMouseDown = composeEventHandlers(
    (event: MouseEvent) => callEventHandler(props.onMouseDown, event),
    () => {
      isClickFocus = true;
    },
  );
  const handleFocus = composeEventHandlers(
    (event: FocusEvent) => callEventHandler(props.onFocus, event),
    (event) => {
      // We normally wouldn't need this check, because we already check
      // that the focus is on the current target and not bubbling to it.
      // We do this because Safari doesn't focus buttons when clicked, and
      // instead, the wrapper will get focused and not through a bubbling event.
      const isKeyboardFocus = !isClickFocus;

      if (event.target === event.currentTarget && isKeyboardFocus && !untrack(isTabbingBackOut)) {
        const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS);
        event.currentTarget!.dispatchEvent(entryFocusEvent);

        if (!entryFocusEvent.defaultPrevented) {
          const items = getItems().filter((item) => item.focusable);
          const activeItem = items.find((item) => item.active);
          const currentItem = items.find((item) => item.id === currentTabStopId());
          const candidateItems = [activeItem, currentItem, ...items].filter(
            Boolean,
          ) as typeof items;
          const candidateNodes = candidateItems.map((item) => item.ref.current!);
          focusFirst(candidateNodes, props.preventScrollOnEntryFocus ?? false);
        }
      }

      isClickFocus = false;
    },
  );
  const handleBlur = composeEventHandlers(
    (event: FocusEvent) => callEventHandler(props.onBlur, event),
    () => setIsTabbingBackOut(false),
  );

  return (
    <RovingFocusProvider
      scope={props.__scopeRovingFocusGroup}
      orientation={props.orientation}
      dir={direction}
      loop={props.loop ?? false}
      currentTabStopId={currentTabStopId}
      onItemFocus={(tabStopId) => setCurrentTabStopId(tabStopId)}
      onItemShiftTab={() => setIsTabbingBackOut(true)}
      onFocusableItemAdd={() => setFocusableItemsCount((prevCount) => prevCount + 1)}
      onFocusableItemRemove={() => setFocusableItemsCount((prevCount) => prevCount - 1)}
    >
      <Primitive.div
        tabindex={isTabbingBackOut() || focusableItemsCount() === 0 ? -1 : 0}
        data-orientation={props.orientation}
        {...rest}
        ref={composedRefs}
        style={(() => {
          const user = props.style;
          if (typeof user === "string") return `outline:none;${user}`;
          return { outline: "none", ...user };
        })()}
        onMouseDown={handleMouseDown as (event: MouseEvent) => void}
        onFocus={handleFocus as (event: FocusEvent) => void}
        onBlur={handleBlur as (event: FocusEvent) => void}
      >
        {props.children}
      </Primitive.div>
    </RovingFocusProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * RovingFocusGroupItem
 * -----------------------------------------------------------------------------------------------*/

const ITEM_NAME = "RovingFocusGroupItem";

interface RovingFocusItemProps extends Omit<PrimitivePropsWithRef<"span">, "children"> {
  tabStopId?: string | undefined;
  focusable?: boolean | undefined;
  active?: boolean | undefined;
  children?:
    | JSX.Element
    | ((props: { hasTabStop: () => boolean; isCurrentTabStop: () => boolean }) => JSX.Element)
    | undefined;
}

const RovingFocusGroupItem: Component<ScopedProps<RovingFocusItemProps>> = (props) => {
  const rest = omit(
    props,
    "__scopeRovingFocusGroup",
    "focusable",
    "active",
    "tabStopId",
    "children",
    "ref",
    "onMouseDown",
    "onFocus",
    "onKeyDown",
  );
  const autoId = useId();
  const id = () => props.tabStopId || autoId;
  const context = useRovingFocusContext(ITEM_NAME, props.__scopeRovingFocusGroup);
  const getItems = useCollection(props.__scopeRovingFocusGroup);
  const isHydrated = useIsHydrated();

  // Registering focusable items drives the group's tab stop
  // (`tabIndex={focusableItemsCount === 0 ? -1 : 0}`). Registration runs in an
  // effect; unlike Radix there is no separate layout/passive split because
  // Solid has no mid-hydration re-render hazard of that kind.
  createEffect(
    () => ({ hydrated: isHydrated(), focusable: props.focusable ?? true }),
    ({ hydrated, focusable }) => {
      if (!hydrated || !focusable) return;
      context.onFocusableItemAdd();
      return () => context.onFocusableItemRemove();
    },
  );

  const handleMouseDown = composeEventHandlers(
    (event: MouseEvent) => callEventHandler(props.onMouseDown, event),
    (event) => {
      const focusable = props.focusable ?? true;
      // We prevent focusing non-focusable items on `mousedown`.
      // Even though the item has tabIndex={-1}, that only means take it out of the tab order.
      if (!focusable) event.preventDefault();
      // Safari doesn't focus a button when clicked so we run our logic on mousedown also
      else context.onItemFocus(id());
    },
  );
  const handleFocus = composeEventHandlers(
    (event: FocusEvent) => callEventHandler(props.onFocus, event),
    () => context.onItemFocus(id()),
  );
  const handleKeyDown = composeEventHandlers(
    (event: KeyboardEvent) => callEventHandler(props.onKeyDown, event),
    (event) => {
      if (event.key === "Tab" && event.shiftKey) {
        context.onItemShiftTab();
        return;
      }

      if (event.target !== event.currentTarget) return;

      const focusIntent = getFocusIntent(event, context.orientation, context.dir);

      if (focusIntent !== undefined) {
        if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
        event.preventDefault();
        const items = getItems().filter((item) => item.focusable);
        let candidateNodes = items.map((item) => item.ref.current!);

        if (focusIntent === "last") candidateNodes.reverse();
        else if (focusIntent === "prev" || focusIntent === "next") {
          if (focusIntent === "prev") candidateNodes.reverse();
          const currentIndex = candidateNodes.indexOf(event.currentTarget as HTMLSpanElement);
          candidateNodes = context.loop
            ? wrapArray(candidateNodes, currentIndex + 1)
            : candidateNodes.slice(currentIndex + 1);
        }

        /**
         * Imperative focus during keydown is risky so we defer past the
         * keydown dispatch to avoid update-ordering bugs.
         */
        setTimeout(() => focusFirst(candidateNodes));
      }
    },
  );

  return (
    <Collection.ItemSlot
      scope={props.__scopeRovingFocusGroup}
      id={id()}
      focusable={props.focusable ?? true}
      active={props.active ?? false}
    >
      <Primitive.span
        tabindex={context.currentTabStopId() === id() ? 0 : -1}
        data-orientation={context.orientation}
        {...rest}
        ref={props.ref}
        onMouseDown={handleMouseDown as (event: MouseEvent) => void}
        onFocus={handleFocus as (event: FocusEvent) => void}
        onKeyDown={handleKeyDown as (event: KeyboardEvent) => void}
      >
        {
          (() => {
            const child = props.children;
            // NOTE: dynamic component children also arrive as functions
            // (zero-arg thunks, which ignore the argument), so every function
            // child is invoked with tab-stop accessors. Reading live state
            // through the accessors - instead of re-invoking per change -
            // keeps component children mounted across tab-stop updates.
            return typeof child === "function"
              ? (
                  child as (props: {
                    hasTabStop: () => boolean;
                    isCurrentTabStop: () => boolean;
                  }) => JSX.Element
                )({
                  isCurrentTabStop: () => context.currentTabStopId() === id(),
                  hasTabStop: () => context.currentTabStopId() != null,
                })
              : child;
          }) as unknown as JSX.Element
        }
      </Primitive.span>
    </Collection.ItemSlot>
  );
};

/* -----------------------------------------------------------------------------------------------*/

const MAP_KEY_TO_FOCUS_INTENT: Record<string, FocusIntent> = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last",
};

function getDirectionAwareKey(key: string, dir?: Direction) {
  if (dir !== Direction.RTL) return key;
  return key === "ArrowLeft" ? "ArrowRight" : key === "ArrowRight" ? "ArrowLeft" : key;
}

type FocusIntent = "first" | "last" | "prev" | "next";

function getFocusIntent(event: KeyboardEvent, orientation?: Orientation, dir?: Direction) {
  const key = getDirectionAwareKey(event.key, dir);
  if (orientation === Orientation.Vertical && ["ArrowLeft", "ArrowRight"].includes(key)) {
    return undefined;
  }
  if (orientation === Orientation.Horizontal && ["ArrowUp", "ArrowDown"].includes(key)) {
    return undefined;
  }
  return MAP_KEY_TO_FOCUS_INTENT[key];
}

function focusFirst(candidates: HTMLElement[], preventScroll = false) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidate of candidates) {
    // if focus is already where we want to go, we don't want to keep going through the candidates
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus({ preventScroll });
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}

/**
 * Wraps an array around itself at a given start index
 * Example: `wrapArray(['a', 'b', 'c', 'd'], 2) === ['c', 'd', 'a', 'b']`
 */
function wrapArray<T>(array: T[], startIndex: number) {
  return array.map<T>((_, index) => array[(startIndex + index) % array.length]!);
}

export {
  createRovingFocusGroupScope,
  //
  RovingFocusGroup,
  RovingFocusGroupItem,
  //
  RovingFocusGroup as Root,
  RovingFocusGroupItem as Item,
};
export type { RovingFocusGroupProps, RovingFocusItemProps };
