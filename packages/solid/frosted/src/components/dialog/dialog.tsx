// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/dialog/dialog.tsx
// Base UI Dialog parts (Root, Trigger, Portal, Backdrop, Popup, Title, Description, Close)
// map onto @solidix/dialog (Dialog, Trigger, Portal, Overlay, Content, Title, Description,
// Close). Upstream Backdrop + Viewport are sibling overlays: the backdrop dims, the viewport
// centers the popup. Both map onto `DialogOverlay` here (`fui-DialogBackdrop` and
// `fui-DialogOverlay`), since the solidix overlay is a plain styled layer without the
// Base UI backdrop/viewport split.

import {
  createContext,
  omit,
  useContext as useSolidContext,
  type Component,
  type ComponentProps,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  Dialog as DialogPrimitive,
  DialogClose as DialogClosePrimitive,
  DialogContent as DialogContentPrimitive,
  DialogDescription as DialogDescriptionPrimitive,
  DialogOverlay as DialogOverlayPrimitive,
  DialogPortal as DialogPortalPrimitive,
  DialogTitle as DialogTitlePrimitive,
  DialogTrigger as DialogTriggerPrimitive,
  type DialogCloseProps as DialogClosePrimitiveProps,
  type DialogContentProps as DialogContentPrimitiveProps,
  type DialogPortalProps as DialogPortalPrimitiveProps,
  type DialogProps as DialogPrimitiveProps,
  type DialogTriggerProps as DialogTriggerPrimitiveProps,
} from "@solidix/dialog";
import { cx } from "../../helpers/cx";
import { Theme } from "../../theme";
import { Heading } from "../heading/heading";
import { Text } from "../text/text";
import { dialogContentPropDefs, type DialogContentOwnProps } from "./dialog.props";

/* -------------------------------------------------------------------------------------------------
 * DialogContentContext - resolves the content size for Title/Description cascades.
 * -----------------------------------------------------------------------------------------------*/

/** Value shared from `Content` to `Title` and `Description` for size cascades. */
interface DialogContentContextValue {
  /** The resolved content size ('1' - '4'). */
  readonly size: NonNullable<DialogContentOwnProps["size"]>;
}

const DialogContentContext = createContext<DialogContentContextValue>();

/**
 * Returns the nearest dialog content context, or `undefined` when the title or
 * description renders outside a frosted dialog content.
 */
function useDialogContentContext(): DialogContentContextValue | undefined {
  try {
    return useSolidContext(DialogContentContext);
  } catch {
    return undefined;
  }
}

/* -------------------------------------------------------------------------------------------------
 * DialogRoot
 * -----------------------------------------------------------------------------------------------*/

/** Props accepted by the `Root` component. Modal is always on, matching upstream. */
interface DialogRootProps extends Omit<DialogPrimitiveProps, "modal"> {}

/** The root container that manages the dialog open state. Always modal. */
const DialogRoot: Component<DialogRootProps> = (props) => (
  // Upstream forces `modal` on the Base UI root; there is no frosted `modal` prop.
  <DialogPrimitive modal {...props} />
);

/* -------------------------------------------------------------------------------------------------
 * DialogTrigger
 * -----------------------------------------------------------------------------------------------*/

/** Props accepted by the `Trigger` component. `children` is the single slotted element. */
interface DialogTriggerProps extends Omit<DialogTriggerPrimitiveProps, "asChild"> {
  /** The single element that receives the trigger behavior. */
  children: JSX.Element;
}

/** The button that opens the dialog, slotted onto its single child element. */
const DialogTrigger: Component<DialogTriggerProps> = (props) => {
  const rest = omit(props, "children");
  return (
    <DialogTriggerPrimitive asChild {...rest}>
      {props.children}
    </DialogTriggerPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DialogContent
 * -----------------------------------------------------------------------------------------------*/

/** Props accepted by the `Content` component. */
interface DialogContentProps
  extends DialogContentOwnProps,
    Omit<DialogContentPrimitiveProps, "asChild"> {
  /** Container element to portal the content into. Passed to the portal. */
  container?: DialogPortalPrimitiveProps["container"] | undefined;
  /** Keeps the portal mounted when closed. Passed to the portal as `forceMount`. */
  keepMounted?: boolean | undefined;
}

/** The dialog panel, portalled with backdrop, viewport centering, and theme. */
const DialogContent: Component<DialogContentProps> = (props) => {
  const rest = omit(
    props,
    "size",
    "class",
    "style",
    "children",
    "container",
    "keepMounted",
    "forceMount",
  );
  const size = () => props.size ?? dialogContentPropDefs.size.default;
  return (
    <DialogPortalPrimitive
      container={props.container}
      forceMount={props.keepMounted ? true : undefined}
    >
      <DialogOverlayPrimitive
        class="fui-DialogBackdrop"
        forceMount={props.forceMount}
      />
      <DialogOverlayPrimitive
        class="fui-DialogOverlay"
        forceMount={props.forceMount}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <Theme>
          <DialogContentPrimitive
            class={cx("fui-DialogContent", `fui-r-size-${size()}`, props.class)}
            style={props.style}
            forceMount={props.forceMount}
            {...rest}
          >
            <DialogContentContext
              value={{
                get size() {
                  return size();
                },
              }}
            >
              {props.children}
            </DialogContentContext>
          </DialogContentPrimitive>
        </Theme>
      </DialogOverlayPrimitive>
    </DialogPortalPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DialogTitle
 * -----------------------------------------------------------------------------------------------*/

/** Maps content size to the heading size used by the title. */
const DIALOG_TITLE_SIZE_MAP = { "1": "3", "2": "5", "3": "5", "4": "6" } as const;

/** Props accepted by the `Title` component. An explicit `size` wins over the cascade. */
type DialogTitleProps = ComponentProps<typeof Heading>;

/** The dialog title, rendered as a heading with content-size cascade. */
const DialogTitle: Component<DialogTitleProps> = (props) => {
  const context = useDialogContentContext();
  const rest = omit(props, "size", "class");
  const size = () =>
    props.size ?? (context ? DIALOG_TITLE_SIZE_MAP[context.size] : undefined);
  return (
    <DialogTitlePrimitive asChild>
      <Heading
        size={size()}
        trim="start"
        class={cx("fui-DialogTitle", props.class)}
        {...rest}
      />
    </DialogTitlePrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DialogDescription
 * -----------------------------------------------------------------------------------------------*/

/** Maps content size to the text size used by the description. */
const DIALOG_DESCRIPTION_SIZE_MAP = { "1": "1", "2": "2", "3": "2", "4": "3" } as const;

/** Props accepted by the `Description` component. An explicit `size` wins over the cascade. */
type DialogDescriptionProps = ComponentProps<typeof Text>;

/** The dialog description, rendered as text with content-size cascade. */
const DialogDescription: Component<DialogDescriptionProps> = (props) => {
  const context = useDialogContentContext();
  const rest = omit(props, "size", "class");
  const size = () =>
    props.size ?? (context ? DIALOG_DESCRIPTION_SIZE_MAP[context.size] : undefined);
  return (
    <DialogDescriptionPrimitive asChild>
      <Text
        render={<p />}
        size={size()}
        class={cx("fui-DialogDescription", props.class)}
        {...rest}
      />
    </DialogDescriptionPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DialogClose
 * -----------------------------------------------------------------------------------------------*/

/** Props accepted by the `Close` component. `children` is the single slotted element. */
interface DialogCloseProps extends Omit<DialogClosePrimitiveProps, "asChild"> {
  /** The single element that receives the close behavior. */
  children: JSX.Element;
}

/** A button that closes the dialog, slotted onto its single child element. */
const DialogClose: Component<DialogCloseProps> = (props) => {
  const rest = omit(props, "children");
  return (
    <DialogClosePrimitive asChild {...rest}>
      {props.children}
    </DialogClosePrimitive>
  );
};

/* -----------------------------------------------------------------------------------------------*/

/**
 * Namespaced `Dialog` export grouping every dialog part
 * (`Root`, `Trigger`, `Content`, `Title`, `Description`, `Close`).
 */
const Dialog = {
  Close: DialogClose,
  Content: DialogContent,
  Description: DialogDescription,
  Root: DialogRoot,
  Title: DialogTitle,
  Trigger: DialogTrigger,
};

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  useDialogContentContext,
};
export type {
  DialogCloseProps,
  DialogContentContextValue,
  DialogContentProps,
  DialogDescriptionProps,
  DialogRootProps,
  DialogTitleProps,
  DialogTriggerProps,
};
