# `@solidix/use-previous`

Previous-value accessor. Port of `@radix-ui/react-use-previous`.

## Differences from Radix

- Returns an accessor `() => T` instead of a snapshot: Solid has no re-render, so reactivity requires the getter.
- Accepts a plain value or a reactive getter (`usePrevious(() => props.value)`); pass a getter for values that change over time.
