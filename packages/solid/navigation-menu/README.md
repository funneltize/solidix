# `@solidix/navigation-menu`

Navigation menu primitive. Port of `@radix-ui/react-navigation-menu`,
including root/sub menus, automatic/manual activation, the shared viewport
with proxied content, the measuring indicator, keyboard navigation across
triggers and content (roving `FocusGroup`), link selection, and the
focus-outside refinements (#3473) and ref stability (#3963).

## Differences from Radix

- `class` replaces `className`; `ref` is a plain prop; `asChild` composes via
  `@solidix/slot` (including through `Primitive`, which handles `asChild`
  itself).
- Reactive state (`value`, `previousValue`, `viewport`, `indicatorTrack`,
  viewport registry) lives in signals exposed through context as getters;
  static props and callbacks pass through unchanged.
- Composed event handlers wrap the consumer's handler as
  `(event) => callEventHandler(rest.onX, event)` so Solid `[handler, data]`
  tuple handlers keep working.
- `style` props are object-only (not `string`) on the parts that merge base
  styles (`Content`, `Indicator`, `Viewport`), matching the other portalled
  primitives. Style keys follow Solid semantics (kebab-case).
- `ViewportContentMounter` registers once (Solid props never change identity)
  instead of re-registering every render; `NavigationMenuViewportItem`
  recomputes `data-state` from a reactive `isActive` getter so the proxied
  content always carries the current state.
- With `asChild`, the viewport portals the proxied content list into the
  consumer's element. React clones the child with the contents inside, while
  Solidix `Slot` can only move siblings in a deferred effect — which would
  leave `Presence` resolving two top-level elements and break
  exit-animation tracking. The rendered DOM is identical.
- `Presence` now ignores Solid-only resolution artifacts (comment anchors
  from control flow, empty text markers from portals) instead of throwing;
  anything else that is not the single element is still an error. This is
  what lets the gated `Indicator` and the portalled `asChild` viewport
  resolve like their Radix counterparts.
- Uncontrolled `onValueChange` fires from a deferred effect (as in Radix, but
  without React's `act()` flushing), so tests asserting it settle first
  (`vi.waitFor`) or `flush()`, as the select suite does.
- The indicator suite installs a delivering `ResizeObserver` (Radix's shared
  setup fires observations on `observe`; the Solidix setup stub never
  delivers).
- The suite ports all 40 Radix tests and adds two Solidix guards for
  value-switching across two items (plain and `asChild` viewport), which the
  single-item Radix suite never exercises.
