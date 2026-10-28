// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/hover-card/hover-card.props.ts

import type { GetPropDefTypes, PropDef } from "../../helpers/props";

const contentSizes = ["1", "2", "3"] as const;
const contentVariants = ["solid", "translucent"] as const;

/** Prop definitions driving `HoverCard.Content`. */
const hoverCardContentPropDefs = {
  size: { type: "enum", values: contentSizes, default: "2" },
  variant: { type: "enum", values: contentVariants, default: "translucent" },
} satisfies {
  size: PropDef<(typeof contentSizes)[number]>;
  variant: PropDef<(typeof contentVariants)[number]>;
};

/** Content props derived from {@link hoverCardContentPropDefs}. */
type HoverCardContentOwnProps = GetPropDefTypes<typeof hoverCardContentPropDefs>;

export { hoverCardContentPropDefs };
export type { HoverCardContentOwnProps };
