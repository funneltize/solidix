# `@solidix/use-layout-effect`

Client-only settled effect. Port of `@radix-ui/react-use-layout-effect`.

## Differences from Radix

- Runs **once** via `onSettled` (there is no dependency array). For reactive post-DOM work, use Solid's `createEffect` with explicit tracking instead of this hook.
- Still a client-only noop on the server, like Radix.
