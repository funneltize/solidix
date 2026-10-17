# `@soldix/avatar`

Avatar primitive. Port of `@radix-ui/react-avatar`.

## Differences from Radix

- `Avatar.Image` accepts lowercase `crossorigin`/`referrerpolicy` props, matching
  Solid JSX rather than React's camelCase DOM props. The values are forwarded
  both to the rendered `<img>` and to the preload image, as in Radix.
- SSR/hydration tests from Radix are not ported yet; Solid 2's SSR story is
  still being validated (see the root `AGENTS.md`).
