# `@solidix/use-controllable-state`

Controlled/uncontrolled state hooks. Port of `@radix-ui/react-use-controllable-state`.

Pair with the [State management guide](../../../docs/state.md) for the controlled/uncontrolled ownership pattern these hooks implement.

## Differences from Radix

- Returns an accessor plus setter (`[() => T, setValue]`) instead of a snapshot tuple, so controlled values stay reactive.
- `prop` additionally accepts a reactive getter (`prop: () => props.value`); pass a getter for values that change. Plain values are supported and treated as static.
- Controlled-ness follows the resolved value (like Radix's per-render check), so a getter resolving `undefined` stays uncontrolled.
- The controlled↔uncontrolled dev warning tracks the resolved prop value.
