# `@soldix/hover-card`

HoverCard primitive. Port of `@radix-ui/react-hover-card`.

## Differences from Radix

- `HoverCardPortal` nests `Presence` _inside_ the portal instead of around it.
  Solid portals resolve to a text marker, so a `Presence` around the portal
  cannot resolve (or track for exit animations) the portalled content. With
  `Presence` inside, it resolves the content directly. Consequences: empty
  portal markers stay in the container while closed, and the portal renders
  its plain wrapper `div` (it cannot `asChild`-slot onto `Presence`'s
  fragment). Both are unstyled and inert.
- The tabbable-stripping pass (Radix runs it after every render) runs when
  the content node sets. Content children are static in practice; dynamically
  added tabbables would keep their tab order until the node swaps.
- `class` replaces `className`; `ref` is a plain prop; `asChild` replaces
  Radix's `Slot`/`asChild` composition via `@soldix/slot`.
