import { createEffect, createSignal, omit, untrack, type Component, type Setter } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createContextScope } from "@solidix/context";
import { useComposedRefs, type Ref, type RefObject } from "@solidix/compose-refs";
import { createSlot, type SlotProps } from "@solidix/slot";
import type { EntryOf } from "./ordered-dictionary";
import { OrderedDict, type ReadOnlyOrderedDict } from "./ordered-dictionary";

type CollectionElement = HTMLElement;
interface CollectionSlotProps extends SlotProps {
  scope: any;
}

interface BaseItemData {
  id?: string | undefined;
}

type ItemDataWithElement<
  ItemData extends BaseItemData,
  ItemElement extends HTMLElement,
> = ItemData & {
  element: ItemElement;
};

type BaseCollectionDict<
  ItemElement extends HTMLElement,
  ItemData extends BaseItemData,
> = OrderedDict<ItemElement, ItemDataWithElement<ItemData, ItemElement>>;

type CollectionDict<ItemElement extends HTMLElement, ItemData> = ReadOnlyOrderedDict<
  ItemElement,
  ItemDataWithElement<ItemData & BaseItemData, ItemElement>
>;

/**
 * Creates a collection that tracks its items in document order and exposes them
 * via `useCollection`.
 *
 * Item data passed to `ItemSlot` (every prop other than `scope`, `children`
 * and `ref`) is snapshotted and compared shallowly; changes re-register the
 * item. Unlike Radix there is no render to memoize against — reactive item
 * props are tracked automatically.
 */
/* @__NO_SIDE_EFFECTS__ */ function createCollection<
  ItemElement extends HTMLElement,
  ItemData extends {} = {},
>(name: string) {
  type AllItemData = ItemData & BaseItemData;
  /* -----------------------------------------------------------------------------------------------
   * CollectionProvider
   * ---------------------------------------------------------------------------------------------*/

  const PROVIDER_NAME = name + "CollectionProvider";
  const [createCollectionContext, createCollectionScope] = createContextScope(PROVIDER_NAME);

  interface CollectionStableContextValue {
    collectionElementRef: (node: CollectionElement | null) => void;
    collectionElementRefObject: RefObject<CollectionElement | null>;
    setCollection: Setter<BaseCollectionDict<ItemElement, AllItemData>>;
    getCollection: () => CollectionDict<ItemElement, AllItemData>;
    registry: BaseCollectionDict<ItemElement, AllItemData>;
  }

  interface CollectionStatefulContextValue {
    collectionElement: () => CollectionElement | null;
    collection: () => CollectionDict<ItemElement, AllItemData>;
  }

  const [CollectionStableContextProvider, useStableCollectionContext] =
    createCollectionContext<CollectionStableContextValue>(PROVIDER_NAME);
  const [CollectionStatefulContextProvider, useStatefulCollectionContext] =
    createCollectionContext<CollectionStatefulContextValue>(PROVIDER_NAME);

  type CollectionState = [
    () => BaseCollectionDict<ItemElement, AllItemData>,
    Setter<BaseCollectionDict<ItemElement, AllItemData>>,
  ];

  const CollectionProvider: Component<{
    children?: JSX.Element;
    scope: any;
    state?: CollectionState | undefined;
  }> = (props) => {
    return props.state ? (
      <CollectionProviderImpl scope={props.scope} state={props.state}>
        {props.children}
      </CollectionProviderImpl>
    ) : (
      <CollectionInit scope={props.scope}>{props.children}</CollectionInit>
    );
  };

  const CollectionInit: Component<{ children?: JSX.Element; scope: any }> = (props) => {
    const state = useInitCollection();
    return (
      <CollectionProviderImpl scope={props.scope} state={state}>
        {props.children}
      </CollectionProviderImpl>
    );
  };

  const CollectionProviderImpl: Component<{
    children?: JSX.Element;
    scope: any;
    state: CollectionState;
  }> = (props) => {
    const ref: RefObject<CollectionElement | null> = { current: null };
    // Ref callbacks fire with `null` during disposal (an owned scope); the
    // write is intentional bookkeeping, so opt out of the owned-write check.
    const [collectionElement, setCollectionElement] = createSignal<CollectionElement | null>(null, {
      ownedWrite: true,
    });
    const composeRefs = useComposedRefs(ref, (node) => setCollectionElement(node));
    const [collection, setCollection] = props.state;

    // Written only from ref callbacks and effects, so it never includes items
    // that were never mounted.
    const registry: BaseCollectionDict<ItemElement, AllItemData> = new OrderedDict();
    const getCollection = () => {
      if (!isInDocumentOrder(registry)) {
        registry.sort(sortByDocumentPosition);
      }
      return registry as CollectionDict<ItemElement, AllItemData>;
    };

    createEffect(
      () => collectionElement(),
      (element) => {
        if (!element) return;
        const observer = getChildListObserver(() => {
          setCollection((map) => {
            const sorted = map.toSorted(sortByDocumentPosition);
            const orderChanged = sorted.some(([key], index) => map.keyAt(index) !== key);
            return orderChanged ? sorted : map;
          });
        });
        observer.observe(element, { childList: true, subtree: true });
        return () => observer.disconnect();
      },
    );

    return (
      <CollectionStableContextProvider
        scope={props.scope}
        collectionElementRef={composeRefs}
        collectionElementRefObject={ref}
        getCollection={getCollection}
        setCollection={setCollection}
        registry={registry}
      >
        <CollectionStatefulContextProvider
          scope={props.scope}
          collectionElement={collectionElement}
          collection={collection}
        >
          {props.children}
        </CollectionStatefulContextProvider>
      </CollectionStableContextProvider>
    );
  };

  /* -----------------------------------------------------------------------------------------------
   * CollectionSlot
   * ---------------------------------------------------------------------------------------------*/

  const COLLECTION_SLOT_NAME = name + "CollectionSlot";

  const CollectionSlotImpl = createSlot<CollectionElement>(COLLECTION_SLOT_NAME);
  const CollectionSlot: Component<CollectionSlotProps> = (props) => {
    const context = useStableCollectionContext(COLLECTION_SLOT_NAME, props.scope);
    const composedRefs = useComposedRefs(props.ref, context.collectionElementRef);
    return <CollectionSlotImpl ref={composedRefs}>{props.children}</CollectionSlotImpl>;
  };

  /* -----------------------------------------------------------------------------------------------
   * CollectionItem
   * ---------------------------------------------------------------------------------------------*/

  const ITEM_SLOT_NAME = name + "CollectionItemSlot";
  const ITEM_DATA_ATTR = "data-radix-collection-item";

  type CollectionItemSlotProps = AllItemData & {
    children: JSX.Element;
    scope: any;
    ref?: Ref<ItemElement> | undefined;
  };

  const CollectionItemSlotImpl = createSlot<ItemElement>(ITEM_SLOT_NAME);
  /**
   * Registers its child element as a collection item. Every prop other than
   * `scope`, `children` and `ref` is item data.
   */
  const CollectionItemSlot: Component<CollectionItemSlotProps> = (props) => {
    const itemData = omit(props, "scope", "children", "ref");
    const ref: RefObject<ItemElement | null> = { current: null };
    const context = useStableCollectionContext(ITEM_SLOT_NAME, props.scope);

    const { setCollection, registry } = context;
    // Ref callbacks fire with `null` during disposal (an owned scope); the
    // write is intentional bookkeeping, so opt out of the owned-write check.
    const [element, setElement] = createSignal<ItemElement | null>(null, { ownedWrite: true });

    const registerElement = (node: ItemElement | null) => {
      if (node) {
        registry.set(node, {
          ...(untrack(() => ({ ...itemData })) as unknown as AllItemData),
          element: node,
        });
      }
      setElement(() => node);
    };
    const composedRefs = useComposedRefs(props.ref, registerElement, ref);

    createEffect(
      () =>
        ({ element: element(), data: { ...itemData } }) as unknown as {
          element: ItemElement | null;
          data: AllItemData;
        },
      ({ element: current, data }, prev) => {
        if (prev && prev.element === current && shallowEqual(prev.data, data)) return;
        setCollection((map) => {
          const next = new OrderedDict(map);
          if (prev?.element && prev.element !== current) {
            next.delete(prev.element);
          }
          if (current) {
            next.set(current, { ...(data as AllItemData), element: current });
          }
          return next.sort(sortByDocumentPosition);
        });
        if (current) {
          registry.set(current, { ...(data as AllItemData), element: current });
        }
        return () => {
          // The closure owns `current`, so this runs deterministically on
          // re-run and on disposal — unlike an `onCleanup` reading the
          // `element` signal, which the ref detach may already have nulled.
          if (current) registry.delete(current);
          setCollection((map) => {
            if (!current || !map.has(current)) return map;
            const next = new OrderedDict(map);
            next.delete(current);
            return next;
          });
        };
      },
    );

    return (
      <CollectionItemSlotImpl {...{ [ITEM_DATA_ATTR]: "" }} ref={composedRefs}>
        {props.children}
      </CollectionItemSlotImpl>
    );
  };

  /* -----------------------------------------------------------------------------------------------
   * useInitCollection
   * ---------------------------------------------------------------------------------------------*/

  function useInitCollection(): CollectionState {
    // Item effects unregister via their cleanups, which run in an owned scope
    // during disposal; the write is intentional bookkeeping, so opt out of
    // the owned-write check.
    return createSignal<BaseCollectionDict<ItemElement, AllItemData>>(new OrderedDict(), {
      ownedWrite: true,
    });
  }

  /* -----------------------------------------------------------------------------------------------
   * useCollection
   * ---------------------------------------------------------------------------------------------*/

  function useCollection(scope: any) {
    const { collection } = useStatefulCollectionContext(name + "CollectionConsumer", scope);
    return collection;
  }

  function useGetCollection(scope: any) {
    const { getCollection } = useStableCollectionContext(name + "CollectionConsumer", scope);
    return getCollection;
  }

  const functions = {
    createCollectionScope,
    useCollection,
    useGetCollection,
    useInitCollection,
  };

  return [
    { Provider: CollectionProvider, Slot: CollectionSlot, ItemSlot: CollectionItemSlot },
    functions,
  ] as const;
}

export { createCollection };
export type { CollectionSlotProps, CollectionDict };

function shallowEqual(a: any, b: any) {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object") return false;
  if (a == null || b == null) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (a[key] !== b[key]) return false;
  }
  return true;
}

function isElementPreceding(a: Element, b: Element) {
  return !!(b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING);
}

function isInDocumentOrder<E extends HTMLElement, T extends BaseItemData>(
  dict: BaseCollectionDict<E, T>,
) {
  let previous: Element | undefined;
  for (const element of dict.keys()) {
    if (previous) {
      const position = previous.compareDocumentPosition(element);
      if (
        !(position & Node.DOCUMENT_POSITION_DISCONNECTED) &&
        position & Node.DOCUMENT_POSITION_PRECEDING
      ) {
        return false;
      }
    }
    previous = element;
  }
  return true;
}

function sortByDocumentPosition<E extends HTMLElement, T extends BaseItemData>(
  a: EntryOf<BaseCollectionDict<E, T>>,
  b: EntryOf<BaseCollectionDict<E, T>>,
) {
  return !a[1].element || !b[1].element
    ? 0
    : isElementPreceding(a[1].element, b[1].element)
      ? -1
      : 1;
}

function getChildListObserver(callback: () => void) {
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        callback();
        return;
      }
    }
  });

  return observer;
}
