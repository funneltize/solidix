import { Show, createEffect, createSignal, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useComposedRefs, type RefObject } from "@soldix/compose-refs";
import { createContextScope, type Scope } from "@soldix/context";
import { useId } from "@soldix/id";
import { Label as LabelPrimitive, type LabelProps } from "@soldix/label";
import {
  Primitive,
  callEventHandler,
  composeEventHandlers,
  type PrimitivePropsWithRef,
} from "@soldix/primitive";
import { useLayoutEffect } from "@soldix/use-layout-effect";

type ScopedProps<P> = P & { __scopeForm?: Scope | undefined };
const [createFormContext, createFormScope] = createContextScope("Form");

/* -------------------------------------------------------------------------------------------------
 * Form
 * -----------------------------------------------------------------------------------------------*/

const FORM_NAME = "Form";

type ValidityMap = { [fieldName: string]: ValidityState | undefined };
type CustomMatcherEntriesMap = { [fieldName: string]: CustomMatcherEntry[] };
type CustomErrorsMap = { [fieldName: string]: Record<string, boolean> };

type ValidationContextValue = {
  getFieldValidity(fieldName: string): ValidityState | undefined;
  onFieldValidityChange(fieldName: string, validity: ValidityState): void;

  getFieldCustomMatcherEntries(fieldName: string): CustomMatcherEntry[];
  onFieldCustomMatcherEntryAdd(fieldName: string, matcherEntry: CustomMatcherEntry): void;
  onFieldCustomMatcherEntryRemove(fieldName: string, matcherEntryId: string): void;

  getFieldCustomErrors(fieldName: string): Record<string, boolean>;
  onFieldCustomErrorsChange(fieldName: string, errors: Record<string, boolean>): void;

  onFieldValiditionClear(fieldName: string): void;
};
const [ValidationProvider, useValidationContext] =
  createFormContext<ValidationContextValue>(FORM_NAME);

type MessageIdsMap = { [fieldName: string]: Set<string> };

type AriaDescriptionContextValue = {
  onFieldMessageIdAdd(fieldName: string, id: string): void;
  onFieldMessageIdRemove(fieldName: string, id: string): void;
  getFieldDescription(fieldName: string): string | undefined;
};
const [AriaDescriptionProvider, useAriaDescriptionContext] =
  createFormContext<AriaDescriptionContextValue>(FORM_NAME);

type FormProps = PrimitivePropsWithRef<"form"> & {
  onClearServerErrors?: (() => void) | undefined;
};

const Form: Component<ScopedProps<FormProps>> = (props) => {
  const rest = omit(props, "__scopeForm", "onClearServerErrors", "ref");
  const formRef: RefObject<HTMLFormElement | null> = { current: null };
  const composedFormRef = useComposedRefs(props.ref, formRef);

  // native validity per field
  const [validityMap, setValidityMap] = createSignal<ValidityMap>({});
  const getFieldValidity: ValidationContextValue["getFieldValidity"] = (fieldName) =>
    validityMap()[fieldName];
  const handleFieldValidityChange: ValidationContextValue["onFieldValidityChange"] = (
    fieldName,
    validity,
  ) =>
    setValidityMap((prevValidityMap) => ({
      ...prevValidityMap,
      [fieldName]: { ...prevValidityMap[fieldName], ...validity },
    }));
  const handleFieldValiditionClear: ValidationContextValue["onFieldValiditionClear"] = (
    fieldName,
  ) => {
    setValidityMap((prevValidityMap) => ({ ...prevValidityMap, [fieldName]: undefined }));
    setCustomErrorsMap((prevCustomErrorsMap) => ({ ...prevCustomErrorsMap, [fieldName]: {} }));
  };

  // custom matcher entries per field
  const [customMatcherEntriesMap, setCustomMatcherEntriesMap] =
    createSignal<CustomMatcherEntriesMap>({});
  const getFieldCustomMatcherEntries: ValidationContextValue["getFieldCustomMatcherEntries"] = (
    fieldName,
  ) => customMatcherEntriesMap()[fieldName] ?? [];
  const handleFieldCustomMatcherAdd: ValidationContextValue["onFieldCustomMatcherEntryAdd"] = (
    fieldName,
    matcherEntry,
  ) => {
    setCustomMatcherEntriesMap((prevCustomMatcherEntriesMap) => ({
      ...prevCustomMatcherEntriesMap,
      [fieldName]: [...(prevCustomMatcherEntriesMap[fieldName] ?? []), matcherEntry],
    }));
  };
  const handleFieldCustomMatcherRemove: ValidationContextValue["onFieldCustomMatcherEntryRemove"] =
    (fieldName, matcherEntryId) => {
      setCustomMatcherEntriesMap((prevCustomMatcherEntriesMap) => ({
        ...prevCustomMatcherEntriesMap,
        [fieldName]: (prevCustomMatcherEntriesMap[fieldName] ?? []).filter(
          (matcherEntry) => matcherEntry.id !== matcherEntryId,
        ),
      }));
    };

  // custom errors per field
  const [customErrorsMap, setCustomErrorsMap] = createSignal<CustomErrorsMap>({});
  const getFieldCustomErrors: ValidationContextValue["getFieldCustomErrors"] = (fieldName) =>
    customErrorsMap()[fieldName] ?? {};
  const handleFieldCustomErrorsChange: ValidationContextValue["onFieldCustomErrorsChange"] = (
    fieldName,
    customErrors,
  ) => {
    setCustomErrorsMap((prevCustomErrorsMap) => ({
      ...prevCustomErrorsMap,
      [fieldName]: { ...prevCustomErrorsMap[fieldName], ...customErrors },
    }));
  };

  // messageIds per field
  const [messageIdsMap, setMessageIdsMap] = createSignal<MessageIdsMap>({});
  const handleFieldMessageIdAdd: AriaDescriptionContextValue["onFieldMessageIdAdd"] = (
    fieldName,
    id,
  ) => {
    setMessageIdsMap((prevMessageIdsMap) => {
      const fieldDescriptionIds = new Set(prevMessageIdsMap[fieldName]).add(id);
      return { ...prevMessageIdsMap, [fieldName]: fieldDescriptionIds };
    });
  };
  const handleFieldMessageIdRemove: AriaDescriptionContextValue["onFieldMessageIdRemove"] = (
    fieldName,
    id,
  ) => {
    setMessageIdsMap((prevMessageIdsMap) => {
      const fieldDescriptionIds = new Set(prevMessageIdsMap[fieldName]);
      fieldDescriptionIds.delete(id);
      return { ...prevMessageIdsMap, [fieldName]: fieldDescriptionIds };
    });
  };
  const getFieldDescription: AriaDescriptionContextValue["getFieldDescription"] = (fieldName) =>
    Array.from(messageIdsMap()[fieldName] ?? []).join(" ") || undefined;

  return (
    <ValidationProvider
      scope={props.__scopeForm}
      getFieldValidity={getFieldValidity}
      onFieldValidityChange={handleFieldValidityChange}
      getFieldCustomMatcherEntries={getFieldCustomMatcherEntries}
      onFieldCustomMatcherEntryAdd={handleFieldCustomMatcherAdd}
      onFieldCustomMatcherEntryRemove={handleFieldCustomMatcherRemove}
      getFieldCustomErrors={getFieldCustomErrors}
      onFieldCustomErrorsChange={handleFieldCustomErrorsChange}
      onFieldValiditionClear={handleFieldValiditionClear}
    >
      <AriaDescriptionProvider
        scope={props.__scopeForm}
        onFieldMessageIdAdd={handleFieldMessageIdAdd}
        onFieldMessageIdRemove={handleFieldMessageIdRemove}
        getFieldDescription={getFieldDescription}
      >
        <Primitive.form
          {...rest}
          ref={composedFormRef}
          // focus first invalid control when the form is submitted
          onInvalid={composeEventHandlers(
            (event) => callEventHandler(props.onInvalid, event),
            (event) => {
              const firstInvalidControl = getFirstInvalidControl(event.currentTarget);
              if (firstInvalidControl === event.target) firstInvalidControl.focus();

              // prevent default browser UI for form validation
              event.preventDefault();
            },
          )}
          // clear server errors when the form is re-submitted
          onSubmit={composeEventHandlers(
            (event) => callEventHandler(props.onSubmit, event),
            () => callEventHandler(props.onClearServerErrors, undefined as never),
            { checkForDefaultPrevented: false },
          )}
          // clear server errors when the form is reset
          onReset={composeEventHandlers(
            (event) => callEventHandler(props.onReset, event),
            () => callEventHandler(props.onClearServerErrors, undefined as never),
          )}
        />
      </AriaDescriptionProvider>
    </ValidationProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * FormField
 * -----------------------------------------------------------------------------------------------*/

const FIELD_NAME = "FormField";

type FormFieldContextValue = {
  id: string;
  name: string;
  serverInvalid: () => boolean;
};
const [FormFieldProvider, useFormFieldContext] =
  createFormContext<FormFieldContextValue>(FIELD_NAME);

type FormFieldProps = PrimitivePropsWithRef<"div"> & {
  name: string;
  serverInvalid?: boolean | undefined;
};

const FormField: Component<ScopedProps<FormFieldProps>> = (props) => {
  const rest = omit(props, "__scopeForm", "name", "serverInvalid", "ref");
  const validationContext = useValidationContext(FIELD_NAME, props.__scopeForm);
  const validity = () => validationContext.getFieldValidity(props.name);
  const id = useId();

  return (
    <FormFieldProvider
      scope={props.__scopeForm}
      id={id}
      name={props.name}
      serverInvalid={() => props.serverInvalid ?? false}
    >
      <Primitive.div
        data-valid={getValidAttribute(validity(), props.serverInvalid ?? false)}
        data-invalid={getInvalidAttribute(validity(), props.serverInvalid ?? false)}
        {...rest}
        ref={props.ref}
      />
    </FormFieldProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * FormLabel
 * -----------------------------------------------------------------------------------------------*/

const LABEL_NAME = "FormLabel";

type FormLabelProps = LabelProps & {
  name?: string | undefined;
  /** React-style alias; rendered as the `for` attribute. */
  htmlFor?: string | undefined;
};

const FormLabel: Component<ScopedProps<FormLabelProps>> = (props) => {
  const rest = omit(props, "__scopeForm", "name", "htmlFor", "ref");
  const validationContext = useValidationContext(LABEL_NAME, props.__scopeForm);
  const fieldContext = useFormFieldContext(LABEL_NAME, props.__scopeForm, { optional: true });
  const name = () => props.name ?? fieldContext?.name;
  if (!name()) {
    throw new Error(
      `\`${LABEL_NAME}\` must be used within \`${FIELD_NAME}\` or specify the \`name\` prop`,
    );
  }

  const htmlFor = () => props.htmlFor || fieldContext?.id;
  if (!htmlFor()) {
    throw new Error(
      `\`${LABEL_NAME}\` must be used within \`${FIELD_NAME}\` or specify the \`htmlFor\` prop`,
    );
  }

  const validity = () => validationContext.getFieldValidity(name()!);
  const serverInvalid = () => fieldContext?.serverInvalid() ?? false;

  return (
    <LabelPrimitive
      data-valid={getValidAttribute(validity(), serverInvalid())}
      data-invalid={getInvalidAttribute(validity(), serverInvalid())}
      {...rest}
      ref={props.ref}
      // Solid renders `htmlFor` literally (`htmlfor`); the `for` attribute
      // is what associates the label with its control.
      for={htmlFor()}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * FormControl
 * -----------------------------------------------------------------------------------------------*/

const CONTROL_NAME = "FormControl";

type FormControlProps = PrimitivePropsWithRef<"input">;

const FormControl: Component<ScopedProps<FormControlProps>> = (props) => {
  const rest = omit(props, "__scopeForm", "name", "id", "aria-describedby", "ref");

  const validationContext = useValidationContext(CONTROL_NAME, props.__scopeForm);
  const fieldContext = useFormFieldContext(CONTROL_NAME, props.__scopeForm, { optional: true });
  const ariaDescriptionContext = useAriaDescriptionContext(CONTROL_NAME, props.__scopeForm);

  const controlRef: RefObject<HTMLInputElement | null> = { current: null };
  const composedRef = useComposedRefs(props.ref, controlRef);
  const name = () => props.name || fieldContext?.name;
  if (!name()) {
    throw new Error(
      `\`${CONTROL_NAME}\` must be used within \`${FIELD_NAME}\` or specify the \`name\` prop`,
    );
  }

  const id = () => props.id || fieldContext?.id;
  if (!id()) {
    throw new Error(
      `\`${CONTROL_NAME}\` must be used within \`${FIELD_NAME}\` or specify the \`id\` prop`,
    );
  }

  const { onFieldValidityChange, onFieldCustomErrorsChange, onFieldValiditionClear } =
    validationContext;
  const updateControlValidity = async (control: HTMLInputElement) => {
    const fieldName = name()!;
    //------------------------------------------------------------------------------------------
    // 1. first, if we have built-in errors we stop here

    if (hasBuiltInError(control.validity)) {
      const controlValidity = validityStateToObject(control.validity);
      onFieldValidityChange(fieldName, controlValidity);
      return;
    }

    //------------------------------------------------------------------------------------------
    // 2. then gather the form data to give to custom matchers for cross-comparisons

    const formData = control.form ? new FormData(control.form) : new FormData();
    const matcherArgs: CustomMatcherArgs = [control.value, formData];

    //------------------------------------------------------------------------------------------
    // 3. split sync and async custom matcher entries

    const customMatcherEntries = validationContext.getFieldCustomMatcherEntries(fieldName);
    const syncCustomMatcherEntries: Array<SyncCustomMatcherEntry> = [];
    const ayncCustomMatcherEntries: Array<AsyncCustomMatcherEntry> = [];
    customMatcherEntries.forEach((customMatcherEntry) => {
      if (isAsyncCustomMatcherEntry(customMatcherEntry, matcherArgs)) {
        ayncCustomMatcherEntries.push(customMatcherEntry);
      } else if (isSyncCustomMatcherEntry(customMatcherEntry)) {
        syncCustomMatcherEntries.push(customMatcherEntry);
      }
    });

    //------------------------------------------------------------------------------------------
    // 4. run sync custom matchers and update control validity / internal validity + errors

    const syncCustomErrors = syncCustomMatcherEntries.map(({ id, match }) => {
      return [id, match(...matcherArgs)] as const;
    });
    const syncCustomErrorsById = Object.fromEntries(syncCustomErrors);
    const hasSyncCustomErrors = Object.values(syncCustomErrorsById).some(Boolean);
    const hasCustomError = hasSyncCustomErrors;
    control.setCustomValidity(hasCustomError ? DEFAULT_INVALID_MESSAGE : "");
    const controlValidity = validityStateToObject(control.validity);
    onFieldValidityChange(fieldName, controlValidity);
    onFieldCustomErrorsChange(fieldName, syncCustomErrorsById);

    //------------------------------------------------------------------------------------------
    // 5. run async custom matchers and update control validity / internal validity + errors

    if (!hasSyncCustomErrors && ayncCustomMatcherEntries.length > 0) {
      const promisedCustomErrors = ayncCustomMatcherEntries.map(({ id, match }) =>
        match(...matcherArgs).then((matches) => [id, matches] as const),
      );
      const asyncCustomErrors = await Promise.all(promisedCustomErrors);
      const asyncCustomErrorsById = Object.fromEntries(asyncCustomErrors);
      const hasAsyncCustomErrors = Object.values(asyncCustomErrorsById).some(Boolean);
      const hasCustomError = hasAsyncCustomErrors;
      control.setCustomValidity(hasCustomError ? DEFAULT_INVALID_MESSAGE : "");
      const controlValidity = validityStateToObject(control.validity);
      onFieldValidityChange(fieldName, controlValidity);
      onFieldCustomErrorsChange(fieldName, asyncCustomErrorsById);
    }
  };

  useLayoutEffect(() => {
    const control = controlRef.current;
    if (control) {
      // We only want validate on change (native `change` event, not React's `onChange`). This is primarily
      // a UX decision, we don't want to validate on every keystroke and React's `onChange` is the `input` event.
      const handleChange = () => updateControlValidity(control);
      control.addEventListener("change", handleChange);
      return () => control.removeEventListener("change", handleChange);
    }
  });

  const resetControlValidity = () => {
    const control = controlRef.current;
    if (control) {
      control.setCustomValidity("");
      onFieldValiditionClear(name()!);
    }
  };

  // reset validity and errors when the form is reset
  useLayoutEffect(() => {
    const form = controlRef.current?.form;
    if (form) {
      form.addEventListener("reset", resetControlValidity);
      return () => form.removeEventListener("reset", resetControlValidity);
    }
  });

  const serverInvalid = () => fieldContext?.serverInvalid() ?? false;

  // focus first invalid control when fields are set as invalid by server
  createEffect(
    () => serverInvalid(),
    (serverInvalidNow) => {
      if (!serverInvalidNow) {
        return;
      }

      const control = controlRef.current;
      const form = control?.closest("form");
      const firstInvalidControl = form ? getFirstInvalidControl(form) : null;
      if (firstInvalidControl === control) {
        firstInvalidControl?.focus();
      }
    },
  );

  const validity = () => validationContext.getFieldValidity(name()!);

  return (
    <Primitive.input
      data-valid={getValidAttribute(validity(), serverInvalid())}
      data-invalid={getInvalidAttribute(validity(), serverInvalid())}
      aria-invalid={serverInvalid() ? "true" : undefined}
      aria-describedby={concatAriaDescribedby(
        props["aria-describedby"],
        ariaDescriptionContext.getFieldDescription(name()!),
      )}
      // disable default browser behaviour of showing built-in error message on hover
      title=""
      {...rest}
      ref={composedRef}
      id={id()}
      name={name()}
      onInvalid={composeEventHandlers(
        (event) => callEventHandler(props.onInvalid, event),
        (event) => {
          const control = event.currentTarget;
          updateControlValidity(control);
        },
      )}
      onChange={composeEventHandlers(
        (event) => callEventHandler(props.onChange, event),
        (_event) => {
          // reset validity when user changes value
          resetControlValidity();
        },
      )}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * FormMessage
 * -----------------------------------------------------------------------------------------------*/

const _validityMatchers = [
  "badInput",
  "patternMismatch",
  "rangeOverflow",
  "rangeUnderflow",
  "stepMismatch",
  "tooLong",
  "tooShort",
  "typeMismatch",
  "valid",
  "valueMissing",
] as const;
type ValidityMatcher = (typeof _validityMatchers)[number];

const DEFAULT_INVALID_MESSAGE = "This value is not valid";
const DEFAULT_BUILT_IN_MESSAGES: Record<ValidityMatcher, string | undefined> = {
  badInput: DEFAULT_INVALID_MESSAGE,
  patternMismatch: "This value does not match the required pattern",
  rangeOverflow: "This value is too large",
  rangeUnderflow: "This value is too small",
  stepMismatch: "This value does not match the required step",
  tooLong: "This value is too long",
  tooShort: "This value is too short",
  typeMismatch: "This value does not match the required type",
  valid: undefined,
  valueMissing: "This value is missing",
};

const MESSAGE_NAME = "FormMessage";

type FormMessageProps = Omit<FormMessageImplProps, "name"> & {
  match?: ValidityMatcher | CustomMatcher | undefined;
  forceMatch?: boolean | undefined;
  name?: string | undefined;
};

const FormMessage: Component<ScopedProps<FormMessageProps>> = (props) => {
  const fieldContext = useFormFieldContext(MESSAGE_NAME, props.__scopeForm, { optional: true });
  const name = () => props.name ?? fieldContext?.name;
  if (!name()) {
    throw new Error(
      `\`${MESSAGE_NAME}\` must be used within \`${FIELD_NAME}\` or specify the \`name\` prop`,
    );
  }

  const match = () => props.match;
  return (
    <Show
      when={match() !== undefined}
      fallback={
        <FormMessageImpl
          {...omit(props, "__scopeForm", "match", "forceMatch", "name", "ref")}
          __scopeForm={props.__scopeForm}
          ref={props.ref}
          name={name()!}
        >
          {props.children || DEFAULT_INVALID_MESSAGE}
        </FormMessageImpl>
      }
    >
      <Show
        when={typeof match() === "function"}
        fallback={
          <FormBuiltInMessage
            {...omit(props, "__scopeForm", "ref")}
            __scopeForm={props.__scopeForm}
            ref={props.ref}
            match={match() as ValidityMatcher}
            name={name()!}
          />
        }
      >
        <FormCustomMessage
          {...omit(props, "__scopeForm", "ref")}
          __scopeForm={props.__scopeForm}
          ref={props.ref}
          match={match() as CustomMatcher}
          name={name()!}
        />
      </Show>
    </Show>
  );
};

type FormBuiltInMessageProps = FormMessageImplProps & {
  match: ValidityMatcher;
  forceMatch?: boolean | undefined;
  name: string;
};

const FormBuiltInMessage: Component<ScopedProps<FormBuiltInMessageProps>> = (props) => {
  const rest = omit(props, "__scopeForm", "match", "forceMatch", "name", "children", "ref");
  const validationContext = useValidationContext(MESSAGE_NAME, props.__scopeForm);
  const validity = () => validationContext.getFieldValidity(props.name);
  const matches = () => props.forceMatch || validity()?.[props.match];

  return (
    <Show when={matches()}>
      <FormMessageImpl {...rest} __scopeForm={props.__scopeForm} ref={props.ref} name={props.name}>
        {props.children ?? DEFAULT_BUILT_IN_MESSAGES[props.match]}
      </FormMessageImpl>
    </Show>
  );
};

type FormCustomMessageProps = Omit<FormMessageImplProps, "name"> & {
  match: CustomMatcher;
  forceMatch?: boolean | undefined;
  name: string;
};

const FormCustomMessage: Component<ScopedProps<FormCustomMessageProps>> = (props) => {
  const rest = omit(props, "__scopeForm", "match", "forceMatch", "name", "id", "children", "ref");
  const validationContext = useValidationContext(MESSAGE_NAME, props.__scopeForm);
  const messageRef: RefObject<HTMLSpanElement | null> = { current: null };
  const composedRef = useComposedRefs(props.ref, messageRef);
  const generatedId = useId();
  // Messages need an id for `aria-describedby` linkage; `id={false}` (attribute
  // removal) is meaningless here, so it falls back to the generated id.
  const id = () => (props.id === false ? generatedId : (props.id ?? generatedId));

  const customMatcherEntry = { id: id(), match: props.match };
  const { onFieldCustomMatcherEntryAdd, onFieldCustomMatcherEntryRemove } = validationContext;
  useLayoutEffect(() => {
    onFieldCustomMatcherEntryAdd(props.name, customMatcherEntry);
    return () => onFieldCustomMatcherEntryRemove(props.name, customMatcherEntry.id);
  });

  const validity = () => validationContext.getFieldValidity(props.name);
  const customErrors = () => validationContext.getFieldCustomErrors(props.name);
  const hasMatchingCustomError = () => customErrors()[id()];
  const matches = () =>
    props.forceMatch || (validity() && !hasBuiltInError(validity()!) && hasMatchingCustomError());

  return (
    <Show when={matches()}>
      <FormMessageImpl
        id={id()}
        {...rest}
        __scopeForm={props.__scopeForm}
        ref={composedRef}
        name={props.name}
      >
        {props.children ?? DEFAULT_INVALID_MESSAGE}
      </FormMessageImpl>
    </Show>
  );
};

type FormMessageImplProps = PrimitivePropsWithRef<"span"> & {
  name: string;
};

const FormMessageImpl: Component<ScopedProps<FormMessageImplProps>> = (props) => {
  const rest = omit(props, "__scopeForm", "id", "name", "ref");
  const ariaDescriptionContext = useAriaDescriptionContext(MESSAGE_NAME, props.__scopeForm);
  const generatedId = useId();
  const id = () => (props.id === false ? generatedId : (props.id ?? generatedId));

  const { onFieldMessageIdAdd, onFieldMessageIdRemove } = ariaDescriptionContext;
  useLayoutEffect(() => {
    onFieldMessageIdAdd(props.name, id());
    return () => onFieldMessageIdRemove(props.name, id());
  });

  return <Primitive.span id={id()} {...rest} ref={props.ref} />;
};

/* -------------------------------------------------------------------------------------------------
 * FormValidityState
 * -----------------------------------------------------------------------------------------------*/

const VALIDITY_STATE_NAME = "FormValidityState";

type FormValidityStateProps = {
  children(validity: ValidityState | undefined): JSX.Element;
  name?: string | undefined;
};

const FormValidityState: Component<ScopedProps<FormValidityStateProps>> = (props) => {
  const validationContext = useValidationContext(VALIDITY_STATE_NAME, props.__scopeForm);
  const fieldContext = useFormFieldContext(VALIDITY_STATE_NAME, props.__scopeForm, {
    optional: true,
  });
  const name = () => props.name ?? fieldContext?.name;
  if (!name()) {
    throw new Error(
      `\`${VALIDITY_STATE_NAME}\` must be used within \`${FIELD_NAME}\` or specify the \`name\` prop`,
    );
  }
  const validity = () => validationContext.getFieldValidity(name()!);
  return <>{props.children(validity())}</>;
};

/* -------------------------------------------------------------------------------------------------
 * FormSubmit
 * -----------------------------------------------------------------------------------------------*/

type FormSubmitProps = PrimitivePropsWithRef<"button">;

const FormSubmit: Component<ScopedProps<FormSubmitProps>> = (props) => {
  const rest = omit(props, "__scopeForm", "ref");
  return <Primitive.button type="submit" {...rest} ref={props.ref} />;
};

/* -----------------------------------------------------------------------------------------------*/

type ValidityStateKey = keyof ValidityState;
type SyncCustomMatcher = (value: string, formData: FormData) => boolean;
type AsyncCustomMatcher = (value: string, formData: FormData) => Promise<boolean>;
type CustomMatcher = SyncCustomMatcher | AsyncCustomMatcher;
type CustomMatcherEntry = { id: string; match: CustomMatcher };
type SyncCustomMatcherEntry = { id: string; match: SyncCustomMatcher };
type AsyncCustomMatcherEntry = { id: string; match: AsyncCustomMatcher };
type CustomMatcherArgs = [string, FormData];

function validityStateToObject(validity: ValidityState) {
  const object: Record<string, boolean> = {};
  for (const key in validity) {
    object[key] = validity[key as ValidityStateKey];
  }
  return object as Record<ValidityStateKey, boolean>;
}

function isHTMLElement(element: unknown): element is HTMLElement {
  return element instanceof HTMLElement;
}

function isFormControl(element: unknown): element is { validity: ValidityState } {
  return typeof element === "object" && element !== null && "validity" in element;
}

function isInvalid(control: HTMLElement) {
  return (
    isFormControl(control) &&
    (control.validity.valid === false || control.getAttribute("aria-invalid") === "true")
  );
}

function getFirstInvalidControl(form: HTMLFormElement): HTMLElement | null {
  const elements = form.elements;
  const [firstInvalidControl] = Array.from(elements).filter(isHTMLElement).filter(isInvalid);
  return firstInvalidControl ?? null;
}

function isAsyncCustomMatcherEntry(
  entry: CustomMatcherEntry,
  args: CustomMatcherArgs,
): entry is AsyncCustomMatcherEntry {
  return entry.match.constructor.name === "AsyncFunction" || returnsPromise(entry.match, args);
}

function isSyncCustomMatcherEntry(entry: CustomMatcherEntry): entry is SyncCustomMatcherEntry {
  return entry.match.constructor.name === "Function";
}

function returnsPromise(func: CustomMatcher, args: CustomMatcherArgs) {
  return func(...args) instanceof Promise;
}

function hasBuiltInError(validity: ValidityState) {
  let error = false;
  for (const validityKey in validity) {
    const key = validityKey as ValidityStateKey;
    if (key !== "valid" && key !== "customError" && validity[key]) {
      error = true;
      break;
    }
  }
  return error;
}

function getValidAttribute(validity: ValidityState | undefined, serverInvalid: boolean) {
  // Stringified: Solid renders a boolean `true` data attribute as `""`,
  // while Radix (React) renders `"true"`.
  if (validity?.valid === true && !serverInvalid) return "true";
  return undefined;
}

function getInvalidAttribute(validity: ValidityState | undefined, serverInvalid: boolean) {
  if (validity?.valid === false || serverInvalid) return "true";
  return undefined;
}

function concatAriaDescribedby(...values: unknown[]): string | undefined {
  const ids = new Set<string>();
  for (const value of values) {
    if (typeof value !== "string") continue;
    for (const id of String(value).trim().split(/\s+/)) {
      if (id) ids.add(id);
    }
  }

  return ids.size > 0 ? Array.from(ids).join(" ") : undefined;
}

/* -----------------------------------------------------------------------------------------------*/

export {
  createFormScope,
  //
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
  FormValidityState,
  FormSubmit,
  //
  Form as Root,
  FormField as Field,
  FormLabel as Label,
  FormControl as Control,
  FormMessage as Message,
  FormValidityState as ValidityState,
  FormSubmit as Submit,
};

export type {
  FormProps,
  FormFieldProps,
  FormLabelProps,
  FormControlProps,
  FormMessageProps,
  FormValidityStateProps,
  FormSubmitProps,
};
