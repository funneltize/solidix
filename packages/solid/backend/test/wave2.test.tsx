import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { BackendTheme, BulkBar, DataList, DataTable, FilterBar, Pagination } from "../src/index";

// Frosted `Theme` reads `window.matchMedia`, which jsdom does not provide.
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: () => {},
    matches: false,
    removeEventListener: () => {},
  }));
});

type Customer = { id: string; name: string; email: string; spend: number; status: string };
const customers: Customer[] = [
  { id: "c2", name: "Grace Hopper", email: "grace@example.com", spend: 980, status: "Active" },
  { id: "c1", name: "Ada Lovelace", email: "ada@example.com", spend: 1240, status: "Active" },
  { id: "c3", name: "Alan Turing", email: "alan@example.com", spend: 2150, status: "Invited" },
];
const columns = [
  { key: "name", header: "Name", sortable: true, sortValue: (r: Customer) => r.name },
  { key: "email", header: "Email" },
  { key: "spend", header: "Spend", align: "end" as const, sortable: true, sortValue: (r: Customer) => r.spend, render: (r: Customer) => `$${r.spend}` },
  { key: "status", header: "Status" },
];

describe("DataTable", () => {
  test("sorts presented rows and reports sort state", async () => {
    const onSortChange = vi.fn();
    const { findByText, container } = render(() => (
      <BackendTheme>
        <DataTable columns={columns} rows={customers} onSortChange={onSortChange} />
      </BackendTheme>
    ));
    fireEvent.click(await findByText("Name"));
    flush();
    expect(onSortChange).toHaveBeenCalledWith({ key: "name", direction: "asc" });
    const cells = [...container.querySelectorAll("tbody tr td:nth-child(1)")].map((c) => c.textContent);
    expect(cells).toEqual(["Ada Lovelace", "Alan Turing", "Grace Hopper"]);
    const nameHeader = (await findByText("Name")).closest("th");
    expect(nameHeader?.getAttribute("aria-sort")).toBe("ascending");
    fireEvent.click(await findByText("Name"));
    flush();
    expect(onSortChange).toHaveBeenLastCalledWith({ key: "name", direction: "desc" });
  });

  test("selects by stable id with select-all, controlled by the app", async () => {
    const [selected, setSelected] = createSignal<string[]>([]);
    const { findByLabelText, findByText } = render(() => (
      <BackendTheme>
        <DataTable columns={columns} rows={customers} selectable selectedIds={selected()} onSelectionChange={setSelected} />
        <span>{selected().length} chosen</span>
      </BackendTheme>
    ));
    fireEvent.click(await findByLabelText("Select row c1"));
    flush();
    expect(selected()).toEqual(["c1"]);
    fireEvent.click(await findByLabelText("Select all rows"));
    flush();
    expect(selected()).toEqual(["c2", "c1", "c3"]);
    expect(await findByText("3 chosen")).toBeTruthy();
  });

  test("renders the empty slot when there are no rows", async () => {
    const { findByText } = render(() => (
      <BackendTheme>
        <DataTable columns={columns} rows={[]} empty={<p>No customers yet</p>} />
      </BackendTheme>
    ));
    expect(await findByText("No customers yet")).toBeTruthy();
  });
});

describe("FilterBar, Pagination, BulkBar, DataList", () => {
  test("FilterBar reports query and shows the result count", async () => {
    const onQueryChange = vi.fn();
    const { findByPlaceholderText, findByText } = render(() => (
      <BackendTheme>
        <FilterBar onQueryChange={onQueryChange} resultCount="3 results" placeholder="Search customers" />
      </BackendTheme>
    ));
    const input = await findByPlaceholderText("Search customers");
    fireEvent.input(input, { target: { value: "ada" } });
    flush();
    expect(onQueryChange).toHaveBeenCalledWith("ada");
    expect(await findByText("3 results")).toBeTruthy();
  });

  test("Pagination clamps and disables at the ends", async () => {
    const onPageChange = vi.fn();
    const { findByText } = render(() => (
      <BackendTheme>
        <Pagination page={1} totalPages={3} onPageChange={onPageChange} />
      </BackendTheme>
    ));
    const prev = (await findByText("Previous")) as HTMLButtonElement;
    expect(prev.disabled).toBe(true);
    fireEvent.click(await findByText("Next"));
    flush();
    expect(onPageChange).toHaveBeenCalledWith(2);
    fireEvent.click(await findByText("3"));
    flush();
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  test("BulkBar hides at zero and clears on demand; DataList marks selection", async () => {
    const onClear = vi.fn();
    const { findByText, container, queryByText } = render(() => (
      <BackendTheme>
        <BulkBar selectedCount={2} onClear={onClear}>
          <button type="button">Export</button>
        </BulkBar>
        <DataList
          records={[{ id: "c1", primary: "Ada Lovelace", value: "$1,240" }]}
          selectedIds={["c1"]}
        />
      </BackendTheme>
    ));
    expect(await findByText("2 selected")).toBeTruthy();
    fireEvent.click(await findByText("Clear"));
    flush();
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[data-backend-part="data-row"]')?.getAttribute("data-selected")).toBe("true");
    const emptyRender = render(() => (
      <BackendTheme>
        <BulkBar selectedCount={0} onClear={onClear} />
      </BackendTheme>
    ));
    expect(emptyRender.queryByText(/selected/)).toBeNull();
    expect(queryByText("Export")).toBeTruthy();
  });
});
