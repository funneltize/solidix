# `@soldix/toolbar`

Toolbar primitive. Port of `@radix-ui/react-toolbar`, composed on
`@soldix/roving-focus`, `@soldix/separator`, and `@soldix/toggle-group`
exactly as Radix composes on its counterparts.

## Differences from Radix

- `class` replaces `className`; `ref` is a plain prop; `asChild` replaces
  Radix's `Slot`/`asChild` composition via `@soldix/slot`.
- The `ToolbarLink` Space-activation guard
  (`event.target !== event.currentTarget`, #3232) is ported verbatim, so
  Space typed into a portaled focusable descendant does not click the link.
