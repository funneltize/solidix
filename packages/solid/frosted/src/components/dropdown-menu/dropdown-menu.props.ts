// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/base-menu/base-menu.props.ts

import type { GetPropDefTypes, PropDef } from "../../helpers/props";
import { colorProp } from "../../helpers/props";

const sizes = ["1", "2", "3"] as const;
const variants = ["solid", "translucent"] as const;

/** Prop definitions driving `DropdownMenu.Content` props, classes, and defaults. */
const dropdownMenuContentPropDefs = {
  size: { type: "enum", values: sizes, default: "2" },
  color: colorProp,
  variant: { type: "enum", values: variants, default: "translucent" },
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  color: typeof colorProp;
  variant: PropDef<(typeof variants)[number]>;
};

/** Prop definitions driving `DropdownMenu.Item` and `DropdownMenu.SubTrigger` props. */
const dropdownMenuItemPropDefs = {
  color: colorProp,
  shortcut: { type: "string", default: undefined },
} satisfies {
  color: typeof colorProp;
  shortcut: PropDef<string>;
};

/** Prop definitions driving `DropdownMenu.CheckboxItem` props. */
const dropdownMenuCheckboxItemPropDefs = {
  shortcut: { type: "string", default: undefined },
} satisfies {
  shortcut: PropDef<string>;
};

/** Content props derived from {@link dropdownMenuContentPropDefs}. */
type DropdownMenuContentOwnProps = GetPropDefTypes<typeof dropdownMenuContentPropDefs>;
/** Item props derived from {@link dropdownMenuItemPropDefs}. */
type DropdownMenuItemOwnProps = GetPropDefTypes<typeof dropdownMenuItemPropDefs>;
/** CheckboxItem props derived from {@link dropdownMenuCheckboxItemPropDefs}. */
type DropdownMenuCheckboxItemOwnProps = GetPropDefTypes<typeof dropdownMenuCheckboxItemPropDefs>;

export { dropdownMenuCheckboxItemPropDefs, dropdownMenuContentPropDefs, dropdownMenuItemPropDefs };
export type {
  DropdownMenuCheckboxItemOwnProps,
  DropdownMenuContentOwnProps,
  DropdownMenuItemOwnProps,
};
