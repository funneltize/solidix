import { fireEvent, render } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { BackendTheme, DataSkeleton, DataTable } from "../src/index";

// Frosted `Theme` reads `window.matchMedia`, which jsdom does not provide.
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: () => {},
    matches: false,
    removeEventListener: () => {},
  }));
});

type Row = { id: string; name: string; spend: number };

describe("column width and resizing", () => {
  test("applies the initial width and resizes by keyboard", async () => {
    const { findByLabelText, findByText, container } = render(() => (
      <BackendTheme>
        <DataTable
          rows={[{ id: "a", name: "Ada", spend: 10 }]}
          columns={[
            { key: "name", header: "Name", width: "200px", resizable: true },
            { key: "spend", header: "Spend" },
          ]}
        />
      </BackendTheme>
    ));
    const header = (await findByText("Name")).closest("th") as HTMLElement;
    expect(header.style.width).toBe("200px");
    const handle = await findByLabelText("Resize column Name");
    expect(handle.getAttribute("role")).toBe("separator");
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    flush();
    // jsdom reports 0 layout width, so the 48px minimum clamp applies.
    expect(header.style.width).toBe("48px");
    expect(container.querySelector(".sbx-col-resize")).toBeTruthy();
  });

  test("non-resizable columns render no handle", async () => {
    const { findByText, queryByLabelText } = render(() => (
      <BackendTheme>
        <DataTable rows={[{ id: "a", name: "Ada", spend: 10 }]} columns={[{ key: "name", header: "Name" }]} />
      </BackendTheme>
    ));
    expect(await findByText("Ada")).toBeTruthy();
    expect(queryByLabelText(/Resize column/)).toBeNull();
  });
});

describe("virtualized rendering", () => {
  test("renders only the visible window plus overscan", async () => {
    const rows: Row[] = Array.from({ length: 100 }, (_, i) => ({ id: `r${i}`, name: `Row ${i}`, spend: i }));
    const { container, findByText } = render(() => (
      <BackendTheme>
        <DataTable
          rows={rows}
          columns={[{ key: "name", header: "Name" }]}
          virtual={{ rowHeight: 40, height: 200, overscan: 2 }}
        />
      </BackendTheme>
    ));
    expect(await findByText("Row 0")).toBeTruthy();
    const rendered = container.querySelectorAll("tbody .sbx-table-row").length;
    expect(rendered).toBeLessThan(20);
    expect(rendered).toBeGreaterThan(5);
  });

  test("without virtual, every row renders", async () => {
    const rows: Row[] = Array.from({ length: 30 }, (_, i) => ({ id: `r${i}`, name: `Row ${i}`, spend: i }));
    const { container, findByText } = render(() => (
      <BackendTheme>
        <DataTable rows={rows} columns={[{ key: "name", header: "Name" }]} />
      </BackendTheme>
    ));
    expect(await findByText("Row 29")).toBeTruthy();
    expect(container.querySelectorAll("tbody .sbx-table-row").length).toBe(30);
  });
});

describe("DataSkeleton", () => {
  test("renders placeholder rows with a loading status", async () => {
    const { container, findByLabelText } = render(() => (
      <BackendTheme>
        <DataSkeleton rows={3} columns={2} />
      </BackendTheme>
    ));
    expect(await findByLabelText("Loading")).toBeTruthy();
    expect(container.querySelectorAll(".sbx-skeleton-row").length).toBe(3);
    expect(container.querySelectorAll(".sbx-skeleton-bar").length).toBe(6);
  });
});
