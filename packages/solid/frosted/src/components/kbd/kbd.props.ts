/** Prop definitions for the `Kbd` component. */
import type { PropDef } from "../../helpers/props";

const sizes = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

/** Prop definitions driving `Kbd` props, classes, and defaults. */
const kbdPropDefs = {
  size: { type: "enum", values: sizes, default: undefined },
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
};

export { kbdPropDefs };
