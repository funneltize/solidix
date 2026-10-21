# `@solidix/menu`

Menu primitive. Port of `@radix-ui/react-menu`. This is the shared
foundation that `@solidix/dropdown-menu`, `@solidix/context-menu`, and
`@solidix/menubar` compose on, exactly as in Radix.

Solid API mapping: `class` for `className`; `ref` is a plain prop; `asChild` composes via `@solidix/slot` (see the [Composition guide](../../../docs/composition.md)).

## Differences from Radix

- `MenuPortal` nests `Presence` _inside_ the portal instead of around it.
  Solid portals resolve to a text marker, so a `Presence` around the portal
  cannot resolve (or track for exit animations) the portalled content. With
  `Presence` inside, it resolves the content directly. Consequences: empty
  portal markers stay in the container while closed, and the portal renders
  its plain wrapper `div` (it cannot `asChild`-slot onto `Presence`'s
  fragment). Both are unstyled and inert. The marker nodes are non-elements, so
  `querySelector` and `.children` skip them; only the wrapper `div`
  itself is selectable.
- The `style` prop of `MenuContent`/`MenuSubContent` is object-only (not
  `string`) so it can merge with the re-namespaced content custom
  properties, matching `@solidix/popper`.
- `class` replaces `className`; `ref` is a plain prop; `asChild` replaces
  Radix's `Slot`/`asChild` composition via `@solidix/slot`.
- Typeahead resolves item labels from the live DOM at match time (an
  explicit `textValue` prop still wins): Solid props freeze at setup and
  cannot pick up the post-mount `.textContent` sync the way Radix's
  re-render does. Matching behavior is identical.
