import { createContext, omit, useContext } from "solid-js";
import { Portal } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import * as Headless from "@solidix/context-menu";
import type {
  ContextMenuCheckboxItemProps as HeadlessCheckboxItemProps,
  ContextMenuContentProps as HeadlessContentProps,
  ContextMenuGroupProps as HeadlessGroupProps,
  ContextMenuItemProps as HeadlessItemProps,
  ContextMenuLabelProps as HeadlessLabelProps,
  ContextMenuProps as HeadlessRootProps,
  ContextMenuRadioGroupProps as HeadlessRadioGroupProps,
  ContextMenuRadioItemProps as HeadlessRadioItemProps,
  ContextMenuSeparatorProps as HeadlessSeparatorProps,
  ContextMenuSubContentProps as HeadlessSubContentProps,
  ContextMenuSubProps as HeadlessSubProps,
  ContextMenuSubTriggerProps as HeadlessSubTriggerProps,
  ContextMenuTriggerProps as HeadlessTriggerProps,
} from "@solidix/context-menu";
import { cx } from "../../helpers/cx.js";
import { Theme } from "../../theme.js";
import { colorProp } from "../../helpers/props/color.prop.js";
import { contextMenuContentPropDefs } from "./context-menu.props.js";

import "./context-menu.css";

/**
 * Frosted context menu, ported from frosted-ui `ContextMenu` at upstream commit
 * `56787900bfe0` (`packages/frosted-ui/src/components/context-menu.tsx`).
 *
 * Styling follows the dropdown-menu port exactly: the upstream `base-menu.css`
 * is inlined into `context-menu.css` with the Base UI state attributes bridged
 * to the Radix data attributes the headless layer emits. Behavior comes from
 * `@solidix/context-menu` (trigger long-press, outside dismissal, submenus).
 */

/**
 * Size/color/variant theming inherited by submenu content, mirroring the
 * `DropdownMenuContentContext` pattern of the sibling dropdown-menu port.
 */
interface ContextMenuContentContextValue {
  readonly size: "1" | "2" | "3" | undefined;
  readonly color: string | undefined;
  readonly variant: "solid" | "translucent" | undefined;
}

const ContextMenuContentContext =
  createContext<ContextMenuContentContextValue | null>(null);

/**
 * Reads the inherited submenu theming context, or `null` outside a menu.
 */
function useMenuContentContext(): ContextMenuContentContextValue | null {
  return useContext(ContextMenuContentContext);
}

/**
 * Thick check mark rendered inside checkbox and radio items. Vendored from the
 * upstream icons module (9x9, filled `currentColor`).
 */
function ThickCheckIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 9 9"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8.04246 1.00843C8.31459 1.28056 8.31459 1.72152 8.04246 1.99365L3.5877 6.44841L0.95759 3.8183C0.685461 3.54617 0.685461 3.10521 0.95759 2.83308C1.22972 2.56096 1.67068 2.56096 1.94281 2.83308L3.5877 4.47797L7.05715 1.00843C7.32928 0.736303 7.77033 0.736303 8.04246 1.00843Z"
      />
    </svg>
  );
}

/**
 * Thick chevron rendered inside submenu triggers. Vendored from the upstream
 * icons module (9x9, filled `currentColor`).
 */
function ThickChevronRightIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 9 9"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M2 1.5L2.77254 0.727451C2.95039 0.549603 3.23899 0.549604 3.41683 0.727451L6.96934 4.27996C7.14719 4.45781 7.14719 4.74641 6.96934 4.92426L3.41683 8.47677C3.23899 8.65461 2.95039 8.65461 2.77254 8.47677L2 7.70422L5.68025 4.02394C5.76926 3.93493 5.76926 3.79043 5.68025 3.70142L2 1.5Z" />
    </svg>
  );
}

/**
 * Props for {@link ContextMenuRoot}.
 */
export interface ContextMenuRootProps extends HeadlessRootProps {}

/**
 * Root state for one context menu. Behavior comes from the headless layer;
 * this wrapper only forwards props.
 */
function ContextMenuRoot(props: ContextMenuRootProps): JSX.Element {
  return <Headless.Root {...props} />;
}

/**
 * Props for {@link ContextMenuTrigger}.
 */
export interface ContextMenuTriggerProps extends HeadlessTriggerProps {}

/**
 * Area that opens the menu on right-click (and long-press on touch, handled
 * inside the headless trigger). Upstream renders no extra markup here.
 */
function ContextMenuTrigger(props: ContextMenuTriggerProps): JSX.Element {
  return <Headless.Trigger {...props} />;
}

/**
 * Props for {@link ContextMenuContent}.
 */
export interface ContextMenuContentProps extends Omit<HeadlessContentProps, "color"> {
  /**
   * Text size of the menu items. Defaults to the theme's menu size (`"2"`).
   */
  size?: (typeof contextMenuContentPropDefs.size.values)[number] | undefined;
  /**
   * Accent color used for highlighted items. Defaults to the theme accent.
   */
  color?: (typeof colorProp.values)[number] | undefined;
  /**
   * Surface treatment of the menu panel. Defaults to `"solid"`.
   */
  variant?: (typeof contextMenuContentPropDefs.variant.values)[number] | undefined;
}

/**
 * Floating menu panel, rendered in a portal with theme tokens applied.
 * Upstream nests `Theme > Positioner > Content > Viewport`; the positioner
 * shell is merged into the headless content, which positions itself.
 */
function ContextMenuContent(props: ContextMenuContentProps): JSX.Element {
  const inherited = useMenuContentContext();
  const size = () => props.size ?? inherited?.size ?? contextMenuContentPropDefs.size.default;
  const color = () => props.color ?? inherited?.color;
  const variant = () =>
    props.variant ?? inherited?.variant ?? contextMenuContentPropDefs.variant.default;
  // NOTE: `{props.children}` is read raw (exactly once) below, like the
  // sibling dropdown-menu port. Resolving through a `children()` memo here
  // would instantiate nested parts under this setup's owner instead of the
  // headless providers, so they would miss menu context.
  const rest = omit(
    props,
    "size",
    "color",
    "variant",
    "class",
    "children",
    "side",
    "sideOffset",
    "align",
    "collisionPadding",
  );

  return (
    <Portal>
      <Theme
        asChild={false}
        class={cx("fui-ContextMenuContent", `fui-r-size-${size()}`, `fui-variant-${variant()}`)}
      >
        <ContextMenuContentContext
          value={{
            get size() {
              return size();
            },
            get color() {
              return color();
            },
            get variant() {
              return variant();
            },
          }}
        >
          <Headless.Content
            data-accent-color={color()}
            class={cx(
              "fui-reset",
              "fui-BaseMenuContent",
              "fui-ContextMenuContent",
              `fui-r-size-${size()}`,
              `fui-variant-${variant()}`,
              props.class,
            )}
            side={props.side ?? "right"}
            sideOffset={props.sideOffset}
            align={props.align ?? "start"}
            collisionPadding={props.collisionPadding ?? 10}
            {...rest}
          >
            <div class={cx("fui-BaseMenuViewport", "fui-ContextMenuViewport")}>
              {props.children}
            </div>
          </Headless.Content>
        </ContextMenuContentContext>
      </Theme>
    </Portal>
  );
}

/**
 * Props for {@link ContextMenuGroup}.
 */
export interface ContextMenuGroupProps extends HeadlessGroupProps {}

/**
 * Groups related items. Upstream applies both the base and component classes.
 */
function ContextMenuGroup(props: ContextMenuGroupProps): JSX.Element {
  return (
    <Headless.Group
      {...props}
      class={cx("fui-BaseMenuGroup", "fui-ContextMenuGroup", props.class)}
    />
  );
}

/**
 * Props for {@link ContextMenuGroupLabel}.
 */
export interface ContextMenuGroupLabelProps extends HeadlessLabelProps {}

/**
 * Non-interactive label heading a group. Upstream names this export
 * `GroupLabel` (backed by the headless `Label`).
 */
function ContextMenuGroupLabel(props: ContextMenuGroupLabelProps): JSX.Element {
  return (
    <Headless.Label
      {...props}
      class={cx("fui-BaseMenuGroupLabel", "fui-ContextMenuGroupLabel", props.class)}
    />
  );
}

/**
 * Props for {@link ContextMenuItem}.
 */
export interface ContextMenuItemProps extends Omit<HeadlessItemProps, "color"> {
  /**
   * Keyboard shortcut hint rendered at the trailing edge of the item.
   */
  shortcut?: JSX.Element | undefined;
  /**
   * Accent color applied to this item via `data-accent-color`.
   */
  color?: (typeof colorProp.values)[number] | undefined;
}

/**
 * Selectable menu item with an optional trailing shortcut hint.
 */
function ContextMenuItem(props: ContextMenuItemProps): JSX.Element {
  const rest = omit(props, "shortcut", "color", "class", "children");
  return (
    <Headless.Item
      data-accent-color={props.color}
      class={cx("fui-reset", "fui-BaseMenuItem", "fui-ContextMenuItem", props.class)}
      {...rest}
    >
      {props.children}
      {props.shortcut ? (
        <span class={cx("fui-BaseMenuShortcut", "fui-ContextMenuShortcut")}>
          {props.shortcut}
        </span>
      ) : null}
    </Headless.Item>
  );
}

/**
 * Props for {@link ContextMenuCheckboxItem}.
 */
export interface ContextMenuCheckboxItemProps extends Omit<HeadlessCheckboxItemProps, "color"> {
  /**
   * Keyboard shortcut hint rendered at the trailing edge of the item.
   */
  shortcut?: JSX.Element | undefined;
  /**
   * Accent color applied to this item via `data-accent-color`.
   */
  color?: (typeof colorProp.values)[number] | undefined;
}

/**
 * Checkable menu item rendering a thick check indicator when checked.
 */
function ContextMenuCheckboxItem(props: ContextMenuCheckboxItemProps): JSX.Element {
  const rest = omit(props, "shortcut", "color", "class", "children");
  return (
    <Headless.CheckboxItem
      data-accent-color={props.color}
      class={cx(
        "fui-reset",
        "fui-BaseMenuItem",
        "fui-BaseMenuCheckboxItem",
        "fui-ContextMenuItem",
        "fui-ContextMenuCheckboxItem",
        props.class,
      )}
      {...rest}
    >
      <span class={cx("fui-BaseMenuItemIndicator", "fui-ContextMenuItemIndicator")}>
        <Headless.ItemIndicator
          class={cx("fui-BaseMenuItemIndicatorIcon", "fui-ContextMenuItemIndicatorIcon")}
        >
          <ThickCheckIcon />
        </Headless.ItemIndicator>
      </span>
      {props.children}
      {props.shortcut ? (
        <span class={cx("fui-BaseMenuShortcut", "fui-ContextMenuShortcut")}>
          {props.shortcut}
        </span>
      ) : null}
    </Headless.CheckboxItem>
  );
}

/**
 * Props for {@link ContextMenuRadioGroup}.
 */
export interface ContextMenuRadioGroupProps extends HeadlessRadioGroupProps {}

/**
 * Groups radio items so only one can be checked. Renders no extra markup.
 */
function ContextMenuRadioGroup(props: ContextMenuRadioGroupProps): JSX.Element {
  return <Headless.RadioGroup {...props} />;
}

/**
 * Props for {@link ContextMenuRadioItem}.
 */
export interface ContextMenuRadioItemProps extends Omit<HeadlessRadioItemProps, "color"> {
  /**
   * Keyboard shortcut hint rendered at the trailing edge of the item.
   */
  shortcut?: JSX.Element | undefined;
  /**
   * Accent color applied to this item via `data-accent-color`.
   */
  color?: (typeof colorProp.values)[number] | undefined;
}

/**
 * Radio menu item rendering a thick check indicator when checked.
 */
function ContextMenuRadioItem(props: ContextMenuRadioItemProps): JSX.Element {
  const rest = omit(props, "shortcut", "color", "class", "children");
  return (
    <Headless.RadioItem
      data-accent-color={props.color}
      class={cx(
        "fui-reset",
        "fui-BaseMenuItem",
        "fui-BaseMenuRadioItem",
        "fui-ContextMenuItem",
        "fui-ContextMenuRadioItem",
        props.class,
      )}
      {...rest}
    >
      <span class={cx("fui-BaseMenuItemIndicator", "fui-ContextMenuItemIndicator")}>
        <Headless.ItemIndicator
          class={cx("fui-BaseMenuItemIndicatorIcon", "fui-ContextMenuItemIndicatorIcon")}
        >
          <ThickCheckIcon />
        </Headless.ItemIndicator>
      </span>
      {props.children}
      {props.shortcut ? (
        <span class={cx("fui-BaseMenuShortcut", "fui-ContextMenuShortcut")}>
          {props.shortcut}
        </span>
      ) : null}
    </Headless.RadioItem>
  );
}

/**
 * Props for {@link ContextMenuSeparator}.
 */
export interface ContextMenuSeparatorProps extends HeadlessSeparatorProps {}

/**
 * Visual divider between items or groups.
 */
function ContextMenuSeparator(props: ContextMenuSeparatorProps): JSX.Element {
  return (
    <Headless.Separator
      {...props}
      class={cx("fui-BaseMenuSeparator", "fui-ContextMenuSeparator", props.class)}
    />
  );
}

/**
 * Props for {@link ContextMenuSub}.
 */
export interface ContextMenuSubProps extends HeadlessSubProps {}

/**
 * State wrapper for one submenu. Renders no extra markup.
 */
function ContextMenuSub(props: ContextMenuSubProps): JSX.Element {
  return <Headless.Sub {...props} />;
}

/**
 * Props for {@link ContextMenuSubTrigger}.
 */
export interface ContextMenuSubTriggerProps extends HeadlessSubTriggerProps {}

/**
 * Item that opens a submenu, with a trailing chevron.
 */
function ContextMenuSubTrigger(props: ContextMenuSubTriggerProps): JSX.Element {
  const rest = omit(props, "class", "children");
  return (
    <Headless.SubTrigger
      class={cx(
        "fui-reset",
        "fui-BaseMenuItem",
        "fui-BaseMenuSubTrigger",
        "fui-ContextMenuItem",
        "fui-ContextMenuSubTrigger",
        props.class,
      )}
      {...rest}
    >
      {props.children}
      <span class={cx("fui-BaseMenuSubTriggerIcon", "fui-ContextMenuSubTriggerIcon")}>
        <ThickChevronRightIcon />
      </span>
    </Headless.SubTrigger>
  );
}

/**
 * Props for {@link ContextMenuSubContent}.
 */
export interface ContextMenuSubContentProps extends Omit<HeadlessSubContentProps, "color"> {
  /**
   * Text size of the submenu items. Defaults to the parent menu size.
   */
  size?: (typeof contextMenuContentPropDefs.size.values)[number] | undefined;
  /**
   * Accent color used for highlighted items. Defaults to the parent color.
   */
  color?: (typeof colorProp.values)[number] | undefined;
  /**
   * Surface treatment of the submenu panel. Defaults to the parent variant.
   */
  variant?: (typeof contextMenuContentPropDefs.variant.values)[number] | undefined;
}

/**
 * Floating submenu panel. Inherits size/color/variant from the parent menu
 * through context, like the sibling dropdown-menu port.
 */
function ContextMenuSubContent(props: ContextMenuSubContentProps): JSX.Element {
  const inherited = useMenuContentContext();
  const size = () => props.size ?? inherited?.size ?? contextMenuContentPropDefs.size.default;
  const color = () => props.color ?? inherited?.color;
  const variant = () =>
    props.variant ?? inherited?.variant ?? contextMenuContentPropDefs.variant.default;
  const rest = omit(
    props,
    "size",
    "color",
    "variant",
    "class",
    "children",
    "sideOffset",
    "alignOffset",
    "collisionPadding",
  );

  return (
    <Portal>
      <Theme
        asChild={false}
        class={cx("fui-ContextMenuSubContent", `fui-r-size-${size()}`, `fui-variant-${variant()}`)}
      >
        <ContextMenuContentContext
          value={{
            get size() {
              return size();
            },
            get color() {
              return color();
            },
            get variant() {
              return variant();
            },
          }}
        >
          <Headless.SubContent
            data-accent-color={color()}
            class={cx(
              "fui-reset",
              "fui-BaseMenuContent",
              "fui-BaseMenuSubContent",
              "fui-ContextMenuContent",
              "fui-ContextMenuSubContent",
              `fui-r-size-${size()}`,
              `fui-variant-${variant()}`,
              props.class,
            )}
            sideOffset={props.sideOffset ?? 2}
            alignOffset={props.alignOffset ?? -4}
            collisionPadding={props.collisionPadding ?? 10}
            {...rest}
          >
            <div class={cx("fui-BaseMenuViewport", "fui-ContextMenuViewport")}>
              {props.children}
            </div>
          </Headless.SubContent>
        </ContextMenuContentContext>
      </Theme>
    </Portal>
  );
}

/**
 * Frosted `ContextMenu` namespace, mirroring the upstream export shape with
 * `GroupLabel` in place of the headless `Label`.
 */
export const ContextMenu = {
  Root: ContextMenuRoot,
  Trigger: ContextMenuTrigger,
  Content: ContextMenuContent,
  Group: ContextMenuGroup,
  GroupLabel: ContextMenuGroupLabel,
  Item: ContextMenuItem,
  CheckboxItem: ContextMenuCheckboxItem,
  RadioGroup: ContextMenuRadioGroup,
  RadioItem: ContextMenuRadioItem,
  Separator: ContextMenuSeparator,
  Sub: ContextMenuSub,
  SubTrigger: ContextMenuSubTrigger,
  SubContent: ContextMenuSubContent,
};

export {
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuRoot,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
};
