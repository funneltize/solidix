import { fireEvent, render } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  BackendTheme,
  DataTable,
  backendThemePropDefs,
  dataTablePropDefs,
  paginationPropDefs,
} from "../src/index";

// Frosted `Theme` reads `window.matchMedia`, which jsdom does not provide.
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: () => {},
    matches: false,
    removeEventListener: () => {},
  }));
});

type Row = { id: string; name: string };
const rows: Row[] = [
  { id: "b", name: "Beta" },
  { id: "a", name: "Alpha" },
];
const columns = [{ key: "name", header: "Name", sortable: true, sortValue: (r: Row) => r.name }];

describe("DataTable server-sort mode", () => {
  test("reports the next sort without reordering presented rows", async () => {
    const onSortChange = vi.fn();
    const { findByText, container } = render(() => (
      <BackendTheme>
        <DataTable columns={columns} rows={rows} sortMode="server" onSortChange={onSortChange} />
      </BackendTheme>
    ));
    fireEvent.click(await findByText("Name"));
    flush();
    expect(onSortChange).toHaveBeenCalledWith({ key: "name", direction: "asc" });
    const cells = [...container.querySelectorAll("tbody tr td")].map((c) => c.textContent);
    expect(cells).toEqual(["Beta", "Alpha"]);
    const header = (await findByText("Name")).closest("th");
    expect(header?.getAttribute("aria-sort")).toBe("ascending");
  });

  test("client mode still reorders (default)", async () => {
    const { findByText, container } = render(() => (
      <BackendTheme>
        <DataTable columns={columns} rows={rows} />
      </BackendTheme>
    ));
    fireEvent.click(await findByText("Name"));
    flush();
    const cells = [...container.querySelectorAll("tbody tr td")].map((c) => c.textContent);
    expect(cells).toEqual(["Alpha", "Beta"]);
  });
});

describe("prop definitions", () => {
  test("defaults match the behavior components implement", () => {
    expect(backendThemePropDefs.density.default).toBe("compact");
    expect(backendThemePropDefs.density.values).toEqual(["compact", "comfortable"]);
    expect(dataTablePropDefs.sortMode.default).toBe("client");
    expect(dataTablePropDefs.sortMode.values).toEqual(["client", "server"]);
    expect(dataTablePropDefs.selectable.default).toBe(false);
  });

  test("every def carries a type and one-line description", () => {
    for (const defs of [backendThemePropDefs, dataTablePropDefs, paginationPropDefs]) {
      for (const def of Object.values(defs)) {
        expect(def.type.length).toBeGreaterThan(0);
        expect(def.description.length).toBeGreaterThan(8);
      }
    }
  });
});
