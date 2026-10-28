/** Prop definitions for the `Inset` component. */
import type { PropDef } from "../../helpers/props/prop-def";

const sides = ["all", "x", "y", "top", "bottom", "left", "right"] as const;
const clips = ["border-box", "padding-box"] as const;
const paddings = ["current", "0"] as const;

/** Prop definitions driving `Inset` props, classes, and defaults. */
const insetPropDefs = {
  side: { type: "enum", values: sides, default: "all" },
  clip: { type: "enum", values: clips, default: "border-box" },
  p: { type: "enum", values: paddings, default: undefined },
  px: { type: "enum", values: paddings, default: undefined },
  py: { type: "enum", values: paddings, default: undefined },
  pt: { type: "enum", values: paddings, default: undefined },
  pr: { type: "enum", values: paddings, default: undefined },
  pb: { type: "enum", values: paddings, default: undefined },
  pl: { type: "enum", values: paddings, default: undefined },
} satisfies {
  side: PropDef<(typeof sides)[number]>;
  clip: PropDef<(typeof clips)[number]>;
  p: PropDef<(typeof paddings)[number]>;
  px: PropDef<(typeof paddings)[number]>;
  py: PropDef<(typeof paddings)[number]>;
  pt: PropDef<(typeof paddings)[number]>;
  pr: PropDef<(typeof paddings)[number]>;
  pb: PropDef<(typeof paddings)[number]>;
  pl: PropDef<(typeof paddings)[number]>;
};

export { insetPropDefs };
