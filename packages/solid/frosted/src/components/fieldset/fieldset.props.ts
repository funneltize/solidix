import type { TextProps } from "../text/text.js";

/** Own props for `Fieldset.Legend` before the native `legend` attributes. */
export interface FieldsetLegendOwnProps {
  /** Legend text size, defaulting to `"3"` for `legend` and `"2"` for `label`. */
  size?: TextProps["size"] | undefined;
  /** Legend text weight, defaulting to `"bold"` for `legend` and `"medium"` for `label`. */
  weight?: TextProps["weight"] | undefined;
  /** Legend text alignment, passed through to `Text`. */
  align?: TextProps["align"] | undefined;
  /** Legend leading trim, passed through to `Text`. */
  trim?: TextProps["trim"] | undefined;
  /** Legend text color, passed through to `Text`. */
  color?: TextProps["color"] | undefined;
  /** Legend high-contrast flag, passed through to `Text`. */
  highContrast?: TextProps["highContrast"] | undefined;
  /**
   * Visual variant of the legend. Defaults to `"legend"`.
   * - `"legend"` - larger section-heading text (size `"3"`, weight `"bold"`).
   * - `"label"` - smaller field-label-like text (size `"2"`, weight `"medium"`).
   */
  variant?: "legend" | "label" | undefined;
  /**
   * Whether the legend is disabled. Defaults to the parent `Fieldset.Root`
   * `disabled` state.
   */
  disabled?: boolean | undefined;
}
