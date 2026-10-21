# `@solidix/accordion`

Accordion primitive. Port of `@radix-ui/react-accordion`.

Solid API mapping: `class` for `className`; `ref` is a plain prop; `asChild` composes via `@solidix/slot` (see the [Composition guide](../../../docs/composition.md)). Docs site: Accordion page (`#/accordion` route) with a live demo and API reference.

## Differences from Radix

- `AccordionTrigger` renders `aria-disabled="true"` (string) instead of a boolean
  `true`, because Solid renders boolean `aria-*` values as empty strings; the
  attribute is still absent when the trigger is not disabled.
- The unused root ref object Radix composes internally is dropped; `ref` is
  forwarded directly to the rendered element.
- Radix tests covering React-only concurrency (`Suspense` boundaries,
  `Activity`, `startTransition`) are not ported: this Solid 2 RC exposes no
  equivalent primitives. Item mount/unmount/reorder/disabled coverage uses
  signals with `<For>` instead.
