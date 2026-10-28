import { omit, type Component } from "solid-js";
import { Form as FormPrimitive, type FormProps as FormPrimitiveProps } from "@solidix/form";
import { cx } from "../../helpers/cx";

/**
 * Props for the styled `Form` element: the Solidix form primitive props
 * (`onClearServerErrors` included) with `class` appended after `fui-FormRoot`.
 *
 * Deviation from upstream: frosted-ui's `Form` is a Base UI `Form` with an
 * `errors` map, an `actionsRef` exposing `validate()`, a `validationMode`
 * prop, and `onFormSubmit(values, eventDetails)`. The Solidix form primitive
 * is Radix-style (native-validity driven, no Base UI validation contract), so
 * this wrapper keeps the primitive's API and only adds the `fui-FormRoot`
 * class. Upstream source: `packages/frosted-ui/src/components/form/form.tsx`
 * at commit 56787900bfe0.
 */
interface FormProps extends FormPrimitiveProps {}

/**
 * Styled form root. Renders the Solidix `Form` primitive with the
 * `fui-FormRoot` class; all behavior (submit handling, server-error clearing)
 * comes from the primitive.
 */
const Form: Component<FormProps> = (props) => {
  const rest = omit(props, "class");

  return <FormPrimitive {...rest} class={cx("fui-FormRoot", props.class)} />;
};

export { Form };
export type { FormProps };
