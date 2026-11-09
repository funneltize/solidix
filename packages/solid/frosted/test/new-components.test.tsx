import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import {
  Combobox,
  ComboboxInput,
  ComboboxListbox,
  ComboboxOption,
  CommandMenu,
  DataTable,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  Sortable,
  SortableHandle,
  SortableItem,
  SplitPane,
} from "../src/index";

afterEach(cleanup);

// Dialog and Sheet mount a Theme, which reads window.matchMedia.
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: () => {},
    matches: false,
    removeEventListener: () => {},
  }));
});

describe("Combobox (frosted)", () => {
  it("renders styled parts and selects an option", async () => {
    const onValueChange = vi.fn();
    render(() => (
      <Combobox onValueChange={onValueChange}>
        <ComboboxInput aria-label="City" />
        <ComboboxListbox>
          <ComboboxOption value="paris">Paris</ComboboxOption>
          <ComboboxOption value="rome">Rome</ComboboxOption>
        </ComboboxListbox>
      </Combobox>
    ));
    const input = screen.getByLabelText("City");
    fireEvent.focus(input);
    const option = await screen.findByText("Paris");
    expect(option.classList.contains("fui-ComboboxOption")).toBe(true);
    fireEvent.click(option);
    flush();
    expect(onValueChange).toHaveBeenCalledWith("paris");
  });
});

describe("CommandMenu", () => {
  it("filters groups and selects a row", async () => {
    const onSelect = vi.fn();
    render(() => (
      <CommandMenu
        open
        groups={[
          {
            label: "Actions",
            items: [
              { value: "publish", label: "Publish funnel" },
              { value: "settings", label: "Open settings" },
            ],
          },
        ]}
        onSelect={onSelect}
      />
    ));
    const input = await screen.findByRole("combobox", { name: "Command menu" });
    fireEvent.input(input, { target: { value: "settings" } });
    await screen.findByText("Open settings");
    expect(screen.queryByText("Publish funnel")).toBeNull();
    fireEvent.click(screen.getByText("Open settings"));
    flush();
    expect(onSelect).toHaveBeenCalledWith("settings");
  });
});

describe("SplitPane", () => {
  it("sizes panels and resizes with the keyboard", async () => {
    const onSizesChange = vi.fn();
    render(() => (
      <SplitPane defaultSizes={[50, 50]} onSizesChange={onSizesChange}>
        <div>Left</div>
        <div>Right</div>
      </SplitPane>
    ));
    const separator = await screen.findByRole("separator");
    fireEvent.keyDown(separator, { key: "ArrowRight" });
    flush();
    expect(onSizesChange).toHaveBeenCalled();
    const sizes = onSizesChange.mock.calls[0]?.[0] as number[];
    expect(sizes[0]).toBeGreaterThan(50);
    expect(sizes[0]! + sizes[1]!).toBeCloseTo(100);
  });
});

describe("Sheet", () => {
  it("opens from its trigger with a title", async () => {
    render(() => (
      <Sheet>
        <SheetTrigger>
          <button type="button">Open sheet</button>
        </SheetTrigger>
        <SheetContent aria-label="Filters">
          <SheetTitle>Filters</SheetTitle>
          <p>Sheet body</p>
        </SheetContent>
      </Sheet>
    ));
    fireEvent.click(screen.getByText("Open sheet"));
    await screen.findByText("Sheet body");
    expect(screen.getByRole("heading", { name: "Filters" })).toBeTruthy();
  });
});

describe("DataTable", () => {
  const rows = [
    { id: "a", name: "Ada", score: 3 },
    { id: "b", name: "Bo", score: 9 },
    { id: "c", name: "Cy", score: 5 },
  ];
  it("sorts by a column and reports selection", async () => {
    const onSelectionChange = vi.fn();
    render(() => (
      <DataTable
        rows={rows}
        rowKey={(row) => row.id}
        onSelectionChange={onSelectionChange}
        columns={[
          { id: "name", header: "Name", cell: (row) => row.name, sortValue: (row) => row.name },
          {
            id: "score",
            header: "Score",
            cell: (row) => String(row.score),
            sortValue: (row) => row.score,
          },
        ]}
      />
    ));
    await screen.findByText("Ada");
    fireEvent.click(screen.getByRole("button", { name: /Score/ }));
    flush();
    const cells = screen.getAllByRole("cell");
    expect(cells.map((cell) => cell.textContent)).toContain("9");
    fireEvent.click(screen.getByLabelText("Select row b"));
    flush();
    expect(onSelectionChange).toHaveBeenCalledWith(["b"]);
  });

  it("paginates when pageSize is set", async () => {
    render(() => (
      <DataTable
        rows={rows}
        rowKey={(row) => row.id}
        pageSize={2}
        columns={[{ id: "name", header: "Name", cell: (row) => row.name }]}
      />
    ));
    await screen.findByText("Ada");
    expect(screen.queryByText("Cy")).toBeNull();
    fireEvent.click(screen.getByText("Next"));
    flush();
    await screen.findByText("Cy");
    expect(screen.getByText("Page 2 of 2")).toBeTruthy();
  });
});

describe("Sortable (frosted)", () => {
  it("reorders through the styled handle", () => {
    const [items, setItems] = createSignal(["a", "b"]);
    render(() => (
      <Sortable items={items()} onOrderChange={setItems}>
        <SortableItem itemId="a">
          <SortableHandle aria-label="Reorder a" />
          <span>A</span>
        </SortableItem>
        <SortableItem itemId="b">
          <SortableHandle aria-label="Reorder b" />
          <span>B</span>
        </SortableItem>
      </Sortable>
    ));
    const handle = screen.getByLabelText("Reorder a");
    fireEvent.keyDown(handle, { key: " " });
    flush();
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    flush();
    expect(items()).toEqual(["b", "a"]);
  });
});
