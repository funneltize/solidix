// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/select/select.props.ts

import type { GetPropDefTypes, PropDef } from "../../helpers/props";
import { colorProp, highContrastProp } from "../../helpers/props";

const sizes = ["1", "2", "3", "4"] as const;
const variants = ["classic", "surface", "soft", "ghost"] as const;

/** Prop definitions driving `Select` root props, classes, and defaults. */
const selectRootPropDefs = {
  size: { type: "enum", values: sizes, default: "2", responsive: true },
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
};

/** Prop definitions driving `Select.Trigger` props, classes, and defaults. */
const selectTriggerPropDefs = {
  variant: { type: "enum", values: variants, default: "surface", responsive: true },
  color: colorProp,
} satisfies {
  variant: PropDef<(typeof variants)[number]>;
  color: typeof colorProp;
};

/** Prop definitions driving `Select.Content` props, classes, and defaults. */
const selectContentPropDefs = {
  highContrast: highContrastProp,
} satisfies {
  highContrast: typeof highContrastProp;
};

/** Root props derived from {@link selectRootPropDefs}. */
type SelectRootOwnProps = GetPropDefTypes<typeof selectRootPropDefs>;
/** Trigger props derived from {@link selectTriggerPropDefs}. */
type SelectTriggerOwnProps = GetPropDefTypes<typeof selectTriggerPropDefs>;
/** Content props derived from {@link selectContentPropDefs}. */
type SelectContentOwnProps = GetPropDefTypes<typeof selectContentPropDefs>;

export { selectContentPropDefs, selectRootPropDefs, selectTriggerPropDefs };
export type { SelectContentOwnProps, SelectRootOwnProps, SelectTriggerOwnProps };
