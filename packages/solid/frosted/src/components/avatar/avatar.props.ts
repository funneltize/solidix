import type { JSX } from "@solidjs/web";
import type { GetPropDefTypes, PropDef } from "../../helpers/props";
import { colorProp, highContrastProp } from "../../helpers/props";

const sizes = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;
const shapes = ["circle", "square"] as const;

/**
 * Prop definitions for `Avatar`.
 *
 * Upstream: `avatar.props.ts` (`avatarPropDefs`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const avatarPropDefs = {
  size: { type: "enum", values: sizes, default: "3" },
  shape: { type: "enum", values: shapes, default: "circle" },
  color: { ...colorProp, default: undefined },
  highContrast: highContrastProp,
  fallback: { type: "ReactNode", default: undefined, required: true },
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
  shape: PropDef<(typeof shapes)[number]>;
  color: typeof colorProp;
  highContrast: typeof highContrastProp;
  fallback: PropDef<JSX.Element>;
};

/** Avatar props derived from {@link avatarPropDefs}. */
type AvatarOwnProps = GetPropDefTypes<typeof avatarPropDefs>;

export { avatarPropDefs };
export type { AvatarOwnProps };
