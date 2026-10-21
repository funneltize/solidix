# `@solidix/roving-focus`

Roving tabindex group. Port of `@radix-ui/react-roving-focus`.

Solid API mapping: `class` for `className`; `ref` is a plain prop; `asChild` composes via `@solidix/slot` (see the [Composition guide](../../../docs/composition.md)).

## Differences from Radix

- The group context carries `currentTabStopId` as an accessor (internal
  context shape; required for reactivity without re-renders).
- `useIsHydrated` is an accessor here, so focusable-item registration is a
  single effect tracking hydration + `focusable` (no layout/passive split -
  Solid has no mid-hydration re-render hazard of that kind).
- Entry-focus subscription uses `onSettled`; keyboard/mouse/focus handlers
  are stable closures reading signals and props lazily.
- Render-prop item children receive `isCurrentTabStop`/`hasTabStop` as
  accessors (not booleans) so the item stays mounted while the values
  update; re-invoking per change would remount it.
