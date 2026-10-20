# `@solidix/direction`

Direction provider and hook. Port of `@radix-ui/react-direction`.

## Differences from Radix

- The provided `dir` is read when consumers are created; changing `dir` at
  runtime after mount is not observed, where Radix would re-render consumers.
  Set it once at the app root.
