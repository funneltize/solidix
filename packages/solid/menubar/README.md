# `@soldix/menubar`

Menubar primitive. Port of `@radix-ui/react-menubar`, composed on
`@soldix/menu` exactly as Radix composes on `@radix-ui/react-menu`, with a
horizontal `@soldix/roving-focus` group over a `@soldix/collection` of
triggers.

## Differences from Radix

- `MenubarPortal` nests `Presence` _inside_ the portal instead of around it
  (inherited from `@soldix/menu`). Solid portals resolve to a text marker,
  so a `Presence` around the portal cannot resolve (or track for exit
  animations) the portalled content. Consequences: empty portal markers stay
  in the container while closed, and the portal renders its plain wrapper
  `div`. Both are unstyled and inert.
- The `style` prop of `MenubarContent`/`MenubarSubContent` is object-only
  (not `string`) so it can merge with the re-namespaced content custom
  properties, matching `@soldix/popper`.
- `class` replaces `className`; `ref` is a plain prop; `asChild` replaces
  Radix's `Slot`/`asChild` composition via `@soldix/slot`.
- `MenubarMenu` drops Radix's `'LEGACY_REACT_AUTO_VALUE'` fallback: it only
  exists because React's `useId` returns an empty string on the first render
  (SSR), while Solid's `useId` is synchronous and never empty.
- `aria-expanded` on the trigger is normalized through `ariaBoolean`
  (Radix passes a raw boolean; Solid would render `true` as `""`).
