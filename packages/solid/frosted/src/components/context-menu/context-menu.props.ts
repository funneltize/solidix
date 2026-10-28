// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/base-menu/base-menu.props.ts

import type { GetPropDefTypes, PropDef } from "../../helpers/props";
import { colorProp } from "../../helpers/props";

const sizes = ["1", "2", "3"] as const;
const variants = ["solid", "translucent"] as const;

/** Prop definitions driving `ContextMenu.Content` props, classes, and defaults. */
const contextMenuContentPropDefs = {
  size: { type: "enum", values: sizes, default: "2" },
  color: colorProp,
  variant: { type: "enum", values: variants, default: "translucent" },
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  color: typeof colorProp;
  variant: PropDef<(typeof variants)[number]>;
};

/** Prop definitions driving `ContextMenu.Item` and `ContextMenu.SubTrigger` props. */
const contextMenuItemPropDefs = {
  color: colorProp,
  shortcut: { type: "string", default: undefined },
} satisfies {
  color: typeof colorProp;
  shortcut: PropDef<string>;
};

/** Prop definitions driving `ContextMenu.CheckboxItem` props. */
const contextMenuCheckboxItemPropDefs = {
  shortcut: { type: "string", default: undefined },
} satisfies {
  shortcut: PropDef<string>;
};

/** Content props derived from {@link contextMenuContentPropDefs}. */
type ContextMenuContentOwnProps = GetPropDefTypes<typeof contextMenuContentPropDefs>;
/** Item props derived from {@link contextMenuItemPropDefs}. */
type ContextMenuItemOwnProps = GetPropDefTypes<typeof contextMenuItemPropDefs>;
/** CheckboxItem props derived from {@link contextMenuCheckboxItemPropDefs}. */
type ContextMenuCheckboxItemOwnProps = GetPropDefTypes<typeof contextMenuCheckboxItemPropDefs>;

export { contextMenuCheckboxItemPropDefs, contextMenuContentPropDefs, contextMenuItemPropDefs };
export type {
  ContextMenuCheckboxItemOwnProps,
  ContextMenuContentOwnProps,
  ContextMenuItemOwnProps,
};
