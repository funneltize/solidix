import type { PropDef } from "../../helpers/props/prop-def";

const orientationValues = ["horizontal", "vertical"] as const;

/**
 * Prop definitions for `WidgetStack.Root`.
 *
 * Upstream: `widget-stack.props.ts` (`widgetStackRootPropDefs`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const widgetStackRootPropDefs = {
  orientation: {
    type: "enum",
    values: orientationValues,
    default: "vertical",
  },
} satisfies {
  orientation: PropDef<(typeof orientationValues)[number]>;
};

export { widgetStackRootPropDefs };
