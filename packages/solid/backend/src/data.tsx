import { For, Show, createSignal, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { cx } from "@solidix/primitive";
import { useControllableState } from "@solidix/use-controllable-state";

/** One record rendered by `DataRow`. Wave 0 proves the row contract. */
export type DataRowRecord = {
  /** Stable row key. Never use a row index. */
  id: string;
  /** Primary label, usually a name or title. */
  primary: string;
  /** Secondary label, usually an email, slug, or owner. */
  secondary?: string | undefined;
  /** Status text shown in the trailing status slot. */
  status?: string | undefined;
  /** Numeric or mono value shown right-aligned with tabular figures. */
  value?: string | undefined;
};

/** Props for `DataRow`. */
export type DataRowProps = Omit<JSX.IntrinsicElements["div"], "ref" | "children"> & {
  /** Record to present. The app owns fetching and filtering. */
  record: DataRowRecord;
  /** Marks the row selected, using the selected surface role. */
  selected?: boolean | undefined;
  /** Rendered via ref callback or element ref from Solid. */
  ref?: ((el: HTMLDivElement | null) => void) | HTMLDivElement | undefined;
};

/**
 * Single dense data row: primary and secondary labels, tabular value,
 * and status. Edge-to-edge with a hairline divider, never card-wrapped.
 */
export const DataRow: Component<DataRowProps> = (props) => {
  const rest = omit(props, "class", "record", "selected");
  return (
    <div
      data-backend-part="data-row"
      data-selected={props.selected ? "true" : undefined}
      class={cx("sbx-data-row", props.class)}
      {...rest}
    >
      <div class="sbx-data-row-main">
        <span class="sbx-data-row-primary">{props.record.primary}</span>
        {props.record.secondary ? (
          <span class="sbx-data-row-secondary">{props.record.secondary}</span>
        ) : null}
      </div>
      {props.record.value ? <span class="sbx-data-row-value">{props.record.value}</span> : null}
      {props.record.status ? <span class="sbx-data-row-status">{props.record.status}</span> : null}
    </div>
  );
};

/** Props for `DataList`, an edge-to-edge stack of data rows. */
export type DataListProps = Omit<JSX.IntrinsicElements["div"], "ref" | "children"> & {
  /** Records to present, in display order. */
  records: DataRowRecord[];
  /** Selected record ids, matched by stable `id`. */
  selectedIds?: string[] | undefined;
  /** Content shown when `records` is empty. */
  empty?: JSX.Element | undefined;
  /** Rendered via ref callback or element ref from Solid. */
  ref?: ((el: HTMLDivElement | null) => void) | HTMLDivElement | undefined;
};

/** Edge-to-edge list of `DataRow` records with divider rhythm. */
export const DataList: Component<DataListProps> = (props) => {
  const rest = omit(props, "class", "records", "selectedIds", "empty");
  return (
    <div data-backend-part="data-list" class={cx("sbx-data-list", props.class)} {...rest}>
      {props.records.length === 0 && props.empty ? (
        props.empty
      ) : (
        <For each={props.records}>
          {(record) => <DataRow record={record} selected={props.selectedIds?.includes(record.id)} />}
        </For>
      )}
    </div>
  );
};

/** Sort direction for a `DataTable` column. */
export type SortDirection = "asc" | "desc";

/** Active sort reported by `DataTable`. */
export type SortState = {
  /** Column key being sorted. */
  key: string;
  /** Current sort direction. */
  direction: SortDirection;
};

/** One column definition for `DataTable`. */
export type DataColumn<T extends { id: string }> = {
  /** Stable column key, used for sort state. */
  key: string;
  /** Header label shown in the sticky header. */
  header: string;
  /** Cell alignment. Numeric columns should use `end`. */
  align?: "start" | "end" | undefined;
  /** Enables header sorting for this column. */
  sortable?: boolean | undefined;
  /** Value used to sort presented rows. Required for sorting to reorder. */
  sortValue?: ((row: T) => string | number) | undefined;
  /** Custom cell renderer. Defaults to `String(row[key])`. */
  render?: ((row: T) => JSX.Element) | undefined;
  /** Initial column width, any CSS length. Resizing updates it locally. */
  width?: string | undefined;
  /** Shows a drag and keyboard resize handle on this column. */
  resizable?: boolean | undefined;
};

/** Props for `DataTable`. Generic over row records with stable `id`. */
export type DataTableProps<T extends { id: string }> = Omit<
  JSX.IntrinsicElements["div"],
  "ref" | "children"
> & {
  /** Column definitions in display order. */
  columns: DataColumn<T>[];
  /** Rows to present. The table sorts only the rows it is given. */
  rows: T[];
  /** Shows row checkboxes and enables selection. */
  selectable?: boolean | undefined;
  /** Controlled selected row ids. */
  selectedIds?: string[] | undefined;
  /** Initial selected row ids for uncontrolled use. */
  defaultSelectedIds?: string[] | undefined;
  /** Called with the next selected id list after a toggle. */
  onSelectionChange?: ((ids: string[]) => void) | undefined;
  /** Controlled active sort. */
  sort?: SortState | undefined;
  /** Initial sort for uncontrolled use. */
  defaultSort?: SortState | undefined;
  /** Called with the next sort after a header activation. */
  onSortChange?: ((sort: SortState) => void) | undefined;
  /**
   * `client` (default) sorts the presented rows. `server` only reports
   * the next sort via `onSortChange`; the app re-fetches and passes
   * already-sorted rows back in.
   */
  sortMode?: "client" | "server" | undefined;
  /**
   * Opt-in windowing for large row sets. Renders only the visible
   * window plus overscan inside a fixed-height scroller.
   */
  virtual?: { rowHeight?: number | undefined; height?: number | undefined; overscan?: number | undefined } | undefined;
  /** Content shown when `rows` is empty. */
  empty?: JSX.Element | undefined;
  /** Accessible name for the table. */
  caption?: string | undefined;
  /** Rendered via ref callback or element ref from Solid. */
  ref?: ((el: HTMLDivElement | null) => void) | HTMLDivElement | undefined;
};

/**
 * Dense data table with sticky header, column sorting, and stable-key
 * row selection. Presents rows it is given; fetching and full-set
 * filtering stay in the app.
 */
export function DataTable<T extends { id: string }>(props: DataTableProps<T>): JSX.Element {
  const [selectedIds, setSelectedIds] = useControllableState<string[]>({
    prop: () => props.selectedIds,
    defaultProp: props.defaultSelectedIds ?? [],
    onChange: props.onSelectionChange as ((value: string[]) => void) | undefined,
    caller: "DataTable",
  });
  const [sort, setSort] = useControllableState<SortState | undefined>({
    prop: () => props.sort,
    defaultProp: props.defaultSort,
    onChange: props.onSortChange as ((value: SortState | undefined) => void) | undefined,
    caller: "DataTable",
  });
  const sortedRows = (): T[] => {
    if (props.sortMode === "server") return props.rows;
    const active = sort();
    if (!active) return props.rows;
    const column = props.columns.find((c) => c.key === active.key);
    if (!column?.sortValue) return props.rows;
    const get = column.sortValue;
    return [...props.rows].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return active.direction === "asc" ? cmp : -cmp;
    });
  };
  const toggleRow = (id: string, checked: boolean) => {
    const current = selectedIds();
    setSelectedIds(checked ? [...current, id] : current.filter((x) => x !== id));
  };
  const allSelected = () => props.rows.length > 0 && props.rows.every((r) => selectedIds().includes(r.id));
  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? props.rows.map((r) => r.id) : []);
  };
  const activateSort = (column: DataColumn<T>) => {
    if (!column.sortable) return;
    const current = sort();
    const direction: SortDirection =
      current?.key === column.key && current.direction === "asc" ? "desc" : "asc";
    setSort({ key: column.key, direction });
  };
  const [widths, setWidths] = createSignal<Record<string, number>>({});
  const widthOf = (column: DataColumn<T>): string | undefined => {
    const px = widths()[column.key];
    if (px !== undefined) return `${px}px`;
    return column.width;
  };
  const setWidthPx = (key: string, px: number) => {
    setWidths((prev) => ({ ...prev, [key]: Math.max(48, Math.round(px)) }));
  };
  const startResize = (column: DataColumn<T>, event: PointerEvent) => {
    event.preventDefault();
    const th = (event.currentTarget as HTMLElement).closest("th");
    const startX = event.clientX;
    const startWidth = th?.getBoundingClientRect().width ?? 120;
    const onMove = (move: PointerEvent) => setWidthPx(column.key, startWidth + move.clientX - startX);
    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  };
  const onResizeKey = (column: DataColumn<T>, event: KeyboardEvent) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const th = (event.currentTarget as HTMLElement).closest("th");
    const current = th?.getBoundingClientRect().width ?? 120;
    setWidthPx(column.key, current + (event.key === "ArrowRight" ? 8 : -8));
  };
  const [scrollTop, setScrollTop] = createSignal(0);
  const rowHeight = () => props.virtual?.rowHeight ?? 40;
  const viewHeight = () => props.virtual?.height ?? 320;
  const overscan = () => props.virtual?.overscan ?? 4;
  const visibleRows = (): { rows: T[]; topPad: number; bottomPad: number } => {
    const all = sortedRows();
    if (!props.virtual) return { rows: all, topPad: 0, bottomPad: 0 };
    const start = Math.max(0, Math.floor(scrollTop() / rowHeight()) - overscan());
    const count = Math.ceil(viewHeight() / rowHeight()) + overscan() * 2;
    const slice = all.slice(start, start + count);
    return { rows: slice, topPad: start * rowHeight(), bottomPad: Math.max(0, (all.length - start - slice.length) * rowHeight()) };
  };
  const rest = omit(props as unknown as DataTableProps<{ id: string }>, "class", "columns", "rows", "selectable", "selectedIds", "defaultSelectedIds", "onSelectionChange", "sort", "defaultSort", "onSortChange", "sortMode", "virtual", "empty", "caption");
  return (
    <div
      data-backend-part="data-table"
      class={cx("sbx-table-wrap", (props as { class?: string }).class)}
      style={props.virtual ? { "max-height": `${viewHeight()}px`, "overflow-y": "auto" } : undefined}
      onScroll={props.virtual ? (e) => setScrollTop(e.currentTarget.scrollTop) : undefined}
      {...rest}
    >
      <table class="sbx-table">
        {props.caption ? <caption class="sbx-table-caption">{props.caption}</caption> : null}
        <thead>
          <tr>
            {props.selectable ? (
              <th class="sbx-table-select" scope="col">
                <input
                  type="checkbox"
                  aria-label="Select all rows"
                  checked={allSelected()}
                  onChange={(e) => toggleAll(e.currentTarget.checked)}
                />
              </th>
            ) : null}
            <For each={props.columns}>
              {(column) => {
                const isSorted = () => sort()?.key === column.key;
                return (
                  <th
                    scope="col"
                    class={cx("sbx-table-th", column.align === "end" && "sbx-table-end")}
                    style={{ width: widthOf(column) }}
                    aria-sort={isSorted() ? (sort()?.direction === "asc" ? "ascending" : "descending") : undefined}
                  >
                    {column.sortable ? (
                      <button type="button" class="sbx-table-sort" onClick={() => activateSort(column)}>
                        {column.header}
                        <span aria-hidden="true">{isSorted() ? (sort()?.direction === "asc" ? " ↑" : " ↓") : ""}</span>
                      </button>
                    ) : (
                      column.header
                    )}
                    {column.resizable ? (
                      <span
                        class="sbx-col-resize"
                        role="separator"
                        aria-label={`Resize column ${column.header}`}
                        aria-orientation="vertical"
                        tabindex="0"
                        onPointerDown={(e) => startResize(column, e)}
                        onKeyDown={(e) => onResizeKey(column, e)}
                      />
                    ) : null}
                  </th>
                );
              }}
            </For>
          </tr>
        </thead>
        <tbody>
          {props.virtual && visibleRows().topPad > 0 ? (
            <tr aria-hidden="true"><td style={{ height: `${visibleRows().topPad}px`, padding: "0", border: "0" }} colspan="99" /></tr>
          ) : null}
          <For each={visibleRows().rows}>
            {(row) => (
              <tr data-selected={selectedIds().includes(row.id) ? "true" : undefined} class="sbx-table-row">
                {props.selectable ? (
                  <td class="sbx-table-select">
                    <input
                      type="checkbox"
                      aria-label={`Select row ${row.id}`}
                      checked={selectedIds().includes(row.id)}
                      onChange={(e) => toggleRow(row.id, e.currentTarget.checked)}
                    />
                  </td>
                ) : null}
                <For each={props.columns}>
                  {(column) => (
                    <td class={cx("sbx-table-td", column.align === "end" && "sbx-table-end")}>
                      {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? "")}
                    </td>
                  )}
                </For>
              </tr>
            )}
          </For>
          {props.virtual && visibleRows().bottomPad > 0 ? (
            <tr aria-hidden="true"><td style={{ height: `${visibleRows().bottomPad}px`, padding: "0", border: "0" }} colspan="99" /></tr>
          ) : null}
        </tbody>
      </table>
      {props.rows.length === 0 && props.empty ? props.empty : null}
      <span class="sbx-visually-hidden" role="status">
        {props.selectable ? `${selectedIds().length} selected` : ""}
      </span>
    </div>
  );
}

/** Props for `DataSkeleton`, the table and list loading placeholder. */
export type DataSkeletonProps = Omit<JSX.IntrinsicElements["div"], "ref" | "children"> & {
  /** Number of placeholder rows. Defaults to 5. */
  rows?: number | undefined;
  /** Number of placeholder columns. Defaults to 3. */
  columns?: number | undefined;
  /** Rendered via ref callback or element ref from Solid. */
  ref?: ((el: HTMLDivElement | null) => void) | HTMLDivElement | undefined;
};

/** Pulsing placeholder rows while a data surface loads. */
export const DataSkeleton: Component<DataSkeletonProps> = (props) => {
  const rest = omit(props, "class", "rows", "columns");
  const rowCount = () => props.rows ?? 5;
  const colCount = () => props.columns ?? 3;
  return (
    <div data-backend-part="data-skeleton" class={cx("sbx-skeleton", props.class)} role="status" aria-label="Loading" {...rest}>
      <For each={Array.from({ length: rowCount() })}>
        {() => (
          <div class="sbx-skeleton-row" aria-hidden="true">
            <For each={Array.from({ length: colCount() })}>
              {() => <span class="sbx-skeleton-bar" />}
            </For>
          </div>
        )}
      </For>
    </div>
  );
};

/** Props for `FilterBar`, search plus filter slots above a data surface. */
export type FilterBarProps = Omit<JSX.IntrinsicElements["div"], "ref"> & {
  /** Controlled search query. */
  query?: string | undefined;
  /** Initial search query for uncontrolled use. */
  defaultQuery?: string | undefined;
  /** Called with the next query on every input. */
  onQueryChange?: ((query: string) => void) | undefined;
  /** Placeholder for the search input. Never used as its label. */
  placeholder?: string | undefined;
  /** Result count shown after the filters, for example `12 results`. */
  resultCount?: string | undefined;
  /** Rendered via ref callback or element ref from Solid. */
  ref?: ((el: HTMLDivElement | null) => void) | HTMLDivElement | undefined;
};

/** Search input, filter controls slot, and result count in one bar. */
export const FilterBar: Component<FilterBarProps> = (props) => {
  const rest = omit(props, "class", "children", "query", "defaultQuery", "onQueryChange", "placeholder", "resultCount");
  const [query, setQuery] = useControllableState<string>({
    prop: () => props.query,
    defaultProp: props.defaultQuery ?? "",
    onChange: props.onQueryChange as ((value: string) => void) | undefined,
    caller: "FilterBar",
  });
  return (
    <div data-backend-part="filter-bar" class={cx("sbx-filter-bar", props.class)} {...rest}>
      <label class="sbx-visually-hidden" for="sbx-filter-search">Search</label>
      <input
        id="sbx-filter-search"
        class="sbx-filter-search"
        type="search"
        value={query()}
        placeholder={props.placeholder ?? "Search"}
        onInput={(e) => setQuery(e.currentTarget.value)}
      />
      <div class="sbx-filter-controls">{props.children}</div>
      {props.resultCount ? <span class="sbx-filter-count">{props.resultCount}</span> : null}
    </div>
  );
};

/** Props for `Pagination`. Controlled: the app owns the current page. */
export type PaginationProps = Omit<JSX.IntrinsicElements["nav"], "ref" | "children"> & {
  /** Current page, 1-based. */
  page: number;
  /** Total page count, at least 1. */
  totalPages: number;
  /** Called with the next 1-based page. */
  onPageChange: (page: number) => void;
  /** Rendered via ref callback or element ref from Solid. */
  ref?: ((el: HTMLElement | null) => void) | HTMLElement | undefined;
};

/** Previous, page numbers, and next with disabled ends. */
export const Pagination: Component<PaginationProps> = (props) => {
  const rest = omit(props, "class", "page", "totalPages", "onPageChange");
  const pages = () => Array.from({ length: Math.max(1, props.totalPages) }, (_, i) => i + 1);
  const go = (page: number) => {
    const next = Math.min(Math.max(1, page), Math.max(1, props.totalPages));
    if (next !== props.page) props.onPageChange(next);
  };
  return (
    <nav data-backend-part="pagination" class={cx("sbx-pagination", props.class)} aria-label="Pagination" {...rest}>
      <button type="button" class="sbx-page-btn" disabled={props.page <= 1} onClick={() => go(props.page - 1)}>
        Previous
      </button>
      <For each={pages()}>
        {(page) => (
          <button
            type="button"
            class="sbx-page-btn"
            data-active={page === props.page ? "true" : undefined}
            aria-current={page === props.page ? "page" : undefined}
            onClick={() => go(page)}
          >
            {page}
          </button>
        )}
      </For>
      <button
        type="button"
        class="sbx-page-btn"
        disabled={props.page >= props.totalPages}
        onClick={() => go(props.page + 1)}
      >
        Next
      </button>
    </nav>
  );
};

/** Props for `BulkBar`, actions shown while rows are selected. */
export type BulkBarProps = Omit<JSX.IntrinsicElements["div"], "ref"> & {
  /** Number of selected rows. The bar renders only when above zero. */
  selectedCount: number;
  /** Clears the selection in the app. */
  onClear: () => void;
  /** Rendered via ref callback or element ref from Solid. */
  ref?: ((el: HTMLDivElement | null) => void) | HTMLDivElement | undefined;
};

/**
 * Bulk action bar that replaces the filter bar in place while a
 * selection is active, so the frame never jumps.
 */
export const BulkBar: Component<BulkBarProps> = (props) => {
  const rest = omit(props, "class", "children", "selectedCount", "onClear");
  return (
    <Show when={props.selectedCount > 0}>
      <div data-backend-part="bulk-bar" class={cx("sbx-bulk-bar", props.class)} role="status" {...rest}>
        <span class="sbx-bulk-count">{props.selectedCount} selected</span>
        <div class="sbx-bulk-actions">{props.children}</div>
        <button type="button" class="sbx-bulk-clear" onClick={() => props.onClear()}>
          Clear
        </button>
      </div>
    </Show>
  );
};
