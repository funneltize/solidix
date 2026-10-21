# `@solidix/menubar`

Menubar primitive. Port of `@radix-ui/react-menubar`, composed on
`@solidix/menu` exactly as Radix composes on `@radix-ui/react-menu`, with a
horizontal `@solidix/roving-focus` group over a `@solidix/collection` of
triggers.

Solid API mapping: `class` for `className`; `ref` is a plain prop; `asChild` composes via `@solidix/slot` (see the [Composition guide](../../../docs/composition.md)). Docs site: Menubar page (`#/menubar` route) with a live demo and API reference.

## Differences from Radix

- `MenubarPortal` nests `Presence` _inside_ the portal instead of around it
  (inherited from `@solidix/menu`). Solid portals resolve to a text marker,
  so a `Presence` around the portal cannot resolve (or track for exit
  animations) the portalled content. Consequences: empty portal markers stay
  in the container while closed, and the portal renders its plain wrapper
  `div`. Both are unstyled and inert. The marker nodes are non-elements, so
  `querySelector` and `.children` skip them; only the wrapper `div`
  itself is selectable.
- The `style` prop of `MenubarContent`/`MenubarSubContent` is object-only
  (not `string`) so it can merge with the re-namespaced content custom
  properties, matching `@solidix/popper`.
- `class` replaces `className`; `ref` is a plain prop; `asChild` replaces
  Radix's `Slot`/`asChild` composition via `@solidix/slot`.
- `MenubarMenu` drops Radix's `'LEGACY_REACT_AUTO_VALUE'` fallback: it only
  exists because React's `useId` returns an empty string on the first render
  (SSR), while Solid's `useId` is synchronous and never empty.
- `aria-expanded` on the trigger is normalized through `ariaBoolean`
  (Radix passes a raw boolean; Solid would render `true` as `""`).
