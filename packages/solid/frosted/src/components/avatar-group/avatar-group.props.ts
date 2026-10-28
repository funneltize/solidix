import type { GetPropDefTypes, PropDef } from "../../helpers/props";
import { colorProp } from "../../helpers/props";

const sizes = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;
const shapes = ["circle", "square"] as const;

/**
 * Prop definitions for `AvatarGroup.Root`.
 *
 * Upstream: `avatar-group.props.ts` (`avatarGroupPropDefs`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const avatarGroupPropDefs = {
  color: { ...colorProp, default: "gray" },
  size: { type: "enum", values: sizes, default: "3" },
  shape: { type: "enum", values: shapes, default: "circle" },
} satisfies {
  color: typeof colorProp;
  size: PropDef<(typeof sizes)[number]>;
  shape: PropDef<(typeof shapes)[number]>;
};

/** Avatar group root props derived from {@link avatarGroupPropDefs}. */
type AvatarGroupRootOwnProps = GetPropDefTypes<typeof avatarGroupPropDefs>;

export { avatarGroupPropDefs };
export type { AvatarGroupRootOwnProps };
