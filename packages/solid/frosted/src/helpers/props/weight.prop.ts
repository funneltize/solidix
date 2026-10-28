import type { PropDef } from "./prop-def";

const weights = ["light", "regular", "medium", "semi-bold", "bold"] as const;

/** Prop def for the shared `weight` (font-weight) prop. */
const weightProp = {
  type: "enum",
  values: weights,
  default: undefined,
} satisfies PropDef<(typeof weights)[number]>;

export { weightProp };
