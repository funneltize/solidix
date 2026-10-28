import { omit, type Component } from "solid-js";
import {
  Tabs as HeadlessRoot,
  TabsContent as HeadlessContent,
  TabsList as HeadlessList,
  TabsTrigger as HeadlessTrigger,
  type TabsContentProps as HeadlessContentProps,
  type TabsListProps as HeadlessListProps,
  type TabsProps as HeadlessRootProps,
  type TabsTriggerProps as HeadlessTriggerProps,
} from "@solidix/tabs";
import { cx } from "../../helpers/cx";

/** Props for `SegmentedControl.Root`. */
interface SegmentedControlRootProps extends Omit<HeadlessRootProps, "asChild" | "orientation"> {}

/**
 * Segmented control state root: manages the active value for the list and
 * panels. Horizontal only (upstream drops `orientation`).
 *
 * Upstream: `segmented-control.tsx` (`SegmentedControlRoot`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const SegmentedControlRoot: Component<SegmentedControlRootProps> = (props) => (
  <HeadlessRoot
    {...omit(props, "class")}
    class={cx("fui-BaseSegmentedControlRoot", props.class)}
  />
);

/** Props for `SegmentedControl.List`. */
interface SegmentedControlListProps extends Omit<HeadlessListProps, "asChild"> {}

/**
 * Segmented option strip: roving-tabindex tablist.
 *
 * Upstream: `segmented-control.tsx` (`SegmentedControlList`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const SegmentedControlList: Component<SegmentedControlListProps> = (props) => (
  <HeadlessList
    {...omit(props, "class")}
    class={cx("fui-BaseSegmentedControlList", props.class)}
  />
);

/** Props for `SegmentedControl.Trigger`. */
interface SegmentedControlTriggerProps extends Omit<HeadlessTriggerProps, "asChild"> {}

/**
 * One segment: wraps the label in an inner span for the selected indicator.
 *
 * Upstream: `segmented-control.tsx` (`SegmentedControlTrigger`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const SegmentedControlTrigger: Component<SegmentedControlTriggerProps> = (props) => (
  <HeadlessTrigger
    {...omit(props, "class", "children")}
    class={cx("fui-reset", "fui-BaseSegmentedControlTrigger", props.class)}
  >
    <span class="fui-BaseSegmentedControlTriggerInner">{props.children}</span>
  </HeadlessTrigger>
);

/** Props for `SegmentedControl.Content`. */
interface SegmentedControlContentProps extends Omit<HeadlessContentProps, "asChild"> {}

/**
 * Panel for one segment value.
 *
 * Upstream: `segmented-control.tsx` (`SegmentedControlContent`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const SegmentedControlContent: Component<SegmentedControlContentProps> = (props) => (
  <HeadlessContent {...props} class={cx("fui-SegmentedControlContent", props.class)} />
);

/**
 * Frosted segmented-control namespace, matching the upstream
 * `* as SegmentedControl`.
 */
const SegmentedControl = {
  Root: SegmentedControlRoot,
  List: SegmentedControlList,
  Trigger: SegmentedControlTrigger,
  Content: SegmentedControlContent,
};

export {
  SegmentedControl,
  SegmentedControlContent,
  SegmentedControlList,
  SegmentedControlRoot,
  SegmentedControlTrigger,
};
export type {
  SegmentedControlContentProps,
  SegmentedControlListProps,
  SegmentedControlRootProps,
  SegmentedControlTriggerProps,
};
