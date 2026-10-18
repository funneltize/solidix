# `@solidix/context`

Context factories with scopes. Port of `@radix-ui/react-context`.

## Differences from Radix

- Built on Solid's `createContext`/`useContext`. Provider values are reactive proxies, so object values stay live through property reads (no memoization step needed).
- No `displayName` assignments - Solid has no such convention.
- Scope objects are plain objects (no `useMemo`).
