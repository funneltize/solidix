import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Table } from "../src/index";

describe("Table", () => {
  it("renders the table structure with root classes", async () => {
    render(() => (
      <Table.Root>
        <Table.Table>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.RowHeader>Ada</Table.RowHeader>
              <Table.Cell>Engineer</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Table>
      </Table.Root>
    ));
    const table = await screen.findByRole("table");
    expect(table.classList.contains("fui-TableTable")).toBe(true);
    expect(table.closest(".fui-TableRoot")?.classList.contains("fui-r-size-2")).toBe(true);
    expect(table.closest(".fui-TableRoot")?.classList.contains("fui-variant-surface")).toBe(
      true,
    );
    expect(screen.getByRole("columnheader", { name: "Name" }).tagName).toBe("TH");
    expect(screen.getByRole("rowheader", { name: "Ada" }).getAttribute("scope")).toBe("row");
    expect(screen.getByRole("cell", { name: "Engineer" }).tagName).toBe("TD");
  });

  it("applies size and variant classes", async () => {
    render(() => (
      <Table.Root size="1" variant="ghost">
        <Table.Table>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Hi</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Table>
      </Table.Root>
    ));
    const root = (await screen.findByRole("cell")).closest(".fui-TableRoot");
    expect(root?.classList.contains("fui-r-size-1")).toBe(true);
    expect(root?.classList.contains("fui-variant-ghost")).toBe(true);
  });

  it("applies cell alignment, justification, and width", async () => {
    render(() => (
      <Table.Root>
        <Table.Table>
          <Table.Body>
            <Table.Row>
              <Table.Cell align="end" justify="center" width={120}>
                Aligned
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Table>
      </Table.Root>
    ));
    const cell = await screen.findByRole("cell");
    expect(cell.classList.contains("fui-TableCell")).toBe(true);
    expect(cell.classList.contains("fui-r-ta-end")).toBe(true);
    expect(cell.classList.contains("fui-r-jc-center")).toBe(true);
    expect(cell.style.width).toBe("120px");
  });

  it("renders a sortable column header button", async () => {
    render(() => (
      <Table.Root>
        <Table.Table>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>
                <Table.ColumnHeaderCellButton active sortDirection="asc">
                  Name
                </Table.ColumnHeaderCellButton>
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
        </Table.Table>
      </Table.Root>
    ));
    const button = await screen.findByRole("button", { name: "Name" });
    expect(button.classList.contains("fui-TableColumnHeaderCellButton")).toBe(true);
    expect(button.classList.contains("fui-sortable")).toBe(true);
    expect(button.classList.contains("fui-active")).toBe(true);
    expect(button.classList.contains("fui-sort-asc")).toBe(true);
  });

  it("renders a footer group", async () => {
    render(() => (
      <Table.Root>
        <Table.Table>
          <Table.Footer>
            <Table.Row>
              <Table.Cell>Total</Table.Cell>
            </Table.Row>
          </Table.Footer>
        </Table.Table>
      </Table.Root>
    ));
    expect((await screen.findByText("Total")).closest("tfoot")).not.toBeNull();
  });
});
