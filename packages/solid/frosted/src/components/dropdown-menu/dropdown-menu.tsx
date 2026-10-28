// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/dropdown-menu/dropdown-menu.tsx
// Styled overlay port: frosted `fui-*` classes over the `@solidix/dropdown-menu` headless primitive.

import { createContext, omit, useContext, type Component } from "solid-js";
import { Portal, type JSX } from "@solidjs/web";
import {
  DropdownMenu as HeadlessRoot,
  DropdownMenuCheckboxItem as HeadlessCheckboxItem,
  DropdownMenuContent as HeadlessContent,
  DropdownMenuGroup as HeadlessGroup,
  DropdownMenuItem as HeadlessItem,
  DropdownMenuItemIndicator as HeadlessItemIndicator,
  DropdownMenuLabel as HeadlessLabel,
  DropdownMenuRadioGroup as HeadlessRadioGroup,
  DropdownMenuRadioItem as HeadlessRadioItem,
  DropdownMenuSeparator as HeadlessSeparator,
  DropdownMenuSub as HeadlessSub,
  DropdownMenuSubContent as HeadlessSubContent,
  DropdownMenuSubTrigger as HeadlessSubTrigger,
  DropdownMenuTrigger as HeadlessTrigger,
  type DropdownMenuCheckboxItemProps as HeadlessCheckboxItemProps,
  type DropdownMenuContentProps as HeadlessContentProps,
  type DropdownMenuGroupProps as HeadlessGroupProps,
  type DropdownMenuItemProps as HeadlessItemProps,
  type DropdownMenuLabelProps as HeadlessLabelProps,
  type DropdownMenuProps as HeadlessRootProps,
  type DropdownMenuRadioGroupProps as HeadlessRadioGroupProps,
  type DropdownMenuRadioItemProps as HeadlessRadioItemProps,
  type DropdownMenuSeparatorProps as HeadlessSeparatorProps,
  type DropdownMenuSubContentProps as HeadlessSubContentProps,
  type DropdownMenuSubProps as HeadlessSubProps,
  type DropdownMenuSubTriggerProps as HeadlessSubTriggerProps,
  type DropdownMenuTriggerProps as HeadlessTriggerProps,
} from "@solidix/dropdown-menu";
import type {
  DropdownMenuCheckboxItemOwnProps,
  DropdownMenuContentOwnProps,
  DropdownMenuItemOwnProps,
} from "./dropdown-menu.props";
import { dropdownMenuContentPropDefs } from "./dropdown-menu.props";
import { cx } from "../../helpers/cx";
import { Theme, useThemeContext } from "../../theme";

/** Props accepted by the inline indicator icons. */
interface DropdownMenuIconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  /** Fill color for the icon paths. Defaults to `currentColor`. */
  color?: string | undefined;
}

/**
 * Check mark rendered inside checked item indicators. Inlined from the
 * upstream icons module so this port stays self-contained.
 */
const ThickCheckIcon: Component<DropdownMenuIconProps> = (props) => {
  const rest = omit(props, "color");
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 9 9"
      fill={props.color ?? "currentColor"}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8.53547 0.62293C8.88226 0.849446 8.97976 1.3142 8.75325 1.66099L4.5083 8.1599C4.38833 8.34356 4.19397 8.4655 3.9764 8.49358C3.75883 8.52167 3.53987 8.45309 3.3772 8.30591L0.616113 5.80777C0.308959 5.52987 0.285246 5.05559 0.563148 4.74844C0.84105 4.44128 1.31533 4.41757 1.62249 4.69547L3.73256 6.60459L7.49741 0.840706C7.72393 0.493916 8.18868 0.396414 8.53547 0.62293Z"
      />
    </svg>
  );
};

/**
 * Chevron rendered inside sub triggers. Inlined from the upstream icons
 * module so this port stays self-contained.
 */
const ThickChevronRightIcon: Component<DropdownMenuIconProps> = (props) => {
  const rest = omit(props, "color");
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 9 9"
      fill={props.color ?? "currentColor"}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M3.23826 0.201711C3.54108 -0.0809141 4.01567 -0.0645489 4.29829 0.238264L7.79829 3.98826C8.06724 4.27642 8.06724 4.72359 7.79829 5.01174L4.29829 8.76174C4.01567 9.06455 3.54108 9.08092 3.23826 8.79829C2.93545 8.51567 2.91909 8.04108 3.20171 7.73826L6.22409 4.5L3.20171 1.26174C2.91909 0.958928 2.93545 0.484337 3.23826 0.201711Z"
      />
    </svg>
  );
};

/** Appearance shared by the styled content and its sub content. */
interface DropdownMenuContentContextValue {
  /** Content size (1, 2, or 3). */
  size: DropdownMenuContentOwnProps["size"];
  /** Accent color token for the content, when set. */
  color: DropdownMenuContentOwnProps["color"];
  /** Content variant (solid or translucent). */
  variant: DropdownMenuContentOwnProps["variant"];
}

/** Context carrying content-level appearance down to sub content. */
const DropdownMenuContentContext = createContext<DropdownMenuContentContextValue>();

/** Reads the styled content context, throwing outside a `DropdownMenu.Content`. */
function useDropdownMenuContentContext(consumer: string): DropdownMenuContentContextValue {
  try {
    return useContext(DropdownMenuContentContext);
  } catch {
    throw new Error(`\`${consumer}\` must be used within \`DropdownMenu.Content\``);
  }
}

/** Props accepted by the styled `DropdownMenu.Root`. */
export type DropdownMenuRootProps = HeadlessRootProps;

/**
 * Styled dropdown menu root. Renders the headless root unchanged.
 *
 * Deviation: upstream `handle` / `createHandle` (the Base UI imperative
 * handle for render-prop triggers) is not supported; triggers render
 * declaratively, so there is no handle to create or pass.
 */
const DropdownMenuRoot: Component<DropdownMenuRootProps> = (props) => {
  return <HeadlessRoot {...props} />;
};

/** Props accepted by the styled `DropdownMenu.Trigger`. */
export type DropdownMenuTriggerProps = HeadlessTriggerProps;

/**
 * Opens the menu when activated.
 *
 * Deviation: upstream renders its child through a render prop, replacing the
 * trigger element. This port renders children inside the headless trigger
 * button, so custom trigger content nests rather than replaces.
 */
const DropdownMenuTrigger: Component<DropdownMenuTriggerProps> = (props) => {
  const rest = omit(props, "class", "children");
  return (
    <HeadlessTrigger {...rest} class={cx(props.class)}>
      {props.children}
    </HeadlessTrigger>
  );
};

/** Props accepted by the styled `DropdownMenu.Content`. */
export type DropdownMenuContentProps = Omit<HeadlessContentProps, "class" | "forceMount"> &
  DropdownMenuContentOwnProps & {
    /** Additional class names for the positioned content element. */
    class?: string | undefined;
    /** Portal container for the floating content. Defaults to `document.body`. */
    container?: HTMLElement | undefined;
    /** Keep the content mounted when the menu is closed. */
    keepMounted?: boolean | undefined;
  };

/**
 * Styled dropdown menu content, portalled with theme and frosted classes.
 * Defaults: `side` bottom, `sideOffset` 4, `align` start, `collisionPadding` 10.
 *
 * Deviations: upstream wraps the viewport in a `ScrollArea`; this port
 * renders a plain viewport `div` (no ScrollArea primitive exists yet).
 * Upstream positions through a separate `Positioner` element; the headless
 * content positions itself, so there is no separate positioner node.
 * `container` maps to the portal `mount`, `keepMounted` to `forceMount`.
 */
const DropdownMenuContent: Component<DropdownMenuContentProps> = (props) => {
  const rest = omit(
    props,
    "class",
    "children",
    "size",
    "color",
    "variant",
    "container",
    "keepMounted",
    "side",
    "sideOffset",
    "align",
    "collisionPadding",
  ) as HeadlessContentProps;
  let themeContext: ReturnType<typeof useThemeContext> | undefined;
  try {
    themeContext = useThemeContext();
  } catch {
    themeContext = undefined;
  }
  const size = () => props.size ?? dropdownMenuContentPropDefs.size.default;
  const color = () => props.color ?? themeContext?.accentColor;
  const variant = () => props.variant ?? dropdownMenuContentPropDefs.variant.default;
  const portalProps = () => (props.container ? { mount: props.container } : {});
  return (
    <Portal {...portalProps()}>
      <Theme>
        <HeadlessContent
          data-accent-color={color()}
          {...rest}
          side={props.side ?? "bottom"}
          sideOffset={props.sideOffset ?? 4}
          align={props.align ?? "start"}
          collisionPadding={props.collisionPadding ?? 10}
          forceMount={props.keepMounted || undefined}
          class={cx(
            "fui-BaseMenuContent",
            "fui-DropdownMenuContent",
            `fui-variant-${variant()}`,
            props.class,
            `fui-r-size-${size()}`,
          )}
        >
          <div class="fui-BaseMenuViewport fui-DropdownMenuViewport">
            <DropdownMenuContentContext
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
              {props.children}
            </DropdownMenuContentContext>
          </div>
        </HeadlessContent>
      </Theme>
    </Portal>
  );
};

/** Props accepted by the styled `DropdownMenu.Group`. */
export type DropdownMenuGroupProps = HeadlessGroupProps;

/** Styled menu group. Adds frosted classes to the headless group. */
const DropdownMenuGroup: Component<DropdownMenuGroupProps> = (props) => {
  return (
    <HeadlessGroup
      {...props}
      class={cx("fui-BaseMenuGroup", "fui-DropdownMenuGroup", props.class)}
    />
  );
};

/** Props accepted by the styled `DropdownMenu.GroupLabel`. */
export type DropdownMenuGroupLabelProps = HeadlessLabelProps;

/** Styled group label. Adds frosted classes to the headless label. */
const DropdownMenuGroupLabel: Component<DropdownMenuGroupLabelProps> = (props) => {
  return (
    <HeadlessLabel
      {...props}
      class={cx("fui-BaseMenuGroupLabel", "fui-DropdownMenuGroupLabel", props.class)}
    />
  );
};

/** Props accepted by the styled `DropdownMenu.Item`. */
export type DropdownMenuItemProps = HeadlessItemProps & DropdownMenuItemOwnProps;

/**
 * Styled menu item with an optional trailing shortcut hint. The only part
 * carrying `fui-reset`, matching upstream.
 */
const DropdownMenuItem: Component<DropdownMenuItemProps> = (props) => {
  const rest = omit(props, "class", "children", "color", "shortcut") as HeadlessItemProps;
  return (
    <HeadlessItem
      data-accent-color={props.color}
      {...rest}
      class={cx("fui-reset", "fui-BaseMenuItem", "fui-DropdownMenuItem", props.class)}
    >
      {props.children}
      {props.shortcut ? (
        <div class="fui-BaseMenuShortcut fui-DropdownMenuShortcut">{props.shortcut}</div>
      ) : null}
    </HeadlessItem>
  );
};

/** Props accepted by the styled `DropdownMenu.CheckboxItem`. */
export type DropdownMenuCheckboxItemProps = HeadlessCheckboxItemProps &
  DropdownMenuCheckboxItemOwnProps;

/** Styled checkable item with an indicator and an optional shortcut hint. */
const DropdownMenuCheckboxItem: Component<DropdownMenuCheckboxItemProps> = (props) => {
  const rest = omit(props, "class", "children", "shortcut") as HeadlessCheckboxItemProps;
  return (
    <HeadlessCheckboxItem
      {...rest}
      class={cx(
        "fui-BaseMenuItem",
        "fui-BaseMenuCheckboxItem",
        "fui-DropdownMenuItem",
        "fui-DropdownMenuCheckboxItem",
        props.class,
      )}
    >
      {props.children}
      <HeadlessItemIndicator class="fui-BaseMenuItemIndicator fui-DropdownMenuItemIndicator">
        <ThickCheckIcon class="fui-BaseMenuItemIndicatorIcon fui-DropdownMenuItemIndicatorIcon" />
      </HeadlessItemIndicator>
      {props.shortcut ? (
        <div class="fui-BaseMenuShortcut fui-DropdownMenuShortcut">{props.shortcut}</div>
      ) : null}
    </HeadlessCheckboxItem>
  );
};

/** Props accepted by the styled `DropdownMenu.RadioGroup`. */
export type DropdownMenuRadioGroupProps = HeadlessRadioGroupProps;

/** Styled radio group. Adds frosted classes to the headless radio group. */
const DropdownMenuRadioGroup: Component<DropdownMenuRadioGroupProps> = (props) => {
  return (
    <HeadlessRadioGroup
      {...props}
      class={cx("fui-BaseMenuRadioGroup", "fui-DropdownMenuRadioGroup", props.class)}
    />
  );
};

/** Props accepted by the styled `DropdownMenu.RadioItem`. */
export type DropdownMenuRadioItemProps = HeadlessRadioItemProps;

/**
 * Styled radio item with a check indicator. Uses the shared headless item
 * indicator, which Radix also shares between checkbox and radio items.
 */
const DropdownMenuRadioItem: Component<DropdownMenuRadioItemProps> = (props) => {
  const rest = omit(props, "class", "children") as HeadlessRadioItemProps;
  return (
    <HeadlessRadioItem
      {...rest}
      class={cx(
        "fui-BaseMenuItem",
        "fui-BaseMenuRadioItem",
        "fui-DropdownMenuItem",
        "fui-DropdownMenuRadioItem",
        props.class,
      )}
    >
      {props.children}
      <HeadlessItemIndicator class="fui-BaseMenuItemIndicator fui-DropdownMenuItemIndicator">
        <ThickCheckIcon class="fui-BaseMenuItemIndicatorIcon fui-DropdownMenuItemIndicatorIcon" />
      </HeadlessItemIndicator>
    </HeadlessRadioItem>
  );
};

/** Props accepted by the styled `DropdownMenu.Separator`. */
export type DropdownMenuSeparatorProps = HeadlessSeparatorProps;

/** Styled separator. Adds frosted classes to the headless separator. */
const DropdownMenuSeparator: Component<DropdownMenuSeparatorProps> = (props) => {
  return (
    <HeadlessSeparator
      {...props}
      class={cx("fui-BaseMenuSeparator", "fui-DropdownMenuSeparator", props.class)}
    />
  );
};

/** Props accepted by the styled `DropdownMenu.Sub`. */
export type DropdownMenuSubProps = HeadlessSubProps;

/** Styled submenu root. Renders the headless sub unchanged. */
const DropdownMenuSub: Component<DropdownMenuSubProps> = (props) => {
  return <HeadlessSub {...props} />;
};

/** Props accepted by the styled `DropdownMenu.SubTrigger`. */
export type DropdownMenuSubTriggerProps = HeadlessSubTriggerProps;

/** Styled submenu trigger with a trailing chevron indicator. */
const DropdownMenuSubTrigger: Component<DropdownMenuSubTriggerProps> = (props) => {
  const rest = omit(props, "class", "children") as HeadlessSubTriggerProps;
  return (
    <HeadlessSubTrigger
      {...rest}
      class={cx(
        "fui-BaseMenuItem",
        "fui-BaseMenuSubTrigger",
        "fui-DropdownMenuItem",
        "fui-DropdownMenuSubTrigger",
        props.class,
      )}
    >
      {props.children}
      <div class="fui-BaseMenuShortcut fui-DropdownMenuShortcut">
        <ThickChevronRightIcon class="fui-BaseMenuSubTriggerIcon fui-DropdownMenuSubTriggerIcon" />
      </div>
    </HeadlessSubTrigger>
  );
};

/** Props accepted by the styled `DropdownMenu.SubContent`. */
export type DropdownMenuSubContentProps = Omit<HeadlessSubContentProps, "class" | "forceMount"> & {
  /** Additional class names for the positioned sub content element. */
  class?: string | undefined;
  /** Portal container for the floating content. Defaults to `document.body`. */
  container?: HTMLElement | undefined;
  /** Keep the content mounted when the menu is closed. */
  keepMounted?: boolean | undefined;
};

/**
 * Styled submenu content. Inherits size, color, and variant from the parent
 * `DropdownMenu.Content`, falling back to the content defaults when rendered
 * outside one. Defaults: `sideOffset` 2, `alignOffset` -4,
 * `collisionPadding` 10.
 *
 * Deviations: same ScrollArea, Positioner, `container`, and `keepMounted`
 * notes as {@link DropdownMenuContent}.
 */
const DropdownMenuSubContent: Component<DropdownMenuSubContentProps> = (props) => {
  const rest = omit(
    props,
    "class",
    "children",
    "container",
    "keepMounted",
    "sideOffset",
    "alignOffset",
    "collisionPadding",
  ) as HeadlessSubContentProps;
  let parent: DropdownMenuContentContextValue | undefined;
  try {
    parent = useDropdownMenuContentContext("DropdownMenuSubContent");
  } catch {
    parent = undefined;
  }
  const size = () => parent?.size ?? dropdownMenuContentPropDefs.size.default;
  const color = () => parent?.color;
  const variant = () => parent?.variant ?? dropdownMenuContentPropDefs.variant.default;
  const portalProps = () => (props.container ? { mount: props.container } : {});
  return (
    <Portal {...portalProps()}>
      <Theme>
        <HeadlessSubContent
          data-accent-color={color()}
          {...rest}
          sideOffset={props.sideOffset ?? 2}
          alignOffset={props.alignOffset ?? -4}
          collisionPadding={props.collisionPadding ?? 10}
          forceMount={props.keepMounted || undefined}
          class={cx(
            "fui-BaseMenuContent",
            "fui-BaseMenuSubContent",
            "fui-DropdownMenuContent",
            "fui-DropdownMenuSubContent",
            `fui-variant-${variant()}`,
            props.class,
            `fui-r-size-${size()}`,
          )}
        >
          <div class="fui-BaseMenuViewport fui-DropdownMenuViewport">{props.children}</div>
        </HeadlessSubContent>
      </Theme>
    </Portal>
  );
};

/** Styled dropdown menu parts as a single namespace object. */
const DropdownMenu: {
  Root: typeof DropdownMenuRoot;
  Trigger: typeof DropdownMenuTrigger;
  Content: typeof DropdownMenuContent;
  Group: typeof DropdownMenuGroup;
  GroupLabel: typeof DropdownMenuGroupLabel;
  Item: typeof DropdownMenuItem;
  CheckboxItem: typeof DropdownMenuCheckboxItem;
  RadioGroup: typeof DropdownMenuRadioGroup;
  RadioItem: typeof DropdownMenuRadioItem;
  Separator: typeof DropdownMenuSeparator;
  Sub: typeof DropdownMenuSub;
  SubTrigger: typeof DropdownMenuSubTrigger;
  SubContent: typeof DropdownMenuSubContent;
} = {
  Root: DropdownMenuRoot,
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Group: DropdownMenuGroup,
  GroupLabel: DropdownMenuGroupLabel,
  Item: DropdownMenuItem,
  CheckboxItem: DropdownMenuCheckboxItem,
  RadioGroup: DropdownMenuRadioGroup,
  RadioItem: DropdownMenuRadioItem,
  Separator: DropdownMenuSeparator,
  Sub: DropdownMenuSub,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuSubContent,
};

export {
  DropdownMenu,
  DropdownMenuCheckboxItem as CheckboxItem,
  DropdownMenuContent as Content,
  DropdownMenuGroup as Group,
  DropdownMenuGroupLabel as GroupLabel,
  DropdownMenuItem as Item,
  DropdownMenuRadioGroup as RadioGroup,
  DropdownMenuRadioItem as RadioItem,
  DropdownMenuRoot as Root,
  DropdownMenuSeparator as Separator,
  DropdownMenuSub as Sub,
  DropdownMenuSubContent as SubContent,
  DropdownMenuSubTrigger as SubTrigger,
  DropdownMenuTrigger as Trigger,
};

export type {
  DropdownMenuCheckboxItemProps as CheckboxItemProps,
  DropdownMenuContentProps as ContentProps,
  DropdownMenuGroupLabelProps as GroupLabelProps,
  DropdownMenuGroupProps as GroupProps,
  DropdownMenuItemProps as ItemProps,
  DropdownMenuRadioGroupProps as RadioGroupProps,
  DropdownMenuRadioItemProps as RadioItemProps,
  DropdownMenuRootProps as RootProps,
  DropdownMenuSeparatorProps as SeparatorProps,
  DropdownMenuSubContentProps as SubContentProps,
  DropdownMenuSubProps as SubProps,
  DropdownMenuSubTriggerProps as SubTriggerProps,
  DropdownMenuTriggerProps as TriggerProps,
};
