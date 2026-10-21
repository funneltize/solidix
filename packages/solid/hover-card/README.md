# `@solidix/hover-card`

HoverCard primitive. Port of `@radix-ui/react-hover-card`.

Solid API mapping: `class` for `className`; `ref` is a plain prop; `asChild` composes via `@solidix/slot` (see the [Composition guide](../../../docs/composition.md)). Docs site: Hover Card page (`#/hover-card` route) with a live demo and API reference.

## Differences from Radix

- `HoverCardPortal` nests `Presence` _inside_ the portal instead of around it.
  Solid portals resolve to a text marker, so a `Presence` around the portal
  cannot resolve (or track for exit animations) the portalled content. With
  `Presence` inside, it resolves the content directly. Consequences: empty
  portal markers stay in the container while closed, and the portal renders
  its plain wrapper `div` (it cannot `asChild`-slot onto `Presence`'s
  fragment). Both are unstyled and inert. The marker nodes are non-elements, so
  `querySelector` and `.children` skip them; only the wrapper `div`
  itself is selectable.
- The tabbable-stripping pass (Radix runs it after every render) runs when
  the content node sets. Content children are static in practice; dynamically
  added tabbables would keep their tab order until the node swaps.
- `class` replaces `className`; `ref` is a plain prop; `asChild` replaces
  Radix's `Slot`/`asChild` composition via `@solidix/slot`.
