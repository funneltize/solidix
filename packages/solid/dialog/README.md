# `@soldix/dialog`

Dialog primitive. Port of `@radix-ui/react-dialog`, including the modal
`hideOthers` behavior, nested/overlapping-modal handling (#4035, #3645), the
slotted-content regression (#4077), and the iOS overlay tap handling.

## Differences from Radix

- `class` replaces `className`; `ref` is a plain prop; `asChild` replaces
  Radix's `Slot`/`asChild` composition via `@soldix/slot`.
- Each `DialogPortal` child gets its own portal, matching Radix's
  `Children.map` behavior for `Overlay`/`Content` siblings.
- The modal `hideOthers` call waits until the content node is connected
  (`afterConnected` from `@soldix/compose-refs`). Solid calls `ref` at
  element creation — before portal insertion adopts the node — and slotted
  children resolve lazily, so a set ref does not imply a connected node.
  Before adoption a template-cloned node's `ownerDocument` can even point at
  a detached template-contents document whose `body` is `null`. Running
  synchronously when already connected keeps the common path timing
  unchanged; otherwise the insertion mutation triggers setup.
- `hideOthers`/`inertOthers` (in `@soldix/primitive`) no-op instead of
  crashing when given an unusable parent node. Radix never passes one (its
  `useLayoutEffect` always runs post-insertion); this is Soldix hardening
  for the timing above.
- `id={false}` normalizes to `undefined` internally (`toValidId`), and
  `aria-describedby` concatenation accepts `unknown` values like
  `@soldix/popover`, since Solid attribute types admit `false`.
- The `style` props are object-only (not `string`), matching `@soldix/popper`
  and the other portalled primitives.
- Modal `body` pointer-events locking and document listener registration in
  `@soldix/dismissable-layer`, and delegated-event listener attachment in
  `@soldix/slot`, use the same connect-then-setup rule. Tests asserting lock
  state, outside dismissal, or slotted delegated handlers must therefore
  settle first (`findBy*`/`vi.waitFor`), as the dialog suite does.
