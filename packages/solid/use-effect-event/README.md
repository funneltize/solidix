# `@solidix/use-effect-event`

Effect-event callback wrapper. Port of `@radix-ui/react-use-effect-event`.

Stable wrapper for effect callbacks that must see the latest values without re-subscribing; pass a closure that reads props at call time, never `props.onX` directly.

## Differences from Radix

- Implemented as a plain closure (same rationale as `@solidix/use-callback-ref`). There is no render-phase call guard: Solid effects track explicitly, so calling the returned function during setup is simply an un-tracked read.
