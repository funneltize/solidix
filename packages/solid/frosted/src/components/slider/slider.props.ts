import { colorProp, highContrastProp } from "../../helpers/props";
import type { PropDef } from "../../helpers/props/prop-def";

const sizes = ["1", "2", "3"] as const;

/** Prop definitions driving the `Slider` component (size, color, highContrast). */
const sliderPropDefs = {
  size: { type: "enum", values: sizes, default: "2" },
  color: colorProp,
  highContrast: highContrastProp,
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  color: typeof colorProp;
  highContrast: typeof highContrastProp;
};

export { sliderPropDefs };
