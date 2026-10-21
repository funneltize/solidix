# `@solidix/tooltip`

Tooltip primitive. Port of `@radix-ui/react-tooltip`.

Solid API mapping: `class` for `className`; `ref` is a plain prop; `asChild` composes via `@solidix/slot` (see the [Composition guide](../../../docs/composition.md)). Docs site: Tooltip page (`#/tooltip` route) with a live demo and API reference.

## Differences from Radix

- `TooltipPortal` nests `Presence` _inside_ the portal instead of around it.
  Solid portals resolve to a text marker, so a `Presence` around the portal
  cannot resolve (or track for exit animations) the portalled content. With
  `Presence` inside, it resolves the content directly. Consequences: empty
  portal markers stay in the container while closed, and the portal renders
  its plain wrapper `div` (it cannot `asChild`-slot onto `Presence`'s
  fragment). Both are unstyled and inert. The marker nodes are non-elements, so
  `querySelector` and `.children` skip them; only the wrapper `div`
  itself is selectable.
- The hoverable content tracks its content node with a signal instead of
  reading `ref.current` during render, so the pointer-grace-area listeners
  attach deterministically. Observable behavior matches.
- `class` replaces `className`; `ref` is a plain prop; `asChild` replaces
  Radix's `Slot`/`asChild` composition via `@solidix/slot`.
