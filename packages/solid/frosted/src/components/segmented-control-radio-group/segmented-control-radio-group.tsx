import { omit, type Component } from "solid-js";
import {
  RadioGroup as HeadlessRoot,
  RadioGroupItem as HeadlessItem,
  type RadioGroupItemProps as HeadlessItemProps,
  type RadioGroupProps as HeadlessRootProps,
} from "@solidix/radio-group";
import { cx } from "../../helpers/cx";

/** Props for `SegmentedControlRadioGroup.Root`: string-valued group props. */
interface SegmentedControlRadioGroupRootProps extends Omit<HeadlessRootProps, "asChild"> {}

/**
 * Segment-styled radio group root: manages the selected value for the
 * items. Values are strings (the headless layer is string-based; upstream
 * is generic).
 *
 * Upstream: `segmented-control-radio-group.tsx`
 * (`SegmentedControlRadioGroupRoot`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const SegmentedControlRadioGroupRoot: Component<SegmentedControlRadioGroupRootProps> = (props) => (
  <HeadlessRoot {...omit(props, "class", "children")} class={cx("fui-SegmentedControlRadioGroupRoot", props.class)}>
    <div class="fui-BaseSegmentedControlList">{props.children}</div>
  </HeadlessRoot>
);

/** Props for `SegmentedControlRadioGroup.Item`. */
interface SegmentedControlRadioGroupItemProps extends Omit<HeadlessItemProps, "asChild"> {}

/**
 * One radio segment: wraps the label in an inner span for the checked
 * indicator.
 *
 * Upstream: `segmented-control-radio-group.tsx`
 * (`SegmentedControlRadioGroupItem`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const SegmentedControlRadioGroupItem: Component<SegmentedControlRadioGroupItemProps> = (props) => (
  <HeadlessItem
    {...omit(props, "class", "children")}
    class={cx("fui-reset", "fui-BaseSegmentedControlTrigger", props.class)}
  >
    <span class="fui-BaseSegmentedControlTriggerInner">{props.children}</span>
  </HeadlessItem>
);

/**
 * Frosted segmented-control-radio-group namespace, matching the upstream
 * `* as SegmentedControlRadioGroup`.
 */
const SegmentedControlRadioGroup = {
  Root: SegmentedControlRadioGroupRoot,
  Item: SegmentedControlRadioGroupItem,
};

export {
  SegmentedControlRadioGroup,
  SegmentedControlRadioGroupItem,
  SegmentedControlRadioGroupRoot,
};
export type { SegmentedControlRadioGroupItemProps, SegmentedControlRadioGroupRootProps };
