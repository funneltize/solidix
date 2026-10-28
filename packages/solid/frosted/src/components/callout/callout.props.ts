import type { GetPropDefTypes } from "../../helpers/props";
import { colorProp } from "../../helpers/props";

/**
 * Prop definitions for `Callout.Root`.
 *
 * Upstream: `callout.props.ts` (`calloutRootPropDefs`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const calloutRootPropDefs = {
  color: { ...colorProp, default: undefined },
} satisfies {
  color: typeof colorProp;
};

/** Callout root props derived from {@link calloutRootPropDefs}. */
type CalloutRootOwnProps = GetPropDefTypes<typeof calloutRootPropDefs>;

export { calloutRootPropDefs };
export type { CalloutRootOwnProps };
