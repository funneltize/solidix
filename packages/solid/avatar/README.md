# `@solidix/avatar`

Avatar primitive. Port of `@radix-ui/react-avatar`.

Solid API mapping: `class` for `className`; `ref` is a plain prop; `asChild` composes via `@solidix/slot` (see the [Composition guide](../../../docs/composition.md)). Docs site: Avatar page (`#/avatar` route) with a live demo and API reference.

## Differences from Radix

- `Avatar.Image` accepts lowercase `crossorigin`/`referrerpolicy` props, matching
  Solid JSX rather than React's camelCase DOM props. The values are forwarded
  both to the rendered `<img>` and to the preload image, as in Radix.
- SSR/hydration tests from Radix are not ported yet; Solid 2's SSR story is
  still being validated (see the root `AGENTS.md`).
