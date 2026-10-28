import { children, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  Checkbox as CheckboxPrimitive,
  type CheckedState,
  type CheckboxProps as CheckboxPrimitiveProps,
} from "@solidix/checkbox";
import { useControllableState } from "@solidix/use-controllable-state";
import { cx } from "../../helpers/cx";
import type { GetPropDefTypes } from "../../helpers/props";
import { filterChipPropDefs } from "./filter-chip.props";

/** Own props of `FilterChip` derived from `filterChipPropDefs` (size, color). */
type FilterChipOwnProps = GetPropDefTypes<typeof filterChipPropDefs>;

/** Props for the `FilterChip` component: headless checkbox props plus size/color. */
interface FilterChipProps
  extends FilterChipOwnProps, Omit<CheckboxPrimitiveProps, "children" | "value"> {
  /** Chip label content. */
  children: JSX.Element;
}

/**
 * Toggleable filter chip: a checkbox styled as a chip, with `data-checked` /
 * `data-unchecked` bridged from the headless checked state for the
 * `fui-BaseChip` styles.
 *
 * Upstream: `filter-chip.tsx` (`FilterChip`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const FilterChip: Component<FilterChipProps> = (props) => {
  const rest = omit(
    props,
    "checked",
    "children",
    "class",
    "color",
    "defaultChecked",
    "onCheckedChange",
    "size",
    "style",
  );
  const size = () => props.size ?? filterChipPropDefs.size.default;
  const color = () => props.color ?? filterChipPropDefs.color.default;
  const resolved = children(() => props.children);

  const [checked, setChecked] = useControllableState<CheckedState>({
    prop: () => props.checked,
    defaultProp: props.defaultChecked ?? false,
    onChange: (value) => props.onCheckedChange?.(value),
    caller: "FilterChip",
  });

  return (
    <CheckboxPrimitive
      data-accent-color={color()}
      {...rest}
      checked={checked()}
      onCheckedChange={setChecked}
      data-checked={checked() === true ? "" : undefined}
      data-unchecked={checked() !== true ? "" : undefined}
      class={cx("fui-reset", "fui-BaseChip", props.class, `fui-r-size-${size()}`)}
      style={props.style}
    >
      {resolved()}
    </CheckboxPrimitive>
  );
};

export { FilterChip };
export type { FilterChipOwnProps, FilterChipProps };
