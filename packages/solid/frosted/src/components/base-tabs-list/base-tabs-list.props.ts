import type { GetPropDefTypes, PropDef } from "../../helpers/props";
import { colorProp, highContrastProp } from "../../helpers/props";

const sizes = ["1", "2"] as const;

/**
 * Shared list prop definitions for `Tabs` and `TabsNav`.
 *
 * Upstream: `base-tabs-list.props.ts` (`baseTabsListPropDefs`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const baseTabsListPropDefs = {
  size: { type: "enum", values: sizes, default: "2" },
  color: colorProp,
  highContrast: highContrastProp,
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  color: typeof colorProp;
  highContrast: typeof highContrastProp;
};

/** Shared list props derived from {@link baseTabsListPropDefs}. */
type BaseTabsListOwnProps = GetPropDefTypes<typeof baseTabsListPropDefs>;

export { baseTabsListPropDefs };
export type { BaseTabsListOwnProps };
