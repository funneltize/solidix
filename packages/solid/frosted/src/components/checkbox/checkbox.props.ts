import { colorProp, highContrastProp } from "../../helpers/props";
import type { PropDef } from "../../helpers/props";

const sizes = ["1", "2", "3"] as const;

/** Prop definitions driving `Checkbox` props, classes, and defaults. */
const checkboxPropDefs = {
  size: { type: "enum", values: sizes, default: "2" },
  color: colorProp,
  highContrast: highContrastProp,
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  color: typeof colorProp;
  highContrast: typeof highContrastProp;
};

export { checkboxPropDefs };
