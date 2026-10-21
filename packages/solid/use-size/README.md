# `@solidix/use-size`

Element size observer hook. Port of `@radix-ui/react-use-size`.

Reactive content-size accessor backed by a ResizeObserver; accepts an element or a getter.

## Differences from Radix

- Returns an accessor `() => { width, height } | undefined` instead of a snapshot.
- Accepts an element or a reactive getter.
