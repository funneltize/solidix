// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/dialog/dialog.props.ts

import type { GetPropDefTypes, PropDef } from "../../helpers/props";

const contentSizes = ["1", "2", "3", "4"] as const;

/** Prop definitions driving `Dialog.Content` (size cascades to title/description). */
const dialogContentPropDefs = {
  size: { type: "enum", values: contentSizes, default: "3" },
} satisfies {
  size: PropDef<(typeof contentSizes)[number]>;
};

/** Content props derived from {@link dialogContentPropDefs}. */
type DialogContentOwnProps = GetPropDefTypes<typeof dialogContentPropDefs>;

export { dialogContentPropDefs };
export type { DialogContentOwnProps };
