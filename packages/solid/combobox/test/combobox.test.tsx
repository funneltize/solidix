import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { Combobox, ComboboxInput, ComboboxListbox, ComboboxOption } from "../src/index";

const ITEMS = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

function Harness(props: { onValueChange?: (value: string) => void }) {
  const [query, setQuery] = createSignal("");
  const matches = () =>
    ITEMS.filter((item) => item.label.toLowerCase().includes(query().toLowerCase()));
  return (
    <Combobox
      inputValue={query()}
      onInputValueChange={setQuery}
      onValueChange={props.onValueChange}
    >
      <ComboboxInput aria-label="Fruit" placeholder="Pick a fruit" />
      <ComboboxListbox>
        {matches().map((item) => (
          <ComboboxOption value={item.value}>{item.label}</ComboboxOption>
        ))}
      </ComboboxListbox>
    </Combobox>
  );
}

afterEach(cleanup);

describe("Combobox", () => {
  it("opens on focus, filters by input, and selects with the keyboard", async () => {
    const onValueChange = vi.fn();
    render(() => <Harness onValueChange={onValueChange} />);
    const input = screen.getByLabelText("Fruit") as HTMLInputElement;
    fireEvent.focus(input);
    await screen.findByText("Apple");

    fireEvent.input(input, { target: { value: "ban" } });
    await screen.findByText("Banana");
    expect(screen.queryByText("Apple")).toBeNull();

    fireEvent.keyDown(input, { key: "ArrowDown" });
    flush();
    expect(input.getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(input, { key: "Enter" });
    flush();
    expect(onValueChange).toHaveBeenCalledWith("banana");
    expect(input.value).toBe("Banana");
  });

  it("selects on click and closes on Escape", async () => {
    const onValueChange = vi.fn();
    render(() => <Harness onValueChange={onValueChange} />);
    const input = screen.getByLabelText("Fruit");
    fireEvent.focus(input);
    fireEvent.click(await screen.findByText("Cherry"));
    flush();
    expect(onValueChange).toHaveBeenCalledWith("cherry");

    // Selection filled the input with "Cherry"; clearing reopens the full list.
    fireEvent.input(input, { target: { value: "" } });
    flush();
    await screen.findByText("Apple");
    fireEvent.keyDown(input, { key: "Escape" });
    flush();
    expect(screen.queryByText("Apple")).toBeNull();
  });
});
