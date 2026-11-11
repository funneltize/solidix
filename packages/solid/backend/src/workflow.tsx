import { Show, createEffect, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { cx } from "@solidix/primitive";
import { useControllableState } from "@solidix/use-controllable-state";
import {
  AlertDialog,
  Button,
  CommandMenu as FrostedCommandMenu,
  EmptyState as FrostedEmptyState,
  type CommandMenuGroup,
  type CommandMenuItem,
} from "@solidix/frosted";

export type { CommandMenuGroup, CommandMenuItem };

/** Props for backend `CommandMenu`. Mirrors Frosted with a Cmd+K shortcut. */
export type CommandMenuProps = {
  /** Controlled open state. */
  open?: boolean | undefined;
  /** Initial open state for uncontrolled use. */
  defaultOpen?: boolean | undefined;
  /** Called when the palette asks to open or close. */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Input placeholder. */
  placeholder?: string | undefined;
  /** Grouped rows; filtered by label and keywords. */
  groups: CommandMenuGroup[];
  /** Called with the chosen item value; the palette closes. */
  onSelect?: ((value: string) => void) | undefined;
  /** Shown when no row matches. */
  emptyText?: string | undefined;
  /** Accessible label for the dialog. */
  label?: string | undefined;
  /** Enables the global Cmd+K / Ctrl+K shortcut. Defaults to true. */
  shortcut?: boolean | undefined;
};

/**
 * Command palette wired to Cmd+K (Ctrl+K on Windows). Behavior and
 * keyboard model come from Frosted `CommandMenu`; this wrapper only
 * adds the global shortcut and the backend part marker.
 */
export const CommandMenu: Component<CommandMenuProps> = (props) => {
  const [open, setOpen] = useControllableState<boolean>({
    prop: () => props.open,
    defaultProp: props.defaultOpen ?? false,
    onChange: props.onOpenChange as ((value: boolean) => void) | undefined,
    caller: "CommandMenu",
  });
  createEffect(
    () => props.shortcut !== false,
    (enabled) => {
      if (!enabled) return;
      const onKeyDown = (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
          event.preventDefault();
          setOpen(!open());
        }
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    },
  );
  return (
    <div data-backend-part="command-menu">
      <FrostedCommandMenu
        open={open()}
        onOpenChange={setOpen}
        groups={props.groups}
        onSelect={props.onSelect}
        placeholder={props.placeholder}
        emptyText={props.emptyText}
        label={props.label}
      />
    </div>
  );
};

/** Props for backend `EmptyState`, the data-surface empty pattern. */
export type EmptyStateProps = Omit<JSX.IntrinsicElements["div"], "ref" | "children"> & {
  /** Empty-state title, for example `No customers yet`. */
  title: string;
  /** Supporting description under the title. */
  description?: string | undefined;
  /** Optional leading icon or glyph. */
  icon?: JSX.Element | undefined;
  /** Primary action slot, usually one Frosted `Button`. */
  action?: JSX.Element | undefined;
  /** Rendered via ref callback or element ref from Solid. */
  ref?: ((el: HTMLDivElement | null) => void) | HTMLDivElement | undefined;
};

/** Centered empty pattern for data surfaces, composed from Frosted parts. */
export const EmptyState: Component<EmptyStateProps> = (props) => {
  const rest = omit(props, "class", "title", "description", "icon", "action");
  return (
    <div data-backend-part="empty-state" class={cx("sbx-empty", props.class)} {...rest}>
      <FrostedEmptyState.Root>
        <FrostedEmptyState.Header>
          {props.icon ? <FrostedEmptyState.Media>{props.icon}</FrostedEmptyState.Media> : null}
          <FrostedEmptyState.Title>{props.title}</FrostedEmptyState.Title>
          {props.description ? (
            <FrostedEmptyState.Description>{props.description}</FrostedEmptyState.Description>
          ) : null}
        </FrostedEmptyState.Header>
        {props.action ? (
          <FrostedEmptyState.Actions>{props.action}</FrostedEmptyState.Actions>
        ) : null}
      </FrostedEmptyState.Root>
    </div>
  );
};

/** One metric rendered by `Stat`. */
export type StatProps = Omit<JSX.IntrinsicElements["div"], "ref" | "children"> & {
  /** Metric label, for example `Monthly revenue`. */
  label: string;
  /** Metric value, already formatted by the app. */
  value: string;
  /** Optional change text, for example `+12% vs last month`. */
  delta?: string | undefined;
  /** Delta direction, for assistive text and tone. */
  deltaDirection?: "up" | "down" | "flat" | undefined;
  /** Rendered via ref callback or element ref from Solid. */
  ref?: ((el: HTMLDivElement | null) => void) | HTMLDivElement | undefined;
};

/** Single dashboard metric with label, tabular value, and delta. */
export const Stat: Component<StatProps> = (props) => {
  const rest = omit(props, "class", "label", "value", "delta", "deltaDirection");
  return (
    <div data-backend-part="stat" class={cx("sbx-stat", props.class)} {...rest}>
      <span class="sbx-stat-label">{props.label}</span>
      <span class="sbx-stat-value">{props.value}</span>
      {props.delta ? (
        <span class="sbx-stat-delta" data-direction={props.deltaDirection ?? "flat"}>
          {props.delta}
        </span>
      ) : null}
    </div>
  );
};

/** Props for `StatGrid`, a responsive grid of `Stat` widgets. */
export type StatGridProps = Omit<JSX.IntrinsicElements["div"], "ref"> & {
  /** Rendered via ref callback or element ref from Solid. */
  ref?: ((el: HTMLDivElement | null) => void) | HTMLDivElement | undefined;
};

/** Widget grid for dashboard metrics. Cards are widgets here, by design. */
export const StatGrid: Component<StatGridProps> = (props) => {
  const rest = omit(props, "class", "children");
  return (
    <div data-backend-part="stat-grid" class={cx("sbx-stat-grid", props.class)} {...rest}>
      {props.children}
    </div>
  );
};

/** Props for `Confirm`, the destructive-action confirmation pattern. */
export type ConfirmProps = {
  /** Whether the dialog is open (controlled). */
  open?: boolean | undefined;
  /** Called when the dialog asks to open or close. */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Dialog title naming the object, for example `Delete workspace?`. */
  title: string;
  /** Description naming what will be destroyed and that it is permanent. */
  description: string;
  /** Confirm button label naming the action, for example `Delete workspace`. */
  confirmLabel: string;
  /** Cancel button label. Defaults to `Cancel`. */
  cancelLabel?: string | undefined;
  /** Called after the user confirms. The dialog closes first. */
  onConfirm: () => void;
  /** Trigger element that opens the dialog. */
  children?: JSX.Element | undefined;
};

/**
 * Destructive confirmation built on Frosted `AlertDialog`. The title
 * and confirm label must name the object being destroyed.
 */
export const Confirm: Component<ConfirmProps> = (props) => {
  return (
    <div data-backend-part="confirm">
      <AlertDialog.Root open={props.open} onOpenChange={props.onOpenChange}>
        {props.children ? <AlertDialog.Trigger>{props.children}</AlertDialog.Trigger> : null}
        <AlertDialog.Content>
          <AlertDialog.Title>{props.title}</AlertDialog.Title>
          <AlertDialog.Description>{props.description}</AlertDialog.Description>
          <AlertDialog.Cancel>
            <Button type="button">{props.cancelLabel ?? "Cancel"}</Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button
              type="button"
              onClick={() => {
                props.onOpenChange?.(false);
                props.onConfirm();
              }}
            >
              {props.confirmLabel}
            </Button>
          </AlertDialog.Action>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  );
};

/** Props for `SaveBar`, the dirty-state bar for editors and settings. */
export type SaveBarProps = Omit<JSX.IntrinsicElements["div"], "ref"> & {
  /** Shows the bar. Render it only while the form is dirty. */
  visible: boolean;
  /** Status text, for example `Unsaved changes`. */
  message?: string | undefined;
  /** Called when the user saves. */
  onSave: () => void;
  /** Called when the user discards changes. Optional. */
  onDiscard?: (() => void) | undefined;
  /** Save button label. Defaults to `Save changes`. */
  saveLabel?: string | undefined;
  /** Rendered via ref callback or element ref from Solid. */
  ref?: ((el: HTMLDivElement | null) => void) | HTMLDivElement | undefined;
};

/** Sticky dirty-state bar with save and optional discard actions. */
export const SaveBar: Component<SaveBarProps> = (props) => {
  const rest = omit(
    props,
    "class",
    "children",
    "visible",
    "message",
    "onSave",
    "onDiscard",
    "saveLabel",
  );
  return (
    <Show when={props.visible}>
      <div
        data-backend-part="save-bar"
        class={cx("sbx-save-bar", props.class)}
        role="status"
        {...rest}
      >
        <span class="sbx-save-message">{props.message ?? "Unsaved changes"}</span>
        <div class="sbx-save-actions">
          {props.children}
          {props.onDiscard ? (
            <button type="button" class="sbx-save-discard" onClick={() => props.onDiscard?.()}>
              Discard
            </button>
          ) : null}
          <button type="button" class="sbx-save-submit" onClick={() => props.onSave()}>
            {props.saveLabel ?? "Save changes"}
          </button>
        </div>
      </div>
    </Show>
  );
};
