# `@solidix/radio-group`

RadioGroup primitive. Port of `@radix-ui/react-radio-group`.

## Differences from Radix

- Context values that change over time (value, checked state, elements,
  config) are carried as accessors (internal context shape; required for
  reactivity without re-renders).
- "The consumer stopped propagation" is read from the native event's
  `cancelBubble` — Solid handlers receive native events, which have no
  React-style `isPropagationStopped`.
- The bubble input dispatches `click` plus `input`/`change` (Radix dispatches
  only `click`, which React translates into `onChange`). Solid performs no
  such translation, so the form events are dispatched explicitly; ancestor
  and form notification behavior matches Radix exactly.
- The bubble input's `style` prop is object-only (not `string`) so it can
  merge with the control-size styles, and sizes are emitted as `px` strings
  (Solid does not append `px` like React does).
