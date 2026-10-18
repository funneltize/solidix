# `@solidix/toast`

Toast primitive. Port of `@radix-ui/react-toast`, including the viewport
focus management (hotkey, focus proxies, programmed tab order), pause/resume
timers, swipe gestures, screen-reader announcements, and the escape
regressions (#2906, #2233, #3963, #3703).

## Differences from Radix

- `class` replaces `className`; `ref` is a plain prop; `asChild` replaces
  Radix's `Slot`/`asChild` composition via `@solidix/slot`.
- The toast `li` is portalled directly into the viewport `ol` (no
  `@solidix/portal` wrapper), so it stays a direct list child exactly like
  Radix. The announcer keeps the plain wrapper `div` (as in
  `@solidix/popover`); it is unstyled and inert.
- Timers, pause/resume bookkeeping, swipe math, and announcement text
  collection are ported verbatim. Solid has no synthetic events, so the
  `Escape` self-close reads the native event directly.
- The provider publishes viewport/count updates directly instead of as
  React transitions: this Solid RC has no `startTransition`, and its
  Suspense-hydration test (#3301) has no port.
- The `style` prop of `Toast` is object-only (not `string`), matching the
  other portalled primitives.
- Tests asserting portalled content or slotted delegated handlers settle
  first (`findBy*`/`vi.waitFor`), as in `@solidix/dialog`.
