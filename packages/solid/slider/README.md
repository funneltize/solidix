# `@soldix/slider`

Slider primitive. Port of `@radix-ui/react-slider`.

## Differences from Radix

- Thumb membership uses the new (`unstable_`) collection instead of the legacy
  one Radix uses: legacy membership is only visible through a render-churned
  getter, which has no Solid equivalent, while the new collection's registry
  is populated synchronously by ref callbacks with a reactive membership
  signal. Observable behavior (thumb index, keyboard nav, drag) matches.
- `Slider.BubbleInput` remounts via `<Show keyed>` when the thumb index
  changes, replacing React's `key={index}`; `defaultValue` stays in sync the
  same way.
- The bubble input dispatches a bubbling `change` event alongside the `input`
  event: Solid does not synthesize `onChange` from `input` events the way
  React does, and Radix notifies forms of programmatic changes too. Ancestor
  `onInput` handlers still observe only user-driven changes.
- `aria-disabled` on the root renders the string `"true"` (Solid renders
  boolean `aria-*` values as empty strings); the attribute is still absent
  when enabled.
- The horizontal orientation resolves its slider element through a ref object
  instead of React state; the unused range ref object Radix composes
  internally is dropped. Both are behaviorally invisible.
- Radix tests covering React-only concurrency (`startTransition`) and render
  counting (`React.Profiler`) are not ported. The no-op-move behavior the
  Profiler test guards is covered by asserting the value and `onValueChange`
  stay untouched instead.
- Value mutations drain the reactive queue synchronously (`flush()`), so
  gestures dispatched as back-to-back synchronous events observe each step,
  matching Radix-under-`act()` semantics despite Solid 2's microtask batching.
