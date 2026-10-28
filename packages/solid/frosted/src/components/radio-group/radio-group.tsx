import { children, createContext, omit, useContext, type Component } from "solid-js";
import { Dynamic, type JSX } from "@solidjs/web";
import {
  RadioGroup as RadioGroupPrimitive,
  RadioGroupIndicator,
  Item as RadioGroupItemPrimitive,
  type RadioGroupItemProps as RadioGroupItemPrimitiveProps,
  type RadioGroupProps as RadioGroupPrimitiveProps,
} from "@solidix/radio-group";
import { useControllableState } from "@solidix/use-controllable-state";
import { cx } from "../../helpers/cx";
import { type GetPropDefTypes } from "../../helpers/props";
import { radioGroupPropDefs } from "./radio-group.props";

type RadioGroupOwnProps = GetPropDefTypes<typeof radioGroupPropDefs>;

/** Props for {@link Root}. */
interface RootProps extends Omit<RadioGroupPrimitiveProps, "children">, RadioGroupOwnProps {
  /** Radio items belonging to this group. */
  children?: JSX.Element;
}

/** Context value shared from the radio group root down to its items. */
interface RadioGroupContextValue {
  /** Size of the radio items. */
  size: RadioGroupOwnProps["size"];
  /** Accent color of the radio items. */
  color: RadioGroupOwnProps["color"];
  /** High-contrast styling flag for the radio items. */
  highContrast: RadioGroupOwnProps["highContrast"];
  /** Currently selected value, for the checked-state bridge. */
  value: () => string | null;
}

/** Context carrying root size, color, contrast, and value down to radio items. */
const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(undefined);

/**
 * Reads the radio group context, returning `undefined` outside a root.
 *
 * @returns The radio group context value, or `undefined` when there is no root.
 */
function useRadioGroupContext(): RadioGroupContextValue | undefined {
  return useContext(RadioGroupContext);
}

/**
 * Styled radio group root wrapping the Radix radio group primitive.
 *
 * Tracks the selected value in a controllable signal so items can bridge the
 * `data-checked` / `data-unchecked` attributes the frosted CSS targets (the
 * Radix primitive only emits `data-state`).
 *
 * @param props - Radio group props plus `size`, `color`, and `highContrast`.
 * @returns The styled radio group element.
 */
const Root: Component<RootProps> = (props) => {
  const rest = omit(
    props,
    "color",
    "highContrast",
    "size",
    "value",
    "defaultValue",
    "onValueChange",
  );
  const size = () => props.size ?? radioGroupPropDefs.size.default;
  const color = () => props.color ?? radioGroupPropDefs.color.default;
  const highContrast = () => props.highContrast ?? radioGroupPropDefs.highContrast.default;
  const [value, setValue] = useControllableState<string | null>({
    prop: () => props.value,
    defaultProp: props.defaultValue ?? null,
    onChange: props.onValueChange as ((value: string | null) => void) | undefined,
    caller: "RadioGroup",
  });
  return (
    <RadioGroupPrimitive
      {...rest}
      value={value()}
      onValueChange={setValue}
      data-accent-color={color()}
      class={cx("fui-RadioGroupRoot", `fui-r-size-${size()}`, props.class, {
        "fui-high-contrast": highContrast(),
      })}
    >
      <RadioGroupContext
        value={{ size: size(), color: color(), highContrast: highContrast(), value }}
      >
        {props.children}
      </RadioGroupContext>
    </RadioGroupPrimitive>
  );
};

/** Props for {@link Item}. */
interface ItemProps extends Omit<RadioGroupItemPrimitiveProps, "children" | "class" | "style"> {
  /** Optional label content displayed next to the radio button. */
  children?: JSX.Element;
  /** Additional classes for the item wrapper. */
  class?: string | undefined;
  /** Inline styles for the item wrapper. */
  style?: JSX.CSSProperties | undefined;
}

/**
 * Styled radio item with an optional accessible label.
 *
 * Renders a `label` wrapper when children are present, otherwise a `span`
 * (upstream parity). Sets `data-checked` / `data-unchecked` explicitly because
 * the frosted CSS targets those attributes rather than `data-state`.
 *
 * @param props - Radio item props plus optional label children.
 * @returns The styled radio item element.
 */
const Item: Component<ItemProps> = (rawProps) => {
  const context = useRadioGroupContext();
  const itemProps = omit(rawProps, "children", "class", "style", "value");
  const label = children(() => rawProps.children);
  const checked = () => context?.value() === rawProps.value;
  return (
    <Dynamic
      component={label() ? "label" : "span"}
      class={cx("fui-RadioGroupItem", rawProps.class)}
      style={rawProps.style}
    >
      <RadioGroupItemPrimitive
        {...itemProps}
        value={rawProps.value}
        class={cx("fui-reset", "fui-RadioGroupButton")}
        data-checked={checked() ? "" : undefined}
        data-unchecked={checked() ? undefined : ""}
      >
        <RadioGroupIndicator class="fui-RadioGroupIndicator" />
      </RadioGroupItemPrimitive>
      {label()}
    </Dynamic>
  );
};

/**
 * Namespaced `RadioGroup` export grouping the radio group parts (`Root`, `Item`).
 */
const RadioGroup = { Item, Root };

export { Item, RadioGroup, Root };
export type { ItemProps, RootProps };
