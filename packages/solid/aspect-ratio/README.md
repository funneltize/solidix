# `@solidix/aspect-ratio`

AspectRatio primitive. Port of `@radix-ui/react-aspect-ratio`.

Solid API mapping: `class` for `className`; `ref` is a plain prop; `asChild` composes via `@solidix/slot` (see the [Composition guide](../../../docs/composition.md)). Docs site: Aspect Ratio page (`#/aspect-ratio` route) with a live demo and API reference.

## Differences from Radix

- The `style` prop is object-only (not `string`) so it can merge with the
  ratio-positioning styles, matching `@solidix/popper` and
  `@solidix/visually-hidden`.
