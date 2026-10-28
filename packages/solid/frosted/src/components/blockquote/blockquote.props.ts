/** Prop definitions for the `Blockquote` component. */
import { textPropDefs } from "../text/text.props";

/** Prop definitions driving `Blockquote` props, classes, and defaults. */
const blockquotePropDefs = {
  size: textPropDefs.size,
  weight: textPropDefs.weight,
  color: textPropDefs.color,
  highContrast: textPropDefs.highContrast,
} satisfies {
  size: typeof textPropDefs.size;
  weight: typeof textPropDefs.weight;
  color: typeof textPropDefs.color;
  highContrast: typeof textPropDefs.highContrast;
};

export { blockquotePropDefs };
