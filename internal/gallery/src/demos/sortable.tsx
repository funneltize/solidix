import { createSignal } from "solid-js";
import { Sortable } from "solidix";

const SortableDemo = () => {
  const [items, setItems] = createSignal(["a", "b", "c"]);
  return (
    <Sortable.Sortable items={items()} onOrderChange={setItems}>
      {items().map((id) => (
        <Sortable.SortableItem itemId={id}>
          <Sortable.SortableHandle aria-label={`Reorder ${id}`}>⠿</Sortable.SortableHandle>
          <span>Item {id}</span>
        </Sortable.SortableItem>
      ))}
    </Sortable.Sortable>
  );
};

export default SortableDemo;
