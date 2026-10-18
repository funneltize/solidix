# `@solidix/compose-refs`

Ref composition utilities. Port of `@radix-ui/react-compose-refs`.

## Differences from Radix

- Refs are framework-neutral: a callback `(element) => void` or a `{ current }` object. There is no React 19 ref-cleanup protocol, so returned cleanups are not composed - register unmount work with `onCleanup` instead.
- `useComposedRefs` is a plain call (no `useCallback` equivalent needed); Solid component setup runs once, so the result is inherently stable per instance.
- The composed callback notifies on change only and is nulled on owner disposal. Solid never nulls callback refs natively, so without this React parity (one mount notification, one unmount notification) would not hold; the change guard also absorbs duplicate pushes from nested composition and slot effects so consumers observe exact `[el]` / `[el, null]` / `[el, null, el]` sequences.
