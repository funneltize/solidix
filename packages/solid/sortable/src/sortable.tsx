// Solidix-native sortable list. Radix has no sortable to port, so this
// follows the WAI drag-and-drop pattern directly: a handle button picks
// an item up with Space or Enter, arrow keys move it, Space or Enter
// drops it, Escape cancels and restores the order from pickup. Pointer
// users get HTML5 drag and drop with live reordering. Order is consumer
// state: the root reports each new order through onOrderChange.

import { createContext, createSignal, omit, useContext, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  Primitive,
  ariaBoolean,
  callEventHandler,
  type PrimitivePropsWithRef,
} from "@solidix/primitive";
import { VisuallyHidden } from "@solidix/visually-hidden";

interface SortableContextValue {
  items: () => string[];
  emit: (items: string[]) => void;
  move: (id: string, delta: 1 | -1) => void;
  reorder: (draggingId: string, overId: string) => void;
  grabbedId: () => string | undefined;
  grab: (id: string) => void;
  drop: () => void;
  cancel: () => void;
  draggingId: () => string | undefined;
  setDraggingId: (id: string | undefined) => void;
  registerHandle: (id: string, element: HTMLElement) => void;
  focusHandle: (id: string) => void;
}

const SortableContext = createContext<SortableContextValue>();
const SortableItemContext = createContext<string>();

function useSortableContext(part: string): SortableContextValue {
  const context = useContext(SortableContext);
  if (!context) throw new Error(`<${part}> must be used inside <Sortable>.`);
  return context;
}

/** Props for the sortable root. */
export interface SortableProps extends Omit<PrimitivePropsWithRef<"div">, "children"> {
  /** Item ids in display order. The consumer owns this state. */
  items: string[];
  /** Fires with the full new order after every move. */
  onOrderChange?: ((items: string[]) => void) | undefined;
  /** The sortable items, rendered in `items` order by the consumer. */
  children?: JSX.Element | undefined;
}

/**
 * Root of a sortable list. Render `SortableItem`s in `items` order,
 * each with a `SortableHandle`. Moves report the full new order through
 * `onOrderChange`, and a polite live region announces them.
 */
export const Sortable: Component<SortableProps> = (props) => {
  const [grabbedId, setGrabbedId] = createSignal<string | undefined>(undefined);
  const [draggingId, setDraggingId] = createSignal<string | undefined>(undefined);
  const [announcement, setAnnouncement] = createSignal("");
  const handles = new Map<string, HTMLElement>();
  let grabSnapshot: string[] | undefined;

  const emit = (items: string[]) => callEventHandler(props.onOrderChange, items);
  const reorderList = (list: string[], dragging: string, over: string) => {
    const from = list.indexOf(dragging);
    const to = list.indexOf(over);
    if (from === -1 || to === -1 || from === to) return list;
    const next = [...list];
    next.splice(from, 1);
    next.splice(to, 0, dragging);
    return next;
  };
  const move = (id: string, delta: 1 | -1) => {
    const current = props.items;
    const index = current.indexOf(id);
    const target = index + delta;
    if (index === -1 || target < 0 || target >= current.length) return;
    emit(reorderList(current, id, current[target]!));
    setAnnouncement(`${id} moved to position ${target + 1} of ${current.length}.`);
  };

  const rest = omit(props, "items", "onOrderChange", "children");
  return (
    <SortableContext
      value={{
        items: () => props.items,
        emit,
        move,
        reorder: (dragging, over) => {
          const next = reorderList(props.items, dragging, over);
          if (next !== props.items) {
            emit(next);
            setAnnouncement(
              `${dragging} moved to position ${next.indexOf(dragging) + 1} of ${next.length}.`,
            );
          }
        },
        grabbedId,
        grab: (id) => {
          grabSnapshot = [...props.items];
          setGrabbedId(id);
          setAnnouncement(`${id} picked up. Use the arrow keys to move it, Space to drop.`);
        },
        drop: () => {
          const id = grabbedId();
          if (id === undefined) return;
          grabSnapshot = undefined;
          setGrabbedId(undefined);
          setAnnouncement(`${id} dropped at position ${props.items.indexOf(id) + 1}.`);
        },
        cancel: () => {
          const id = grabbedId();
          if (id === undefined) return;
          if (grabSnapshot) emit(grabSnapshot);
          grabSnapshot = undefined;
          setGrabbedId(undefined);
          setAnnouncement(`${id} movement cancelled.`);
        },
        draggingId,
        setDraggingId,
        registerHandle: (id, element) => {
          handles.set(id, element);
        },
        focusHandle: (id) => handles.get(id)?.focus(),
      }}
    >
      <Primitive.div {...rest} data-sortable-root="">
        {props.children}
        <VisuallyHidden aria-live="polite" role="status">
          {announcement()}
        </VisuallyHidden>
      </Primitive.div>
    </SortableContext>
  );
};

/** Props for one sortable item. */
export type SortableItemProps = Omit<PrimitivePropsWithRef<"div">, "children"> & {
  /** This item's id, matching an entry in the root's `items`. */
  itemId: string;
  /** Item content, including one `SortableHandle`. */
  children?: JSX.Element | undefined;
};

/**
 * One sortable item. Pointer drag through its handle reorders live
 * over siblings; the handle also provides the keyboard model.
 */
export const SortableItem: Component<SortableItemProps> = (props) => {
  const context = useSortableContext("SortableItem");
  const rest = omit(props, "itemId", "children");
  return (
    <Primitive.div
      {...rest}
      data-sortable-item={props.itemId}
      data-dragging={context.draggingId() === props.itemId ? "" : undefined}
      data-grabbed={context.grabbedId() === props.itemId ? "" : undefined}
    >
      <SortableItemContext value={props.itemId}>{props.children}</SortableItemContext>
    </Primitive.div>
  );
};

/** Props for the drag handle inside a sortable item. */
export type SortableHandleProps = Omit<PrimitivePropsWithRef<"button">, "children"> & {
  /** Handle content, typically a grip icon or label. */
  children?: JSX.Element | undefined;
};

/**
 * The drag handle: a button that picks its item up with Space or Enter,
 * moves it with the arrow keys while grabbed, drops with Space or
 * Enter, and cancels with Escape, restoring the order from pickup.
 * Pointer users drag it directly: the item under the pointer becomes
 * the drop target and the list reorders live.
 */
export const SortableHandle: Component<SortableHandleProps> = (props) => {
  const context = useSortableContext("SortableHandle");
  let itemId = useContext(SortableItemContext);
  const rest = omit(props, "children");
  return (
    <Primitive.button
      {...rest}
      type="button"
      aria-label={props["aria-label"] ?? "Reorder item"}
      aria-grabbed={itemId ? ariaBoolean(context.grabbedId() === itemId) : undefined}
      data-sortable-handle=""
      ref={(node: HTMLButtonElement | null) => {
        if (!node) return;
        if (itemId) context.registerHandle(itemId, node);
        if (typeof props.ref === "function") props.ref(node);
      }}
      onKeyDown={(event) => {
        callEventHandler(props.onKeyDown, event);
        if (!itemId) return;
        const grabbed = context.grabbedId() === itemId;
        switch (event.key) {
          case " ":
          case "Enter":
            event.preventDefault();
            if (grabbed) context.drop();
            else context.grab(itemId);
            break;
          case "ArrowDown":
          case "ArrowRight":
            if (grabbed) {
              event.preventDefault();
              context.move(itemId, 1);
            }
            break;
          case "ArrowUp":
          case "ArrowLeft":
            if (grabbed) {
              event.preventDefault();
              context.move(itemId, -1);
            }
            break;
          case "Escape":
            if (grabbed) {
              event.preventDefault();
              context.cancel();
            }
            break;
        }
      }}
      onPointerDown={(event) => {
        callEventHandler(props.onPointerDown, event);
        if (!itemId || event.button !== 0) return;
        const dragging = itemId;
        context.setDraggingId(dragging);
        const move = (moveEvent: PointerEvent) => {
          const over = document
            .elementFromPoint(moveEvent.clientX, moveEvent.clientY)
            ?.closest("[data-sortable-item]")
            ?.getAttribute("data-sortable-item");
          if (over && over !== dragging) context.reorder(dragging, over);
        };
        const up = () => {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
          context.setDraggingId(undefined);
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
      }}
    >
      {props.children}
    </Primitive.button>
  );
};
