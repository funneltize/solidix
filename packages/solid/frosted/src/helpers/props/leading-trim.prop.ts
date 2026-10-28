import type { PropDef } from "./prop-def";

const trimValues = ["normal", "start", "end", "both"] as const;

/** Prop def for the shared `trim` (leading-trim) prop. */
const trimProp = {
  type: "enum",
  values: trimValues,
  default: undefined,
} satisfies PropDef<(typeof trimValues)[number]>;

export { trimProp };
