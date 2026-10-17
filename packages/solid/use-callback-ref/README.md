# `@soldix/use-callback-ref`

Stable callback wrapper. Port of `@radix-ui/react-use-callback-ref`.

## Differences from Radix

- Implemented as a plain closure: Solid has no stale-closure problem for inline callbacks (reactive state is read lazily at call time), so no ref syncing is needed.
- Edge case: if the callback _identity itself_ is swapped after setup (e.g. a conditional prop), the wrapper keeps calling the original. Pass a stable inline closure instead.
