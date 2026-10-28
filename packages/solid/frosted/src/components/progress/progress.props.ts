import type { GetPropDefTypes, PropDef } from "../../helpers/props";
import { colorProp, highContrastProp } from "../../helpers/props";

const sizes = ["1", "2", "3", "4", "5", "6"] as const;

/**
 * Prop definitions for `Progress`.
 *
 * Upstream: `progress.props.ts` (`progressPropDefs`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const progressPropDefs = {
  size: { type: "enum", values: sizes, default: "6" },
  color: { ...colorProp, default: undefined },
  highContrast: highContrastProp,
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  color: typeof colorProp;
  highContrast: typeof highContrastProp;
};

/** Progress props derived from {@link progressPropDefs}. */
type ProgressOwnProps = GetPropDefTypes<typeof progressPropDefs>;

export { progressPropDefs };
export type { ProgressOwnProps };
