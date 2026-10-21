# `@solidix/direction`

Direction provider and hook. Port of `@radix-ui/react-direction`.

Text-direction provider and hook consumed by slider and other directional parts.

## Differences from Radix

- The provided `dir` is read when consumers are created; changing `dir` at
  runtime after mount is not observed, where Radix would re-render consumers.
  Set it once at the app root.
