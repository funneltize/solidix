# `@soldix/alert-dialog`

Alert dialog primitive. Port of `@radix-ui/react-alert-dialog`, composed on
`@soldix/dialog` exactly as Radix composes on its dialog primitive: forced
`modal`, `role="alertdialog"`, autofocus of the cancel action on open, and
unconditional prevention of outside dismissal.

## Differences from Radix

- `class` replaces `className`; `ref` is a plain prop; `asChild` replaces
  Radix's `Slot`/`asChild` composition via `@soldix/slot`.
- `AlertDialogContent` passes `children` through to the dialog content
  unread. Reading `props.children` during setup would instantiate the
  subtree in the setup's owner scope — outside the cancel-ref provider the
  content renders — so `AlertDialogCancel` would miss its context.
- The `style` props are object-only (not `string`), matching `@soldix/dialog`
  and the other portalled primitives.
- Tests asserting the slotted click handlers settle first (`findBy*`), as in
  `@soldix/dialog`: slotted delegated listeners attach once the child is
  connected.
