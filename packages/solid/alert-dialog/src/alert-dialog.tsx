import { omit, type Component } from "solid-js";
import { useComposedRefs, type RefObject } from "@solidix/compose-refs";
import { createContextScope, type Scope } from "@solidix/context";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  createDialogScope,
  type DialogCloseProps,
  type DialogContentProps,
  type DialogDescriptionProps,
  type DialogOverlayProps,
  type DialogPortalProps,
  type DialogProps,
  type DialogTitleProps,
  type DialogTriggerProps,
} from "@solidix/dialog";
import { composeEventHandlers } from "@solidix/primitive";

/* -------------------------------------------------------------------------------------------------
 * AlertDialog
 * -----------------------------------------------------------------------------------------------*/

const ROOT_NAME = "AlertDialog";

type ScopedProps<P> = P & { __scopeAlertDialog?: Scope | undefined };
const [createAlertDialogContext, createAlertDialogScope] = createContextScope(ROOT_NAME, [
  createDialogScope,
]);
const useDialogScope = createDialogScope();

type AlertDialogProps = Omit<DialogProps, "modal">;

const AlertDialog: Component<ScopedProps<AlertDialogProps>> = (props) => {
  const dialogScope = useDialogScope(props.__scopeAlertDialog);
  return <Dialog {...dialogScope} {...omit(props, "__scopeAlertDialog")} modal />;
};

/* -------------------------------------------------------------------------------------------------
 * AlertDialogTrigger
 * -----------------------------------------------------------------------------------------------*/

type AlertDialogTriggerProps = DialogTriggerProps;

const AlertDialogTrigger: Component<ScopedProps<AlertDialogTriggerProps>> = (props) => {
  const rest = omit(props, "__scopeAlertDialog", "ref");
  const dialogScope = useDialogScope(props.__scopeAlertDialog);
  return <DialogTrigger {...dialogScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * AlertDialogPortal
 * -----------------------------------------------------------------------------------------------*/

type AlertDialogPortalProps = DialogPortalProps;

const AlertDialogPortal: Component<ScopedProps<AlertDialogPortalProps>> = (props) => {
  const dialogScope = useDialogScope(props.__scopeAlertDialog);
  return <DialogPortal {...dialogScope} {...omit(props, "__scopeAlertDialog")} />;
};

/* -------------------------------------------------------------------------------------------------
 * AlertDialogOverlay
 * -----------------------------------------------------------------------------------------------*/

type AlertDialogOverlayProps = DialogOverlayProps;

const AlertDialogOverlay: Component<ScopedProps<AlertDialogOverlayProps>> = (props) => {
  const rest = omit(props, "__scopeAlertDialog", "ref");
  const dialogScope = useDialogScope(props.__scopeAlertDialog);
  return <DialogOverlay {...dialogScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * AlertDialogContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "AlertDialogContent";

type AlertDialogContentContextValue = {
  cancelRef: RefObject<AlertDialogCancelElement | null>;
};

const [AlertDialogContentProvider, useAlertDialogContentContext] =
  createAlertDialogContext<AlertDialogContentContextValue>(CONTENT_NAME);

type AlertDialogContentElement = HTMLDivElement;
type AlertDialogContentProps = Omit<
  DialogContentProps,
  "onPointerDownOutside" | "onInteractOutside"
>;

const AlertDialogContent: Component<ScopedProps<AlertDialogContentProps>> = (props) => {
  // `children` must flow through unread: reading it here would instantiate the
  // subtree in this setup's owner scope, outside the content provider below.
  const rest = omit(props, "__scopeAlertDialog", "ref");
  const dialogScope = useDialogScope(props.__scopeAlertDialog);
  const contentRef: RefObject<AlertDialogContentElement | null> = { current: null };
  const composedRefs = useComposedRefs(props.ref, contentRef);
  const cancelRef: RefObject<AlertDialogCancelElement | null> = { current: null };

  return (
    <AlertDialogContentProvider scope={props.__scopeAlertDialog} cancelRef={cancelRef}>
      <DialogContent
        role="alertdialog"
        {...dialogScope}
        {...rest}
        ref={composedRefs}
        onOpenAutoFocus={composeEventHandlers(rest.onOpenAutoFocus, (event) => {
          event.preventDefault();
          cancelRef.current?.focus({ preventScroll: true });
        })}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      />
    </AlertDialogContentProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * AlertDialogTitle
 * -----------------------------------------------------------------------------------------------*/

type AlertDialogTitleProps = DialogTitleProps;

const AlertDialogTitle: Component<ScopedProps<AlertDialogTitleProps>> = (props) => {
  const rest = omit(props, "__scopeAlertDialog", "ref");
  const dialogScope = useDialogScope(props.__scopeAlertDialog);
  return <DialogTitle {...dialogScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * AlertDialogDescription
 * -----------------------------------------------------------------------------------------------*/

type AlertDialogDescriptionProps = DialogDescriptionProps;

const AlertDialogDescription: Component<ScopedProps<AlertDialogDescriptionProps>> = (props) => {
  const rest = omit(props, "__scopeAlertDialog", "ref");
  const dialogScope = useDialogScope(props.__scopeAlertDialog);
  return <DialogDescription {...dialogScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * AlertDialogAction
 * -----------------------------------------------------------------------------------------------*/

type AlertDialogActionProps = DialogCloseProps;

const AlertDialogAction: Component<ScopedProps<AlertDialogActionProps>> = (props) => {
  const rest = omit(props, "__scopeAlertDialog", "ref");
  const dialogScope = useDialogScope(props.__scopeAlertDialog);
  return <DialogClose {...dialogScope} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * AlertDialogCancel
 * -----------------------------------------------------------------------------------------------*/

const CANCEL_NAME = "AlertDialogCancel";

type AlertDialogCancelElement = HTMLButtonElement;
type AlertDialogCancelProps = DialogCloseProps;

const AlertDialogCancel: Component<ScopedProps<AlertDialogCancelProps>> = (props) => {
  const rest = omit(props, "__scopeAlertDialog", "ref");
  const { cancelRef } = useAlertDialogContentContext(CANCEL_NAME, props.__scopeAlertDialog);
  const dialogScope = useDialogScope(props.__scopeAlertDialog);
  const ref = useComposedRefs(props.ref, cancelRef);
  return <DialogClose {...dialogScope} {...rest} ref={ref} />;
};

/* ---------------------------------------------------------------------------------------------- */

export {
  createAlertDialogScope,
  //
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTitle,
  AlertDialogDescription,
  //
  AlertDialog as Root,
  AlertDialogTrigger as Trigger,
  AlertDialogPortal as Portal,
  AlertDialogOverlay as Overlay,
  AlertDialogContent as Content,
  AlertDialogAction as Action,
  AlertDialogCancel as Cancel,
  AlertDialogTitle as Title,
  AlertDialogDescription as Description,
};
export type {
  AlertDialogProps,
  AlertDialogTriggerProps,
  AlertDialogPortalProps,
  AlertDialogOverlayProps,
  AlertDialogContentProps,
  AlertDialogActionProps,
  AlertDialogCancelProps,
  AlertDialogTitleProps,
  AlertDialogDescriptionProps,
};
