/** Prop-value mapping helpers for frosted-ui components. */
import type { baseButtonPropDefs } from "../components/base-button/base-button.props";
import type { spinnerPropDefs } from "../components/spinner/spinner.props";
import type { Responsive } from "./breakpoints";

/**
 * Maps a `BaseButton` size token to the closest `Spinner` size token so the
 * loading spinner scales with the button.
 */
function mapButtonSizeToSpinnerSize(
  size: (typeof baseButtonPropDefs.size.values)[number],
): (typeof spinnerPropDefs.size.values)[number] {
  switch (size) {
    case "1":
      return "1";
    case "2":
    case "3":
      return "2";
    case "4":
      return "3";
  }
}

/**
 * Maps each breakpoint value of a responsive prop through `fn`, preserving the
 * `initial` key and the responsive object shape.
 */
function mapResponsiveProp<T extends string | boolean, R extends string | boolean | undefined>(
  value: Responsive<T> | undefined,
  fn: (value: T) => R,
): Responsive<R> | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string" || typeof value === "boolean") return fn(value);
  const result: { [key: string]: R } = {};
  for (const key of ["initial", "xs", "sm", "md", "lg", "xl"] as const) {
    if (value[key] !== undefined) result[key] = fn(value[key]);
  }
  return result as Responsive<R>;
}

export { mapButtonSizeToSpinnerSize, mapResponsiveProp };
