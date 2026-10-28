import { omit, type Component } from "solid-js";
import {
  NavigationMenu as HeadlessRoot,
  NavigationMenuItem as HeadlessItem,
  NavigationMenuLink as HeadlessLink,
  NavigationMenuList as HeadlessList,
  type NavigationMenuLinkProps as HeadlessLinkProps,
  type NavigationMenuProps as HeadlessRootProps,
} from "@solidix/navigation-menu";
import { cx } from "../../helpers/cx";

/** Props for `SegmentedControlNav.Root`. */
interface SegmentedControlNavRootProps extends Omit<HeadlessRootProps, "asChild" | "orientation"> {}

/**
 * Segment-styled navigation landmark: a `nav` with a roving link list.
 * Consumer classes land on the inner list (upstream placement).
 *
 * Upstream: `segmented-control-nav.tsx` (`SegmentedControlNavRoot`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const SegmentedControlNavRoot: Component<SegmentedControlNavRootProps> = (props) => (
  <HeadlessRoot class="fui-SegmentedControlNavRoot" {...omit(props, "class", "children")}>
    <HeadlessList class={cx("fui-reset", "fui-BaseSegmentedControlList", props.class)}>
      {props.children}
    </HeadlessList>
  </HeadlessRoot>
);

/**
 * Props for `SegmentedControlNav.Link`. Upstream's Base UI `render` has no
 * headless equivalent and is dropped.
 */
interface SegmentedControlNavLinkProps extends Omit<HeadlessLinkProps, "asChild"> {}

/**
 * One nav segment: wraps the label in an inner span for the active
 * indicator. `active` marks the current page (`aria-current="page"`).
 *
 * Upstream: `segmented-control-nav.tsx` (`SegmentedControlNavLink`) at
 * whopio/frosted-ui commit `56787900bfe0`.
 */
const SegmentedControlNavLink: Component<SegmentedControlNavLinkProps> = (props) => (
  <HeadlessItem class="fui-SegmentedControlNavItem">
    <HeadlessLink
      {...omit(props, "class", "children")}
      class={cx(
        "fui-reset",
        "fui-BaseSegmentedControlTrigger",
        "fui-SegmentedControlNavLink",
        props.class,
      )}
    >
      <span class="fui-BaseSegmentedControlTriggerInner">{props.children}</span>
    </HeadlessLink>
  </HeadlessItem>
);

/**
 * Frosted segmented-control-nav namespace, matching the upstream
 * `* as SegmentedControlNav`.
 */
const SegmentedControlNav = {
  Root: SegmentedControlNavRoot,
  Link: SegmentedControlNavLink,
};

export { SegmentedControlNav, SegmentedControlNavLink, SegmentedControlNavRoot };
export type { SegmentedControlNavLinkProps, SegmentedControlNavRootProps };
