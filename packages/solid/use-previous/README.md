# `@solidix/use-previous`

Previous-value accessor. Port of `@radix-ui/react-use-previous`.

Accessor holding the previous value; accepts a plain value or a reactive getter (pass a getter for values that change over time).

## Differences from Radix

- Returns an accessor `() => T` instead of a snapshot: Solid has no re-render, so reactivity requires the getter.
- Accepts a plain value or a reactive getter (`usePrevious(() => props.value)`); pass a getter for values that change over time.
