// Solidix-native combobox. Radix has no combobox to port, so this follows
// the WAI-ARIA combobox pattern directly: an input with aria-expanded and
// aria-activedescendant, a listbox popup, and options the consumer filters.
// Filtering is the consumer's job (render only matching options); this
// package owns open state, highlight, selection, and keyboard behavior.

import {
  createContext,
  createSignal,
  createUniqueId,
  omit,
  onCleanup,
  useContext,
  type Component,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  Primitive,
  ariaBoolean,
  callEventHandler,
  type PrimitivePropsWithRef,
} from "@solidix/primitive";
import { useControllableState } from "@solidix/use-controllable-state";

interface ComboboxContextValue {
  open: () => boolean;
  setOpen: (open: boolean) => void;
  inputValue: () => string;
  setInputValue: (value: string) => void;
  value: () => string | undefined;
  select: (value: string, label: string) => void;
  highlightedId: () => string | undefined;
  setHighlightedId: (id: string | undefined) => void;
  registerOption: (id: string, element: HTMLElement) => () => void;
  options: () => { id: string; element: HTMLElement }[];
  listboxId: string;
  disabled: () => boolean;
}

const ComboboxContext = createContext<ComboboxContextValue>();

function useComboboxContext(part: string): ComboboxContextValue {
  const context = useContext(ComboboxContext);
  if (!context) throw new Error(`<${part}> must be used inside <Combobox>.`);
  return context;
}

/** Props for the combobox root. */
export interface ComboboxProps {
  /** Selected option value (controlled). */
  value?: string | undefined;
  /** Initially selected option value. */
  defaultValue?: string | undefined;
  /** Fires with the option value when a selection is made. */
  onValueChange?: ((value: string) => void) | undefined;
  /** Input text (controlled). */
  inputValue?: string | undefined;
  /** Initially shown input text. */
  defaultInputValue?: string | undefined;
  /** Fires when the input text changes. */
  onInputValueChange?: ((value: string) => void) | undefined;
  /** Disables the input and closes the popup. */
  disabled?: boolean | undefined;
  /** Root content: one `ComboboxInput` and one `ComboboxListbox`. */
  children?: JSX.Element | undefined;
}

/**
 * Root of a combobox: owns open, input, selection, and highlight state.
 * Render one `ComboboxInput` and one `ComboboxListbox` with
 * `ComboboxOption` children inside it.
 */
export const Combobox: Component<ComboboxProps> = (props) => {
  const [open, setOpenSignal] = createSignal(false);
  const [highlightedId, setHighlightedId] = createSignal<string | undefined>(undefined);
  const registry = new Map<string, HTMLElement>();
  const listboxId = createUniqueId();

  const [value, setValue] = useControllableState({
    prop: () => props.value,
    onChange: (next: string | undefined) => {
      if (next !== undefined) props.onValueChange?.(next);
    },
    defaultProp: props.defaultValue,
    caller: "Combobox",
  });
  const [inputValue, setInputValue] = useControllableState({
    prop: () => props.inputValue,
    onChange: (next: string | undefined) => props.onInputValueChange?.(next ?? ""),
    defaultProp: props.defaultInputValue ?? "",
    caller: "Combobox",
  });

  const setOpen = (next: boolean) => {
    if (props.disabled && next) return;
    setOpenSignal(next);
    if (!next) setHighlightedId(undefined);
  };
  const select = (nextValue: string, label: string) => {
    setValue(nextValue);
    setInputValue(label);
    setOpen(false);
  };
  const registerOption = (id: string, element: HTMLElement) => {
    registry.set(id, element);
    return () => {
      registry.delete(id);
      if (highlightedId() === id) setHighlightedId(undefined);
    };
  };
  const options = () =>
    [...registry.entries()]
      .map(([id, element]) => ({ id, element }))
      .sort((a, b) =>
        a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      );

  return (
    <ComboboxContext
      value={{
        open,
        setOpen,
        inputValue: () => inputValue() ?? "",
        setInputValue: (next) => setInputValue(next),
        value,
        select,
        highlightedId,
        setHighlightedId: (id: string | undefined) => {
          setHighlightedId(id);
        },
        registerOption,
        options,
        listboxId,
        disabled: () => props.disabled ?? false,
      }}
    >
      {props.children}
    </ComboboxContext>
  );
};

/** Props for the combobox input. */
export type ComboboxInputProps = Omit<
  PrimitivePropsWithRef<"input">,
  "value" | "defaultValue" | "role"
>;

/**
 * The text input: role combobox with aria-expanded, aria-controls, and
 * aria-activedescendant. Arrow keys move the highlight, Enter selects,
 * Escape closes, typing opens.
 */
export const ComboboxInput: Component<ComboboxInputProps> = (props) => {
  const context = useComboboxContext("ComboboxInput");
  const move = (delta: 1 | -1) => {
    const items = context.options();
    if (items.length === 0) return;
    const current = items.findIndex((entry) => entry.id === context.highlightedId());
    const next =
      current === -1
        ? delta === 1
          ? 0
          : items.length - 1
        : (current + delta + items.length) % items.length;
    const entry = items[next];
    context.setHighlightedId(entry?.id);
    entry?.element.scrollIntoView?.({ block: "nearest" });
  };
  return (
    <Primitive.input
      {...omit(props, "onInput", "onKeyDown", "onFocus", "onBlur")}
      type="text"
      role="combobox"
      aria-expanded={ariaBoolean(context.open())}
      aria-controls={context.listboxId}
      aria-activedescendant={context.open() ? context.highlightedId() : undefined}
      aria-autocomplete="list"
      autocomplete="off"
      disabled={context.disabled()}
      value={context.inputValue()}
      onInput={(event) => {
        context.setInputValue(event.currentTarget.value);
        context.setOpen(true);
        callEventHandler(props.onInput, event);
      }}
      onFocus={(event) => {
        context.setOpen(true);
        callEventHandler(props.onFocus, event);
      }}
      onBlur={(event) => {
        const root = event.currentTarget.closest("[data-combobox-root]");
        if (!root?.contains(event.relatedTarget as Node)) context.setOpen(false);
        callEventHandler(props.onBlur, event);
      }}
      onKeyDown={(event) => {
        callEventHandler(props.onKeyDown, event);
        if (event.defaultPrevented) return;
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            if (!context.open()) context.setOpen(true);
            else move(1);
            break;
          case "ArrowUp":
            event.preventDefault();
            if (!context.open()) context.setOpen(true);
            else move(-1);
            break;
          case "Home":
            if (context.open()) {
              event.preventDefault();
              const first = context.options()[0];
              if (first) context.setHighlightedId(first.id);
            }
            break;
          case "End":
            if (context.open()) {
              event.preventDefault();
              const items = context.options();
              const last = items[items.length - 1];
              if (last) context.setHighlightedId(last.id);
            }
            break;
          case "Enter": {
            if (!context.open()) break;
            const highlighted = context
              .options()
              .find((entry) => entry.id === context.highlightedId());
            const value = highlighted?.element.dataset.value;
            if (highlighted && value !== undefined) {
              event.preventDefault();
              context.select(value, highlighted.element.textContent ?? value);
            }
            break;
          }
          case "Escape":
            if (context.open()) {
              event.preventDefault();
              context.setOpen(false);
            }
            break;
        }
      }}
    />
  );
};

/** Props for the combobox listbox popup. */
export type ComboboxListboxProps = Omit<PrimitivePropsWithRef<"ul">, "role"> & {
  /** Keeps the listbox mounted while closed (hidden by presence instead). */
  forceMount?: boolean | undefined;
};

/** The popup list of options; rendered only while the combobox is open. */
export const ComboboxListbox: Component<ComboboxListboxProps> = (props) => {
  const context = useComboboxContext("ComboboxListbox");
  const rest = omit(props, "forceMount");
  return (
    <>
      {context.open() || props.forceMount ? (
        <Primitive.ul
          {...rest}
          id={context.listboxId}
          role="listbox"
          data-state={context.open() ? "open" : "closed"}
          hidden={!context.open() && props.forceMount ? true : undefined}
        />
      ) : null}
    </>
  );
};

/** Props for one combobox option. */
export type ComboboxOptionProps = Omit<PrimitivePropsWithRef<"li">, "role"> & {
  /** The value reported to `onValueChange` when this option is chosen. */
  value: string;
  /** Visible label; also becomes the input text after selection. */
  children?: JSX.Element | undefined;
};

/**
 * One option: registers itself for keyboard navigation, highlights on
 * hover, and selects on click. Render only options that match the
 * current input; registration follows render order.
 */
export const ComboboxOption: Component<ComboboxOptionProps> = (props) => {
  const context = useComboboxContext("ComboboxOption");
  const id = createUniqueId();
  let element: HTMLLIElement | undefined;
  onCleanup(() => {
    if (element) context.registerOption(id, element)();
  });
  const highlighted = () => context.highlightedId() === id;
  const selected = () => context.value() === props.value;
  const rest = omit(props, "value", "children", "onClick", "onPointerEnter");
  return (
    <Primitive.li
      {...rest}
      ref={(node: HTMLLIElement | null) => {
        if (!node) return;
        element = node;
        if (node) context.registerOption(id, node);
        if (typeof props.ref === "function") props.ref(node);
      }}
      id={id}
      role="option"
      data-value={props.value}
      aria-selected={ariaBoolean(selected())}
      data-highlighted={highlighted() ? "" : undefined}
      data-selected={selected() ? "" : undefined}
      onPointerEnter={(event) => {
        context.setHighlightedId(id);
        callEventHandler(props.onPointerEnter, event);
      }}
      onPointerDown={(event) => {
        // Keep input focus so the blur handler does not close first.
        event.preventDefault();
      }}
      onClick={(event) => {
        context.select(props.value, element?.textContent ?? props.value);
        callEventHandler(props.onClick, event);
      }}
    >
      {props.children}
    </Primitive.li>
  );
};
