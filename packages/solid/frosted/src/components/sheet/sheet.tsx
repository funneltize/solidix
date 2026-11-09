// Solidix-native bottom sheet, built on @solidix/dialog. A sheet is a
// modal dialog anchored to the bottom edge with a drag handle: drag it
// down past the dismiss threshold (or use the dialog's own Escape and
// overlay behavior) to close. Snap points are heights the sheet rests
// at; dragging between them settles on release.

import { createContext, createSignal, omit, useContext, type Component } from "solid-js";
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
  type DialogProps as DialogPrimitiveProps,
  type DialogTitleProps as DialogTitlePrimitiveProps,
  type DialogTriggerProps as DialogTriggerPrimitiveProps,
} from "@solidix/dialog";
import { useControllableState } from "@solidix/use-controllable-state";
import { cx } from "../../helpers/cx";
import { Theme } from "../../theme";

interface SheetContextValue {
  requestClose: () => void;
}

const SheetContext = createContext<SheetContextValue>({ requestClose: () => {} });

/** Props for the sheet root. */
export interface SheetProps extends DialogPrimitiveProps {}

/**
 * Root of a bottom sheet. Owns open state (controlled or not) and gives
 * `SheetContent` a way to request close after a dismiss drag.
 */
export const Sheet: Component<SheetProps> = (props) => {
  const [open, setOpen] = useControllableState({
    prop: () => props.open,
    onChange: (next: boolean | undefined) => props.onOpenChange?.(next ?? false),
    defaultProp: props.defaultOpen ?? false,
    caller: "Sheet",
  });
  const rest = omit(props, "open", "defaultOpen", "onOpenChange", "modal");
  return (
    <SheetContext value={{ requestClose: () => setOpen(false) }}>
      <DialogPrimitive modal open={open()} onOpenChange={setOpen} {...rest} />
    </SheetContext>
  );
};

/** Props for the sheet trigger. */
export type SheetTriggerProps = Omit<DialogTriggerPrimitiveProps, "asChild"> & {
  /** The single element that receives the trigger behavior. */
  children: JSX.Element;
};

/** The button that opens the sheet, slotted onto its single child. */
export const SheetTrigger: Component<SheetTriggerProps> = (props) => {
  const rest = omit(props, "children");
  return (
    <DialogTriggerPrimitive asChild {...rest}>
      {props.children}
    </DialogTriggerPrimitive>
  );
};

/** Props for the sheet title. */
export type SheetTitleProps = DialogTitlePrimitiveProps;

/** The sheet's accessible title. */
export const SheetTitle: Component<SheetTitleProps> = (props) => {
  const rest = omit(props, "class");
  return <DialogTitlePrimitive {...rest} class={cx("fui-SheetTitle", props.class)} />;
};

/** Props for the sheet close button. */
export type SheetCloseProps = Omit<DialogClosePrimitiveProps, "asChild"> & {
  /** The single element that receives the close behavior. */
  children: JSX.Element;
};

/** A button that closes the sheet, slotted onto its single child. */
export const SheetClose: Component<SheetCloseProps> = (props) => {
  const rest = omit(props, "children");
  return (
    <DialogClosePrimitive asChild {...rest}>
      {props.children}
    </DialogClosePrimitive>
  );
};

/** Props for the sheet content panel. */
export interface SheetContentProps extends Omit<DialogContentPrimitiveProps, "asChild"> {
  /** Fraction of the panel height a downward drag must pass to dismiss. Defaults to 0.35. */
  dismissThreshold?: number | undefined;
  /**
   * Resting heights as fractions of the panel height, ascending, e.g.
   * [0.5, 1] for half and full. Dragging settles at the nearest detent;
   * dragging past the smallest dismisses. Defaults to [1] (full).
   */
  detents?: number[] | undefined;
}

/**
 * The sheet panel: portalled with a dimmed overlay, anchored to the
 * bottom edge, with a grab handle. Dragging the handle (or the panel)
 * down translates the panel; releasing past `dismissThreshold` closes,
 * otherwise it springs back. Escape and overlay press close through
 * the dialog primitive.
 */
export const SheetContent: Component<SheetContentProps> = (props) => {
  const sheet = useContext(SheetContext);
  const [dragOffset, setDragOffset] = createSignal(0);
  const detents = () => {
    const list = [...(props.detents ?? [1])].sort((a, b) => a - b);
    return list.length ? list : [1];
  };
  const [detentIndex, setDetentIndex] = createSignal(detents().length - 1);
  const restingOffset = () => {
    const height = panel?.offsetHeight ?? 0;
    return (1 - detents()[detentIndex()]!) * height;
  };
  const rest = omit(props, "class", "children", "dismissThreshold", "detents");
  let panel: HTMLElement | undefined;

  const startDrag = (event: PointerEvent) => {
    const startY = event.clientY;
    const startOffset = dragOffset();
    const move = (moveEvent: PointerEvent) => {
      setDragOffset(Math.max(0, startOffset + (moveEvent.clientY - startY)));
    };
    const up = (upEvent: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      const height = panel?.offsetHeight ?? 0;
      const traveled = Math.max(0, upEvent.clientY - startY);
      if (height > 0 && detents().length > 1) {
        // Settle at the detent nearest the release point, or dismiss
        // when dragged well below the smallest detent.
        const released = 1 - (restingOffset() + traveled) / height;
        if (released < detents()[0]! - (props.dismissThreshold ?? 0.35) * detents()[0]!) {
          sheet.requestClose();
        } else {
          let nearest = 0;
          detents().forEach((detent, index) => {
            if (Math.abs(detent - released) < Math.abs(detents()[nearest]! - released)) {
              nearest = index;
            }
          });
          setDetentIndex(nearest);
        }
      } else if (height > 0 && traveled / height > (props.dismissThreshold ?? 0.35)) {
        sheet.requestClose();
      }
      setDragOffset(0);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <DialogPortalPrimitive>
      <Theme>
        <DialogOverlayPrimitive class="fui-SheetOverlay" />
        <DialogContentPrimitive
          {...rest}
          ref={(node: HTMLElement | null) => {
            panel = node ?? undefined;
            if (typeof props.ref === "function") props.ref(node as never);
          }}
          class={cx("fui-SheetContent", props.class)}
          style={{
            transform: `translateY(${restingOffset() + dragOffset()}px)`,
          }}
        >
          <div class="fui-SheetHandle" role="presentation" onPointerDown={startDrag}>
            <span class="fui-SheetHandleBar" />
          </div>
          {props.children}
        </DialogContentPrimitive>
      </Theme>
    </DialogPortalPrimitive>
  );
};
