import type { JSX } from "@solidjs/web";

import type { GetPropDefTypes, PropDef } from "../../helpers/props";

/**
 * Prop definitions for the single `Tooltip` convenience component.
 *
 * Mirrors upstream `tooltipPropDefs`: only `content` is declared (and required).
 */
const tooltipPropDefs = {
  content: { type: "ReactNode", default: undefined, required: true },
} satisfies {
  content: PropDef<JSX.Element>;
};

/** Own props derived from `tooltipPropDefs`. `content` is the tooltip text. */
type TooltipOwnProps = GetPropDefTypes<typeof tooltipPropDefs>;

export { tooltipPropDefs };
export type { TooltipOwnProps };
