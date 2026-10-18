# `@solidix/select`

Select primitive. Port of `@radix-ui/react-select`, including both
`position="item-aligned"` and `position="popper"` content, the detached
fragment that keeps items mounted while closed, typeahead on the trigger and
in the content, the clear (empty-value) item (#2706), form reset, the
narrowed-handler bivariance (#4197), keys from focusable descendants (#3232),
ref stability (#3963), and the full bubble-input change matrix (#4102).

## Differences from Radix

- `class` replaces `className`; `ref` is a plain prop; `asChild` composes via
  `@solidix/slot`.
- Reactive state (`open`, `value`, `userSelection`, `trigger`, `valueNode`,
  content/viewport/selected nodes, `nativeOptions`) lives in signals exposed
  through context as getters; static props and callbacks pass through
  unchanged.
- Like `@solidix/dialog`, the modal `hideOthers` call, `DismissableLayer`
  setup, and `Slot` delegated-listener attachment all wait until the content
  node is connected (`afterConnected`). Tests asserting content presence,
  focus, or the scroll buttons therefore settle first (`vi.waitFor`), as the
  select suite does.
- Composed event handlers wrap the consumer's handler as
  `(event) => callEventHandler(rest.onX, event)` so Solid `[handler, data]`
  tuple handlers keep working; `event.cancelBubble` stands in for React's
  `event.isPropagationStopped()` (same as checkbox/radio/switch).
- `SelectContent` renders `SelectItemAlignedPosition`/`SelectPopperPosition`
  as two typed branches (no `Dynamic`), and silently drops popper-only props
  for `item-aligned` exactly like Radix.
- `SelectViewport`'s scrollbar-hiding `<style>` renders its CSS as a text
  child instead of `dangerouslySetInnerHTML`.
- Native options are collected as data (`{ value, disabled, text }`, where
  `text` is a getter) instead of React `<option>` elements; the bubble input
  renders the `<option>` elements itself. Registration effects return their
  cleanup (the house pattern — `onCleanup` inside two-arg effect callbacks
  does not scope to the effect).
- The keyed `select` remount uses a single-item `For` (Solid 2 has no `Key`),
  and the initial value is applied by a post-insertion effect rather than
  `defaultValue` (which Solid JSX lacks for `select`): refs fire before
  `<option>` children are inserted, so a ref-time set never matches and
  insertion then auto-selects the first option. The effect re-applies on
  every options rebuild; plain `.value` assignment dispatches no event, so
  it never double-fires with the bubble dispatch.
- `SelectItemText` portals string children into the value node; element
  children are the same instances Solid already mounted in the item, so rich
  item text moves to the value node instead of appearing in both places.
  Plain-text items (the documented use) match Radix exactly.
- Item `textValue` is passed to the legacy collection as a getter (new
  supported shape — plain values behave exactly as before), because the DOM
  text is only readable after mount. `SelectItemText` additionally re-syncs
  the text once settled, since ref-time `textContent` reads are empty.
- `Presence` now mounts render-prop children while initially closed (Radix
  `forceMount` parity), detected eagerly from the children descriptor
  without instantiating the subtree. Element children are unaffected. This
  is what keeps select items mounted (and typeahead working) while closed.
- Decorative parts (`Icon`, `ItemIndicator`, `Separator`, scroll buttons,
  bubble input) omit a consumer `aria-hidden` and always render
  `aria-hidden="true"`.
- `style` props are object-only (not `string`), matching the other portalled
  primitives.
- The React-`startTransition` bubble test is covered as microtask-deferred
  application instead — Solid 2 has no transition API.
- The suite keeps Radix's four `it.todo` placeholders (`BubbleInput`
  `asChild`, `Value` class/style and `asChild`, `ItemText` class/style).
