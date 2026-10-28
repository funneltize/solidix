// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/alert-dialog/alert-dialog.tsx
// Base UI AlertDialog parts (Root, Trigger, Portal, Backdrop, Viewport, Popup, Title,
// Description, Close) map onto @solidix/alert-dialog (AlertDialog, Trigger, Portal,
// Overlay, Content, Title, Description, Action, Cancel). Upstream Backdrop + Viewport
// are sibling overlays: the backdrop dims, the viewport centers the popup. Both map
// onto `AlertDialogOverlay` here (`fui-DialogBackdrop fui-AlertDialogBackdrop` and
// `fui-DialogOverlay fui-AlertDialogOverlay`), with the popup nested inside the
// viewport overlay. The `handle`/`payload`/`createHandle` machinery is dropped: the
// solidix root has no payload generics. `Close` maps onto the base `Action` part
// (plain close behavior); `Action` and `Cancel` map onto their same-named base
// parts, so `Cancel` keeps its initial-focus registration. Base UI alert dialogs
// block Escape dismissal (the user must choose an action); the @solidix base
// leaves Escape to the dismissable layer, so `Content` always prevents it here.

import {
  createContext,
  omit,
  useContext as useSolidContext,
  type Component,
  type ComponentProps,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  AlertDialog as AlertDialogPrimitive,
  AlertDialogAction as AlertDialogActionPrimitive,
  AlertDialogCancel as AlertDialogCancelPrimitive,
  AlertDialogContent as AlertDialogContentPrimitive,
  AlertDialogDescription as AlertDialogDescriptionPrimitive,
  AlertDialogOverlay as AlertDialogOverlayPrimitive,
  AlertDialogPortal as AlertDialogPortalPrimitive,
  AlertDialogTitle as AlertDialogTitlePrimitive,
  AlertDialogTrigger as AlertDialogTriggerPrimitive,
  type AlertDialogActionProps as AlertDialogActionPrimitiveProps,
  type AlertDialogCancelProps as AlertDialogCancelPrimitiveProps,
  type AlertDialogContentProps as AlertDialogContentPrimitiveProps,
  type AlertDialogPortalProps as AlertDialogPortalPrimitiveProps,
  type AlertDialogProps as AlertDialogPrimitiveProps,
  type AlertDialogTriggerProps as AlertDialogTriggerPrimitiveProps,
} from "@solidix/alert-dialog";
import { callEventHandler } from "@solidix/primitive";
import { cx } from "../../helpers/cx";
import { Theme } from "../../theme";
import { Heading } from "../heading/heading";
import { Text } from "../text/text";
import {
  alertDialogContentPropDefs,
  type AlertDialogContentOwnProps,
} from "./alert-dialog.props";

/* -------------------------------------------------------------------------------------------------
 * AlertDialogContentContext - resolves the content size for Title/Description cascades.
 * -----------------------------------------------------------------------------------------------*/

/** Value shared from `Content` to `Title` and `Description` for size cascades. */
interface AlertDialogContentContextValue {
  /** The resolved content size ('1' - '4'). */
  readonly size: NonNullable<AlertDialogContentOwnProps["size"]>;
}

const AlertDialogContentContext = createContext<AlertDialogContentContextValue>();

/**
 * Returns the nearest alert dialog content context, or `undefined` when the title or
 * description renders outside a frosted alert dialog content.
 */
function useAlertDialogContentContext(): AlertDialogContentContextValue | undefined {
  try {
    return useSolidContext(AlertDialogContentContext);
  } catch {
    return undefined;
  }
}

/* -------------------------------------------------------------------------------------------------
 * AlertDialogRoot
 * -----------------------------------------------------------------------------------------------*/

/** Props accepted by the `Root` component. Modal is always on, matching upstream. */
interface AlertDialogRootProps extends AlertDialogPrimitiveProps {}

/** The root container that manages the alert dialog open state. Always modal. */
const AlertDialogRoot: Component<AlertDialogRootProps> = (props) => (
  <AlertDialogPrimitive {...props} />
);

/* -------------------------------------------------------------------------------------------------
 * AlertDialogTrigger
 * -----------------------------------------------------------------------------------------------*/

/** Props accepted by the `Trigger` component. `children` is the single slotted element. */
interface AlertDialogTriggerProps extends Omit<
  AlertDialogTriggerPrimitiveProps,
  "asChild"
> {
  /** The single element that receives the trigger behavior. */
  children: JSX.Element;
}

/** The button that opens the alert dialog, slotted onto its single child element. */
const AlertDialogTrigger: Component<AlertDialogTriggerProps> = (props) => {
  const rest = omit(props, "children");
  return (
    <AlertDialogTriggerPrimitive asChild {...rest}>
      {props.children}
    </AlertDialogTriggerPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * AlertDialogContent
 * -----------------------------------------------------------------------------------------------*/

/** Props accepted by the `Content` component. */
interface AlertDialogContentProps
  extends AlertDialogContentOwnProps,
    Omit<AlertDialogContentPrimitiveProps, "asChild"> {
  /** Container element to portal the content into. Passed to the portal. */
  container?: AlertDialogPortalPrimitiveProps["container"] | undefined;
  /** Keeps the portal mounted when closed. Passed to the portal as `forceMount`. */
  keepMounted?: boolean | undefined;
}

/** The alert dialog panel, portalled with backdrop, viewport centering, and theme. */
const AlertDialogContent: Component<AlertDialogContentProps> = (props) => {
  const rest = omit(
    props,
    "size",
    "class",
    "style",
    "children",
    "container",
    "keepMounted",
    "forceMount",
    "onEscapeKeyDown",
  );
  const size = () => props.size ?? alertDialogContentPropDefs.size.default;
  return (
    <AlertDialogPortalPrimitive
      container={props.container}
      forceMount={props.keepMounted ? true : undefined}
    >
      <AlertDialogOverlayPrimitive
        class="fui-DialogBackdrop fui-AlertDialogBackdrop"
        forceMount={props.forceMount}
      />
      <AlertDialogOverlayPrimitive
        class="fui-DialogOverlay fui-AlertDialogOverlay"
        forceMount={props.forceMount}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <Theme>
          <AlertDialogContentPrimitive
            class={cx(
              "fui-DialogContent",
              "fui-AlertDialogContent",
              `fui-r-size-${size()}`,
              props.class,
            )}
            style={props.style}
            forceMount={props.forceMount}
            onEscapeKeyDown={(event) => {
              callEventHandler(props.onEscapeKeyDown, event);
              // Base UI parity: the alert dialog never dismisses on Escape.
              event.preventDefault();
            }}
            {...rest}
          >
            <AlertDialogContentContext
              value={{
                get size() {
                  return size();
                },
              }}
            >
              {props.children}
            </AlertDialogContentContext>
          </AlertDialogContentPrimitive>
        </Theme>
      </AlertDialogOverlayPrimitive>
    </AlertDialogPortalPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * AlertDialogTitle
 * -----------------------------------------------------------------------------------------------*/

/** Maps content size to the heading size used by the title. */
const ALERT_DIALOG_TITLE_SIZE_MAP = { "1": "3", "2": "5", "3": "5", "4": "6" } as const;

/** Props accepted by the `Title` component. An explicit `size` wins over the cascade. */
type AlertDialogTitleProps = ComponentProps<typeof Heading>;

/** The alert dialog title, rendered as a heading with content-size cascade. */
const AlertDialogTitle: Component<AlertDialogTitleProps> = (props) => {
  const context = useAlertDialogContentContext();
  const rest = omit(props, "size", "class");
  const size = () =>
    props.size ?? (context ? ALERT_DIALOG_TITLE_SIZE_MAP[context.size] : undefined);
  return (
    <AlertDialogTitlePrimitive asChild>
      <Heading
        size={size()}
        trim="start"
        class={cx("fui-DialogTitle", props.class)}
        {...rest}
      />
    </AlertDialogTitlePrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * AlertDialogDescription
 * -----------------------------------------------------------------------------------------------*/

/** Maps content size to the text size used by the description. */
const ALERT_DIALOG_DESCRIPTION_SIZE_MAP = {
  "1": "1",
  "2": "2",
  "3": "2",
  "4": "3",
} as const;

/** Props accepted by the `Description` component. An explicit `size` wins over the cascade. */
type AlertDialogDescriptionProps = ComponentProps<typeof Text>;

/** The alert dialog description, rendered as text with content-size cascade. */
const AlertDialogDescription: Component<AlertDialogDescriptionProps> = (props) => {
  const context = useAlertDialogContentContext();
  const rest = omit(props, "size", "class");
  const size = () =>
    props.size ??
    (context ? ALERT_DIALOG_DESCRIPTION_SIZE_MAP[context.size] : undefined);
  return (
    <AlertDialogDescriptionPrimitive asChild>
      <Text
        render={<p />}
        size={size()}
        class={cx("fui-DialogDescription", props.class)}
        {...rest}
      />
    </AlertDialogDescriptionPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * AlertDialogClose / AlertDialogAction / AlertDialogCancel
 * -----------------------------------------------------------------------------------------------*/

/** Props accepted by the `Close` component. `children` is the single slotted element. */
interface AlertDialogCloseProps extends Omit<
  AlertDialogActionPrimitiveProps,
  "asChild"
> {
  /** The single element that receives the close behavior. */
  children: JSX.Element;
}

/**
 * A button that closes the alert dialog, slotted onto its single child element.
 * Maps onto the base `Action` part, matching upstream plain close behavior.
 */
const AlertDialogClose: Component<AlertDialogCloseProps> = (props) => {
  const rest = omit(props, "children");
  return (
    <AlertDialogActionPrimitive asChild {...rest}>
      {props.children}
    </AlertDialogActionPrimitive>
  );
};

/** Props accepted by the `Action` component. `children` is the single slotted element. */
interface AlertDialogActionProps extends Omit<
  AlertDialogActionPrimitiveProps,
  "asChild"
> {
  /** The single element that receives the confirm behavior. */
  children: JSX.Element;
}

/** The confirm button, slotted onto its single child element. */
const AlertDialogAction: Component<AlertDialogActionProps> = (props) => {
  const rest = omit(props, "children");
  return (
    <AlertDialogActionPrimitive asChild {...rest}>
      {props.children}
    </AlertDialogActionPrimitive>
  );
};

/** Props accepted by the `Cancel` component. `children` is the single slotted element. */
interface AlertDialogCancelProps extends Omit<
  AlertDialogCancelPrimitiveProps,
  "asChild"
> {
  /** The single element that receives the cancel behavior. */
  children: JSX.Element;
}

/** The cancel button, slotted onto its single child element. Receives initial focus. */
const AlertDialogCancel: Component<AlertDialogCancelProps> = (props) => {
  const rest = omit(props, "children");
  return (
    <AlertDialogCancelPrimitive asChild {...rest}>
      {props.children}
    </AlertDialogCancelPrimitive>
  );
};

/* -----------------------------------------------------------------------------------------------*/

/**
 * Namespaced `AlertDialog` export grouping every alert dialog part
 * (`Root`, `Trigger`, `Content`, `Title`, `Description`, `Close`, `Action`, `Cancel`).
 */
const AlertDialog = {
  Action: AlertDialogAction,
  Cancel: AlertDialogCancel,
  Close: AlertDialogClose,
  Content: AlertDialogContent,
  Description: AlertDialogDescription,
  Root: AlertDialogRoot,
  Title: AlertDialogTitle,
  Trigger: AlertDialogTrigger,
};

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
  useAlertDialogContentContext,
};
export type {
  AlertDialogActionProps,
  AlertDialogCancelProps,
  AlertDialogCloseProps,
  AlertDialogContentContextValue,
  AlertDialogContentProps,
  AlertDialogDescriptionProps,
  AlertDialogRootProps,
  AlertDialogTitleProps,
  AlertDialogTriggerProps,
};
