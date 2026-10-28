import { omit, type Component } from "solid-js";
import { cx } from "../../helpers/cx";
import type { PropsWithoutColor } from "../../helpers/props";
import { Text, type TextProps } from "../text/text";
import {
  dataListItemPropDefs,
  dataListLabelPropDefs,
  dataListRootPropDefs,
  type DataListItemOwnProps,
  type DataListLabelOwnProps,
  type DataListRootOwnProps,
} from "./data-list.props";

/** Props for `DataList.Root`. */
interface DataListRootProps extends PropsWithoutColor<"dl">, DataListRootOwnProps {}

/**
 * Description list root: a `Text` rendered as a `dl` with size, trim, and
 * orientation classes.
 *
 * Upstream: `data-list.tsx` (`DataListRoot`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const DataListRoot: Component<DataListRootProps> = (props) => {
  const size = () => props.size ?? dataListRootPropDefs.size.default;
  const trim = () => props.trim ?? dataListRootPropDefs.trim.default;
  const orientation = () => props.orientation ?? dataListRootPropDefs.orientation.default;
  // Dl-flavored passthrough into span-typed `Text` props: sound at runtime
  // (the `render` branch forwards to the dl) and upstream-identical.
  // Blockquote precedent.
  const textProps = omit(props, "size", "trim", "orientation", "class") as unknown as TextProps;
  return (
    <Text
      render={<dl />}
      {...textProps}
      class={cx(
        "fui-DataListRoot",
        `fui-r-size-${size()}`,
        trim() ? `fui-r-lt-${trim()}` : undefined,
        `fui-r-orientation-${orientation()}`,
        props.class,
      )}
    />
  );
};

/** Props for `DataList.Item`. */
interface DataListItemProps extends PropsWithoutColor<"div">, DataListItemOwnProps {}

/**
 * One label/value row of the data list.
 *
 * Upstream: `data-list.tsx` (`DataListItem`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const DataListItem: Component<DataListItemProps> = (props) => {
  const align = () => props.align ?? dataListItemPropDefs.align.default;
  return (
    <div
      {...omit(props, "align", "class", "children")}
      class={cx("fui-DataListItem", align() ? `fui-r-ai-${align()}` : undefined, props.class)}
    >
      {props.children}
    </div>
  );
};

/** Props for `DataList.Label`. */
interface DataListLabelProps extends PropsWithoutColor<"dt">, DataListLabelOwnProps {}

/**
 * Term cell of a data-list row, tinted by the accent color.
 *
 * Upstream: `data-list.tsx` (`DataListLabel`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const DataListLabel: Component<DataListLabelProps> = (props) => {
  const color = () => props.color ?? dataListLabelPropDefs.color.default;
  const highContrast = () => props.highContrast ?? dataListLabelPropDefs.highContrast.default;
  return (
    <dt
      {...omit(props, "color", "highContrast", "class", "children")}
      data-accent-color={color()}
      class={cx("fui-DataListLabel", highContrast() ? "fui-high-contrast" : undefined, props.class)}
    >
      {props.children}
    </dt>
  );
};

/** Props for `DataList.Value`. */
interface DataListValueProps extends PropsWithoutColor<"dd"> {}

/**
 * Description cell of a data-list row.
 *
 * Upstream: `data-list.tsx` (`DataListValue`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const DataListValue: Component<DataListValueProps> = (props) => (
  <dd {...omit(props, "class", "children")} class={cx(props.class, "fui-DataListValue")}>
    {props.children}
  </dd>
);

/** Frosted data-list namespace, matching the upstream `* as DataList`. */
const DataList = {
  Root: DataListRoot,
  Item: DataListItem,
  Label: DataListLabel,
  Value: DataListValue,
};

export { DataList, DataListItem, DataListLabel, DataListRoot, DataListValue };
export type { DataListItemProps, DataListLabelProps, DataListRootProps, DataListValueProps };
