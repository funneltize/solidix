// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/text-field/text-field.props.ts

import type { PropDef } from "../../helpers/props";
import { colorProp } from "../../helpers/props";

const sizes = ["1", "2", "3", "4"] as const;
const variants = ["surface", "soft"] as const;

/** Prop definitions driving `TextField` props, classes, and defaults. */
const textFieldPropDefs = {
  size: { type: "enum", values: sizes, default: "2" },
  variant: { type: "enum", values: variants, default: "surface" },
  color: { ...colorProp, default: "gray" },
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  variant: PropDef<(typeof variants)[number]>;
  color: typeof colorProp;
};

/** Prop definitions driving `TextField.Slot` props, classes, and defaults. */
const textFieldSlotPropDefs = {
  color: colorProp,
} satisfies {
  color: typeof colorProp;
};

export { textFieldPropDefs, textFieldSlotPropDefs };
