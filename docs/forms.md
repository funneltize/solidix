# Forms

Primitives participate in native forms with no adapter code. The pattern is
the same everywhere: the visible control is custom markup, and a hidden
bubble input mirrors its value so submit, reset, validation, and `FormData`
keep working.

## Bubble inputs

Checkbox, RadioGroup items, Select, Slider, and Switch each render a hidden
input carrying the current value. `name`, `form`, `disabled`, `required`, and
`value`/`defaultValue` flow through to it:

```tsx
<form
  onSubmit={(event) => {
    event.preventDefault();
    console.log(Object.fromEntries(new FormData(event.currentTarget)));
  }}
>
  <Checkbox.Root name="subscribe" value="yes">
    <Checkbox.Indicator>✓</Checkbox.Indicator>
  </Checkbox.Root>
  <button type="submit">Save</button>
</form>
```

Submitting with the box checked yields `{ subscribe: "yes" }`. Unchecked
boxes submit nothing, exactly like a native checkbox. Form reset restores
defaults, and programmatic changes dispatch real `input`/`change` events so
ancestor listeners and frameworks observe them.

`onChange` handlers on the part itself fire only on actual change, and mirror
whatever bubbling decision the originating click made.

## Labels

Associate labels with controls using any native technique:

- Wrap the control: `<Label.Root>First name <input /></Label.Root>`.
- Point at an id: `<Label.Root for="firstName">First name</Label.Root>`.
  Note the native `for` attribute; `htmlFor` would render literally and
  associate nothing.
- Inside `@solidix/solidix/form`, `Form.Label` inside a `Form.Field` wires up
  automatically by field name.

## The Form package

`@solidix/solidix/form` adds validation on top of native controls: constraint
validation tracking, custom sync and async matchers, server-invalid state,
message matching with `aria-describedby` wiring, and focus of the first
invalid control on submit.

```tsx
import { Form } from "@solidix/solidix";

<Form.Root>
  <Form.Field name="email">
    <Form.Label>Email address</Form.Label>
    <Form.Control type="email" required />
    <Form.Message match="valueMissing">Please enter your email.</Form.Message>
    <Form.Message match="typeMismatch">Please provide a valid email.</Form.Message>
  </Form.Field>
  <Form.Submit>Submit</Form.Submit>
</Form.Root>;
```

`Form.Message` renders when its `match` aligns with the field's validity
state; `forceMatch` overrides for server-driven errors. Validity also
surfaces as `data-valid`/`data-invalid` for styling. See the Form API
reference for the matcher vocabulary.

## Controlled values in forms

Controlled and uncontrolled components submit identically: the bubble input
always reflects the resolved value. When controlling a value from a signal,
write the signal in the change handler and the next submit picks it up. See
the [State management](./state.md) guide for the ownership pattern.
