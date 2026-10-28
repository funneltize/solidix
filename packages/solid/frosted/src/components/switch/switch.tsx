import { omit, type Component } from "solid-js";
import {
  Switch as SwitchPrimitive,
  SwitchThumb,
  type SwitchProps as SwitchPrimitiveProps,
} from "@solidix/switch";
import { useControllableState } from "@solidix/use-controllable-state";
import { cx } from "../../helpers/cx";
import type { GetPropDefTypes } from "../../helpers/props";
import { switchPropDefs } from "./switch.props";

/** Own styling props of `Switch` derived from `switchPropDefs` (size, color, highContrast). */
type SwitchOwnProps = GetPropDefTypes<typeof switchPropDefs>;

/**
 * Props for the `Switch` component: prop-def styling values plus the
 * Solidix switch primitive props, with Frosted-controlled checked state.
 */
interface SwitchProps extends SwitchOwnProps, Omit<SwitchPrimitiveProps, "children"> {}

/**
 * A toggle switch with Frosted styling, built on the Solidix switch primitive.
 *
 * Upstream parity notes (`switch.tsx` at 56787900bfe0): the outer `span` carries
 * `fui-SwitchRoot` plus the consumer `class`, `style`, and the `fui-r-size-*`
 * class; the primitive button carries `fui-reset`, `fui-SwitchButton`, and
 * `data-accent-color`. `data-checked` / `data-unchecked` are set explicitly
 * because the Solidix primitive emits only `data-state`, while the ported CSS
 * selects on the Radix-style data attributes. `controlSize` and `data-readonly`
 * are intentionally unsupported, matching upstream.
 */
const Switch: Component<SwitchProps> = (props) => {
  const [checked, setChecked] = useControllableState<boolean>({
    prop: () => props.checked,
    defaultProp: props.defaultChecked ?? false,
    onChange: (value) => props.onCheckedChange?.(value),
    caller: "Switch",
  });
  const rest = omit(
    props,
    "checked",
    "class",
    "color",
    "defaultChecked",
    "highContrast",
    "onCheckedChange",
    "size",
    "style",
  );
  return (
    <span
      class={cx(
        "fui-SwitchRoot",
        props.class,
        `fui-r-size-${props.size ?? switchPropDefs.size.default}`,
        (props.highContrast ?? switchPropDefs.highContrast.default) && "fui-high-contrast",
      )}
      style={props.style}
    >
      <SwitchPrimitive
        {...rest}
        checked={checked()}
        onCheckedChange={setChecked}
        data-accent-color={props.color ?? switchPropDefs.color.default}
        data-checked={checked() ? "" : undefined}
        data-unchecked={!checked() ? "" : undefined}
        class={cx(
          "fui-reset",
          "fui-SwitchButton",
          (props.highContrast ?? switchPropDefs.highContrast.default) && "fui-high-contrast",
        )}
      >
        <SwitchThumb
          class={cx(
            "fui-SwitchThumb",
            (props.highContrast ?? switchPropDefs.highContrast.default) && "fui-high-contrast",
          )}
        />
      </SwitchPrimitive>
    </span>
  );
};

export { Switch };
export type { SwitchProps };
