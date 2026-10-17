# `@soldix/focus-scope`

Focus trapping and looping. Port of `@radix-ui/react-focus-scope`.

## Differences from Radix

- Container, branch, and callback state use signals and lazy prop reads
  instead of refs; there are no render-phase concerns.
- `useFocusScopeBranchRegistry().nodes` is an accessor; call it to read the
  current branch list.
- `useFocusScopeBranch` accepts an element or a reactive getter.
- Trap/autofocus subscription lifecycles map 1:1 onto split effects
  (compute tracks, apply subscribes with cleanup).
