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
import { tabsNavPropDefs, type TabsNavRootOwnProps } from "./tabs-nav.props";

/** Props for `TabsNav.Root`: headless nav props plus the shared list defs. */
interface TabsNavRootProps
  extends Omit<HeadlessRootProps, "asChild" | "orientation">, TabsNavRootOwnProps {}

/**
 * Tab-styled navigation landmark: a `nav` with a roving link list and no
 * panels. Tab-list styling applies to the root; the inner list uses
 * `display: contents` so the nav stays the single layout container.
 *
 * Upstream: `tabs-nav.tsx` (`TabsNavRoot`) at whopio/frosted-ui commit
 * `56787900bfe0`. Base UI `NavigationMenu` maps to the headless one.
 */
const TabsNavRoot: Component<TabsNavRootProps> = (props) => {
  const size = () => props.size ?? tabsNavPropDefs.size.default;
  const color = () => props.color ?? tabsNavPropDefs.color.default;
  const highContrast = () => props.highContrast ?? tabsNavPropDefs.highContrast.default;
  return (
    <HeadlessRoot
      data-accent-color={color()}
      class={cx(
        "fui-TabsNavRoot",
        "fui-reset",
        "fui-BaseTabsList",
        "fui-TabsNavList",
        props.class,
        `fui-r-size-${size()}`,
        highContrast() ? "fui-high-contrast" : undefined,
      )}
      {...omit(props, "size", "color", "highContrast", "class", "children")}
    >
      <HeadlessList class="fui-reset fui-TabsNavListContents">{props.children}</HeadlessList>
    </HeadlessRoot>
  );
};

/**
 * Props for `TabsNav.Link`: headless link props (href, active, onSelect).
 * Upstream's Base UI `render` has no headless equivalent and is dropped.
 */
interface TabsNavLinkProps extends Omit<HeadlessLinkProps, "asChild"> {}

/**
 * One nav link: wraps the label in an inner span for the active indicator.
 * `active` marks the current page (`aria-current="page"`).
 *
 * Upstream: `tabs-nav.tsx` (`TabsNavLink`) at whopio/frosted-ui commit
 * `56787900bfe0`.
 */
const TabsNavLink: Component<TabsNavLinkProps> = (props) => (
  <HeadlessItem class="fui-TabsNavItem">
    <HeadlessLink
      {...omit(props, "class", "children")}
      class={cx("fui-reset", "fui-BaseTabsTrigger", "fui-TabsNavLink", props.class)}
    >
      <span class="fui-BaseTabsTriggerInner fui-TabsNavLinkInner">{props.children}</span>
    </HeadlessLink>
  </HeadlessItem>
);

/** Frosted tabs-nav namespace, matching the upstream `* as TabsNav`. */
const TabsNav = {
  Root: TabsNavRoot,
  Link: TabsNavLink,
};

export { TabsNav, TabsNavLink, TabsNavRoot };
export type { TabsNavLinkProps, TabsNavRootProps };
