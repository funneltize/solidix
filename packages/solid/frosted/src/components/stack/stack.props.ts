/** Prop definitions for the `Stack` and `Row` layout components. */
import type { PropDef } from "../../helpers/props/prop-def";

/** Gap steps, keyed to the `--space-*` scale. */
const gaps = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;
/** Cross-axis alignment values. */
const aligns = ["stretch", "start", "center", "end"] as const;
/** Main-axis distribution values. */
const justifies = ["start", "center", "end", "between"] as const;

/** Prop definitions driving `Stack` props, classes, and defaults. */
const stackPropDefs = {
  gap: { type: "enum", values: gaps, default: "4" },
  align: { type: "enum", values: aligns, default: "stretch" },
  justify: { type: "enum", values: justifies, default: "start" },
} satisfies {
  gap: PropDef<(typeof gaps)[number]>;
  align: PropDef<(typeof aligns)[number]>;
  justify: PropDef<(typeof justifies)[number]>;
};

/** Prop definitions driving `Row` props, classes, and defaults. */
const rowPropDefs = {
  gap: { type: "enum", values: gaps, default: "4" },
  align: { type: "enum", values: aligns, default: "center" },
  justify: { type: "enum", values: justifies, default: "start" },
} satisfies {
  gap: PropDef<(typeof gaps)[number]>;
  align: PropDef<(typeof aligns)[number]>;
  justify: PropDef<(typeof justifies)[number]>;
};

export { rowPropDefs, stackPropDefs };
