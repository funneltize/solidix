/** Prop definitions for the `Separator` component. */
import type { PropDef } from "../../helpers/props";
import { colorProp } from "../../helpers/props";

const sizes = ["1", "2", "3", "4"] as const;

/** Prop definitions driving `Separator` props, classes, and defaults. */
const separatorPropDefs = {
  size: { type: "enum", values: sizes, default: "1" },
  color: { ...colorProp, default: "gray" },
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  color: typeof colorProp;
};

export { separatorPropDefs };
