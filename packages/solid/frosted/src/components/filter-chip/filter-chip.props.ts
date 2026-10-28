import { colorProp } from "../../helpers/props/color.prop";
import type { PropDef } from "../../helpers/props/prop-def";

const sizes = ["1", "2", "3"] as const;

/**
 * Prop definitions for `FilterChip`.
 *
 * Upstream: `filter-chip.props.ts` (`filterChipPropDefs`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const filterChipPropDefs = {
  size: { type: "enum", values: sizes, default: "2" },
  color: colorProp,
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  color: typeof colorProp;
};

export { filterChipPropDefs };
