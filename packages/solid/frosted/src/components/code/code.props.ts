/** Prop definitions for the `Code` component. */
import type { PropDef } from "../../helpers/props";
import { colorProp, highContrastProp, weightProp } from "../../helpers/props";

const sizes = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;
const variants = ["solid", "soft", "outline", "ghost"] as const;

/** Prop definitions driving `Code` props, classes, and defaults. */
const codePropDefs = {
  size: { type: "enum", values: sizes, default: undefined },
  variant: { type: "enum", values: variants, default: "soft" },
  weight: weightProp,
  color: colorProp,
  highContrast: highContrastProp,
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  variant: PropDef<(typeof variants)[number]>;
  weight: typeof weightProp;
  color: typeof colorProp;
  highContrast: typeof highContrastProp;
};

export { codePropDefs };
