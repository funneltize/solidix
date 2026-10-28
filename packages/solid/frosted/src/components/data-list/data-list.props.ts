import type { GetPropDefTypes, PropDef } from "../../helpers/props";
import { colorProp, highContrastProp, trimProp } from "../../helpers/props";

const alignValues = ["start", "center", "end", "baseline", "stretch"] as const;
const orientationValues = ["horizontal", "vertical"] as const;
const sizes = ["1", "2", "3"] as const;

/**
 * Prop definitions for `DataList.Root`.
 *
 * Upstream: `data-list.props.ts` (`dataListRootPropDefs`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const dataListRootPropDefs = {
  orientation: {
    type: "enum",
    values: orientationValues,
    default: "horizontal",
  },
  size: {
    type: "enum",
    values: sizes,
    default: "2",
  },
  trim: {
    ...trimProp,
  },
} satisfies {
  orientation: PropDef<(typeof orientationValues)[number]>;
  size: PropDef<(typeof sizes)[number]>;
  trim: typeof trimProp;
};

/**
 * Prop definitions for `DataList.Item`.
 *
 * Upstream: `data-list.props.ts` (`dataListItemPropDefs`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const dataListItemPropDefs = {
  align: {
    type: "enum",
    values: alignValues,
    default: undefined,
  },
} satisfies {
  align: PropDef<(typeof alignValues)[number]>;
};

/**
 * Prop definitions for `DataList.Label`.
 *
 * Upstream: `data-list.props.ts` (`dataListLabelPropDefs`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const dataListLabelPropDefs = {
  color: colorProp,
  highContrast: highContrastProp,
};

/** DataList root props derived from {@link dataListRootPropDefs}. */
type DataListRootOwnProps = GetPropDefTypes<typeof dataListRootPropDefs>;

/** DataList item props derived from {@link dataListItemPropDefs}. */
type DataListItemOwnProps = GetPropDefTypes<typeof dataListItemPropDefs>;

/** DataList label props derived from {@link dataListLabelPropDefs}. */
type DataListLabelOwnProps = GetPropDefTypes<typeof dataListLabelPropDefs>;

export { dataListItemPropDefs, dataListLabelPropDefs, dataListRootPropDefs };
export type { DataListItemOwnProps, DataListLabelOwnProps, DataListRootOwnProps };
