import { children, omit, type Component } from "solid-js";
import { Dynamic, type JSX } from "@solidjs/web";
import {
  Checkbox as CheckboxPrimitive,
  CheckboxIndicator,
  type CheckedState,
  type CheckboxProps as CheckboxPrimitiveProps,
} from "@solidix/checkbox";
import { useControllableState } from "@solidix/use-controllable-state";
import { cx } from "../../helpers/cx";
import type { GetPropDefTypes } from "../../helpers/props";
import { checkboxPropDefs } from "./checkbox.props";

/** Own props of `Checkbox` derived from `checkboxPropDefs` (size, color, highContrast). */
type CheckboxOwnProps = GetPropDefTypes<typeof checkboxPropDefs>;

/**
 * Props for the `Checkbox` component: prop-def styling values plus the
 * Solidix checkbox primitive props (minus `value`, consumed upstream) and an
 * `indeterminate` visual override. `checked` follows the primitive's union:
 * `true` renders checked, `false` unchecked, `"indeterminate"` renders the
 * indeterminate visual, equivalent to passing `indeterminate`.
 */
interface CheckboxProps
  extends CheckboxOwnProps, Omit<CheckboxPrimitiveProps, "children" | "value"> {
  /** Forces the indeterminate visual on or off, regardless of `checked` state. */
  indeterminate?: boolean | undefined;
  /** Label content; its presence renders the root as a `label` instead of a `span`. */
  children?: JSX.Element;
}

/**
 * Props for the checkbox state icons. Upstream parity: `size` selects the
 * 16/20/24px artwork and `strokeWidth`/`strokeLinecap` stay fixed.
 */
interface CheckboxIconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  /** Size token selecting which icon artwork to render. */
  size: "1" | "2" | "3";
  /** Icons never take children; the glyph is fixed. */
  children?: never;
}

/**
 * Checkmark glyph shown when the checkbox is checked.
 * Artwork copied verbatim from frosted-ui `checkbox.tsx` at 56787900bfe0.
 */
const CheckboxCheckmarkIcon: Component<CheckboxIconProps> = (props) => {
  const rest = omit(props, "color", "size");
  return (
    <>
      {props.size === "1" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          {...rest}
        >
          <path
            d="M4 8.5L6.5 11L12 5.5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      )}
      {props.size === "2" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          {...rest}
        >
          <path
            d="M5 11L8 14L15 7"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      )}
      {props.size === "3" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          {...rest}
        >
          <path
            d="M7 13L10 16L17 9"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      )}
    </>
  );
};

/**
 * Dash glyph shown when the checkbox is indeterminate.
 * Artwork copied verbatim from frosted-ui `checkbox.tsx` at 56787900bfe0.
 */
const CheckboxIndeterminateIcon: Component<CheckboxIconProps> = (props) => {
  const rest = omit(props, "color", "size");
  return (
    <>
      {props.size === "1" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          {...rest}
        >
          <path d="M5 8H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      )}
      {props.size === "2" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          {...rest}
        >
          <path d="M6 10H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      )}
      {props.size === "3" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          {...rest}
        >
          <path d="M7 12H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      )}
    </>
  );
};

/**
 * Themed checkbox. Renders a `span` (or a `label` when label children are
 * given) wrapping the unstyled Solidix checkbox, with Frosted accent color,
 * size, and high-contrast styling. `indeterminate` overrides the visual only;
 * the `checked` union (`true` / `false` / `"indeterminate"`) drives state.
 */
const Checkbox: Component<CheckboxProps> = (props) => {
  const size = () => props.size ?? checkboxPropDefs.size.default;
  const color = () => props.color ?? checkboxPropDefs.color.default;
  const highContrast = () => props.highContrast ?? checkboxPropDefs.highContrast.default;
  const [checked, setChecked] = useControllableState<CheckedState>({
    prop: () => props.checked,
    defaultProp: props.defaultChecked ?? false,
    onChange: (value) => props.onCheckedChange?.(value),
    caller: "Checkbox",
  });
  const indeterminate = () => props.indeterminate ?? checked() === "indeterminate";
  const label = children(() => props.children);
  const hasLabel = () => {
    const resolved = label();
    return resolved !== undefined && resolved !== null && resolved !== false;
  };
  const rest = omit(
    props,
    "checked",
    "children",
    "class",
    "color",
    "defaultChecked",
    "highContrast",
    "indeterminate",
    "onCheckedChange",
    "size",
    "style",
  );

  return (
    <Dynamic
      component={hasLabel() ? "label" : "span"}
      class={cx("fui-CheckboxRoot", props.class, `fui-r-size-${size()}`)}
      style={props.style}
    >
      <CheckboxPrimitive
        {...rest}
        checked={checked()}
        onCheckedChange={setChecked}
        data-accent-color={color()}
        data-checked={checked() === true ? "" : undefined}
        data-unchecked={checked() !== true && !indeterminate() ? "" : undefined}
        data-indeterminate={indeterminate() ? "" : undefined}
        aria-checked={indeterminate() ? "mixed" : checked() === true ? "true" : "false"}
        class={cx("fui-reset", "fui-CheckboxButton", highContrast() && "fui-high-contrast")}
      >
        <CheckboxIndicator class="fui-CheckboxIndicator" forceMount>
          {indeterminate() ? (
            <CheckboxIndeterminateIcon size={size()} class="fui-CheckboxIndicatorIcon" />
          ) : (
            <CheckboxCheckmarkIcon size={size()} class="fui-CheckboxIndicatorIcon" />
          )}
        </CheckboxIndicator>
      </CheckboxPrimitive>
      {label()}
    </Dynamic>
  );
};

export { Checkbox };
export type { CheckboxIconProps, CheckboxProps };
