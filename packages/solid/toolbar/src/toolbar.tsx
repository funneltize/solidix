import { omit, type Component } from "solid-js";
import { createContextScope, type Scope } from "@solidix/context";
import { useDirection } from "@solidix/direction";
import {
  Primitive,
  callEventHandler,
  composeEventHandlers,
  type PrimitivePropsWithRef,
} from "@solidix/primitive";
import {
  RovingFocusGroup,
  RovingFocusGroupItem,
  createRovingFocusGroupScope,
} from "@solidix/roving-focus";
import { Separator, type SeparatorProps } from "@solidix/separator";
import {
  ToggleGroup,
  ToggleGroupItem,
  createToggleGroupScope,
  type ToggleGroupItemProps,
  type ToggleGroupMultipleProps,
  type ToggleGroupSingleProps,
} from "@solidix/toggle-group";

/* -------------------------------------------------------------------------------------------------
 * Toolbar
 * -----------------------------------------------------------------------------------------------*/

const TOOLBAR_NAME = "Toolbar";

type ScopedProps<P> = P & { __scopeToolbar?: Scope | undefined };
/** Creates the toolbar context and composes its scope subtree. */
const [createToolbarContext, createToolbarScope] = createContextScope(TOOLBAR_NAME, [
  createRovingFocusGroupScope,
  createToggleGroupScope,
]);
const useRovingFocusGroupScope = createRovingFocusGroupScope();
const useToggleGroupScope = createToggleGroupScope();

type ToolbarContextValue = {
  orientation: "horizontal" | "vertical";
  dir: "ltr" | "rtl";
};
const [ToolbarProvider, useToolbarContext] =
  createToolbarContext<ToolbarContextValue>(TOOLBAR_NAME);

/** Props for the root Toolbar element. */
type ToolbarProps = Omit<PrimitivePropsWithRef<"div">, "dir"> & {
  orientation?: "horizontal" | "vertical" | undefined;
  loop?: boolean | undefined;
  dir?: "ltr" | "rtl" | undefined;
};

/** Root toolbar with roving tabindex navigation across its controls. */
const Toolbar: Component<ScopedProps<ToolbarProps>> = (props) => {
  const rest = omit(props, "__scopeToolbar", "orientation", "dir", "loop", "ref");
  const rovingFocusGroupScope = useRovingFocusGroupScope(props.__scopeToolbar);
  const direction = useDirection(props.dir);
  const orientation = () => props.orientation ?? "horizontal";

  return (
    <ToolbarProvider scope={props.__scopeToolbar} orientation={orientation()} dir={direction}>
      <RovingFocusGroup
        asChild
        {...rovingFocusGroupScope}
        orientation={orientation()}
        dir={direction}
        loop={props.loop ?? true}
      >
        <Primitive.div
          role="toolbar"
          aria-orientation={orientation()}
          dir={direction}
          {...rest}
          ref={props.ref}
        />
      </RovingFocusGroup>
    </ToolbarProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ToolbarSeparator
 * -----------------------------------------------------------------------------------------------*/

const SEPARATOR_NAME = "ToolbarSeparator";

/** Props for the ToolbarSeparator divider element. */
type ToolbarSeparatorProps = SeparatorProps;

/** Divider between toolbar controls, oriented across the toolbar direction. */
const ToolbarSeparator: Component<ScopedProps<ToolbarSeparatorProps>> = (props) => {
  const rest = omit(props, "__scopeToolbar", "ref");
  const context = useToolbarContext(SEPARATOR_NAME, props.__scopeToolbar);
  return (
    <Separator
      orientation={context.orientation === "horizontal" ? "vertical" : "horizontal"}
      {...rest}
      ref={props.ref}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * ToolbarButton
 * -----------------------------------------------------------------------------------------------*/

/** Props for a ToolbarButton control. */
type ToolbarButtonProps = PrimitivePropsWithRef<"button">;

/** Button that participates in the toolbar roving focus group. */
const ToolbarButton: Component<ScopedProps<ToolbarButtonProps>> = (props) => {
  const rest = omit(props, "__scopeToolbar", "ref");
  const rovingFocusGroupScope = useRovingFocusGroupScope(props.__scopeToolbar);
  return (
    <RovingFocusGroupItem asChild {...rovingFocusGroupScope} focusable={!props.disabled}>
      <Primitive.button type="button" {...rest} ref={props.ref} />
    </RovingFocusGroupItem>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ToolbarLink
 * -----------------------------------------------------------------------------------------------*/

/** Props for a ToolbarLink control. */
type ToolbarLinkProps = PrimitivePropsWithRef<"a">;

/** Link that participates in the toolbar roving focus group. */
const ToolbarLink: Component<ScopedProps<ToolbarLinkProps>> = (props) => {
  const rest = omit(props, "__scopeToolbar", "onKeyDown", "ref");
  const rovingFocusGroupScope = useRovingFocusGroupScope(props.__scopeToolbar);
  return (
    <RovingFocusGroupItem asChild {...rovingFocusGroupScope} focusable>
      <Primitive.a
        {...rest}
        ref={props.ref}
        onKeyDown={composeEventHandlers(
          (event: KeyboardEvent) => callEventHandler(props.onKeyDown, event),
          (event) => {
            // Only react to keys originating from the link itself. Focusable
            // descendants (eg. content portaled out of the link's DOM subtree)
            // bubble their key events here through the event system.
            // See: https://github.com/radix-ui/primitives/issues/3232
            if (event.target !== event.currentTarget) {
              return;
            }

            if (event.key === " ") {
              (event.currentTarget as HTMLElement).click();
            }
          },
        )}
      />
    </RovingFocusGroupItem>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ToolbarToggleGroup
 * -----------------------------------------------------------------------------------------------*/

const TOGGLE_GROUP_NAME = "ToolbarToggleGroup";

/** Props for a single-selection ToolbarToggleGroup. */
type ToolbarToggleGroupSingleProps = ToggleGroupSingleProps;
/** Props for a multiple-selection ToolbarToggleGroup. */
type ToolbarToggleGroupMultipleProps = ToggleGroupMultipleProps;

/** Toggle group bound to the toolbar orientation and direction. */
const ToolbarToggleGroup: Component<
  ScopedProps<ToolbarToggleGroupSingleProps | ToolbarToggleGroupMultipleProps>
> = (props) => {
  const rest = omit(props, "__scopeToolbar", "ref");
  const context = useToolbarContext(TOGGLE_GROUP_NAME, props.__scopeToolbar);
  const toggleGroupScope = useToggleGroupScope(props.__scopeToolbar);
  return (
    <ToggleGroup
      data-orientation={context.orientation}
      dir={context.dir}
      {...toggleGroupScope}
      {...rest}
      ref={props.ref}
      rovingFocus={false}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * ToolbarToggleItem
 * -----------------------------------------------------------------------------------------------*/

/** Props for a ToolbarToggleItem toggle control. */
type ToolbarToggleItemProps = ToggleGroupItemProps;

/** Toggle item inside a toolbar toggle group. */
const ToolbarToggleItem: Component<ScopedProps<ToolbarToggleItemProps>> = (props) => {
  const rest = omit(props, "__scopeToolbar", "ref");
  const toggleGroupScope = useToggleGroupScope(props.__scopeToolbar);
  const scope = { __scopeToolbar: props.__scopeToolbar };

  return (
    <ToolbarButton asChild {...scope}>
      <ToggleGroupItem {...toggleGroupScope} {...rest} ref={props.ref} />
    </ToolbarButton>
  );
};

/* ---------------------------------------------------------------------------------------------- */

export {
  createToolbarScope,
  //
  Toolbar,
  ToolbarSeparator,
  ToolbarButton,
  ToolbarLink,
  ToolbarToggleGroup,
  ToolbarToggleItem,
  //
  Toolbar as Root,
  ToolbarSeparator as Separator,
  ToolbarButton as Button,
  ToolbarLink as Link,
  ToolbarToggleGroup as ToggleGroup,
  ToolbarToggleItem as ToggleItem,
};
export type {
  ToolbarProps,
  ToolbarSeparatorProps,
  ToolbarButtonProps,
  ToolbarLinkProps,
  ToolbarToggleGroupSingleProps,
  ToolbarToggleGroupMultipleProps,
  ToolbarToggleItemProps,
};
