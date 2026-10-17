# `@soldix/tabs`

Tabs primitive. Port of `@radix-ui/react-tabs`.

## Differences from Radix

- The `style` prop of `TabsContent` is object-only (not `string`) so it can
  merge with the mount-animation guard, matching `@soldix/popper` and
  `@soldix/visually-hidden`.
- Internally, `Presence` reports its state to the content through an accessor
  (see `@soldix/presence`); the rendered output and animation contract match.
