/** Prop definitions for the `Link` component. */
import type { PropDef } from "../../helpers/props";
import { textPropDefs } from "../text/text.props";

const underline = ["auto", "hover", "always"] as const;

/** Prop definitions driving `Link` props, classes, and defaults. */
const linkPropDefs = {
  size: textPropDefs.size,
  weight: textPropDefs.weight,
  trim: textPropDefs.trim,
  underline: { type: "enum", values: underline, default: "auto" },
  color: textPropDefs.color,
  highContrast: textPropDefs.highContrast,
} satisfies {
  size: typeof textPropDefs.size;
  weight: typeof textPropDefs.weight;
  trim: typeof textPropDefs.trim;
  underline: PropDef<(typeof underline)[number]>;
  color: typeof textPropDefs.color;
  highContrast: typeof textPropDefs.highContrast;
};

export { linkPropDefs };
