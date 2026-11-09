// Solidix-native data table: the styled Table plus the state every
// data-dense surface rebuilds by hand (sorting, row selection,
// pagination). Presentation stays with Table; this component owns the
// interaction state and reports it, per the pattern guidance.

import { For, createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { cx } from "../../helpers/cx";
import { Table } from "../table/table";

/** Sort direction for a column. */
export type DataTableSortDirection = "asc" | "desc";

/** One column definition for a `DataTable`. */
export interface DataTableColumn<Row> {
  /** Stable column id; also the sort key unless `sortValue` is given. */
  id: string;
  /** Header label. */
  header: string;
  /** Cell renderer for a row. */
  cell: (row: Row) => JSX.Element;
  /** Value compared when sorting; defaults to the rendered text is not used. */
  sortValue?: ((row: Row) => string | number) | undefined;
  /** Whether clicking the header sorts. Defaults to true when `sortValue` exists. */
  sortable?: boolean | undefined;
  /** Text alignment for this column. */
  align?: "left" | "center" | "right" | undefined;
}

/** Props for the `DataTable` component. */
export interface DataTableProps<Row> {
  /** Column definitions in display order. */
  columns: DataTableColumn<Row>[];
  /** Rows to display (all of them; pagination slices internally). */
  rows: Row[];
  /** Stable key for a row, used for selection identity. */
  rowKey: (row: Row) => string;
  /** Enables checkbox selection when provided; receives the selected keys. */
  onSelectionChange?: ((keys: string[]) => void) | undefined;
  /** Rows per page; omit for no pagination. */
  pageSize?: number | undefined;
  /** Label shown when there are no rows. */
  emptyText?: string | undefined;
  /** Accessible label for the table. */
  label?: string | undefined;
  /** Additional class on the table root. */
  class?: string | undefined;
}

/**
 * A data table with sorting, optional row selection, and optional
 * pagination, built on the styled `Table`. Clicking a sortable header
 * toggles direction; selection is by row key and survives sorting and
 * paging. Sort state is internal by design: consumers receive rows
 * through `rowKey` identity, not render order.
 */
export const DataTable = <Row,>(props: DataTableProps<Row>) => {
  const [sort, setSort] = createSignal<{ id: string; direction: DataTableSortDirection } | null>(
    null,
  );
  const [selected, setSelected] = createSignal<string[]>([]);
  const [page, setPage] = createSignal(0);

  const sortedRows = (): Row[] => {
    const active = sort();
    if (!active) return props.rows;
    const column = props.columns.find((entry) => entry.id === active.id);
    if (!column?.sortValue) return props.rows;
    const factor = active.direction === "asc" ? 1 : -1;
    return [...props.rows].sort((a, b) => {
      const left = column.sortValue!(a);
      const right = column.sortValue!(b);
      if (typeof left === "number" && typeof right === "number") return (left - right) * factor;
      return String(left).localeCompare(String(right)) * factor;
    });
  };
  const pageCount = () =>
    props.pageSize ? Math.max(1, Math.ceil(sortedRows().length / props.pageSize)) : 1;
  const visibleRows = () => {
    if (!props.pageSize) return sortedRows();
    const start = page() * props.pageSize;
    return sortedRows().slice(start, start + props.pageSize);
  };
  const toggleSort = (column: DataTableColumn<Row>) => {
    if (!(column.sortable ?? Boolean(column.sortValue))) return;
    setPage(0);
    setSort((current) =>
      current?.id === column.id
        ? { id: column.id, direction: current.direction === "asc" ? "desc" : "asc" }
        : { id: column.id, direction: "asc" },
    );
  };
  const toggleRow = (key: string, checked: boolean) => {
    const next = checked ? [...selected(), key] : selected().filter((entry) => entry !== key);
    setSelected(next);
    props.onSelectionChange?.(next);
  };

  return (
    <div class={cx("fui-DataTable", props.class)}>
      <Table.Root aria-label={props.label}>
        <Table.Table>
          <Table.Header>
            <Table.Row>
              {props.onSelectionChange ? (
                <Table.ColumnHeaderCell class="fui-DataTableSelectCell">
                  <input
                    type="checkbox"
                    class="fui-DataTableCheckbox"
                    aria-label="Select all rows on this page"
                    checked={
                      visibleRows().length > 0 &&
                      visibleRows().every((row) => selected().includes(props.rowKey(row)))
                    }
                    onChange={(event) => {
                      const keys = visibleRows().map((row) => props.rowKey(row));
                      const next = event.currentTarget.checked
                        ? [...new Set([...selected(), ...keys])]
                        : selected().filter((key) => !keys.includes(key));
                      setSelected(next);
                      props.onSelectionChange?.(next);
                    }}
                  />
                </Table.ColumnHeaderCell>
              ) : null}
              <For each={props.columns}>
                {(column) => {
                  const isSortable = () => column.sortable ?? Boolean(column.sortValue);
                  const direction = () =>
                    sort()?.id === column.id ? sort()!.direction : undefined;
                  return (
                    <Table.ColumnHeaderCell
                      aria-sort={
                        direction()
                          ? direction() === "asc"
                            ? "ascending"
                            : "descending"
                          : undefined
                      }
                      style={{ "text-align": column.align ?? "left" }}
                    >
                      {isSortable() ? (
                        <button
                          type="button"
                          class="fui-DataTableSortButton"
                          onClick={() => toggleSort(column)}
                        >
                          {column.header}
                          <span aria-hidden="true">
                            {direction() ? (direction() === "asc" ? "↑" : "↓") : "↕"}
                          </span>
                        </button>
                      ) : (
                        column.header
                      )}
                    </Table.ColumnHeaderCell>
                  );
                }}
              </For>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <For each={visibleRows()}>
              {(row) => (
                <Table.Row data-selected={selected().includes(props.rowKey(row)) ? "" : undefined}>
                  {props.onSelectionChange ? (
                    <Table.Cell class="fui-DataTableSelectCell">
                      <input
                        type="checkbox"
                        class="fui-DataTableCheckbox"
                        aria-label={`Select row ${props.rowKey(row)}`}
                        checked={selected().includes(props.rowKey(row))}
                        onChange={(event) =>
                          toggleRow(props.rowKey(row), event.currentTarget.checked)
                        }
                      />
                    </Table.Cell>
                  ) : null}
                  <For each={props.columns}>
                    {(column) => (
                      <Table.Cell style={{ "text-align": column.align ?? "left" }}>
                        {column.cell(row)}
                      </Table.Cell>
                    )}
                  </For>
                </Table.Row>
              )}
            </For>
          </Table.Body>
        </Table.Table>
      </Table.Root>
      {visibleRows().length === 0 ? (
        <p class="fui-DataTableEmpty">{props.emptyText ?? "No rows"}</p>
      ) : null}
      {props.pageSize && pageCount() > 1 ? (
        <div class="fui-DataTablePagination">
          <button
            type="button"
            disabled={page() === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          >
            Previous
          </button>
          <span>
            Page {page() + 1} of {pageCount()}
          </span>
          <button
            type="button"
            disabled={page() >= pageCount() - 1}
            onClick={() => setPage((current) => Math.min(pageCount() - 1, current + 1))}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
};
