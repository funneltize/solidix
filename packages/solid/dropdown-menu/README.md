# `@soldix/dropdown-menu`

Dropdown menu primitive. Port of `@radix-ui/react-dropdown-menu`, composed
on `@soldix/menu` exactly as Radix composes on `@radix-ui/react-menu`.

## Differences from Radix

- `DropdownMenuPortal` nests `Presence` _inside_ the portal instead of around
  it (inherited from `@soldix/menu`). Solid portals resolve to a text marker,
  so a `Presence` around the portal cannot resolve (or track for exit
  animations) the portalled content. Consequences: empty portal markers stay
  in the container while closed, and the portal renders its plain wrapper
  `div`. Both are unstyled and inert.
- The `style` prop of `DropdownMenuContent`/`DropdownMenuSubContent` is
  object-only (not `string`) so it can merge with the re-namespaced content
  custom properties, matching `@soldix/popper`.
- `class` replaces `className`; `ref` is a plain prop; `asChild` replaces
  Radix's `Slot`/`asChild` composition via `@soldix/slot`.
- Radix quirks preserved for parity: a user `id` on the content wins on the
  element while the trigger keeps pointing at the root-minted context id,
  and `Tab` is prevented inside menus (menus are not Tab-navigated).
- `DropdownMenuSub` accepts an optional `defaultOpen` for uncontrolled use.
  Radix's submenus are controlled-only (`open`/`onOpenChange`); the
  controlled props behave identically here.
