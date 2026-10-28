import type { GetPropDefTypes, PropDef } from "../../helpers/props";

const sizes = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

/**
 * Prop definitions for `AvatarStack.Root`.
 *
 * Upstream: `avatar-stack.props.ts` (`avatarStackPropDefs`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const avatarStackPropDefs = {
  size: { type: "enum", values: sizes, default: "3" },
} satisfies {
  size: PropDef<(typeof sizes)[number]>;
};

/** Avatar stack root props derived from {@link avatarStackPropDefs}. */
type AvatarStackRootOwnProps = GetPropDefTypes<typeof avatarStackPropDefs>;

export { avatarStackPropDefs };
export type { AvatarStackRootOwnProps };
