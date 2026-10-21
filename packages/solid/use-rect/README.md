# `@solidix/use-rect`

Element rect observer hook. Port of `@radix-ui/react-use-rect`.

Reactive `getBoundingClientRect` accessor; accepts an element (or measurable) or a getter, and re-measures over time.

## Differences from Radix

- Returns an accessor `() => DOMRect | undefined` instead of a snapshot.
- Accepts a measurable or a reactive getter.
