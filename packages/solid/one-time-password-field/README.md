# `@soldix/one-time-password-field`

One-time-password field primitive. Port of
`@radix-ui/react-one-time-password-field`, including per-character inputs
with roving focus, validation/sanitization, paste distribution, backspace
navigation, auto-submit, form reset, and the aggregated hidden input.

## Differences from Radix

- `class` replaces `className`; `ref` is a plain prop; `asChild` replaces
  Radix's `Slot`/`asChild` composition via `@soldix/slot`.
- React's `onChange` fires per keystroke (it listens to the native `input`
  event); Solid's `onChange` is the native `change` event (blur/Enter). The
  per-keystroke logic therefore lives on `onInput`, with the consumer's
  `onChange` composed in for React parity.
- Signal reads are always fresh, so `dispatch` needs no `latestValueRef`
  and `flushSync` has no equivalent: writes apply synchronously and the DOM
  flush follows in a microtask, ahead of focus work.
- React-cased attributes render lowercase (`autocomplete`, `inputmode`,
  `maxlength`, `readonly`): Solid JSX only defines the lowercase spellings.
  `autoSave` (absent from Solid's JSX types) is set imperatively.
- The root reads its collection state tuple directly instead of consuming
  the collection context it renders.
