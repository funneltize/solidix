import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { Sortable, SortableHandle, SortableItem } from "../src/index";

function Harness(props: { onOrderChange?: (items: string[]) => void }) {
  const [items, setItems] = createSignal(["a", "b", "c"]);
  return (
    <Sortable
      items={items()}
      onOrderChange={(next) => {
        setItems(next);
        props.onOrderChange?.(next);
      }}
    >
      {items().map((id) => (
        <SortableItem itemId={id}>
          <SortableHandle aria-label={`Reorder ${id}`}>grip</SortableHandle>
          <span>{id}</span>
        </SortableItem>
      ))}
    </Sortable>
  );
}

afterEach(cleanup);

describe("Sortable", () => {
  it("moves an item with pickup, arrow, and drop", () => {
    const onOrderChange = vi.fn();
    render(() => <Harness onOrderChange={onOrderChange} />);
    const handle = screen.getByLabelText("Reorder a");
    fireEvent.keyDown(handle, { key: " " });
    flush();
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    flush();
    expect(onOrderChange).toHaveBeenLastCalledWith(["b", "a", "c"]);
    fireEvent.keyDown(handle, { key: " " });
    flush();
    expect(screen.getByText("a")).toBeTruthy();
  });

  it("restores the order on Escape after pickup", () => {
    const onOrderChange = vi.fn();
    render(() => <Harness onOrderChange={onOrderChange} />);
    const handle = screen.getByLabelText("Reorder b");
    fireEvent.keyDown(handle, { key: "Enter" });
    flush();
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    flush();
    expect(onOrderChange).toHaveBeenLastCalledWith(["a", "c", "b"]);
    fireEvent.keyDown(screen.getByLabelText("Reorder b"), { key: "Escape" });
    flush();
    expect(onOrderChange).toHaveBeenLastCalledWith(["a", "b", "c"]);
  });

  it("does not move without pickup", () => {
    const onOrderChange = vi.fn();
    render(() => <Harness onOrderChange={onOrderChange} />);
    fireEvent.keyDown(screen.getByLabelText("Reorder a"), { key: "ArrowDown" });
    flush();
    expect(onOrderChange).not.toHaveBeenCalled();
  });
});
