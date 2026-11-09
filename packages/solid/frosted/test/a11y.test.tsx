import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { flush } from "solid-js";
import {
  Calendar,
  Combobox,
  ComboboxInput,
  ComboboxListbox,
  ComboboxOption,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  Sortable,
  SortableHandle,
  SortableItem,
} from "../src/index";

// Structural accessibility checks for the native components: roles,
// names, and aria wiring that assistive tech depends on. These run in
// jsdom without axe; they pin the contract, not visual contrast.
afterEach(cleanup);

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: () => {},
    matches: false,
    removeEventListener: () => {},
  }));
});

describe("a11y: combobox", () => {
  it("wires the combobox aria contract", async () => {
    render(() => (
      <Combobox>
        <ComboboxInput aria-label="City" />
        <ComboboxListbox>
          <ComboboxOption value="paris">Paris</ComboboxOption>
        </ComboboxListbox>
      </Combobox>
    ));
    const input = screen.getByRole("combobox", { name: "City" });
    expect(input.getAttribute("aria-expanded")).toBe("false");
    fireEvent.focus(input);
    flush();
    expect(input.getAttribute("aria-expanded")).toBe("true");
    const option = await screen.findByRole("option", { name: "Paris" });
    expect(option.getAttribute("aria-selected")).toBe("false");
    expect(input.getAttribute("aria-controls")).toBe(screen.getByRole("listbox").id);
  });
});

describe("a11y: calendar", () => {
  it("exposes a labelled grid with selected state", async () => {
    render(() => <Calendar defaultValue="2026-03-04" />);
    const grid = await screen.findByRole("grid");
    expect(grid.getAttribute("aria-label")).toContain("2026");
    const day = screen.getByRole("button", { name: "Mar 4, 2026" });
    expect(day.closest("[aria-selected]")?.getAttribute("aria-selected")).toBe("true");
  });
});

describe("a11y: sheet", () => {
  it("opens as a labelled dialog", async () => {
    render(() => (
      <Sheet>
        <SheetTrigger>
          <button type="button">Open</button>
        </SheetTrigger>
        <SheetContent aria-label="Filters panel">
          <SheetTitle>Filters</SheetTitle>
        </SheetContent>
      </Sheet>
    ));
    fireEvent.click(screen.getByText("Open"));
    flush();
    await screen.findByRole("heading", { name: "Filters" });
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});

describe("a11y: sortable", () => {
  it("announces moves through a polite live region", () => {
    render(() => (
      <Sortable items={["a", "b"]} onOrderChange={() => {}}>
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
    const status = document.querySelector('[aria-live="polite"]');
    expect(status?.textContent).toContain("picked up");
  });
});
