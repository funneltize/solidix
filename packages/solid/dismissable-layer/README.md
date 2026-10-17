# `@soldix/dismissable-layer`

Dismissable layer with outside interaction. Port of
`@radix-ui/react-dismissable-layer`.

## Differences from Radix

- Layer-stack updates (which Radix pushes through a `force({})` re-render)
  flow through a version signal that computations subscribe to.
- Solid JSX has no `onXCapture` props, so the focus/blur/pointerdown capture
  listeners are attached manually and composed with the (explicitly declared)
  `onFocusCapture`/`onBlurCapture`/`onPointerDownCapture` props.
- `ownerDocument` and `deferPointerDownOutside` are read reactively, so
  iframe-hosted layers re-subscribe correctly.
- Pointer/focus outside detection, dismissal ordering, interception, and the
  iOS Safari affordances are otherwise ported verbatim.
