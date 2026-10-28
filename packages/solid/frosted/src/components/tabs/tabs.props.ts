import {
  baseTabsListPropDefs,
  type BaseTabsListOwnProps,
} from "../base-tabs-list/base-tabs-list.props";

/**
 * Prop definitions for `Tabs.List` (shared with `TabsNav`).
 *
 * Upstream: `tabs.props.ts` (`tabsListPropDefs`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const tabsListPropDefs = baseTabsListPropDefs;

/** Tabs list props (shared definition; alias of the base list own props). */
type TabsListOwnProps = BaseTabsListOwnProps;

export { tabsListPropDefs };
export type { TabsListOwnProps };
