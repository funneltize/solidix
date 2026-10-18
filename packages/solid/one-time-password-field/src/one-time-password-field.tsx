import { createEffect, createMemo, createSignal, omit, type Component } from "solid-js";
import { clamp } from "@solidix/number";
import { unstable_createCollection as createCollection } from "@solidix/collection";
import { useComposedRefs, type RefObject } from "@solidix/compose-refs";
import { createContextScope, type Scope } from "@solidix/context";
import { useDirection } from "@solidix/direction";
import {
  Primitive,
  callEventHandler,
  composeEventHandlers,
  type PrimitivePropsWithRef,
} from "@solidix/primitive";
import {
  Item as RovingFocusGroupItem,
  Root as RovingFocusGroupRoot,
  createRovingFocusGroupScope,
  type RovingFocusGroupProps,
} from "@solidix/roving-focus";
import { useControllableState } from "@solidix/use-controllable-state";
import { useIsHydrated } from "@solidix/use-is-hydrated";
import { useLayoutEffect } from "@solidix/use-layout-effect";

const InputValidationType = {
  Alpha: "alpha",
  Numeric: "numeric",
  Alphanumeric: "alphanumeric",
  None: "none",
} as const;

const InputType = {
  Password: "password",
  Text: "text",
} as const;

const AutoComplete = {
  Off: "off",
  OneTimeCode: "one-time-code",
} as const;

type InputValidationType = (typeof InputValidationType)[keyof typeof InputValidationType];
type InputType = (typeof InputType)[keyof typeof InputType];
type AutoComplete = (typeof AutoComplete)[keyof typeof AutoComplete];

const INPUT_VALIDATION_MAP = {
  numeric: {
    type: InputValidationType.Numeric,
    regexp: /[^\d]/g,
    pattern: "\\d{1}",
    inputMode: "numeric",
  },
  alpha: {
    type: InputValidationType.Alpha,
    regexp: /[^a-zA-Z]/g,
    pattern: "[a-zA-Z]{1}",
    inputMode: "text",
  },
  alphanumeric: {
    type: InputValidationType.Alphanumeric,
    regexp: /[^a-zA-Z0-9]/g,
    pattern: "[a-zA-Z0-9]{1}",
    inputMode: "text",
  },
  none: null,
} satisfies InputValidation;

/* -------------------------------------------------------------------------------------------------
 * OneTimePasswordFieldProvider
 * -----------------------------------------------------------------------------------------------*/

type OneTimePasswordFieldContextValue = {
  attemptSubmit: () => void;
  autoComplete: () => AutoComplete;
  autoFocus: () => boolean;
  disabled: () => boolean;
  dispatch: Dispatcher;
  form: string | undefined;
  hiddenInputRef: RefObject<HTMLInputElement | null>;
  isHydrated: () => boolean;
  name: string | undefined;
  orientation: () => Exclude<RovingFocusGroupProps["orientation"], undefined>;
  placeholder: () => string | undefined;
  readOnly: () => boolean;
  type: () => InputType;
  userActionRef: RefObject<KeyboardActionDetails | null>;
  validationType: () => InputValidationType;
  value: () => string[];
  sanitizeValue: (arg: string | string[]) => string[];
};

const ONE_TIME_PASSWORD_FIELD_NAME = "OneTimePasswordField";
const [Collection, { useCollection, createCollectionScope, useInitCollection }] =
  createCollection<HTMLInputElement>(ONE_TIME_PASSWORD_FIELD_NAME);
const [createOneTimePasswordFieldContext] = createContextScope(ONE_TIME_PASSWORD_FIELD_NAME, [
  createCollectionScope,
  createRovingFocusGroupScope,
]);
const useRovingFocusGroupScope = createRovingFocusGroupScope();

const [OneTimePasswordFieldContext, useOneTimePasswordFieldContext] =
  createOneTimePasswordFieldContext<OneTimePasswordFieldContextValue>(ONE_TIME_PASSWORD_FIELD_NAME);

/* -------------------------------------------------------------------------------------------------
 * OneTimePasswordField
 * -----------------------------------------------------------------------------------------------*/

type OneTimePasswordFieldOwnProps = {
  /**
   * Specifies what - if any - permission the user agent has to provide automated
   * assistance in filling out form field values, as well as guidance to the
   * browser as to the type of information expected in the field. Allows
   * `"one-time-code"` or `"off"`.
   *
   * @defaultValue `"one-time-code"`
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete
   */
  autoComplete?: AutoComplete | undefined;
  /**
   * Whether or not the first fillable input should be focused on page-load.
   *
   * @defaultValue `false`
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/autofocus
   */
  autoFocus?: boolean | undefined;
  /**
   * Whether or not the component should attempt to automatically submit when
   * all fields are filled. If the field is associated with an HTML `form`
   * element, the form's `requestSubmit` method will be called.
   *
   * @defaultValue `false`
   */
  autoSubmit?: boolean | undefined;
  /**
   * The initial value of the uncontrolled field.
   */
  defaultValue?: string | undefined;
  /**
   * Indicates the horizontal directionality of the parent element's text.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/dir
   */
  dir?: RovingFocusGroupProps["dir"] | undefined;
  /**
   * Whether or not the field's input elements are disabled.
   */
  disabled?: boolean | undefined;
  /**
   * A string specifying the `form` element with which the input is associated.
   * This string's value, if present, must match the id of a `form` element in
   * the same document.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form
   */
  form?: string | undefined;
  /**
   * A string specifying a name for the input control. This name is submitted
   * along with the control's value when the form data is submitted.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#name
   */
  name?: string | undefined;
  /**
   * When the `autoSubmit` prop is set to `true`, this callback will be fired
   * before attempting to submit the associated form. It will be called whether
   * or not a form is located, or if submission is not allowed.
   */
  onAutoSubmit?: { bivarianceHack(value: string): void }["bivarianceHack"] | undefined;
  /**
   * A callback fired when the field's value changes. When the component is
   * controlled, this should update the state passed to the `value` prop.
   */
  onValueChange?: { bivarianceHack(value: string): void }["bivarianceHack"] | undefined;
  /**
   * Indicates the vertical directionality of the input elements.
   *
   * @defaultValue `"horizontal"`
   */
  orientation?: RovingFocusGroupProps["orientation"] | undefined;
  /**
   * Defines the text displayed in a form control when the control has no value.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/placeholder
   */
  placeholder?: string | undefined;
  /**
   * Whether or not the input elements can be updated by the user.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/readonly
   */
  readOnly?: boolean | undefined;
  /**
   * Function for custom sanitization when `validationType` is set to `"none"`.
   * This function will be called before updating values in response to user
   * interactions.
   */
  sanitizeValue?: { bivarianceHack(value: string): string }["bivarianceHack"] | undefined;
  /**
   * The input type of the field's input elements. Can be `"password"` or `"text"`.
   */
  type?: InputType | undefined;
  /**
   * Specifies the type of input validation to be used. Can be `"alpha"`,
   * `"numeric"`, `"alphanumeric"` or `"none"`.
   *
   * @defaultValue `"numeric"`
   */
  validationType?: InputValidationType | undefined;
  /**
   * The controlled value of the field.
   */
  value?: string | undefined;
};

type ScopedProps<P> = P & { __scopeOneTimePasswordField?: Scope | undefined };

type OneTimePasswordFieldProps = OneTimePasswordFieldOwnProps &
  Omit<PrimitivePropsWithRef<"div">, keyof OneTimePasswordFieldOwnProps>;

const OneTimePasswordField: Component<ScopedProps<OneTimePasswordFieldProps>> = (props) => {
  const domProps = omit(
    props,
    "__scopeOneTimePasswordField",
    "defaultValue",
    "value",
    "onValueChange",
    "autoSubmit",
    "children",
    "onPaste",
    "onAutoSubmit",
    "disabled",
    "readOnly",
    "autoComplete",
    "autoFocus",
    "form",
    "name",
    "placeholder",
    "type",
    "orientation",
    "dir",
    "validationType",
    "sanitizeValue",
    "ref",
  );
  const autoSubmit = () => props.autoSubmit ?? false;
  const disabled = () => props.disabled ?? false;
  const readOnly = () => props.readOnly ?? false;
  const autoComplete = () => props.autoComplete ?? AutoComplete.OneTimeCode;
  const autoFocus = () => props.autoFocus ?? false;
  const inputType = () => props.type ?? InputType.Text;
  // TODO: Change default to vertical when inputs use vertical writing mode
  const orientation = () =>
    (props.orientation ?? "horizontal") as Exclude<RovingFocusGroupProps["orientation"], undefined>;
  const validationType = () => props.validationType ?? InputValidationType.Numeric;

  const rovingFocusGroupScope = useRovingFocusGroupScope(props.__scopeOneTimePasswordField);
  const direction = useDirection(props.dir);
  const collectionState = useInitCollection();
  // The root owns the collection state (it renders the provider), so it reads
  // the state tuple directly instead of consuming the context.
  const [collection] = collectionState;

  const validation = () => {
    const current = validationType();
    return INPUT_VALIDATION_MAP[current]
      ? INPUT_VALIDATION_MAP[current as keyof InputValidation]
      : null;
  };

  const sanitizeValue = (value: string | string[]) => {
    if (Array.isArray(value)) {
      value = value.map(removeWhitespace).join("");
    } else {
      value = removeWhitespace(value);
    }

    const currentValidation = validation();
    if (currentValidation) {
      // global regexp is stateful, so we clone it for each call
      const regexp = new RegExp(currentValidation.regexp);
      value = value.replace(regexp, "");
    } else if (props.sanitizeValue) {
      value = props.sanitizeValue(value);
    }

    return value.split("");
  };

  const controlledValue = createMemo(() =>
    props.value != null ? sanitizeValue(props.value) : undefined,
  );

  const [value, setValue] = useControllableState({
    caller: "OneTimePasswordField",
    prop: controlledValue,
    defaultProp: props.defaultValue != null ? sanitizeValue(props.defaultValue) : [],
    onChange: (nextValue: string[]) => callEventHandler(props.onValueChange, nextValue.join("")),
  });

  // Update function *specifically* for event handlers. Solid signals always
  // read fresh, so no `latestValueRef` is needed (unlike Radix, which avoids
  // `value` in its dependency array to keep `dispatch` referentially stable).
  // Likewise `flushSync` has no equivalent: signal writes apply synchronously
  // and the DOM flush follows in a microtask, ahead of focus work.
  const dispatch: Dispatcher = (action) => {
    const currentValue = value();
    switch (action.type) {
      case "SET_CHAR": {
        const { index, char } = action;
        const currentTarget = collection().at(index)?.element;
        if (currentValue[index] === char) {
          const next = currentTarget && collection().from(currentTarget, 1)?.element;
          focusInput(next);
          return;
        }

        // empty values should be handled in the CLEAR_CHAR action
        if (char === "") {
          return;
        }

        const currentValidation = validation();
        if (currentValidation) {
          const regexp = new RegExp(currentValidation.regexp);
          const clean = char.replace(regexp, "");
          if (clean !== char) {
            // not valid; ignore
            return;
          }
        }

        // no more space
        if (currentValue.length >= collection().size) {
          // replace current value; move to next input
          const newValue = [...currentValue];
          newValue[index] = char;
          setValue(newValue);
          const next = currentTarget && collection().from(currentTarget, 1)?.element;
          focusInput(next);
          return;
        }

        const newValue = [...currentValue];
        newValue[index] = char;

        const lastElement = collection().at(-1)?.element;
        setValue(newValue);
        if (currentTarget !== lastElement) {
          const next = currentTarget && collection().from(currentTarget, 1)?.element;
          focusInput(next);
        } else {
          currentTarget?.select();
        }
        return;
      }

      case "CLEAR_CHAR": {
        const { index, reason } = action;
        if (!currentValue[index]) {
          return;
        }

        const newValue = currentValue.filter((_, i) => i !== index);
        const currentTarget = collection().at(index)?.element;
        const previous = currentTarget && collection().from(currentTarget, -1)?.element;

        setValue(newValue);
        if (reason === "Backspace") {
          focusInput(previous);
        } else if (reason === "Delete" || reason === "Cut") {
          focusInput(currentTarget);
        }
        return;
      }

      case "CLEAR": {
        if (currentValue.length === 0) {
          return;
        }

        if (action.reason === "Backspace" || action.reason === "Delete") {
          setValue([]);
          focusInput(collection().at(0)?.element);
        } else {
          setValue([]);
        }
        return;
      }

      case "PASTE": {
        const { value: pastedValue } = action;
        const sanitizedValue = sanitizeValue(pastedValue);
        if (!sanitizedValue) {
          return;
        }

        const nextValue = sanitizedValue.slice(0, collection().size);

        setValue(nextValue);
        focusInput(collection().at(nextValue.length - 1)?.element);
        return;
      }
    }
  };

  // re-validate when the validation type changes
  const validationTypeRef: RefObject<{ type: InputValidationType } | null> = {
    current: validation(),
  };
  createEffect(
    () => ({ currentValidation: validation(), currentValue: value() }),
    ({ currentValidation, currentValue }) => {
      if (!currentValidation) {
        return;
      }

      if (validationTypeRef.current?.type !== currentValidation.type) {
        validationTypeRef.current = currentValidation;
        setValue(sanitizeValue(currentValue.join("")));
      }
    },
  );

  const hiddenInputRef: RefObject<HTMLInputElement | null> = { current: null };

  const userActionRef: RefObject<KeyboardActionDetails | null> = { current: null };
  const rootRef: RefObject<HTMLDivElement | null> = { current: null };
  const composedRefs = useComposedRefs(props.ref, rootRef);

  const locateForm = () => {
    let formElement: HTMLFormElement | null | undefined;
    if (props.form) {
      const associatedElement = (rootRef.current?.ownerDocument ?? document).getElementById(
        props.form,
      );
      if (isFormElement(associatedElement)) {
        formElement = associatedElement;
      }
    } else if (hiddenInputRef.current) {
      formElement = hiddenInputRef.current.form;
    } else {
      const firstInput = collection().at(0)?.element;
      if (firstInput) {
        formElement = firstInput.form;
      }
    }

    return formElement ?? null;
  };

  const attemptSubmit = () => {
    const formElement = locateForm();
    formElement?.requestSubmit();
  };

  useLayoutEffect(() => {
    const form = locateForm();
    if (form) {
      const reset = () => dispatch({ type: "CLEAR", reason: "Reset" });
      form.addEventListener("reset", reset);
      return () => form.removeEventListener("reset", reset);
    }
  });

  const currentValue = () => value().join("");
  const valueRef: RefObject<string> = { current: currentValue() };
  createEffect(
    () => ({ currentValue: currentValue(), length: collection().size, currentArray: value() }),
    ({ currentValue: nextValue, length, currentArray }) => {
      const previousValue = valueRef.current;
      valueRef.current = nextValue;
      if (previousValue === nextValue) {
        return;
      }

      if (
        autoSubmit() &&
        currentArray.every((char) => char !== "") &&
        currentArray.length === length
      ) {
        callEventHandler(props.onAutoSubmit, currentArray.join(""));
        attemptSubmit();
      }
    },
  );
  const isHydrated = useIsHydrated();

  return (
    <OneTimePasswordFieldContext
      scope={props.__scopeOneTimePasswordField}
      value={value}
      attemptSubmit={attemptSubmit}
      disabled={disabled}
      readOnly={readOnly}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      form={props.form}
      name={props.name}
      placeholder={() => props.placeholder}
      type={inputType}
      hiddenInputRef={hiddenInputRef}
      userActionRef={userActionRef}
      dispatch={dispatch}
      validationType={validationType}
      orientation={orientation}
      isHydrated={isHydrated}
      sanitizeValue={sanitizeValue}
    >
      <Collection.Provider scope={props.__scopeOneTimePasswordField} state={collectionState}>
        <Collection.Slot scope={props.__scopeOneTimePasswordField}>
          <RovingFocusGroupRoot
            asChild
            {...rovingFocusGroupScope}
            orientation={orientation()}
            dir={direction}
          >
            <Primitive.div
              {...domProps}
              role="group"
              ref={composedRefs}
              onPaste={composeEventHandlers(
                (event) => callEventHandler(props.onPaste, event),
                (event: ClipboardEvent & { currentTarget: HTMLDivElement }) => {
                  event.preventDefault();
                  const pastedValue = event.clipboardData?.getData("text/plain") ?? "";
                  dispatch({ type: "PASTE", value: pastedValue });
                },
              )}
            >
              {props.children}
            </Primitive.div>
          </RovingFocusGroupRoot>
        </Collection.Slot>
      </Collection.Provider>
    </OneTimePasswordFieldContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * OneTimePasswordFieldHiddenInput
 * -----------------------------------------------------------------------------------------------*/

type OneTimePasswordFieldHiddenInputProps = Omit<
  PrimitivePropsWithRef<"input">,
  | "value"
  | "defaultValue"
  | "type"
  | "onChange"
  | "readonly"
  | "disabled"
  | "autocomplete"
  | "autofocus"
>;

const OneTimePasswordFieldHiddenInput: Component<
  ScopedProps<OneTimePasswordFieldHiddenInputProps>
> = (props) => {
  const rest = omit(props, "__scopeOneTimePasswordField", "ref");
  const context = useOneTimePasswordFieldContext(
    "OneTimePasswordFieldHiddenInput",
    props.__scopeOneTimePasswordField,
  );
  // `autoSave` is not in Solid's JSX types; set it imperatively instead.
  const autoSaveRef = (node: HTMLInputElement | null) => {
    node?.setAttribute("autoSave", "off");
  };
  const ref = useComposedRefs(context.hiddenInputRef, autoSaveRef, props.ref);
  return (
    <input
      ref={ref}
      name={context.name}
      value={context.value().join("").trim()}
      autocomplete="off"
      autofocus={false}
      autocapitalize="off"
      autocorrect="off"
      spellcheck={false}
      {...rest}
      type="hidden"
      readonly
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * OneTimePasswordFieldInput
 * -----------------------------------------------------------------------------------------------*/

type OneTimePasswordFieldInputProps = Omit<
  PrimitivePropsWithRef<"input">,
  | "value"
  | "defaultValue"
  | "disabled"
  | "readonly"
  | "autocomplete"
  | "autofocus"
  | "form"
  | "name"
  | "placeholder"
  | "type"
> & {
  /**
   * Callback fired when the user input fails native HTML input validation.
   */
  onInvalidChange?: { bivarianceHack(character: string): void }["bivarianceHack"] | undefined;
  /**
   * User-provided index to determine the order of the inputs. This is useful if
   * you need certain index-based attributes to be set on the initial render,
   * often to prevent flickering after hydration.
   */
  index?: number | undefined;
};

const OneTimePasswordFieldInput: Component<ScopedProps<OneTimePasswordFieldInputProps>> = (
  props,
) => {
  // TODO: warn if these values are passed
  // (`value`, `defaultValue`, `disabled`, `readonly`, `autocomplete`,
  // `autofocus`, `form`, `name`, `placeholder`, and `type` are already
  // excluded by the props type, so only the remaining keys are omitted here.)
  const domProps = omit(
    props,
    "__scopeOneTimePasswordField",
    "onInvalidChange",
    "index",
    "onInput",
    "onChange",
    "ref",
  );

  const context = useOneTimePasswordFieldContext(
    "OneTimePasswordFieldInput",
    props.__scopeOneTimePasswordField,
  );
  const collection = useCollection(props.__scopeOneTimePasswordField);
  const rovingFocusGroupScope = useRovingFocusGroupScope(props.__scopeOneTimePasswordField);

  const inputRef: RefObject<HTMLInputElement | null> = { current: null };
  const [element, setElement] = createSignal<HTMLInputElement | null>(null);

  const index = () => props.index ?? (element() ? collection().indexOf(element()!) : -1);
  const canSetPlaceholder = () => props.index != null || context.isHydrated();
  const placeholder = () => {
    if (canSetPlaceholder() && context.placeholder() && context.value().length === 0) {
      // only set placeholder after hydration to prevent flickering when indices
      // are re-calculated
      return context.placeholder()![index()];
    }
    return undefined;
  };

  const composedInputRef = useComposedRefs(props.ref, inputRef, setElement);
  const char = () => context.value()[index()] ?? "";

  const keyboardActionTimeoutRef: RefObject<number | null> = { current: null };
  useLayoutEffect(() => {
    return () => {
      if (keyboardActionTimeoutRef.current) {
        window.clearTimeout(keyboardActionTimeoutRef.current);
      }
    };
  });

  const totalValue = () => context.value().join("").trim();
  const lastSelectableIndex = () => clamp(totalValue().length, [0, collection().size - 1]);
  const isFocusable = () => index() <= lastSelectableIndex();

  const validation = () => {
    const current = context.validationType();
    return current in INPUT_VALIDATION_MAP
      ? INPUT_VALIDATION_MAP[current as keyof InputValidation]
      : undefined;
  };

  // React's `onChange` fires per keystroke (it listens to the native `input`
  // event); Solid's `onChange` is the native `change` event (blur/Enter), so
  // the per-keystroke logic lives on `onInput` instead, with the consumer's
  // `onChange` composed in for React parity.
  const handleInput = (event: InputEvent & { currentTarget: HTMLInputElement }) => {
    const inputValue = event.currentTarget.value;
    if (inputValue.length > 1) {
      // Password managers may try to insert the code into a single
      // input, in which case form validation will fail to prevent
      // additional input. Handle this the same as if a user were
      // pasting a value.
      event.preventDefault();
      context.userActionRef.current = { type: "autocomplete-paste" };
      context.dispatch({ type: "PASTE", value: inputValue });
      keyboardActionTimeoutRef.current = window.setTimeout(() => {
        context.userActionRef.current = null;
      }, 10);
      return;
    }

    handleChange(event);
  };

  const handleChange = (event: InputEvent & { currentTarget: HTMLInputElement }) => {
    const currentIndex = index();
    const inputValue = event.currentTarget.value;
    event.preventDefault();
    const action = context.userActionRef.current;
    context.userActionRef.current = null;

    if (action) {
      switch (action.type) {
        case "cut":
          // TODO: do we want to assume the user wants to clear the
          // entire value here and copy the code to the clipboard instead
          // of just the value of the given input?
          context.dispatch({ type: "CLEAR_CHAR", index: currentIndex, reason: "Cut" });
          return;
        case "autocomplete-paste":
          // the PASTE handler will already set the value and focus the final
          // input; we want to skip focusing the wrong element if the browser fires
          // onChange for the first input. This sometimes happens during autocomplete.
          return;
        case "keydown": {
          if (action.key === "Char") {
            // update resulting from a keydown event that set a value
            // directly. Ignore.
            return;
          }

          const isClearing = action.key === "Backspace" && (action.metaKey || action.ctrlKey);
          if (action.key === "Clear" || isClearing) {
            context.dispatch({ type: "CLEAR", reason: "Backspace" });
          } else {
            context.dispatch({ type: "CLEAR_CHAR", index: currentIndex, reason: action.key });
          }
          return;
        }
        default:
          action satisfies never;
          return;
      }
    }

    // Only update the value if it matches the input pattern
    if (event.currentTarget.validity.valid) {
      if (inputValue === "") {
        let reason: "Backspace" | "Delete" | "Cut" = "Backspace";
        if (isInputEvent(event)) {
          const inputType = event.inputType;
          if (inputType === "deleteContentBackward") {
            reason = "Backspace";
          } else if (inputType === "deleteByCut") {
            reason = "Cut";
          }
        }
        context.dispatch({ type: "CLEAR_CHAR", index: currentIndex, reason });
      } else {
        context.dispatch({ type: "SET_CHAR", char: inputValue, index: currentIndex });
      }
    } else {
      const element = event.currentTarget;
      callEventHandler(props.onInvalidChange, element.value);
      requestAnimationFrame(() => {
        if (element.ownerDocument.activeElement === element) {
          element.select();
        }
      });
    }
  };

  return (
    <Collection.ItemSlot scope={props.__scopeOneTimePasswordField}>
      <RovingFocusGroupItem
        {...rovingFocusGroupScope}
        asChild
        focusable={!context.disabled() && isFocusable()}
        active={index() === lastSelectableIndex()}
      >
        {({ hasTabStop, isCurrentTabStop }) => {
          const supportsAutoComplete = () => (hasTabStop() ? isCurrentTabStop() : index() === 0);
          return (
            <Primitive.input
              ref={composedInputRef}
              type={context.type()}
              disabled={context.disabled()}
              aria-label={`Character ${index() + 1} of ${collection().size}`}
              autocomplete={supportsAutoComplete() ? context.autoComplete() : AutoComplete.Off}
              data-1p-ignore={supportsAutoComplete() ? undefined : "true"}
              data-lpignore={supportsAutoComplete() ? undefined : "true"}
              data-protonpass-ignore={supportsAutoComplete() ? undefined : "true"}
              data-bwignore={supportsAutoComplete() ? undefined : "true"}
              inputmode={validation()?.inputMode}
              maxlength={supportsAutoComplete() ? collection().size : 1}
              pattern={validation()?.pattern}
              readonly={context.readOnly()}
              value={char()}
              placeholder={placeholder()}
              data-radix-otp-input=""
              data-radix-index={index()}
              {...domProps}
              onFocus={composeEventHandlers(
                (event) => callEventHandler(props.onFocus, event),
                (event) => {
                  event.currentTarget.select();
                },
              )}
              onCut={composeEventHandlers(
                (event) => callEventHandler(props.onCut, event),
                (event) => {
                  const currentValue = event.currentTarget.value;
                  if (currentValue !== "") {
                    // In this case the value will be cleared, but we don't want to
                    // set it directly because the user may want to prevent default
                    // behavior in the onChange handler. The userActionRef will
                    // be set temporarily so the change handler can behave correctly
                    // in response to the action.
                    context.userActionRef.current = { type: "cut" };
                    // Set a short timeout to clear the action tracker after the change
                    // handler has had time to complete.
                    keyboardActionTimeoutRef.current = window.setTimeout(() => {
                      context.userActionRef.current = null;
                    }, 10);
                  }
                },
              )}
              onInput={composeEventHandlers((event) => {
                callEventHandler(props.onInput, event);
                callEventHandler(props.onChange, event);
              }, handleInput)}
              onKeyDown={composeEventHandlers(
                (event) => callEventHandler(props.onKeyDown, event),
                (event) => {
                  switch (event.key) {
                    case "Clear":
                    case "Delete":
                    case "Backspace": {
                      const currentValue = event.currentTarget.value;
                      // if current value is empty, no change event will fire
                      if (currentValue === "") {
                        // if the user presses delete when there is no value, noop
                        if (event.key === "Delete") return;

                        const isClearing = event.key === "Clear" || event.metaKey || event.ctrlKey;
                        if (isClearing) {
                          context.dispatch({ type: "CLEAR", reason: "Backspace" });
                        } else {
                          const element = event.currentTarget;
                          requestAnimationFrame(() => {
                            focusInput(collection().from(element, -1)?.element);
                          });
                        }
                      } else {
                        // In this case the value will be cleared, but we don't want
                        // to set it directly because the user may want to prevent
                        // default behavior in the onChange handler. The userActionRef
                        // will is set temporarily so the change handler can behave
                        // correctly in response to the key vs. clearing the value by
                        // setting state externally.
                        context.userActionRef.current = {
                          type: "keydown",
                          key: event.key,
                          metaKey: event.metaKey,
                          ctrlKey: event.ctrlKey,
                        };
                        // Set a short timeout to clear the action tracker after the change
                        // handler has had time to complete.
                        keyboardActionTimeoutRef.current = window.setTimeout(() => {
                          context.userActionRef.current = null;
                        }, 10);
                      }

                      return;
                    }
                    case "Enter": {
                      event.preventDefault();
                      context.attemptSubmit();
                      return;
                    }
                    case "ArrowDown":
                    case "ArrowUp": {
                      if (context.orientation() === "horizontal") {
                        // in horizontal orientation, the up/down will de-select the
                        // input instead of moving focus
                        event.preventDefault();
                      }
                      return;
                    }
                    // TODO: Handle left/right arrow keys in vertical writing mode
                    default: {
                      if (event.currentTarget.value === event.key) {
                        // if current value is same as the key press, no change event
                        // will fire. Focus the next input.
                        const element = event.currentTarget;
                        event.preventDefault();
                        focusInput(collection().from(element, 1)?.element);
                        return;
                      } else if (
                        // input already has a value, but...
                        event.currentTarget.value &&
                        // the value is not selected
                        !(
                          event.currentTarget.selectionStart === 0 &&
                          event.currentTarget.selectionEnd != null &&
                          event.currentTarget.selectionEnd > 0
                        )
                      ) {
                        const attemptedValue = event.key;
                        if (event.key.length > 1 || event.key === " ") {
                          // not a character; do nothing
                          return;
                        } else {
                          // user is attempting to enter a character, but the input
                          // will not update by default since it's limited to a single
                          // character.
                          const currentIndex = index();
                          const nextInput = collection().from(event.currentTarget, 1)?.element;
                          const lastInput = collection().at(-1)?.element;
                          if (nextInput !== lastInput && event.currentTarget !== lastInput) {
                            // if selection is before the value, set the value of the
                            // current input. Otherwise set the value of the next
                            // input.
                            if (event.currentTarget.selectionStart === 0) {
                              context.dispatch({
                                type: "SET_CHAR",
                                char: attemptedValue,
                                index: currentIndex,
                              });
                            } else {
                              context.dispatch({
                                type: "SET_CHAR",
                                char: attemptedValue,
                                index: currentIndex + 1,
                              });
                            }

                            context.userActionRef.current = {
                              type: "keydown",
                              key: "Char",
                              metaKey: event.metaKey,
                              ctrlKey: event.ctrlKey,
                            };
                            keyboardActionTimeoutRef.current = window.setTimeout(() => {
                              context.userActionRef.current = null;
                            }, 10);
                          }
                        }
                      }
                    }
                  }
                },
              )}
              onPointerDown={composeEventHandlers(
                (event) => callEventHandler(props.onPointerDown, event),
                (event) => {
                  event.preventDefault();
                  const indexToFocus = Math.min(index(), lastSelectableIndex());
                  const element = collection().at(indexToFocus)?.element;
                  focusInput(element);
                },
              )}
            />
          );
        }}
      </RovingFocusGroupItem>
    </Collection.ItemSlot>
  );
};

export {
  OneTimePasswordField,
  OneTimePasswordFieldInput,
  OneTimePasswordFieldHiddenInput,
  //
  OneTimePasswordField as Root,
  OneTimePasswordFieldInput as Input,
  OneTimePasswordFieldHiddenInput as HiddenInput,
};
export type {
  OneTimePasswordFieldProps,
  OneTimePasswordFieldInputProps,
  OneTimePasswordFieldHiddenInputProps,
  InputValidationType,
};

/* -----------------------------------------------------------------------------------------------*/

function isFormElement(element: Element | null | undefined): element is HTMLFormElement {
  return element?.tagName === "FORM";
}

function removeWhitespace(value: string) {
  return value.replace(/\s/g, "");
}

function focusInput(element: HTMLInputElement | null | undefined) {
  if (!element) return;
  if (element.ownerDocument.activeElement === element) {
    // if the element is already focused, select the value in the next
    // animation frame
    window.requestAnimationFrame(() => {
      element.select?.();
    });
  } else {
    element.focus();
  }
}

function isInputEvent(event: Event): event is InputEvent {
  return event.type === "input";
}

type KeyboardActionDetails =
  | {
      type: "keydown";
      key: "Backspace" | "Delete" | "Clear" | "Char";
      metaKey: boolean;
      ctrlKey: boolean;
    }
  | { type: "cut" }
  | { type: "autocomplete-paste" };

type UpdateAction =
  | {
      type: "SET_CHAR";
      char: string;
      index: number;
    }
  | { type: "CLEAR_CHAR"; index: number; reason: "Backspace" | "Delete" | "Cut" }
  | { type: "CLEAR"; reason: "Reset" | "Backspace" | "Delete" | "Clear" }
  | { type: "PASTE"; value: string };
type Dispatcher = (action: UpdateAction) => void;
type InputValidation = Record<
  InputValidationType,
  {
    type: InputValidationType;
    regexp: RegExp;
    pattern: string;
    inputMode: "text" | "numeric";
  } | null
>;
