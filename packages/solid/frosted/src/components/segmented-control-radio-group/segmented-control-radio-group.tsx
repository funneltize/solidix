import { createContext, omit, useContext, type Component } from "solid-js";
import {
  RadioGroup as HeadlessRoot,
  RadioGroupItem as HeadlessItem,
  type RadioGroupItemProps as HeadlessItemProps,
  type RadioGroupProps as HeadlessRootProps,
} from "@solidix/radio-group";
import { useControllableState } from "@solidix/use-controllable-state";
import { cx } from "../../helpers/cx";

/** Context value shared from the radio root down to its items. */
interface SegmentedControlRadioGroupContextValue {
  /** Currently selected value, for the checked-state bridge. */
  value: () => string | null;
}

/** Context carrying the selected value down to radio items. */
const SegmentedControlRadioGroupContext = createContext<
  SegmentedControlRadioGroupContextValue | undefined
>(undefined);

/**
 * Reads the segmented radio-group context, returning `undefined` outside a root.
 *
 * @returns The context value, or `undefined` when there is no root.
 */
function useSegmentedControlRadioGroupContext():
  | SegmentedControlRadioGroupContextValue
  | undefined {
  return useContext(SegmentedControlRadioGroupContext);
}

/** Props for `SegmentedControlRadioGroup.Root`: string-valued group props. */
interface SegmentedControlRadioGroupRootProps extends Omit<HeadlessRootProps, "asChild"> {}

/**
 * Segment-styled radio group root: manages the selected value for the
 * items. Values are strings (the headless layer is string-based; upstream
 * is generic). Tracks the selected value in a controllable signal so items
 * can bridge the `data-checked` / `data-unchecked` attributes the frosted
 * CSS targets (the headless primitive only emits `data-state`).
 *
 * Upstream: `segmented-control-radio-group.tsx`
 * (`SegmentedControlRadioGroupRoot`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const SegmentedControlRadioGroupRoot: Component<SegmentedControlRadioGroupRootProps> = (props) => {
  const rest = omit(props, "class", "children", "value", "defaultValue", "onValueChange");
  const [value, setValue] = useControllableState<string | null>({
    prop: () => props.value,
    defaultProp: props.defaultValue ?? null,
    onChange: props.onValueChange as ((value: string | null) => void) | undefined,
    caller: "SegmentedControlRadioGroup",
  });
  return (
    <HeadlessRoot
      {...rest}
      value={value()}
      onValueChange={setValue}
      class={cx("fui-SegmentedControlRadioGroupRoot", props.class)}
    >
      <div class="fui-BaseSegmentedControlList">
        <SegmentedControlRadioGroupContext value={{ value }}>
          {props.children}
        </SegmentedControlRadioGroupContext>
      </div>
    </HeadlessRoot>
  );
};

/** Props for `SegmentedControlRadioGroup.Item`. */
interface SegmentedControlRadioGroupItemProps extends Omit<HeadlessItemProps, "asChild"> {}

/**
 * One radio segment: wraps the label in an inner span for the checked
 * indicator. Sets `data-checked` / `data-unchecked` explicitly because the
 * frosted CSS targets those attributes rather than `data-state`.
 *
 * Upstream: `segmented-control-radio-group.tsx`
 * (`SegmentedControlRadioGroupItem`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const SegmentedControlRadioGroupItem: Component<SegmentedControlRadioGroupItemProps> = (props) => {
  const context = useSegmentedControlRadioGroupContext();
  const checked = () => context?.value() === props.value;
  return (
    <HeadlessItem
      {...omit(props, "class", "children")}
      data-checked={checked() ? "" : undefined}
      data-unchecked={checked() ? undefined : ""}
      class={cx("fui-reset", "fui-BaseSegmentedControlTrigger", props.class)}
    >
      <span class="fui-BaseSegmentedControlTriggerInner">{props.children}</span>
    </HeadlessItem>
  );
};

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
