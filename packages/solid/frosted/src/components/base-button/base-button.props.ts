/** Prop definitions for the `BaseButton` component. */
import type { PropDef } from "../../helpers/props";
import { colorProp, highContrastProp } from "../../helpers/props";

const sizes = ["1", "2", "3", "4"] as const;
const variants = ["classic", "solid", "soft", "surface", "ghost"] as const;

/** Prop definitions driving `BaseButton` props, classes, and defaults. */
const baseButtonPropDefs = {
  size: { type: "enum", values: sizes, default: "2" },
  variant: { type: "enum", values: variants, default: "surface" },
  color: colorProp,
  highContrast: highContrastProp,
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  variant: PropDef<(typeof variants)[number]>;
  color: typeof colorProp;
  highContrast: typeof highContrastProp;
};

export { baseButtonPropDefs };
