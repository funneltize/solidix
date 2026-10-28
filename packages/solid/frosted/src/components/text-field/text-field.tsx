// Upstream: https://github.com/whopio/frosted-ui/blob/56787900bfe0/packages/frosted-ui/src/components/text-field/text-field.tsx

import { createContext, omit, useContext as useSolidContext, type Component } from "solid-js";
import { composeRefs, type Ref } from "@solidix/compose-refs";
import { callEventHandler } from "@solidix/primitive";
import { cx } from "../../helpers/cx.js";
import { composeEventHandlers } from "../../helpers/compose-event-handlers.js";
import type { GetPropDefTypes, PropsWithoutColor } from "../../helpers/props/index.js";
import { textFieldPropDefs, textFieldSlotPropDefs } from "./text-field.props.js";

/** Own props of `TextFieldRoot` derived from `textFieldPropDefs` (size, variant, color). */
type TextFieldRootOwnProps = GetPropDefTypes<typeof textFieldPropDefs>;

/**
 * Props for the `TextFieldRoot` component: native div props (minus `color` and `ref`)
 * plus the prop-def values. The root takes no ref, per upstream.
 */
interface TextFieldRootProps extends Omit<PropsWithoutColor<"div">, "ref">, TextFieldRootOwnProps {}

/** Accent color union shared by the root props and the inherited context value. */
type TextFieldColor = NonNullable<TextFieldRootOwnProps["color"]>;

/** Context value shared from `TextFieldRoot` down to slots and standalone inputs. */
interface TextFieldContextValue {
  /** Size class suffix inherited by slots and standalone inputs. */
  size: "1" | "2" | "3" | "4";
  /** Visual treatment inherited by standalone inputs. */
  variant: "surface" | "soft";
  /** Accent color inherited by standalone inputs. */
  color: TextFieldColor;
}

/** Context carrying root size, variant, and color to slots and standalone inputs. */
const TextFieldContext = createContext<TextFieldContextValue>();

/**
 * Reads the `TextFieldRoot` context value, or `undefined` when rendered outside a root
 * (a standalone `Input` self-wraps instead of throwing).
 */
function useTextFieldContext(): TextFieldContextValue | undefined {
  try {
    return useSolidContext(TextFieldContext);
  } catch {
    return undefined;
  }
}

/**
 * Themed text field root. Renders a `div` with `fui-TextFieldRoot` sizing, variant, and
 * accent color classes, providing them to descendant slots. Pointer-down on the root
 * focuses the inner input with the caret placed before or after the value depending on
 * which side was pressed, per upstream.
 */
const TextFieldRoot: Component<TextFieldRootProps> = (props) => {
  const rest = omit(props, "children", "class", "size", "variant", "color", "onPointerDown");

  const size = () => props.size ?? textFieldPropDefs.size.default;
  const variant = () => props.variant ?? textFieldPropDefs.variant.default;
  const color = () => props.color ?? textFieldPropDefs.color.default;

  const handlePointerDown = (
    event: PointerEvent & { currentTarget: HTMLDivElement; target: Element },
  ) => {
    const target = event.target as HTMLElement;
    if (target.closest("input, button, a, select")) return;

    const input = event.currentTarget.querySelector(
      ".fui-TextFieldInput",
    ) as HTMLInputElement | null;
    if (!input) return;

    const position = input.compareDocumentPosition(target);
    const targetIsBeforeInput = (position & Node.DOCUMENT_POSITION_PRECEDING) !== 0;
    const cursorPosition = targetIsBeforeInput ? 0 : input.value.length;

    requestAnimationFrame(() => {
      const selectableTypes = ["text", "search", "url", "tel", "password"];
      if (selectableTypes.includes(input.type)) {
        input.setSelectionRange(cursorPosition, cursorPosition);
      }
      input.focus();
    });
  };

  return (
    <div
      data-accent-color={color()}
      {...rest}
      class={cx(
        "fui-TextFieldRoot",
        `fui-r-size-${size()}`,
        `fui-variant-${variant()}`,
        props.class,
      )}
      onPointerDown={composeEventHandlers(
        (event: PointerEvent & { currentTarget: HTMLDivElement; target: Element }) =>
          callEventHandler(props.onPointerDown, event),
        handlePointerDown,
      )}
    >
      <TextFieldContext value={{ size: size(), variant: variant(), color: color() }}>
        {props.children}
      </TextFieldContext>
    </div>
  );
};

/** Own props of `TextFieldSlot` derived from `textFieldSlotPropDefs` (color). */
type TextFieldSlotOwnProps = GetPropDefTypes<typeof textFieldSlotPropDefs>;

/**
 * Props for the `TextFieldSlot` component: native div props plus the color prop-def.
 * `ref` is narrowed to the compose-refs callback form (text precedent).
 */
interface TextFieldSlotProps extends Omit<PropsWithoutColor<"div">, "ref">, TextFieldSlotOwnProps {
  /** Ref forwarded to the rendered `div`. */
  ref?: Ref<HTMLDivElement> | undefined;
}

/**
 * Icon or adornment slot inside a text field root. Renders a `div` with
 * `fui-TextFieldSlot` and the inherited root size class, per upstream.
 */
const TextFieldSlot: Component<TextFieldSlotProps> = (props) => {
  const rest = omit(props, "children", "class", "ref", "color");

  const context = useTextFieldContext();
  const color = () => props.color ?? textFieldSlotPropDefs.color.default;

  return (
    <div
      data-accent-color={color()}
      {...rest}
      ref={composeRefs(props.ref)}
      class={cx("fui-TextFieldSlot", props.class, `fui-r-size-${context?.size}`)}
    >
      {props.children}
    </div>
  );
};

/** Own props of `TextFieldInput` derived from `textFieldPropDefs` (size, variant, color). */
type TextFieldInputOwnProps = GetPropDefTypes<typeof textFieldPropDefs>;

/**
 * Props for the `TextFieldInput` component: native input props plus the prop-def values.
 * The native numeric `size` is replaced by the prop-def size enum, and `ref` is narrowed
 * to the compose-refs callback form (text precedent).
 */
interface TextFieldInputProps
  extends Omit<PropsWithoutColor<"input">, "ref" | "size">, TextFieldInputOwnProps {
  /** Ref forwarded to the rendered `input`. */
  ref?: Ref<HTMLInputElement> | undefined;
}

/**
 * Text field input. Renders an `input` with `fui-TextFieldInput`, inheriting size,
 * variant, and color from the enclosing root; standalone it self-wraps in a
 * `TextFieldRoot`, per upstream.
 */
const TextFieldInput: Component<TextFieldInputProps> = (props) => {
  const rest = omit(props, "class", "ref", "size", "variant", "color");

  const context = useTextFieldContext();
  const hasRoot = context !== undefined;
  const size = () => props.size ?? context?.size ?? textFieldPropDefs.size.default;
  const variant = () => props.variant ?? context?.variant ?? textFieldPropDefs.variant.default;
  const color = () => props.color ?? context?.color ?? textFieldPropDefs.color.default;

  // Render function (not a hoisted const): the element must instantiate under the
  // self-wrapping root's provider scope, per the no-hoisted-subtrees rule.
  const renderInput = () => (
    <input
      data-accent-color={color()}
      spellcheck="false"
      {...rest}
      ref={composeRefs(props.ref)}
      class={cx(
        "fui-TextFieldInput",
        props.class,
        `fui-r-size-${size()}`,
        `fui-variant-${variant()}`,
      )}
    />
  );

  return hasRoot ? (
    renderInput()
  ) : (
    <TextFieldRoot size={size()} variant={variant()} color={color()}>
      {renderInput()}
    </TextFieldRoot>
  );
};

/**
 * Namespace pairing the text field parts for dotted usage (`TextField.Root`,
 * `TextField.Slot`, `TextField.Input`).
 */
const TextField = { Root: TextFieldRoot, Slot: TextFieldSlot, Input: TextFieldInput };

export { TextField, TextFieldInput as Input, TextFieldRoot as Root, TextFieldSlot as Slot };
export type {
  TextFieldInputProps as InputProps,
  TextFieldRootProps as RootProps,
  TextFieldSlotProps as SlotProps,
};
