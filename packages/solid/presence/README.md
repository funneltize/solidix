# `@solidix/presence`

Presence stays mounted through exit animations. Port of
`@radix-ui/react-presence`.

Stays mounted through exit animations; see the [Animation guide](../../../docs/animation.md) for exit tracking, `forceMount`, and the portal rule.

## Differences from Radix

- `present` accepts a boolean or a reactive getter; pass a getter for values
  that change.
- The child element is resolved directly (Solid creates children eagerly), so
  there is no ref composition and no `useStableComposedRefs` equivalent.
- `usePresence` is internal (as in Radix's public exports) and reports
  `isPresent` as an accessor.
- The React-19 ref-cleanup and concurrent-rendering concerns do not apply;
  otherwise the state machine, animation tracking, and fill-mode flash guard
  are ported verbatim.
- Render-prop children receive `present` as an accessor (not a boolean) so
  the child stays mounted while the value updates; re-invoking per change
  would remount it. Only functions with declared parameters count as render
  props (component children arrive as zero-arg thunks).
- Render-prop children stay mounted while closed once detected (Radix
  `forceMount` parity). Detection is eager from the children descriptor
  without instantiating the subtree, so initially-closed render props
  mount immediately; closed content renders nothing anyway, so the
  difference is invisible.
