# `@solidix/label`

Label primitive. Port of `@radix-ui/react-label`.

Solid API mapping: `class` for `className`; `ref` is a plain prop; `asChild` composes via `@solidix/slot` (see the [Composition guide](../../../docs/composition.md)). Docs site: Label page (`#/label` route) with a live demo and API reference.

## Differences from Radix

- Association uses the native `for` attribute, not Radix's `htmlFor` prop:
  Solid would render `htmlFor` literally as `htmlfor`, which associates
  nothing. (`Form.Label` still accepts `htmlFor` and renders it as `for`.)
