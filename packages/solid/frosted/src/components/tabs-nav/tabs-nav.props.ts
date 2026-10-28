import {
  baseTabsListPropDefs,
  type BaseTabsListOwnProps,
} from "../base-tabs-list/base-tabs-list.props";

/**
 * Prop definitions for `TabsNav.Root` (shared with `Tabs.List`).
 *
 * Upstream: `tabs-nav.props.ts` (`tabsNavPropDefs`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const tabsNavPropDefs = baseTabsListPropDefs;

/** Tabs nav root props (shared definition; alias of the base list own props). */
type TabsNavRootOwnProps = BaseTabsListOwnProps;

export { tabsNavPropDefs };
export type { TabsNavRootOwnProps };
