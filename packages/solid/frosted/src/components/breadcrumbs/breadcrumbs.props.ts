import type { GetPropDefTypes } from "../../helpers/props";
import { colorProp } from "../../helpers/props";

/**
 * Prop definitions for `Breadcrumbs.Root`.
 *
 * Upstream: `breadcrumbs.props.ts` (`breadcrumbsPropDefs`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const breadcrumbsPropDefs = {
  color: { ...colorProp, default: "gray" },
} satisfies {
  color: typeof colorProp;
};

/** Breadcrumbs root props derived from {@link breadcrumbsPropDefs}. */
type BreadcrumbsRootOwnProps = GetPropDefTypes<typeof breadcrumbsPropDefs>;

export { breadcrumbsPropDefs };
export type { BreadcrumbsRootOwnProps };
