import { omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { cx } from "../../helpers/cx";
import type { PropsWithoutColor } from "../../helpers/props";
import { Button, type ButtonProps } from "../button/button";
import { tableRootPropDefs, type TableRootOwnProps } from "./table.props";

/** Props for `Table.Root`. */
interface TableRootProps extends TableRootOwnProps, PropsWithoutColor<"div"> {}

/**
 * Horizontally scrollable table container with size and variant classes.
 *
 * Upstream: `table.tsx` (`TableRoot`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const TableRoot: Component<TableRootProps> = (props) => {
  const size = () => props.size ?? tableRootPropDefs.size.default;
  const variant = () => props.variant ?? tableRootPropDefs.variant.default;
  return (
    <div
      {...omit(props, "size", "variant", "class", "children")}
      class={cx("fui-TableRoot", `fui-r-size-${size()}`, `fui-variant-${variant()}`, props.class)}
    >
      {props.children}
    </div>
  );
};

/** Props for `Table.Table`: accepts (and ignores) the root sizing props. */
interface TableTableProps extends TableRootOwnProps, PropsWithoutColor<"table"> {}

/**
 * The `table` element itself. Accepts the root sizing props for API
 * compatibility but ignores them (upstream quirk).
 *
 * Upstream: `table.tsx` (`TableTable`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const TableTable: Component<TableTableProps> = (props) => (
  <table
    {...omit(props, "size", "variant", "class", "children")}
    class={cx("fui-TableTable", props.class)}
  >
    {props.children}
  </table>
);

/** Props for `Table.Header`. */
interface TableHeaderProps extends PropsWithoutColor<"thead"> {}

/**
 * Table header group.
 *
 * Upstream: `table.tsx` (`TableHeader`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const TableHeader: Component<TableHeaderProps> = (props) => (
  <thead {...omit(props, "class", "children")} class={cx("fui-TableHeader", props.class)}>
    {props.children}
  </thead>
);

/** Props for `Table.Body`. */
interface TableBodyProps extends PropsWithoutColor<"tbody"> {}

/**
 * Table body group.
 *
 * Upstream: `table.tsx` (`TableBody`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const TableBody: Component<TableBodyProps> = (props) => (
  <tbody {...omit(props, "class", "children")} class={cx("fui-TableBody", props.class)}>
    {props.children}
  </tbody>
);

/** Props for `Table.Footer`. */
interface TableFooterProps extends PropsWithoutColor<"tfoot"> {}

/**
 * Table footer group.
 *
 * Upstream: `table.tsx` (`TableFooter`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const TableFooter: Component<TableFooterProps> = (props) => (
  <tfoot {...omit(props, "class", "children")} class={cx("fui-TableFooter", props.class)}>
    {props.children}
  </tfoot>
);

/** Props for `Table.Row`. */
interface TableRowProps extends PropsWithoutColor<"tr"> {}

/**
 * One table row.
 *
 * Upstream: `table.tsx` (`TableRow`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const TableRow: Component<TableRowProps> = (props) => (
  <tr {...omit(props, "class", "children")} class={cx("fui-TableRow", props.class)}>
    {props.children}
  </tr>
);

/** Props for `Table.RowHeader` and `Table.ColumnHeaderCell` alignment. */
type TableCellAlign = "start" | "center" | "end";

/** Justify value for a column header cell. */
type TableColumnJustify = "start" | "center" | "end";

/**
 * Props for `Table.RowHeader`. `style` is narrowed to object form (string
 * styles cannot merge with `width`) and keeps the intrinsic optional shape
 * (no explicit `| undefined`) so the override stays assignable.
 */
interface TableRowHeaderProps extends Omit<PropsWithoutColor<"th">, "style" | "align" | "width"> {
  /** Text alignment of the header cell. No class when unset. */
  align?: TableCellAlign | undefined;
  /** Fixed width, merged into the inline style. */
  width?: string | number | undefined;
  /** Inline styles. String styles cannot merge with `width`. */
  style?: JSX.CSSProperties;
}

/** Props for `Table.ColumnHeaderCell`. */
interface TableColumnHeaderCellProps extends Omit<
  PropsWithoutColor<"th">,
  "style" | "align" | "justify" | "width"
> {
  /** Text alignment of the header cell. No class when unset. */
  align?: TableCellAlign | undefined;
  /** Content justification of the header cell. No class when unset. */
  justify?: TableColumnJustify | undefined;
  /** Fixed width, merged into the inline style. */
  width?: string | number | undefined;
  /** Inline styles. String styles cannot merge with `width`. */
  style?: JSX.CSSProperties;
}

/** Props for `Table.Cell`. */
interface TableCellProps extends Omit<
  PropsWithoutColor<"td">,
  "style" | "align" | "justify" | "width"
> {
  /** Text alignment of the cell. No class when unset. */
  align?: TableCellAlign | undefined;
  /** Content justification of the cell. No class when unset. */
  justify?: TableColumnJustify | undefined;
  /** Fixed width, merged into the inline style. */
  width?: string | number | undefined;
  /** Inline styles. String styles cannot merge with `width`. */
  style?: JSX.CSSProperties;
}

/**
 * Merge a cell `width` into the consumer style object. Numbers become px
 * strings (React does this conversion; Solid leaves numbers unit-less,
 * which CSS ignores for `width`).
 */
function cellStyle(
  width: string | number | undefined,
  style: JSX.CSSProperties | undefined,
): JSX.CSSProperties {
  const widthStyle =
    width === undefined ? {} : { width: typeof width === "number" ? `${width}px` : width };
  return { ...widthStyle, ...style };
}

/**
 * Row header cell (`th` with row scope), with optional alignment and width.
 *
 * Upstream: `table.tsx` (`TableRowHeaderCell`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const TableRowHeader: Component<TableRowHeaderProps> = (props) => (
  <th
    {...omit(props, "align", "width", "style", "class", "children")}
    scope="row"
    style={cellStyle(props.width, props.style)}
    class={cx(
      "fui-TableCell",
      "fui-TableRowHeaderCell",
      props.align ? `fui-r-ta-${props.align}` : undefined,
      props.class,
    )}
  >
    {props.children}
  </th>
);

/**
 * Column header cell (`th` with column scope), with optional alignment,
 * justification, and width.
 *
 * Upstream: `table.tsx` (`TableColumnHeaderCell`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const TableColumnHeaderCell: Component<TableColumnHeaderCellProps> = (props) => (
  <th
    {...omit(props, "align", "justify", "width", "style", "class", "children")}
    scope="col"
    style={cellStyle(props.width, props.style)}
    class={cx(
      "fui-TableCell",
      "fui-TableColumnHeaderCell",
      props.align ? `fui-r-ta-${props.align}` : undefined,
      props.justify ? `fui-r-jc-${props.justify}` : undefined,
      props.class,
    )}
  >
    {props.children}
  </th>
);

/**
 * Body cell, with optional alignment, justification, and width.
 *
 * Upstream: `table.tsx` (`TableCell`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const TableCell: Component<TableCellProps> = (props) => (
  <td
    {...omit(props, "align", "justify", "width", "style", "class", "children")}
    style={cellStyle(props.width, props.style)}
    class={cx(
      "fui-TableCell",
      props.align ? `fui-r-ta-${props.align}` : undefined,
      props.justify ? `fui-r-jc-${props.justify}` : undefined,
      props.class,
    )}
  >
    {props.children}
  </td>
);

/** Sort direction of a column header button, or `false` when unsorted. */
type TableSortDirection = "asc" | "desc" | false;

/** Props for `Table.ColumnHeaderCellButton`. */
interface TableColumnHeaderCellButtonProps extends Omit<PropsWithoutColor<"button">, "color"> {
  /** Whether the column is the active sort column. */
  active?: boolean | undefined;
  /** Sort direction indicator. No direction class when `false`. */
  sortDirection?: TableSortDirection | undefined;
}

/**
 * Sort button for a column header cell: a ghost gray high-contrast button
 * with sortable/active/direction classes. Note the button is only as wide
 * as its content; pass `width="100%"` to stretch it.
 *
 * Upstream: `table.tsx` (`TableColumnHeaderCellButton`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const TableColumnHeaderCellButton: Component<TableColumnHeaderCellButtonProps> = (props) => {
  // Button-attr passthrough into `Button` props: sound at runtime (the same
  // attrs reach the underlying button) and upstream-identical.
  // Blockquote precedent.
  const buttonProps = omit(props, "active", "sortDirection", "class", "children");
  return (
    <Button
      variant="ghost"
      color="gray"
      highContrast
      {...(buttonProps as unknown as ButtonProps)}
      class={cx(
        "fui-TableColumnHeaderCellButton",
        "fui-sortable",
        props.active ? "fui-active" : undefined,
        props.sortDirection ? `fui-sort-${props.sortDirection}` : undefined,
        props.class,
      )}
    >
      {props.children}
    </Button>
  );
};

/** Frosted table namespace, matching the upstream `* as Table`. */
const Table = {
  Root: TableRoot,
  Table: TableTable,
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Row: TableRow,
  RowHeader: TableRowHeader,
  ColumnHeaderCell: TableColumnHeaderCell,
  Cell: TableCell,
  ColumnHeaderCellButton: TableColumnHeaderCellButton,
};

export {
  Table,
  TableBody,
  TableCell,
  TableColumnHeaderCell,
  TableColumnHeaderCellButton,
  TableFooter,
  TableHeader,
  TableRoot,
  TableRow,
  TableRowHeader,
  TableTable,
};
export type {
  TableBodyProps,
  TableCellAlign,
  TableCellProps,
  TableColumnHeaderCellButtonProps,
  TableColumnHeaderCellProps,
  TableColumnJustify,
  TableFooterProps,
  TableHeaderProps,
  TableRootProps,
  TableRowHeaderProps,
  TableRowProps,
  TableSortDirection,
  TableTableProps,
};
