import type { GetPropDefTypes, PropDef } from "../../helpers/props";
import { colorProp, highContrastProp } from "../../helpers/props";

const sizes = ["1", "2"] as const;
const variants = ["solid", "soft", "surface", "outline"] as const;

/**
 * Prop definitions for `Badge`.
 *
 * Upstream: `badge.props.ts` (`badgePropDefs`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const badgePropDefs = {
  size: { type: "enum", values: sizes, default: "1" },
  variant: { type: "enum", values: variants, default: "soft" },
  color: { ...colorProp, default: undefined },
  highContrast: highContrastProp,
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  variant: PropDef<(typeof variants)[number]>;
  color: typeof colorProp;
  highContrast: typeof highContrastProp;
};

/** Badge props derived from {@link badgePropDefs}. */
type BadgeOwnProps = GetPropDefTypes<typeof badgePropDefs>;

export { badgePropDefs };
export type { BadgeOwnProps };
