# `@solidix/use-layout-effect`

Client-only settled effect. Port of `@radix-ui/react-use-layout-effect`.

Runs once when the component settles, client-side only (a server noop); intentionally not reactive - use `createEffect` for dependency-driven work.

## Differences from Radix

- Runs **once** via `onSettled` (there is no dependency array). For reactive post-DOM work, use Solid's `createEffect` with explicit tracking instead of this hook.
- Still a client-only noop on the server, like Radix.
