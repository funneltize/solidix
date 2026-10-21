# `@solidix/slot`

Props-slotting components. Port of `@radix-ui/react-slot`.

This package is the `asChild` mechanism every primitive composes through; see the [Composition guide](../../../docs/composition.md).

## Differences from Radix

Solid has no `cloneElement`, so `Slot` works imperatively: it resolves its
already-created child element and applies slot props to it (attributes,
composed event listeners, merged `class`/`style`, concatenated
`aria-describedby`), keeping them in sync reactively with cleanup. Merge
semantics match Radix (`mergeProps`): child props win, handlers compose with
the child first.

Notes and edges:

- React-only concerns are gone: no `React.lazy`/`use` unwrapping, no
  fragment-ref special case.
- DOM **properties** (`id`, `tabindex`, …) are set only when currently falsy
  (best-effort child-wins, since an explicitly-set falsy value is
  indistinguishable from unset); plain attributes are set only when absent.
- Style objects accept both `camelCase` (IDL assignment) and `kebab-case`
  (`setProperty`, matching Solid's style conventions) keys.
- `Slottable`'s render-prop form receives the target's live child nodes and
  returns replacement children.
- Non-element siblings of a `Slottable` target (raw text) are left in place
  rather than moved inside.
- For events Solid delegates to the document, slot handlers attach at the
  document (after the delegation master) so the child's handler still runs
  first.
- During SSR, children render through unmodified (no DOM to slot onto).
