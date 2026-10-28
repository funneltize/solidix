import {
  children,
  createContext,
  omit,
  onSettled,
  Show,
  useContext,
  type Component,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  RadioGroup as RadioGroupPrimitive,
  Item as RadioGroupItemPrimitive,
  type RadioGroupItemProps as RadioGroupItemPrimitiveProps,
  type RadioGroupProps as RadioGroupPrimitiveProps,
} from "@solidix/radio-group";
import { useControllableState } from "@solidix/use-controllable-state";
import { cx } from "../../helpers/cx";
import type { GetPropDefTypes } from "../../helpers/props";
import { radioButtonGroupPropDefs } from "./radio-button-group.props";

type RadioButtonGroupOwnProps = GetPropDefTypes<typeof radioButtonGroupPropDefs>;

/**
 * Props for {@link Root | RadioButtonGroup.Root}. Extends the Radix-style
 * group props (`@solidix/radio-group`) with accent `color` and `highContrast`.
 */
interface RootProps extends Omit<RadioGroupPrimitiveProps, "children">, RadioButtonGroupOwnProps {
  /** Radio button items belonging to this group. */
  children?: JSX.Element;
}

/**
 * Value shared from the radio button group root down to icons and items.
 * Upstream this is just the own props; the Solid port also carries the
 * selected value so items can bridge checked state to `data-checked`.
 */
interface RadioButtonGroupContextValue extends RadioButtonGroupOwnProps {
  /** Currently selected value, or null when nothing is selected. */
  value: () => string | null;
}

const RadioButtonGroupContext = createContext<RadioButtonGroupContextValue | undefined>(undefined);

/** Reads the ambient radio button group context, if any. */
function useRadioButtonGroupContext(): RadioButtonGroupContextValue | undefined {
  return useContext(RadioButtonGroupContext);
}

/**
 * Radio button group root. Renders the underlying `@solidix/radio-group`
 * group with the `fui-RadioButtonGroupRoot` class and a `data-accent-color`
 * attribute, and provides color/highContrast/value to descendants.
 */
const Root: Component<RootProps> = (rawProps) => {
  const color = () => rawProps.color ?? radioButtonGroupPropDefs.color.default;
  const highContrast = () => rawProps.highContrast ?? radioButtonGroupPropDefs.highContrast.default;
  const [value, setValue] = useControllableState<string | null>({
    prop: () => rawProps.value,
    defaultProp: rawProps.defaultValue ?? null,
    onChange: rawProps.onValueChange as ((value: string | null) => void) | undefined,
    caller: "RadioButtonGroup",
  });
  const rest = omit(rawProps, "color", "highContrast", "value", "defaultValue", "onValueChange");
  return (
    <RadioGroupPrimitive
      data-accent-color={color()}
      {...rest}
      value={value()}
      onValueChange={setValue}
      class={cx(
        "fui-RadioButtonGroupRoot",
        { "fui-high-contrast": highContrast() },
        rawProps.class,
      )}
    >
      <RadioButtonGroupContext value={{ color: color(), highContrast: highContrast(), value }}>
        {rawProps.children}
      </RadioButtonGroupContext>
    </RadioGroupPrimitive>
  );
};

/**
 * Props for {@link Item | RadioButtonGroup.Item}. Extends the Radix-style
 * item props (`@solidix/radio-group`) with Card-style content children.
 */
interface ItemProps extends Omit<RadioGroupItemPrimitiveProps, "children" | "class" | "style"> {
  /** Card (or other single-element) content rendered inside the radio button. */
  children?: JSX.Element;
  /** Additional classes merged onto the radio button. */
  class?: string | undefined;
  /** Inline styles for the radio button. */
  style?: JSX.CSSProperties | undefined;
}

/**
 * Radio button item. Upstream this renders Base UI `Radio.Root` with the
 * `fui-RadioButtonGroupButton`/`fui-RadioButtonGroupItem` classes and injects
 * the selection-ring overlay into a single-element child via `cloneElement`.
 * The Solid radio stack has no asChild/cloneElement equivalent, so this port
 * renders the overlay as an appended sibling inside the button instead; the
 * DOM differs but the visible overlay and checked styling match.
 */
const Item: Component<ItemProps> = (rawProps) => {
  const context = useRadioButtonGroupContext();
  const itemProps = omit(rawProps, "children", "class", "style", "value");
  const content = children(() => rawProps.children);
  const checked = () => context?.value() === rawProps.value;
  // Upstream injects the overlay only when the child count is exactly one
  // (`React.Children.count(children) === 1`); multiple children render without
  // it. Non-element children (plain text) would crash upstream `cloneElement`,
  // so only resolved elements qualify here.
  const isSingleElement = () => {
    const resolved = content();
    return Array.isArray(resolved)
      ? resolved.length === 1
      : typeof resolved === "object" && resolved !== null;
  };
  return (
    <RadioGroupItemPrimitive
      style={rawProps.style}
      {...itemProps}
      value={rawProps.value}
      class={cx(
        "fui-reset",
        "fui-RadioButtonGroupButton",
        "fui-RadioButtonGroupItem",
        rawProps.class,
      )}
      data-checked={checked() ? "" : undefined}
      data-unchecked={checked() ? undefined : ""}
    >
      {content()}
      <Show when={isSingleElement()}>
        <Overlay />
      </Show>
    </RadioGroupItemPrimitive>
  );
};

/**
 * Props for {@link Icon | RadioButtonGroup.Icon}. Accepts plain div props
 * except `children` and `color`, matching upstream.
 */
interface IconProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "color"> {}

/**
 * Check icon shown on Card-style radio button content, reading accent color
 * and contrast from the ambient group context.
 */
const Icon: Component<IconProps> = (props) => {
  const context = useRadioButtonGroupContext();
  const rest = omit(props, "class");
  return (
    <div
      data-accent-color={context?.color}
      class={cx(
        "fui-RadioButtonGroupIcon",
        { "fui-high-contrast": context?.highContrast },
        props.class,
      )}
      aria-hidden="true"
      {...rest}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M6 10.5L8.5 13L14 7.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  );
};

// Selection ring overlay. Upstream reads the parent card's border width and
// radius in a layout effect and copies them to `--parent-border-width` and
// `--parent-border-radius` custom properties. `onSettled` is the Solid
// post-insertion equivalent, so the parent is connected when this runs.
const Overlay: Component = () => {
  let element: HTMLDivElement | undefined;
  onSettled(() => {
    const parent = element?.parentElement;
    if (!element || !parent) return;
    const parentStyles = getComputedStyle(parent);
    element.style.setProperty("--parent-border-width", parentStyles.borderWidth);
    element.style.setProperty("--parent-border-radius", parentStyles.borderRadius);
  });
  return (
    <div
      ref={(node) => {
        element = node;
      }}
      class="fui-RadioButtonGroupOverlay"
      aria-hidden="true"
    />
  );
};

/**
 * Radio button group namespace: `RadioButtonGroup.Root`, `.Item`, `.Icon`.
 * `Overlay` stays internal, matching upstream (which exports no overlay).
 */
const RadioButtonGroup = { Icon, Item, Root };

export { Icon, Item, RadioButtonGroup, Root };
export type { IconProps, ItemProps, RootProps };
