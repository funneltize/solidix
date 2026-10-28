import type { JSX } from "@solidjs/web";
import type { PropDef } from "./prop-def";
import { semanticColors, themePropDefs } from "../../theme-options";

const colorsWithSemanticColors = [...semanticColors, ...themePropDefs.accentColor.values];
/** Prop def for the shared `color` prop: semantic plus accent colors. */
const colorProp = {
  type: "enum",
  values: colorsWithSemanticColors,
  default: undefined as (typeof colorsWithSemanticColors)[number] | undefined,
} satisfies PropDef<(typeof colorsWithSemanticColors)[number]>;

// `JSX.IntrinsicElements` includes 'color', which may lead to clashes
/** Intrinsic element props without `color` (ref-carrying). Not used in Wave 0. */
type PropsWithoutRefOrColor<T extends keyof JSX.IntrinsicElements> = Omit<
  JSX.IntrinsicElements[T],
  "color"
>;
/** Intrinsic element props with the clashing `color` prop removed. */
type PropsWithoutColor<T extends keyof JSX.IntrinsicElements> = Omit<
  JSX.IntrinsicElements[T],
  "color"
>;

export { colorProp };
export type { PropsWithoutRefOrColor, PropsWithoutColor };
