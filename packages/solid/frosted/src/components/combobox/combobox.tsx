// Solidix-native styled combobox and command menu, built on
// @solidix/combobox. The consumer filters: render only matching options.

import { For, createSignal, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  Combobox as ComboboxPrimitive,
  ComboboxInput as ComboboxInputPrimitive,
  ComboboxListbox as ComboboxListboxPrimitive,
  ComboboxOption as ComboboxOptionPrimitive,
  type ComboboxInputProps as ComboboxInputPrimitiveProps,
  type ComboboxListboxProps as ComboboxListboxPrimitiveProps,
  type ComboboxOptionProps as ComboboxOptionPrimitiveProps,
  type ComboboxProps as ComboboxPrimitiveProps,
} from "@solidix/combobox";
import { cx } from "../../helpers/cx";
import { Dialog } from "../dialog/dialog";
import { VisuallyHidden } from "../visually-hidden/visually-hidden";

/** Props for the styled combobox root. */
export type ComboboxProps = ComboboxPrimitiveProps;
/** Props for the styled combobox input. */
export type ComboboxInputProps = ComboboxInputPrimitiveProps;
/** Props for the styled combobox listbox. */
export type ComboboxListboxProps = ComboboxListboxPrimitiveProps;
/** Props for one styled combobox option. */
export type ComboboxOptionProps = ComboboxOptionPrimitiveProps;

/** Root of a styled combobox: owns state, styled as a relative anchor. */
export const Combobox: Component<ComboboxProps & { class?: string | undefined }> = (props) => {
  const [placement, setPlacement] = createSignal<"bottom" | "top">("bottom");
  const updatePlacement = (event: Event) => {
    const root = event.currentTarget as HTMLElement;
    const rect = root.getBoundingClientRect();
    // Flip above when the space below cannot fit the list (20rem cap)
    // and the space above is larger.
    if (window.innerHeight - rect.bottom < 320 && rect.top > window.innerHeight - rect.bottom) {
      setPlacement("top");
    } else {
      setPlacement("bottom");
    }
  };
  return (
    <div
      class={cx("fui-Combobox", props.class)}
      data-combobox-root=""
      data-placement={placement()}
      onFocusIn={updatePlacement}
      onPointerDown={updatePlacement}
    >
      <ComboboxPrimitive
        value={props.value}
        defaultValue={props.defaultValue}
        onValueChange={props.onValueChange}
        inputValue={props.inputValue}
        defaultInputValue={props.defaultInputValue}
        onInputValueChange={props.onInputValueChange}
        disabled={props.disabled}
      >
        {props.children}
      </ComboboxPrimitive>
    </div>
  );
};

/** The styled combobox text input. */
export const ComboboxInput: Component<ComboboxInputProps> = (props) => {
  const rest = omit(props, "class");
  return <ComboboxInputPrimitive {...rest} class={cx("fui-ComboboxInput", props.class)} />;
};

/** The styled combobox popup list. */
export const ComboboxListbox: Component<ComboboxListboxProps> = (props) => {
  const rest = omit(props, "class");
  return <ComboboxListboxPrimitive {...rest} class={cx("fui-ComboboxListbox", props.class)} />;
};

/** One styled combobox option. */
export const ComboboxOption: Component<ComboboxOptionProps> = (props) => {
  const rest = omit(props, "class");
  return <ComboboxOptionPrimitive {...rest} class={cx("fui-ComboboxOption", props.class)} />;
};

/** One selectable row in a `CommandMenu`. */
export interface CommandMenuItem {
  /** Value reported to `onSelect`. */
  value: string;
  /** Visible label; matching runs against it and `keywords`. */
  label: string;
  /** Extra match text (aliases, descriptions). */
  keywords?: string | undefined;
  /** Small leading glyph, rendered as given. */
  icon?: JSX.Element | undefined;
}

/** One labeled group of rows in a `CommandMenu`. */
export interface CommandMenuGroup {
  /** Group heading. */
  label: string;
  /** Rows in this group. */
  items: CommandMenuItem[];
}

/** Props for the `CommandMenu` palette. */
export interface CommandMenuProps {
  /** Whether the palette is open (controlled). */
  open?: boolean | undefined;
  /** Fires when the palette asks to open or close. */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Input placeholder. */
  placeholder?: string | undefined;
  /** Grouped rows; filtered by the query against label and keywords. */
  groups: CommandMenuGroup[];
  /** Fires with the chosen item value; the palette closes. */
  onSelect?: ((value: string) => void) | undefined;
  /** Shown when no row matches. */
  emptyText?: string | undefined;
  /** Accessible label for the dialog. */
  label?: string | undefined;
}

/**
 * A command palette: a modal combobox with grouped, filterable rows.
 * Built from Dialog plus the combobox primitive, so keyboard behavior
 * (arrows, Enter, Escape) comes from the pattern, not this component.
 * Render inside a `Theme` like other frosted overlays.
 */
export const CommandMenu: Component<CommandMenuProps> = (props) => {
  const [query, setQuery] = createSignal("");
  const filtered = () => {
    const needle = query().trim().toLowerCase();
    if (!needle) return props.groups;
    return props.groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          `${item.label} ${item.keywords ?? ""}`.toLowerCase().includes(needle),
        ),
      }))
      .filter((group) => group.items.length > 0);
  };
  const isEmpty = () => filtered().every((group) => group.items.length === 0);
  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={(open) => {
        props.onOpenChange?.(open);
        if (!open) setQuery("");
      }}
    >
      <Dialog.Content class="fui-CommandMenu" aria-label={props.label ?? "Command menu"}>
        <VisuallyHidden>
          <Dialog.Title>{props.label ?? "Command menu"}</Dialog.Title>
        </VisuallyHidden>
        <Combobox
          inputValue={query()}
          onInputValueChange={setQuery}
          onValueChange={(value) => {
            props.onSelect?.(value);
            props.onOpenChange?.(false);
            setQuery("");
          }}
        >
          <ComboboxInput
            placeholder={props.placeholder ?? "Type a command or search"}
            aria-label={props.label ?? "Command menu"}
          />
          <ComboboxListbox class="fui-CommandMenuList" forceMount>
            <For each={filtered()}>
              {(group) => (
                <>
                  <li class="fui-CommandMenuGroupLabel" role="presentation">
                    {group.label}
                  </li>
                  <For each={group.items}>
                    {(item) => (
                      <ComboboxOption value={item.value} class="fui-CommandMenuItem">
                        {item.icon}
                        <span>{item.label}</span>
                      </ComboboxOption>
                    )}
                  </For>
                </>
              )}
            </For>
            {isEmpty() ? (
              <li class="fui-CommandMenuEmpty" role="presentation">
                {props.emptyText ?? "No results"}
              </li>
            ) : null}
          </ComboboxListbox>
        </Combobox>
      </Dialog.Content>
    </Dialog.Root>
  );
};
