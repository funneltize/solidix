# `@solidix/tabs`

Tabs primitive. Port of `@radix-ui/react-tabs`.

Solid API mapping: `class` for `className`; `ref` is a plain prop; `asChild` composes via `@solidix/slot` (see the [Composition guide](../../../docs/composition.md)). Docs site: Tabs page (`#/tabs` route) with a live demo and API reference.

## Differences from Radix

- The `style` prop of `TabsContent` is object-only (not `string`) so it can
  merge with the mount-animation guard, matching `@solidix/popper` and
  `@solidix/visually-hidden`.
- Internally, `Presence` reports its state to the content through an accessor
  (see `@solidix/presence`); the rendered output and animation contract match.
