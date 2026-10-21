# `@solidix/password-toggle-field`

Password toggle field primitive. Port of
`@radix-ui/react-password-toggle-field`, including the controllable
visibility, focus/selection restoration on toggle, form reset/submit
handling, the icon slot, and the aria-label inference.

Solid API mapping: `class` for `className`; `ref` is a plain prop; `asChild` composes via `@solidix/slot` (see the [Composition guide](../../../docs/composition.md)). Docs site: Password Toggle Field page (`#/password-toggle-field` route) with a live demo and API reference.

## Differences from Radix

- `class` replaces `className`; `ref` is a plain prop; `asChild` replaces
  Radix's `Slot`/`asChild` composition via `@solidix/slot`.
- The misspelled `onVisiblityChange` back-compat (including the development
  warning) is ported verbatim.
- No `flushSync` equivalent is needed on toggle: Solid applies the signal
  update synchronously and the `type` attribute flush follows in a
  microtask, ahead of the `requestAnimationFrame` that restores the
  selection - the same ordering Radix relies on.
- React-cased attributes render lowercase (`autocapitalize`, `spellcheck`,
  `autocomplete`, `tabindex`, `for`): Solid outputs `htmlFor`-style props
  literally, which associates nothing.
- The toggle renders the `tabindex` Radix computes but drops, so the button
  is actually unfocusable pre-hydration as intended.
- `id={false}` on the input falls back to the generated input id (the
  toggle links to it via `aria-controls`).
