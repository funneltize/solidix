# `@soldix/use-rect`

Element rect observer hook. Port of `@radix-ui/react-use-rect`.

## Differences from Radix

- Returns an accessor `() => DOMRect | undefined` instead of a snapshot.
- Accepts a measurable or a reactive getter.
