import { children, createContext, omit, useContext, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { cx } from "../../helpers/cx";
import type { PropsWithoutColor } from "../../helpers/props";
import { Avatar, type AvatarProps } from "../avatar/avatar";
import { avatarStackPropDefs, type AvatarStackRootOwnProps } from "./avatar-stack.props";

/** Size cascaded from `AvatarStack.Root` to its avatars. */
type AvatarStackContextValue = AvatarStackRootOwnProps["size"];

const AvatarStackContext = createContext<AvatarStackContextValue>(avatarStackPropDefs.size.default);

/** Props for `AvatarStack.Root`. */
interface AvatarStackRootProps extends PropsWithoutColor<"div">, AvatarStackRootOwnProps {}

/**
 * Renders the stack children in reverse order (later avatars overlap
 * earlier ones). A separate component so the `children()` memo is created
 * under the size provider: resolving in the root setup would instantiate
 * avatars above the provider and they would miss the size.
 */
function ReversedStackChildren(props: { children?: JSX.Element }): JSX.Element {
  const resolved = children(() => props.children);
  return <>{resolved.toArray().reverse()}</>;
}

/**
 * Overlapping avatar row: children render reversed so later avatars paint
 * above earlier ones, all sharing the root size.
 *
 * Upstream: `avatar-stack.tsx` (`AvatarStackRoot`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const AvatarStackRoot: Component<AvatarStackRootProps> = (props) => {
  const size = () => props.size ?? avatarStackPropDefs.size.default;
  return (
    <div
      {...omit(props, "size", "class", "children")}
      class={cx("fui-AvatarStackRoot", props.class, `fui-r-size-${size()}`)}
    >
      <AvatarStackContext value={size()}>
        <ReversedStackChildren>{props.children}</ReversedStackChildren>
      </AvatarStackContext>
    </div>
  );
};

/** Props for `AvatarStack.Avatar`: avatar props with the stack size. */
type AvatarStackAvatarProps = Omit<AvatarProps, "size">;

/**
 * One avatar of the stack, sized by the root.
 *
 * Upstream: `avatar-stack.tsx` (`AvatarStackAvatar`) at whopio/frosted-ui
 * commit `56787900bfe0`.
 */
const AvatarStackAvatar: Component<AvatarStackAvatarProps> = (props) => {
  const size = useContext(AvatarStackContext);
  return (
    <Avatar
      size={size}
      {...omit(props, "class")}
      class={cx("fui-AvatarStackAvatar", props.class)}
    />
  );
};

/**
 * Frosted avatar-stack namespace. Upstream exports `Root`/`Avatar` under
 * `* as AvatarStack`; the port adds flat aliases for barrel consistency.
 */
const AvatarStack = {
  Root: AvatarStackRoot,
  Avatar: AvatarStackAvatar,
};

export { AvatarStack, AvatarStackAvatar, AvatarStackRoot };
export type { AvatarStackAvatarProps, AvatarStackRootProps };
