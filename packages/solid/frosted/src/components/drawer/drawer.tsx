// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/drawer/drawer.drawer.tsx
// Upstream builds the drawer on Base UI Dialog parts (Root, Trigger, Portal, Backdrop,
// Viewport, Popup, Title, Close), which map onto @solidix/dialog (Dialog, Trigger, Portal,
// Overlay, Content, Title, Close). Upstream Backdrop + Viewport are sibling overlays; the
// viewport (`fui-DrawerOverlay`) is an empty positioning shell (the popup is fixed-positioned)
// and the backdrop carries both `fui-DialogBackdrop` and `fui-DrawerBackdrop` so the dialog
// blur/dim transitions apply. Divergence from upstream: the drawer popup renders as a
// sibling after the viewport instead of nested inside it, matching the frosted dialog port
// (the base overlay is a plain styled layer without the Base UI backdrop/viewport split).
// Dropped with no base equivalent: `handle`/`payload`/`createHandle` dialog-handle plumbing,
// and the unused local/content refs in `Body`.

import { omit, type Component, type ComponentProps } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  Dialog as DialogPrimitive,
  DialogClose as DialogClosePrimitive,
  DialogContent as DialogContentPrimitive,
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

/* -------------------------------------------------------------------------------------------------
 * DrawerRoot
 * -----------------------------------------------------------------------------------------------*/

/** Props accepted by the `Root` component. Modal is always on, matching upstream. */
interface DrawerRootProps extends Omit<DialogPrimitiveProps, "modal"> {}

/** The root container that manages the drawer open state. Always modal. */
const DrawerRoot: Component<DrawerRootProps> = (props) => (
  // Upstream forces `modal` on the Base UI root; there is no frosted `modal` prop.
  <DialogPrimitive modal {...props} />
);

/* -------------------------------------------------------------------------------------------------
 * DrawerTrigger
 * -----------------------------------------------------------------------------------------------*/

/** Props accepted by the `Trigger` component. `children` is the single slotted element. */
interface DrawerTriggerProps extends Omit<DialogTriggerPrimitiveProps, "asChild"> {
  /** The single element that receives the trigger behavior. */
  children: JSX.Element;
}

/** The button that opens the drawer, slotted onto its single child element. */
const DrawerTrigger: Component<DrawerTriggerProps> = (props) => {
  const rest = omit(props, "children");
  return (
    <DialogTriggerPrimitive asChild {...rest}>
      {props.children}
    </DialogTriggerPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DrawerContent
 * -----------------------------------------------------------------------------------------------*/

/** Props accepted by the `Content` component. */
interface DrawerContentProps extends Omit<DialogContentPrimitiveProps, "asChild"> {
  /** Container element to portal the content into. Passed to the portal. */
  container?: DialogPortalPrimitiveProps["container"] | undefined;
  /** Keeps the portal mounted when closed. Passed to the portal as `forceMount`. */
  keepMounted?: boolean | undefined;
}

/** The drawer panel, portalled with backdrop, viewport shell, and theme. */
const DrawerContent: Component<DrawerContentProps> = (props) => {
  const rest = omit(props, "class", "style", "children", "container", "keepMounted", "forceMount");
  return (
    <DialogPortalPrimitive
      container={props.container}
      forceMount={props.keepMounted ? true : undefined}
    >
      <DialogOverlayPrimitive
        class="fui-DialogBackdrop fui-DrawerBackdrop"
        forceMount={props.forceMount}
      />
      <DialogOverlayPrimitive
        class="fui-DrawerOverlay"
        forceMount={props.forceMount}
        onKeyDown={(event) => event.stopPropagation()}
      />
      <Theme>
        <DialogContentPrimitive
          class={cx("fui-DrawerContent", props.class)}
          style={props.style}
          forceMount={props.forceMount}
          {...rest}
        >
          {props.children}
        </DialogContentPrimitive>
      </Theme>
    </DialogPortalPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DrawerTitle
 * -----------------------------------------------------------------------------------------------*/

/** Props accepted by the `Title` component. */
type DrawerTitleProps = ComponentProps<typeof Heading>;

/** The drawer title, rendered as a size-4 semibold heading. */
const DrawerTitle: Component<DrawerTitleProps> = (props) => (
  <DialogTitlePrimitive asChild>
    {/* Later props win, so consumers can override the default size/weight. */}
    <Heading size="4" weight="semi-bold" {...props} />
  </DialogTitlePrimitive>
);

/* -------------------------------------------------------------------------------------------------
 * DrawerClose
 * -----------------------------------------------------------------------------------------------*/

/** Props accepted by the `Close` component. `children` is the single slotted element. */
interface DrawerCloseProps extends Omit<DialogClosePrimitiveProps, "asChild"> {
  /** The single element that receives the close behavior. */
  children: JSX.Element;
}

/** A button that closes the drawer, slotted onto its single child element. */
const DrawerClose: Component<DrawerCloseProps> = (props) => {
  const rest = omit(props, "children");
  return (
    <DialogClosePrimitive asChild {...rest}>
      {props.children}
    </DialogClosePrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DrawerHeader / DrawerBody / DrawerStickyFooter
 * -----------------------------------------------------------------------------------------------*/

/** Props accepted by the `Header` layout part. */
interface DrawerHeaderProps extends JSX.HTMLAttributes<HTMLDivElement> {}

/** Pinned header row at the top of the drawer content. */
const DrawerHeader: Component<DrawerHeaderProps> = (props) => {
  const rest = omit(props, "class");
  return <div class={cx("fui-DrawerHeader", props.class)} {...rest} />;
};

/** Props accepted by the `Body` layout part. */
interface DrawerBodyProps extends JSX.HTMLAttributes<HTMLDivElement> {}

/**
 * Scrollable body region. Extra props land on the outer scroll container,
 * matching upstream.
 */
const DrawerBody: Component<DrawerBodyProps> = (props) => {
  const rest = omit(props, "class", "children");
  return (
    <div class="fui-BodyScrollArea" {...rest}>
      <div class={cx("fui-DrawerBody", props.class)}>{props.children}</div>
    </div>
  );
};

/** Props accepted by the `StickyFooter` layout part. */
interface DrawerStickyFooterProps extends JSX.HTMLAttributes<HTMLDivElement> {}

/** Pinned footer row at the bottom of the drawer content. */
const DrawerStickyFooter: Component<DrawerStickyFooterProps> = (props) => {
  const rest = omit(props, "class");
  return <div class={cx("fui-DrawerStickyFooter", props.class)} {...rest} />;
};

/* -----------------------------------------------------------------------------------------------*/

/**
 * Namespaced `Drawer` export grouping every drawer part
 * (`Root`, `Trigger`, `Content`, `Title`, `Close`, `Header`, `Body`, `StickyFooter`).
 */
const Drawer = {
  Body: DrawerBody,
  Close: DrawerClose,
  Content: DrawerContent,
  Header: DrawerHeader,
  Root: DrawerRoot,
  StickyFooter: DrawerStickyFooter,
  Title: DrawerTitle,
  Trigger: DrawerTrigger,
};

export {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerStickyFooter,
  DrawerTitle,
  DrawerTrigger,
};
export type {
  DrawerBodyProps,
  DrawerCloseProps,
  DrawerContentProps,
  DrawerHeaderProps,
  DrawerRootProps,
  DrawerStickyFooterProps,
  DrawerTitleProps,
  DrawerTriggerProps,
};
