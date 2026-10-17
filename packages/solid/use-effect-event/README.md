# `@soldix/use-effect-event`

Effect-event callback wrapper. Port of `@radix-ui/react-use-effect-event`.

## Differences from Radix

- Implemented as a plain closure (same rationale as `@soldix/use-callback-ref`). There is no render-phase call guard: Solid effects track explicitly, so calling the returned function during setup is simply an un-tracked read.
