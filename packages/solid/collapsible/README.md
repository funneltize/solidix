# `@solidix/collapsible`

Collapsible primitive. Port of `@radix-ui/react-collapsible`.

Solid API mapping: `class` for `className`; `ref` is a plain prop; `asChild` composes via `@solidix/slot` (see the [Composition guide](../../../docs/composition.md)). Docs site: Collapsible page (`#/collapsible` route) with a live demo and API reference.

## Differences from Radix

- The `style` prop of `CollapsibleContent` is object-only (not `string`) so
  it can merge with the measured `--radix-collapsible-content-*` variables,
  matching `@solidix/popper` and `@solidix/visually-hidden`.
- Internally, `Presence` reports its state to the content through an accessor
  (see `@solidix/presence`); the rendered output and animation contract match.
