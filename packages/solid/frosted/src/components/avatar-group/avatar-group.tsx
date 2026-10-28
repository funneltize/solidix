import { omit, type Component } from "solid-js";
import { cx } from "../../helpers/cx";
import type { PropsWithoutColor } from "../../helpers/props";
import { Avatar, type AvatarProps } from "../avatar/avatar";
import { avatarGroupPropDefs, type AvatarGroupRootOwnProps } from "./avatar-group.props";

/** Props for `AvatarGroup.Root`. */
interface AvatarGroupRootProps extends PropsWithoutColor<"div">, AvatarGroupRootOwnProps {}

/**
 * Overlapping avatar collage: up to seven avatars arranged by CSS `:has`
 * selectors inside a scaled inner container.
 *
 * Upstream: `avatar-group.tsx` (`AvatarGroupRoot`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const AvatarGroupRoot: Component<AvatarGroupRootProps> = (props) => {
  const size = () => props.size ?? avatarGroupPropDefs.size.default;
  const shape = () => props.shape ?? avatarGroupPropDefs.shape.default;
  const color = () => props.color ?? avatarGroupPropDefs.color.default;
  return (
    <div
      data-accent-color={color()}
      {...omit(props, "size", "shape", "color", "class", "children")}
      class={cx("fui-AvatarGroupRoot", props.class, `fui-r-size-${size()}`, `fui-shape-${shape()}`)}
    >
      <div class="fui-AvatarGroupRootInner">{props.children}</div>
    </div>
  );
};

/** Props for `AvatarGroup.Avatar`: avatar props with fixed size 3. */
type AvatarGroupAvatarProps = Omit<AvatarProps, "size" | "shape">;

/**
 * One avatar of the group, fixed at size 3 (the group scales the collage).
 *
 * Upstream: `avatar-group.tsx` (`AvatarGroupAvatar`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const AvatarGroupAvatar: Component<AvatarGroupAvatarProps> = (props) => (
  <Avatar size="3" {...omit(props, "class")} class={cx("fui-AvatarGroupAvatar", props.class)} />
);

/**
 * Frosted avatar-group namespace. Upstream exports `Root`/`Avatar` under
 * `* as AvatarGroup`; the port adds flat aliases for barrel consistency.
 */
const AvatarGroup = {
  Root: AvatarGroupRoot,
  Avatar: AvatarGroupAvatar,
};

export { AvatarGroup, AvatarGroupAvatar, AvatarGroupRoot };
export type { AvatarGroupAvatarProps, AvatarGroupRootProps };
