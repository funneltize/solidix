# `@solidix/announce`

Announce primitive. Port of `@radix-ui/react-announce`.

Solid API mapping: `class` for `className`; `ref` is a plain prop; `asChild` composes via `@solidix/slot` (see the [Composition guide](../../../docs/composition.md)). Import from the subpath (`@solidix/solidix/announce`); like `radix-ui`, the umbrella does not re-export it. Docs site: Announce page (`#/announce` route) with a live demo and API reference.

## Differences from Radix

- React renders the same `children` descriptor both visibly and inside the
  live region; Solid children are live DOM nodes, which can only be mounted
  once. The live region therefore renders a clone of the visible content and
  re-syncs it through a `MutationObserver`, so dynamic updates keep working.
  The public API, region sharing, and visibility silencing all match.
- `aria-atomic` also accepts the `"true"`/`"false"` strings (Solid's DOM types
  only know the string form); booleans render identically to Radix.
