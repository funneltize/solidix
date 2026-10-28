// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/popover/popover.props.ts

import type { GetPropDefTypes, PropDef } from "../../helpers/props";

const contentSizes = ["1", "2", "3", "4"] as const;
const contentVariants = ["solid", "translucent"] as const;

/** Prop definitions driving `Popover.Content`. */
const popoverContentPropDefs = {
  size: { type: "enum", values: contentSizes, default: "2" },
  variant: { type: "enum", values: contentVariants, default: "translucent" },
} satisfies {
  size: PropDef<(typeof contentSizes)[number]>;
  variant: PropDef<(typeof contentVariants)[number]>;
};

/** Content props derived from {@link popoverContentPropDefs}. */
type PopoverContentOwnProps = GetPropDefTypes<typeof popoverContentPropDefs>;

export { popoverContentPropDefs };
export type { PopoverContentOwnProps };
