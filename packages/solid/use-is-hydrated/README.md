# `@solidix/use-is-hydrated`

Hydration-state accessor. Port of `@radix-ui/react-use-is-hydrated`.

Accessor reporting whether the tree has settled on the client (`false` on first client render, `true` once settled).

## Differences from Radix

- Returns an accessor `() => boolean` instead of a boolean snapshot, so consumers stay reactive after hydration flips the value.
