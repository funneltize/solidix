import { omit, type Component } from "solid-js";
import { useComposedRefs, type RefObject } from "@solidix/compose-refs";
import { createContextScope, type Scope } from "@solidix/context";
import { useId } from "@solidix/id";
import {
  Menu as MenuRoot,
  MenuAnchor,
  MenuArrow,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuItemIndicator,
  MenuLabel,
  MenuPortal,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  createMenuScope,
  type MenuArrowProps,
  type MenuCheckboxItemProps,
  type MenuContentProps,
  type MenuGroupProps,
  type MenuItemIndicatorProps,
  type MenuItemProps,
  type MenuLabelProps,
  type MenuPortalProps,
  type MenuRadioGroupProps,
  type MenuRadioItemProps,
  type MenuSeparatorProps,
  type MenuSubContentProps,
  type MenuSubProps,
  type MenuSubTriggerProps,
} from "@solidix/menu";
import {
  Primitive,
  ariaBoolean,
  callEventHandler,
  composeEventHandlers,
  type PrimitivePropsWithRef,
} from "@solidix/primitive";
import { useControllableState } from "@solidix/use-controllable-state";

/* -------------------------------------------------------------------------------------------------
 * DropdownMenu
 * -----------------------------------------------------------------------------------------------*/

const DROPDOWN_MENU_NAME = "DropdownMenu";

type ScopedProps<P> = P & { __scopeDropdownMenu?: Scope | undefined };
/** Creates the dropdown-menu context scope shared by all parts of one menu. */
const [createDropdownMenuContext, createDropdownMenuScope] = createContextScope(
  DROPDOWN_MENU_NAME,
  [createMenuScope],
);
const useMenuScope = createMenuScope();

type DropdownMenuContextValue = {
  triggerId: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
  contentId: string;
  open: () => boolean;
  onOpenChange(open: boolean): void;
  onOpenToggle(): void;
  modal: boolean;
};

const [DropdownMenuProvider, useDropdownMenuContext] =
  createDropdownMenuContext<DropdownMenuContextValue>(DROPDOWN_MENU_NAME);

type DropdownMenuProps = {
  children?: import("@solidjs/web").JSX.Element | undefined;
  dir?: "ltr" | "rtl" | undefined;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: { bivarianceHack(open: boolean): void }["bivarianceHack"] | undefined;
  modal?: boolean | undefined;
};

/** Root state container for a dropdown menu; holds open state and forwards scope to its parts. */
const DropdownMenu: Component<ScopedProps<DropdownMenuProps>> = (props) => {
  const menuScope = useMenuScope(props.__scopeDropdownMenu);
  const triggerRef: RefObject<HTMLButtonElement | null> = { current: null };
  const [open, setOpen] = useControllableState({
    prop: () => props.open,
    defaultProp: props.defaultOpen ?? false,
    onChange: props.onOpenChange,
    caller: DROPDOWN_MENU_NAME,
  });
  const modal = () => props.modal ?? true;
  // Minted at setup: ids inline in (nested) JSX would re-evaluate per
  // children-getter read and desynchronize trigger/content linkage.
  const triggerId = useId();
  const contentId = useId();

  return (
    <DropdownMenuProvider
      scope={props.__scopeDropdownMenu}
      triggerId={triggerId}
      triggerRef={triggerRef}
      contentId={contentId}
      open={open}
      onOpenChange={setOpen}
      onOpenToggle={() => setOpen((prevOpen) => !prevOpen)}
      modal={modal()}
    >
      <MenuRoot {...menuScope} open={open()} onOpenChange={setOpen} dir={props.dir} modal={modal()}>
        {props.children}
      </MenuRoot>
    </DropdownMenuProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = "DropdownMenuTrigger";

type DropdownMenuTriggerProps = PrimitivePropsWithRef<"button">;

/** Button that toggles the dropdown menu open and closed. */
const DropdownMenuTrigger: Component<ScopedProps<DropdownMenuTriggerProps>> = (props) => {
  const rest = omit(props, "__scopeDropdownMenu", "disabled", "ref");
  const context = useDropdownMenuContext(TRIGGER_NAME, props.__scopeDropdownMenu);
  const menuScope = useMenuScope(props.__scopeDropdownMenu);
  const composedRefs = useComposedRefs(props.ref, context.triggerRef);
  const disabled = () => props.disabled ?? false;
  return (
    <MenuAnchor asChild {...menuScope}>
      <Primitive.button
        type="button"
        id={context.triggerId}
        aria-haspopup="menu"
        aria-expanded={ariaBoolean(context.open())}
        aria-controls={context.open() ? context.contentId : undefined}
        data-state={context.open() ? "open" : "closed"}
        data-disabled={disabled() ? "" : undefined}
        disabled={disabled()}
        {...rest}
        ref={composedRefs}
        onPointerDown={composeEventHandlers(
          (event: PointerEvent) => callEventHandler(props.onPointerDown, event),
          (event) => {
            // only call handler if it's the left button (mousedown gets triggered by all mouse buttons)
            // but not when the control key is pressed (avoiding MacOS right click)
            if (!disabled() && event.button === 0 && event.ctrlKey === false) {
              context.onOpenToggle();
              // prevent trigger focusing when opening
              // this allows the content to be given focus without competition
              if (!context.open()) event.preventDefault();
            }
          },
        )}
        onKeyDown={composeEventHandlers(
          (event: KeyboardEvent) => callEventHandler(props.onKeyDown, event),
          (event) => {
            if (disabled()) return;
            if (["Enter", " "].includes(event.key)) context.onOpenToggle();
            if (event.key === "ArrowDown") context.onOpenChange(true);
            // prevent keydown from scrolling window / first focused item to execute
            // that keydown (inadvertently closing the menu)
            if (["Enter", " ", "ArrowDown"].includes(event.key)) event.preventDefault();
          },
        )}
      />
    </MenuAnchor>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuPortal
 * -----------------------------------------------------------------------------------------------*/

type DropdownMenuPortalProps = MenuPortalProps;

/** Portals dropdown menu content into `document.body` when open. */
const DropdownMenuPortal: Component<ScopedProps<DropdownMenuPortalProps>> = (props) => {
  const rest = omit(props, "__scopeDropdownMenu");
  const menuScope = useMenuScope(props.__scopeDropdownMenu);
  return <MenuPortal {...menuScope} {...rest} />;
};

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "DropdownMenuContent";

type DropdownMenuContentProps = Omit<MenuContentProps, "onEntryFocus">;

/** Floating panel that renders the dropdown menu items. */
const DropdownMenuContent: Component<ScopedProps<DropdownMenuContentProps>> = (props) => {
  const rest = omit(props, "__scopeDropdownMenu", "ref");
  const context = useDropdownMenuContext(CONTENT_NAME, props.__scopeDropdownMenu);
  const menuScope = useMenuScope(props.__scopeDropdownMenu);
  const hasInteractedOutsideRef = { current: false };

  return (
    <MenuContent
      id={context.contentId}
      aria-labelledby={context.triggerId}
      {...menuScope}
      {...rest}
      ref={props.ref}
      onCloseAutoFocus={composeEventHandlers(
        (event) => callEventHandler(rest.onCloseAutoFocus, event),
        (event) => {
          if (!hasInteractedOutsideRef.current) context.triggerRef.current?.focus();
          hasInteractedOutsideRef.current = false;
          // Always prevent auto focus because we either focus manually or want user agent focus
          event.preventDefault();
        },
      )}
      onInteractOutside={composeEventHandlers(
        (event) => callEventHandler(rest.onInteractOutside, event),
        (event) => {
          const originalEvent = event.detail.originalEvent as PointerEvent;
          const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
          const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
          if (!context.modal || isRightClick) hasInteractedOutsideRef.current = true;
        },
      )}
      style={{
        ...props.style,
        // re-namespace exposed content custom properties
        "--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
        "--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)",
        "--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)",
        "--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
        "--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)",
      }}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuGroup
 * -----------------------------------------------------------------------------------------------*/

type DropdownMenuGroupProps = MenuGroupProps;

/** Groups related menu items with an optional label. */
const DropdownMenuGroup: Component<ScopedProps<DropdownMenuGroupProps>> = (props) => {
  const rest = omit(props, "__scopeDropdownMenu", "ref");
  const menuScope = useMenuScope(props.__scopeDropdownMenu);
  return <MenuGroup {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuLabel
 * -----------------------------------------------------------------------------------------------*/

type DropdownMenuLabelProps = MenuLabelProps;

/** Non-interactive heading for a group of menu items. */
const DropdownMenuLabel: Component<ScopedProps<DropdownMenuLabelProps>> = (props) => {
  const rest = omit(props, "__scopeDropdownMenu", "ref");
  const menuScope = useMenuScope(props.__scopeDropdownMenu);
  return <MenuLabel {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuItem
 * -----------------------------------------------------------------------------------------------*/

type DropdownMenuItemProps = MenuItemProps;

/** Selectable menu item that closes the menu on select by default. */
const DropdownMenuItem: Component<ScopedProps<DropdownMenuItemProps>> = (props) => {
  const rest = omit(props, "__scopeDropdownMenu", "ref");
  const menuScope = useMenuScope(props.__scopeDropdownMenu);
  return <MenuItem {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuCheckboxItem
 * -----------------------------------------------------------------------------------------------*/

type DropdownMenuCheckboxItemProps = MenuCheckboxItemProps;

/** Menu item with a checkable on/off state. */
const DropdownMenuCheckboxItem: Component<ScopedProps<DropdownMenuCheckboxItemProps>> = (props) => {
  const rest = omit(props, "__scopeDropdownMenu", "ref");
  const menuScope = useMenuScope(props.__scopeDropdownMenu);
  return <MenuCheckboxItem {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuRadioGroup
 * -----------------------------------------------------------------------------------------------*/

type DropdownMenuRadioGroupProps = MenuRadioGroupProps;

/** Groups radio items so only one can be checked at a time. */
const DropdownMenuRadioGroup: Component<ScopedProps<DropdownMenuRadioGroupProps>> = (props) => {
  const rest = omit(props, "__scopeDropdownMenu", "ref");
  const menuScope = useMenuScope(props.__scopeDropdownMenu);
  return <MenuRadioGroup {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuRadioItem
 * -----------------------------------------------------------------------------------------------*/

type DropdownMenuRadioItemProps = MenuRadioItemProps;

/** Checkable menu item that belongs to a radio group. */
const DropdownMenuRadioItem: Component<ScopedProps<DropdownMenuRadioItemProps>> = (props) => {
  const rest = omit(props, "__scopeDropdownMenu", "ref");
  const menuScope = useMenuScope(props.__scopeDropdownMenu);
  return <MenuRadioItem {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuItemIndicator
 * -----------------------------------------------------------------------------------------------*/

type DropdownMenuItemIndicatorProps = MenuItemIndicatorProps;

/** Renders its children when its parent checkbox or radio item is checked. */
const DropdownMenuItemIndicator: Component<ScopedProps<DropdownMenuItemIndicatorProps>> = (
  props,
) => {
  const rest = omit(props, "__scopeDropdownMenu", "ref");
  const menuScope = useMenuScope(props.__scopeDropdownMenu);
  return <MenuItemIndicator {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuSeparator
 * -----------------------------------------------------------------------------------------------*/

type DropdownMenuSeparatorProps = MenuSeparatorProps;

/** Visual divider between menu items or groups. */
const DropdownMenuSeparator: Component<ScopedProps<DropdownMenuSeparatorProps>> = (props) => {
  const rest = omit(props, "__scopeDropdownMenu", "ref");
  const menuScope = useMenuScope(props.__scopeDropdownMenu);
  return <MenuSeparator {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuArrow
 * -----------------------------------------------------------------------------------------------*/

type DropdownMenuArrowProps = MenuArrowProps;

/** Small arrow pointing from the menu content toward its trigger. */
const DropdownMenuArrow: Component<ScopedProps<DropdownMenuArrowProps>> = (props) => {
  const rest = omit(props, "__scopeDropdownMenu", "ref");
  const menuScope = useMenuScope(props.__scopeDropdownMenu);
  return <MenuArrow {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuSub
 * -----------------------------------------------------------------------------------------------*/

type DropdownMenuSubProps = MenuSubProps & {
  defaultOpen?: boolean | undefined;
};

/** Root state container for a nested submenu. */
const DropdownMenuSub: Component<ScopedProps<DropdownMenuSubProps>> = (props) => {
  const menuScope = useMenuScope(props.__scopeDropdownMenu);
  const [open, setOpen] = useControllableState({
    prop: () => props.open,
    defaultProp: props.defaultOpen ?? false,
    onChange: props.onOpenChange,
    caller: "DropdownMenuSub",
  });

  return (
    <MenuSub {...menuScope} open={open()} onOpenChange={setOpen}>
      {props.children}
    </MenuSub>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuSubTrigger
 * -----------------------------------------------------------------------------------------------*/

type DropdownMenuSubTriggerProps = MenuSubTriggerProps;

/** Menu item that opens its nested submenu. */
const DropdownMenuSubTrigger: Component<ScopedProps<DropdownMenuSubTriggerProps>> = (props) => {
  const rest = omit(props, "__scopeDropdownMenu", "ref");
  const menuScope = useMenuScope(props.__scopeDropdownMenu);
  return <MenuSubTrigger {...menuScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuSubContent
 * -----------------------------------------------------------------------------------------------*/

type DropdownMenuSubContentProps = MenuSubContentProps;

/** Floating panel that renders a nested submenu's items. */
const DropdownMenuSubContent: Component<ScopedProps<DropdownMenuSubContentProps>> = (props) => {
  const rest = omit(props, "__scopeDropdownMenu", "ref");
  const menuScope = useMenuScope(props.__scopeDropdownMenu);

  return (
    <MenuSubContent
      {...menuScope}
      {...rest}
      ref={props.ref}
      style={{
        ...props.style,
        // re-namespace exposed content custom properties
        "--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
        "--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)",
        "--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)",
        "--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
        "--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)",
      }}
    />
  );
};

/* -----------------------------------------------------------------------------------------------*/

export {
  createDropdownMenuScope,
  //
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItemIndicator,
  DropdownMenuSeparator,
  DropdownMenuArrow,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  //
  DropdownMenu as Root,
  DropdownMenuTrigger as Trigger,
  DropdownMenuPortal as Portal,
  DropdownMenuContent as Content,
  DropdownMenuGroup as Group,
  DropdownMenuLabel as Label,
  DropdownMenuItem as Item,
  DropdownMenuCheckboxItem as CheckboxItem,
  DropdownMenuRadioGroup as RadioGroup,
  DropdownMenuRadioItem as RadioItem,
  DropdownMenuItemIndicator as ItemIndicator,
  DropdownMenuSeparator as Separator,
  DropdownMenuArrow as Arrow,
  DropdownMenuSub as Sub,
  DropdownMenuSubTrigger as SubTrigger,
  DropdownMenuSubContent as SubContent,
};
export type {
  DropdownMenuProps,
  DropdownMenuTriggerProps,
  DropdownMenuPortalProps,
  DropdownMenuContentProps,
  DropdownMenuGroupProps,
  DropdownMenuLabelProps,
  DropdownMenuItemProps,
  DropdownMenuCheckboxItemProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  DropdownMenuItemIndicatorProps,
  DropdownMenuSeparatorProps,
  DropdownMenuArrowProps,
  DropdownMenuSubProps,
  DropdownMenuSubTriggerProps,
  DropdownMenuSubContentProps,
};
