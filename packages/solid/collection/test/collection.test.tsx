import { describe, expect, test } from "vitest";
import { render } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { Show } from "solid-js";
import { createCollection, unstable_createCollection } from "../src/index";

describe("createCollection (legacy)", () => {
  const [Collection, useCollection, createCollectionScope] = createCollection<
    HTMLButtonElement,
    { value: string; disabled?: boolean }
  >("Test");

  test("registers items in document order with their data", () => {
    let getItems!: ReturnType<typeof useCollection>;
    const useScope = createCollectionScope();
    const scope = (useScope(undefined) as any).__scopeTestCollectionProvider;

    function Capture() {
      getItems = useCollection(scope);
      return null;
    }

    render(() => (
      <Collection.Provider scope={scope}>
        <Capture />
        <Collection.Slot scope={scope}>
          <div>
            <Collection.ItemSlot scope={scope} value="one">
              <button type="button">one</button>
            </Collection.ItemSlot>
            <Collection.ItemSlot scope={scope} value="two" disabled>
              <button type="button">two</button>
            </Collection.ItemSlot>
            <Collection.ItemSlot scope={scope} value="three">
              <button type="button">three</button>
            </Collection.ItemSlot>
          </div>
        </Collection.Slot>
      </Collection.Provider>
    ));
    flush();

    const items = getItems();
    expect(items.map((item) => item.value)).toEqual(["one", "two", "three"]);
    expect(items[1]?.disabled).toBe(true);
    expect(items[0]?.ref.current?.textContent).toBe("one");
  });

  test("unregisters items on unmount", () => {
    let getItems!: ReturnType<typeof useCollection>;
    let setShow!: (show: boolean) => void;
    const useScope = createCollectionScope();
    const scope = (useScope(undefined) as any).__scopeTestCollectionProvider;

    function Capture() {
      getItems = useCollection(scope);
      return null;
    }

    render(() => {
      const [show, set] = createSignal(true);
      setShow = set;
      return (
        <Collection.Provider scope={scope}>
          <Capture />
          <Collection.Slot scope={scope}>
            <div>
              <Collection.ItemSlot scope={scope} value="one">
                <button type="button">one</button>
              </Collection.ItemSlot>
              <Show when={show()}>
                <Collection.ItemSlot scope={scope} value="two">
                  <button type="button">two</button>
                </Collection.ItemSlot>
              </Show>
            </div>
          </Collection.Slot>
        </Collection.Provider>
      );
    });
    flush();
    expect(getItems().map((item) => item.value)).toEqual(["one", "two"]);

    setShow(false);
    flush();
    expect(getItems().map((item) => item.value)).toEqual(["one"]);
  });
});

describe("unstable_createCollection", () => {
  const [Collection, { useCollection, useGetCollection, createCollectionScope }] =
    unstable_createCollection<HTMLButtonElement, { value: string }>("Unstable");

  test("exposes a reactive collection and an imperative getter", () => {
    let collection!: ReturnType<typeof useCollection>;
    let getCollection!: ReturnType<typeof useGetCollection>;
    const useScope = createCollectionScope();
    const scope = (useScope(undefined) as any).__scopeUnstableCollectionProvider;

    function Capture() {
      collection = useCollection(scope);
      getCollection = useGetCollection(scope);
      return null;
    }

    render(() => (
      <Collection.Provider scope={scope}>
        <Capture />
        <Collection.Slot scope={scope}>
          <div>
            <Collection.ItemSlot scope={scope} value="one">
              <button type="button">one</button>
            </Collection.ItemSlot>
            <Collection.ItemSlot scope={scope} value="two">
              <button type="button">two</button>
            </Collection.ItemSlot>
          </div>
        </Collection.Slot>
      </Collection.Provider>
    ));
    flush();

    expect(Array.from(collection().values()).map((item) => item.value)).toEqual(["one", "two"]);
    expect(Array.from(getCollection().values()).map((item) => item.value)).toEqual(["one", "two"]);
  });

  test("unregisters items on unmount", () => {
    let collection!: ReturnType<typeof useCollection>;
    let getCollection!: ReturnType<typeof useGetCollection>;
    let setShow!: (show: boolean) => void;
    const useScope = createCollectionScope();
    const scope = (useScope(undefined) as any).__scopeUnstableCollectionProvider;

    function Capture() {
      collection = useCollection(scope);
      getCollection = useGetCollection(scope);
      return null;
    }

    render(() => {
      const [show, set] = createSignal(true);
      setShow = set;
      return (
        <Collection.Provider scope={scope}>
          <Capture />
          <Collection.Slot scope={scope}>
            <div>
              <Collection.ItemSlot scope={scope} value="one">
                <button type="button">one</button>
              </Collection.ItemSlot>
              <Show when={show()}>
                <Collection.ItemSlot scope={scope} value="two">
                  <button type="button">two</button>
                </Collection.ItemSlot>
              </Show>
            </div>
          </Collection.Slot>
        </Collection.Provider>
      );
    });
    flush();
    expect(Array.from(collection().values()).map((item) => item.value)).toEqual(["one", "two"]);

    setShow(false);
    flush();
    expect(Array.from(collection().values()).map((item) => item.value)).toEqual(["one"]);
    expect(Array.from(getCollection().values()).map((item) => item.value)).toEqual(["one"]);
  });
});
