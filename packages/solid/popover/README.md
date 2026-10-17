# `@soldix/popover`

Popover primitive. Port of `@radix-ui/react-popover`.

## Differences from Radix

- `PopoverPortal` nests `Presence` _inside_ the portal instead of around it.
  Solid portals resolve to a text marker, so a `Presence` around the portal
  cannot resolve (or track for exit animations) the portalled content. With
  `Presence` inside, it resolves the content directly. Consequences: empty
  portal markers stay in the container while closed, and the portal renders
  its plain wrapper `div` (it cannot `asChild`-slot onto `Presence`'s
  fragment). Both are unstyled and inert.
- The `style` prop of `PopoverContent` is object-only (not `string`) so it can
  merge with the re-namespaced content custom properties, matching
  `@soldix/popper` and `@soldix/visually-hidden`.
- `class` replaces `className`; `ref` is a plain prop; `asChild` replaces
  Radix's `Slot`/`asChild` composition via `@soldix/slot`.
