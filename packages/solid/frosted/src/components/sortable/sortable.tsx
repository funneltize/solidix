// Solidix-native styled sortable list, built on @solidix/sortable.
// The headless package owns order, keyboard pickup, and announcements;
// these parts add the surface, grip, and drag feedback.

import { omit, type Component } from "solid-js";
import {
  Sortable as SortablePrimitive,
  SortableHandle as SortableHandlePrimitive,
  SortableItem as SortableItemPrimitive,
  type SortableHandleProps as SortableHandlePrimitiveProps,
  type SortableItemProps as SortableItemPrimitiveProps,
  type SortableProps as SortablePrimitiveProps,
} from "@solidix/sortable";
import { cx } from "../../helpers/cx";

/** Props for the styled sortable root. */
export type SortableProps = SortablePrimitiveProps;
/** Props for one styled sortable item. */
export type SortableItemProps = SortableItemPrimitiveProps;
/** Props for the styled drag handle. */
export type SortableHandleProps = SortableHandlePrimitiveProps;

/** Root of a styled sortable list; renders as a Stack with hairlines. */
export const Sortable: Component<SortableProps> = (props) => {
  const rest = omit(props, "class");
  return <SortablePrimitive {...rest} class={cx("fui-Sortable", props.class)} />;
};

/** One styled sortable row. */
export const SortableItem: Component<SortableItemProps> = (props) => {
  const rest = omit(props, "class");
  return <SortableItemPrimitive {...rest} class={cx("fui-SortableItem", props.class)} />;
};

/** The styled grip handle: a quiet button that brightens on hover. */
export const SortableHandle: Component<SortableHandleProps> = (props) => {
  const rest = omit(props, "class", "children");
  return (
    <SortableHandlePrimitive {...rest} class={cx("fui-SortableHandle", props.class)}>
      {props.children ?? "⠿"}
    </SortableHandlePrimitive>
  );
};
