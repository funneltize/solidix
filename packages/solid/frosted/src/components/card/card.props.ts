import type { GetPropDefTypes, PropDef } from "../../helpers/props";

const sizes = ["1", "2", "3", "4", "5"] as const;
const variants = ["surface", "outline", "ghost", "soft"] as const;

/**
 * Prop definitions for `Card`.
 *
 * Upstream: `card.props.ts` (`cardPropDefs`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const cardPropDefs = {
  size: { type: "enum", values: sizes, default: "1" },
  variant: { type: "enum", values: variants, default: "surface" },
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  variant: PropDef<(typeof variants)[number]>;
};

/** Card props derived from {@link cardPropDefs}. */
type CardOwnProps = GetPropDefTypes<typeof cardPropDefs>;

export { cardPropDefs };
export type { CardOwnProps };
