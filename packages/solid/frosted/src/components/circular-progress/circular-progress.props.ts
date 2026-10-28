import type { GetPropDefTypes, PropDef } from "../../helpers/props";
import { colorProp, highContrastProp } from "../../helpers/props";

const sizes = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

/**
 * Prop definitions for `CircularProgress`.
 *
 * Upstream: `circular-progress.props.ts` (`circularProgressPropDefs`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const circularProgressPropDefs = {
  size: { type: "enum", values: sizes, default: "3" },
  color: { ...colorProp, default: undefined },
  highContrast: highContrastProp,
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  color: typeof colorProp;
  highContrast: typeof highContrastProp;
};

/** Circular progress props derived from {@link circularProgressPropDefs}. */
type CircularProgressOwnProps = GetPropDefTypes<typeof circularProgressPropDefs>;

export { circularProgressPropDefs };
export type { CircularProgressOwnProps };
