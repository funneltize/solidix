# `@solidix/context-menu`

Context menu primitive. Port of `@radix-ui/react-context-menu`, composed
on `@solidix/menu` exactly as Radix composes on `@radix-ui/react-menu`.

Solid API mapping: `class` for `className`; `ref` is a plain prop; `asChild` composes via `@solidix/slot` (see the [Composition guide](../../../docs/composition.md)). Docs site: Context Menu page (`#/context-menu` route) with a live demo and API reference.

## Differences from Radix

- `ContextMenuPortal` nests `Presence` _inside_ the portal instead of around
  it (inherited from `@solidix/menu`). Solid portals resolve to a text marker,
  so a `Presence` around the portal cannot resolve (or track for exit
  animations) the portalled content. Consequences: empty portal markers stay
  in the container while closed, and the portal renders its plain wrapper
  `div`. Both are unstyled and inert. The marker nodes are non-elements, so
  `querySelector` and `.children` skip them; only the wrapper `div`
  itself is selectable.
- The `style` prop of `ContextMenuTrigger`, `ContextMenuContent`, and
  `ContextMenuSubContent` is object-only (not `string`) so it can merge with
  the trigger's `-webkit-touch-callout` reset and the re-namespaced content
  custom properties, matching `@solidix/popper`. (React's `style` is
  object-only too.)
- The trigger anchors through a reactive virtual-ref getter instead of a
  recreated ref object: the anchor effect re-runs on every pointer-point
  change, so re-triggering while open re-anchors identically to Radix
  (#2611) with no object churn.
- `class` replaces `className`; `ref` is a plain prop; `asChild` replaces
  Radix's `Slot`/`asChild` composition via `@solidix/slot`.
- Touch long-press (700ms), nested-trigger claiming, the `disabled`
  passthrough to the native context menu, and the dev warning for
  `open={true}` before interaction are ported verbatim.
