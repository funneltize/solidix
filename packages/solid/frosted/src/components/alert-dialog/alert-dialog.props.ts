// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/alert-dialog/alert-dialog.props.ts

import type { GetPropDefTypes, PropDef } from "../../helpers/props";

const contentSizes = ["1", "2", "3", "4"] as const;

/** Prop definitions driving `AlertDialog.Content` (size cascades to title/description). */
const alertDialogContentPropDefs = {
  size: { type: "enum", values: contentSizes, default: "3" },
} satisfies {
  size: PropDef<(typeof contentSizes)[number]>;
};

/** Content props derived from {@link alertDialogContentPropDefs}. */
type AlertDialogContentOwnProps = GetPropDefTypes<typeof alertDialogContentPropDefs>;

export { alertDialogContentPropDefs };
export type { AlertDialogContentOwnProps };
