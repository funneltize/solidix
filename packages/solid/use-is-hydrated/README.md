# `@soldix/use-is-hydrated`

Hydration-state accessor. Port of `@radix-ui/react-use-is-hydrated`.

## Differences from Radix

- Returns an accessor `() => boolean` instead of a boolean snapshot, so consumers stay reactive after hydration flips the value.
