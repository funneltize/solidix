# `@solidix/toolbar`

Toolbar primitive. Port of `@radix-ui/react-toolbar`, composed on
`@solidix/roving-focus`, `@solidix/separator`, and `@solidix/toggle-group`
exactly as Radix composes on its counterparts.

Solid API mapping: `class` for `className`; `ref` is a plain prop; `asChild` composes via `@solidix/slot` (see the [Composition guide](../../../docs/composition.md)). Docs site: Toolbar page (`#/toolbar` route) with a live demo and API reference.

## Differences from Radix

- The `ToolbarLink` Space-activation guard
  (`event.target !== event.currentTarget`, #3232) is ported verbatim, so
  Space typed into a portaled focusable descendant does not click the link.
