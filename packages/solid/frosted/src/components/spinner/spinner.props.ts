/** Prop definitions for the `Spinner` component. */
import type { PropDef } from "../../helpers/props";

const sizes = ["1", "2", "3", "4", "5", "6"] as const;

/** Prop definitions driving `Spinner` props, classes, and defaults. */
const spinnerPropDefs = {
  size: { type: "enum", values: sizes, default: "2" },
  loading: { type: "boolean", default: true },
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  loading: PropDef<boolean>;
};

export { spinnerPropDefs };
