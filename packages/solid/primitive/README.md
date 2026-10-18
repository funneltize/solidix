# `@solidix/primitive`

Primitive components and DOM utilities. Port of `@radix-ui/react-primitive`
**and** `@radix-ui/primitive` (merged - see below).

## Differences from Radix

- **Merged packages**: Radix splits the `Primitive.*` components
  (`@radix-ui/react-primitive`) from framework-neutral DOM utilities
  (`@radix-ui/primitive`: `composeEventHandlers`, owner helpers,
  `hideOthers`/`inertOthers`/…, `canUseDOM`). Both drop the `react-` infix
  here, so they are merged into this single package rather than inventing a
  second name.
- `Primitive` renders through Solid's `Dynamic` for tags and `Slot` for
  `asChild`. There are no `forwardRef` wrappers - `ref` is a plain prop.
- `dispatchDiscreteCustomEvent` flushes with Solid's `flush` instead of
  `ReactDOM.flushSync`.
- The `--radix-*` CSS variable typing Radix declares is already covered by
  Solid's JSX types (which allow all `--*` custom properties).
- The `Symbol.for('radix-ui')` window marker is kept verbatim.
