// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/number-field/number-field.props.ts

import type { PropDef } from "../../helpers/props";
import { colorProp } from "../../helpers/props";

const sizes = ["1", "2", "3", "4"] as const;
const variants = ["surface", "soft"] as const;
const buttonLayouts = ["split", "trailing", "none"] as const;

/** Prop definitions driving `NumberField` props, classes, and defaults. */
const numberFieldPropDefs = {
  size: { type: "enum", values: sizes, default: "2" },
  variant: { type: "enum", values: variants, default: "surface" },
  color: { ...colorProp, default: "gray" },
  buttonLayout: { type: "enum", values: buttonLayouts, default: "trailing" },
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  variant: PropDef<(typeof variants)[number]>;
  color: typeof colorProp;
  buttonLayout: PropDef<(typeof buttonLayouts)[number]>;
};

/** Prop definitions driving `NumberField.Slot` props, classes, and defaults. */
const numberFieldSlotPropDefs = {
  color: colorProp,
} satisfies {
  color: typeof colorProp;
};

export { numberFieldPropDefs, numberFieldSlotPropDefs };
