import { createContext, omit, useContext, type Component } from "solid-js";
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
import { useControllableState } from "@solidix/use-controllable-state";
import { cx } from "../../helpers/cx";

/** Context value shared from the segmented root down to its triggers. */
interface SegmentedControlContextValue {
  /** Currently selected value, for the selected-state bridge. */
  value: () => string;
}

/** Context carrying the selected value down to segment triggers. */
const SegmentedControlContext = createContext<SegmentedControlContextValue | undefined>(undefined);

/**
 * Reads the segmented-control context, returning `undefined` outside a root.
 *
 * @returns The segmented-control context value, or `undefined` when there is no root.
 */
function useSegmentedControlContext(): SegmentedControlContextValue | undefined {
  return useContext(SegmentedControlContext);
}

/** Props for `SegmentedControl.Root`. */
interface SegmentedControlRootProps extends Omit<HeadlessRootProps, "asChild" | "orientation"> {}

/**
 * Segmented control state root: manages the active value for the list and
 * panels. Horizontal only (upstream drops `orientation`). Tracks the selected
 * value in a controllable signal so triggers can bridge the `data-selected`
 * attribute the frosted CSS targets (the headless primitive only emits
 * `data-state`).
 *
 * Upstream: `segmented-control.tsx` (`SegmentedControlRoot`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const SegmentedControlRoot: Component<SegmentedControlRootProps> = (props) => {
  const rest = omit(props, "class", "value", "defaultValue", "onValueChange");
  const [value, setValue] = useControllableState<string>({
    prop: () => props.value,
    defaultProp: props.defaultValue ?? "",
    onChange: props.onValueChange as ((value: string) => void) | undefined,
    caller: "SegmentedControl",
  });
  return (
    <HeadlessRoot
      {...rest}
      value={value()}
      onValueChange={setValue}
      class={cx("fui-BaseSegmentedControlRoot", props.class)}
    >
      <SegmentedControlContext value={{ value }}>{props.children}</SegmentedControlContext>
    </HeadlessRoot>
  );
};

/** Props for `SegmentedControl.List`. */
interface SegmentedControlListProps extends Omit<HeadlessListProps, "asChild"> {}

/**
 * Segmented option strip: roving-tabindex tablist.
 *
 * Upstream: `segmented-control.tsx` (`SegmentedControlList`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const SegmentedControlList: Component<SegmentedControlListProps> = (props) => (
  <HeadlessList {...omit(props, "class")} class={cx("fui-BaseSegmentedControlList", props.class)} />
);

/** Props for `SegmentedControl.Trigger`. */
interface SegmentedControlTriggerProps extends Omit<HeadlessTriggerProps, "asChild"> {}

/**
 * One segment: wraps the label in an inner span for the selected indicator.
 * Sets `data-selected` explicitly because the frosted CSS targets that
 * attribute rather than `data-state`.
 *
 * Upstream: `segmented-control.tsx` (`SegmentedControlTrigger`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const SegmentedControlTrigger: Component<SegmentedControlTriggerProps> = (props) => {
  const context = useSegmentedControlContext();
  const selected = () => context?.value() === props.value;
  return (
    <HeadlessTrigger
      {...omit(props, "class", "children")}
      data-selected={selected() ? "" : undefined}
      class={cx("fui-reset", "fui-BaseSegmentedControlTrigger", props.class)}
    >
      <span class="fui-BaseSegmentedControlTriggerInner">{props.children}</span>
    </HeadlessTrigger>
  );
};

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
