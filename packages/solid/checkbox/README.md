# `@soldix/checkbox`

Checkbox primitive. Port of `@radix-ui/react-checkbox`.

## Differences from Radix

- Context values that change over time (checked state, elements, config) are
  carried as accessors (internal context shape; required for reactivity
  without re-renders).
- "The consumer stopped propagation" is read from the native event's
  `cancelBubble` — Solid handlers receive native events, which have no
  React-style `isPropagationStopped`.
- The bubble input dispatches `click` plus `input`/`change` (Radix dispatches
  only `click`, which React translates into `onChange`). Solid performs no
  such translation, so the form events are dispatched explicitly; ancestor
  and form notification behavior matches Radix exactly.
- The `style` props of the indicator and bubble input are object-only (not
  `string`) so they can merge with internal styles, and bubble sizes are
  emitted as `px` strings (Solid does not append `px` like React does).
