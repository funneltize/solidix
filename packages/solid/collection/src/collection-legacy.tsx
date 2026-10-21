import { createEffect, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createContextScope } from "@solidix/context";
import { useComposedRefs, type Ref, type RefObject } from "@solidix/compose-refs";
import { createSlot, type SlotProps } from "@solidix/slot";

type CollectionElement = HTMLElement;
interface CollectionProps extends SlotProps {
  scope: any;
}

// We have resorted to returning slots directly rather than exposing primitives that can then
// be slotted like `<CollectionItem as={Slot}>…</CollectionItem>`.
// This is because we encountered issues with generic types that cannot be statically analysed
// due to creating them dynamically via createCollection.

/** Creates provider, slot, and item components that track ordered items within a collection. */
/* @__NO_SIDE_EFFECTS__ */ function createCollection<
  ItemElement extends HTMLElement,
  ItemData = {},
>(name: string) {
  /* -----------------------------------------------------------------------------------------------
   * CollectionProvider
   * ---------------------------------------------------------------------------------------------*/

  const PROVIDER_NAME = name + "CollectionProvider";
  const [createCollectionContext, createCollectionScope] = createContextScope(PROVIDER_NAME);

  type ContextValue = {
    collectionRef: RefObject<CollectionElement | null>;
    itemMap: Map<RefObject<ItemElement | null>, { ref: RefObject<ItemElement | null> } & ItemData>;
  };

  const [CollectionProviderImpl, useCollectionContext] = createCollectionContext<ContextValue>(
    PROVIDER_NAME,
    { collectionRef: { current: null }, itemMap: new Map() },
  );

  const CollectionProvider: Component<{ children?: JSX.Element; scope: any }> = (props) => {
    const ref: RefObject<CollectionElement | null> = { current: null };
    const itemMap: ContextValue["itemMap"] = new Map();
    return (
      <CollectionProviderImpl scope={props.scope} itemMap={itemMap} collectionRef={ref}>
        {props.children}
      </CollectionProviderImpl>
    );
  };

  /* -----------------------------------------------------------------------------------------------
   * CollectionSlot
   * ---------------------------------------------------------------------------------------------*/

  const COLLECTION_SLOT_NAME = name + "CollectionSlot";

  const CollectionSlotImpl = createSlot<CollectionElement>(COLLECTION_SLOT_NAME);
  const CollectionSlot: Component<CollectionProps> = (props) => {
    const context = useCollectionContext(COLLECTION_SLOT_NAME, props.scope);
    const composedRefs = useComposedRefs(props.ref, context.collectionRef);
    return <CollectionSlotImpl ref={composedRefs}>{props.children}</CollectionSlotImpl>;
  };

  /* -----------------------------------------------------------------------------------------------
   * CollectionItem
   * ---------------------------------------------------------------------------------------------*/

  const ITEM_SLOT_NAME = name + "CollectionItemSlot";
  const ITEM_DATA_ATTR = "data-radix-collection-item";

  // Item data may be a getter for values known only after mount (e.g. select
  // item text read from the DOM): Solid props freeze at setup and can't pick
  // up post-mount updates the way Radix's re-render does, so getters are
  // resolved (and tracked) in the registration effect below.
  type CollectionItemSlotProps = {
    [K in keyof ItemData]: ItemData[K] | (() => ItemData[K]);
  } & {
    children: JSX.Element;
    scope: any;
    ref?: Ref<ItemElement> | undefined;
  };

  const CollectionItemSlotImpl = createSlot<ItemElement>(ITEM_SLOT_NAME);
  const CollectionItemSlot: Component<CollectionItemSlotProps> = (props) => {
    const itemData = omit(props, "scope", "children", "ref");
    const ref: RefObject<ItemElement | null> = { current: null };
    const composedRefs = useComposedRefs(props.ref, ref);
    const context = useCollectionContext(ITEM_SLOT_NAME, props.scope);

    createEffect(
      () => resolveItemData(itemData as unknown as Record<string, unknown>) as unknown as ItemData,
      (data) => {
        context.itemMap.set(ref, { ref, ...(data as unknown as ItemData) });
        return () => void context.itemMap.delete(ref);
      },
    );

    return (
      <CollectionItemSlotImpl {...{ [ITEM_DATA_ATTR]: "" }} ref={composedRefs}>
        {props.children}
      </CollectionItemSlotImpl>
    );
  };

  /* -----------------------------------------------------------------------------------------------
   * useCollection
   * ---------------------------------------------------------------------------------------------*/

  function useCollection(scope: any) {
    const context = useCollectionContext(name + "CollectionConsumer", scope);

    const getItems = () => {
      const collectionNode = context.collectionRef.current;
      if (!collectionNode) return [];
      const orderedNodes = Array.from(collectionNode.querySelectorAll(`[${ITEM_DATA_ATTR}]`));
      const items = Array.from(context.itemMap.values());
      const orderedItems = items.sort(
        (a, b) => orderedNodes.indexOf(a.ref.current!) - orderedNodes.indexOf(b.ref.current!),
      );
      return orderedItems;
    };

    return getItems;
  }

  return [
    { Provider: CollectionProvider, Slot: CollectionSlot, ItemSlot: CollectionItemSlot },
    useCollection,
    createCollectionScope,
  ] as const;
}

export { createCollection };
export type { CollectionProps };

function resolveItemData(itemData: Record<string, unknown>): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};
  for (const key of Object.keys(itemData)) {
    const value = itemData[key];
    resolved[key] = typeof value === "function" ? (value as () => unknown)() : value;
  }
  return resolved;
}
