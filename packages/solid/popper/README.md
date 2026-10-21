# `@solidix/popper`

Positioning primitives. Port of `@radix-ui/react-popper`.

Solid API mapping: `class` for `className`; `ref` is a plain prop; `asChild` composes via `@solidix/slot` (see the [Composition guide](../../../docs/composition.md)).

## Differences from Radix

- Built on the framework-agnostic `@floating-ui/dom` (`computePosition` +
  `autoUpdate`) instead of `@floating-ui/react-dom`'s `useFloating` hook.
  Middleware, update strategies, CSS variables, and data attributes all match.
- The popper/content contexts carry changing values (anchor, placement,
  arrow coordinates) as accessors - an internal shape change required for
  reactivity without re-renders.
- `PopperAnchor`'s `virtualRef` additionally accepts a reactive getter; plain
  ref objects sync once settled.
- Styles that Radix passes as numbers (`left`/`top` arrow offsets) are
  emitted as `px` strings - Solid does not append `px` like React does.
- `PopperContent`'s `style` prop is object-only so it can merge with the
  positioning styles.
- `data-radix-popper-side` / `data-radix-popper-align` /
  `data-radix-popper-content-wrapper` are kept verbatim.
