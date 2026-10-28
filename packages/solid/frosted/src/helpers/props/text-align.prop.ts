import type { PropDef } from "./prop-def";

const alignValues = ["left", "center", "right"] as const;

/** Prop def for the shared `align` (text-align) prop. */
const alignProp = {
  type: "enum",
  values: alignValues,
  default: undefined,
} satisfies PropDef<(typeof alignValues)[number]>;

export { alignProp };
