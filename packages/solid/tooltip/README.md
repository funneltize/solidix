# `@soldix/tooltip`

Tooltip primitive. Port of `@radix-ui/react-tooltip`.

## Differences from Radix

- `TooltipPortal` nests `Presence` _inside_ the portal instead of around it.
  Solid portals resolve to a text marker, so a `Presence` around the portal
  cannot resolve (or track for exit animations) the portalled content. With
  `Presence` inside, it resolves the content directly. Consequences: empty
  portal markers stay in the container while closed, and the portal renders
  its plain wrapper `div` (it cannot `asChild`-slot onto `Presence`'s
  fragment). Both are unstyled and inert.
- The hoverable content tracks its content node with a signal instead of
  reading `ref.current` during render, so the pointer-grace-area listeners
  attach deterministically. Observable behavior matches.
- `class` replaces `className`; `ref` is a plain prop; `asChild` replaces
  Radix's `Slot`/`asChild` composition via `@soldix/slot`.
