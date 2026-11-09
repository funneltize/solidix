// Solidix-native styled toast, built on the declarative @solidix/toast
// primitives. Upstream frosted-ui builds on an imperative toast manager;
// Solid does not need one: `Toaster` owns a small signal queue and renders
// each item through the headless Root, so announcements, swipe, and timers
// keep the primitive behavior while the queue stays ordinary app state.

import {
  For,
  createContext,
  createSignal,
  createUniqueId,
  omit,
  useContext,
  type Component,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  Toast as ToastPrimitive,
  ToastAction as ToastActionPrimitive,
  ToastClose as ToastClosePrimitive,
  ToastDescription as ToastDescriptionPrimitive,
  ToastProvider as ToastProviderPrimitive,
  ToastTitle as ToastTitlePrimitive,
  ToastViewport as ToastViewportPrimitive,
  type ToastActionProps as ToastActionPrimitiveProps,
  type ToastCloseProps as ToastClosePrimitiveProps,
  type ToastDescriptionProps as ToastDescriptionPrimitiveProps,
  type ToastProps as ToastPrimitiveProps,
  type ToastProviderProps as ToastProviderPrimitiveProps,
  type ToastTitleProps as ToastTitlePrimitiveProps,
  type ToastViewportProps as ToastViewportPrimitiveProps,
} from "@solidix/toast";
import { cx } from "../../helpers/cx";

/** Props for the styled `ToastProvider`, passed to the headless provider. */
export type ToastProviderProps = ToastProviderPrimitiveProps;
/** Props for the styled `ToastViewport`. */
export type ToastViewportProps = ToastViewportPrimitiveProps;
/** Props for the styled `Toast` root. */
export type ToastProps = ToastPrimitiveProps;
/** Props for the styled `ToastTitle`. */
export type ToastTitleProps = ToastTitlePrimitiveProps;
/** Props for the styled `ToastDescription`. */
export type ToastDescriptionProps = ToastDescriptionPrimitiveProps;
/** Props for the styled `ToastAction`. */
export type ToastActionProps = ToastActionPrimitiveProps;
/** Props for the styled `ToastClose`. */
export type ToastCloseProps = ToastClosePrimitiveProps;

/** Provides toast duration and swipe behavior to toasts and viewports. */
export const ToastProvider: Component<ToastProviderProps> = (props) => (
  <ToastProviderPrimitive {...props} />
);

/** The fixed region that collects toasts, styled as a vertical stack. */
export const ToastViewport: Component<ToastViewportProps> = (props) => {
  const rest = omit(props, "class");
  return <ToastViewportPrimitive {...rest} class={cx("fui-ToastViewport", props.class)} />;
};

/** A single styled toast surface. */
export const Toast: Component<ToastProps> = (props) => {
  const rest = omit(props, "class");
  return <ToastPrimitive {...rest} class={cx("fui-Toast", props.class)} />;
};

/** The toast's headline line. */
export const ToastTitle: Component<ToastTitleProps> = (props) => {
  const rest = omit(props, "class");
  return <ToastTitlePrimitive {...rest} class={cx("fui-ToastTitle", props.class)} />;
};

/** The toast's supporting line. */
export const ToastDescription: Component<ToastDescriptionProps> = (props) => {
  const rest = omit(props, "class");
  return <ToastDescriptionPrimitive {...rest} class={cx("fui-ToastDescription", props.class)} />;
};

/** An action button inside a toast; `altText` is required for announcements. */
export const ToastAction: Component<ToastActionProps> = (props) => {
  const rest = omit(props, "class");
  return <ToastActionPrimitive {...rest} class={cx("fui-ToastAction", props.class)} />;
};

/** The dismiss button inside a toast. */
export const ToastClose: Component<ToastCloseProps> = (props) => {
  const rest = omit(props, "class");
  return <ToastClosePrimitive {...rest} class={cx("fui-ToastClose", props.class)} />;
};

/** One item pushed into the `Toaster` queue. */
export interface ToastItem {
  /** Headline line. */
  title: string;
  /** Supporting line. */
  description?: string | undefined;
  /** Visible action label; requires `onAction`. Announced as the action. */
  actionLabel?: string | undefined;
  /** Runs when the action is pressed; the toast closes either way. */
  onAction?: (() => void) | undefined;
  /** Milliseconds visible; defaults to the provider duration (5000). */
  duration?: number | undefined;
  /** Semantic tone: colors the leading edge. Defaults to neutral. */
  variant?: "default" | "success" | "danger" | undefined;
}

/** The handle returned by `useToast`: call `notify` to show a toast. */
export interface ToastQueue {
  /** Pushes a toast onto the queue and returns its id. */
  notify: (item: ToastItem) => string;
  /** Removes a toast by id. */
  dismiss: (id: string) => void;
}

const ToastQueueContext = createContext<ToastQueue>();

/**
 * Returns the toast queue of the nearest `Toaster`. Throws when called
 * outside one, so a missing provider fails at setup, not silently.
 */
export function useToast(): ToastQueue {
  const queue = useContext(ToastQueueContext);
  if (!queue) throw new Error("useToast must be used inside <Toaster>.");
  return queue;
}

/** Props for the `Toaster` queue host. */
export interface ToasterProps {
  /** App content; call `useToast` anywhere inside it to push toasts. */
  children?: JSX.Element | undefined;
  /** Default milliseconds each toast stays visible. */
  duration?: number | undefined;
  /** Most toasts visible at once; older ones drop. Defaults to 4. */
  limit?: number | undefined;
  /** Screen-reader label prefix for each toast. */
  label?: string | undefined;
}

type QueuedToast = ToastItem & { id: string };

/**
 * Hosts the toast queue: renders its children plus a viewport, and shows
 * toasts pushed through `useToast().notify(...)`. Toasts stack, pause on
 * hover (primitive behavior), and remove themselves when closed.
 */
export const Toaster: Component<ToasterProps> = (props) => {
  const [items, setItems] = createSignal<QueuedToast[]>([]);
  const dismiss = (id: string) => setItems((current) => current.filter((item) => item.id !== id));
  const notify = (item: ToastItem) => {
    const id = createUniqueId();
    const limit = props.limit ?? 4;
    setItems((current) => [...current, { ...item, id }].slice(-limit));
    return id;
  };
  return (
    <ToastQueueContext value={{ notify, dismiss }}>
      {props.children}
      <ToastProviderPrimitive duration={props.duration} label={props.label}>
        <For each={items()}>
          {(item) => (
            <Toast
              data-variant={item.variant ?? "default"}
              duration={item.duration}
              onOpenChange={(open) => {
                if (!open) dismiss(item.id);
              }}
            >
              <div class="fui-ToastBody">
                <ToastTitle>{item.title}</ToastTitle>
                {item.description ? <ToastDescription>{item.description}</ToastDescription> : null}
              </div>
              {item.actionLabel ? (
                <ToastAction
                  altText={item.actionLabel}
                  onClick={() => {
                    item.onAction?.();
                    dismiss(item.id);
                  }}
                >
                  {item.actionLabel}
                </ToastAction>
              ) : null}
              <ToastClose aria-label="Close">×</ToastClose>
            </Toast>
          )}
        </For>
        <ToastViewport />
      </ToastProviderPrimitive>
    </ToastQueueContext>
  );
};
