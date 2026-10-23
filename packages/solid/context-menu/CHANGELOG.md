# @solidix/context-menu

## 0.1.5

### Patch Changes

- 7a6c3d5: Raise the Solid 2 peer floor to rc.18, matching the pinned toolchain (rc.18 / vite-plugin next.51 / testing-library rc.2). No API or behavior change.
- Updated dependencies [7a6c3d5]
  - @solidix/context@0.1.5
  - @solidix/focus-scope@0.1.5
  - @solidix/menu@0.1.5
  - @solidix/primitive@0.2.1
  - @solidix/remove-scroll@0.1.5
  - @solidix/slot@0.1.5
  - @solidix/use-controllable-state@0.1.5

## 0.1.4

### Patch Changes

- Fix stale callbacks: `useCallbackRef`, `useEffectEvent`, and `useControllableState` capture their callback once at setup, so call sites that passed `props.onX` directly froze the first handler identity and dropped later ones. All 33 direct captures now pass a stable closure that reads the prop at call time (e.g. `(next) => props.onChange?.(next)`), matching the existing lazy-inline convention. `SelectValue` also reads children presence from its `children()` memo instead of raw `props.children`, which re-instantiated the subtree on every read. Adds callback-freshness regression tests to toast and switch.
- Roll out the README header template to every package: Solid API mapping with guide link, gallery docs-site route where a demo exists, and a `Differences from Radix` section (explicit parity statements for behavior-identical ports, no-counterpart notes for motion/funnel). Docs-only change.
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @solidix/primitive@0.2.0
  - @solidix/menu@0.1.4
  - @solidix/context@0.1.4
  - @solidix/env-check@0.1.4
  - @solidix/focus-scope@0.1.4
  - @solidix/remove-scroll@0.1.4
  - @solidix/slot@0.1.4
  - @solidix/use-controllable-state@0.1.4

## 0.1.3

### Patch Changes

- 909b39c: Document every exported type and namespace, and inject @module headers into staged declarations for the JSR docs score. Comments only, no behavior change.
- Updated dependencies [909b39c]
  - @solidix/env-check@0.1.3
  - @solidix/context@0.1.3
  - @solidix/focus-scope@0.1.3
  - @solidix/menu@0.1.3
  - @solidix/primitive@0.1.3
  - @solidix/remove-scroll@0.1.3
  - @solidix/slot@0.1.3
  - @solidix/use-controllable-state@0.1.3

## 0.1.2

### Patch Changes

- Document every exported value with JSDoc and inject @module headers at staging for the JSR docs score. Comments only, no behavior change.
- 0d802dd: Bump the Solid 2 toolchain pins from rc.15 to rc.16 (`solid-js` and `@solidjs/web` exact pins plus the peer ranges). No API changes; the full gate suite (format, lint, typecheck, test, build) passes on rc.16, including the Slot, Presence, `For`, and accordion keyed-reorder coverage affected by the upstream insert-effect timing and keyed-reconciler changes.
- Updated dependencies
- Updated dependencies [0d802dd]
  - @solidix/env-check@0.1.2
  - @solidix/context@0.1.2
  - @solidix/focus-scope@0.1.2
  - @solidix/menu@0.1.2
  - @solidix/primitive@0.1.2
  - @solidix/remove-scroll@0.1.2
  - @solidix/slot@0.1.2
  - @solidix/use-controllable-state@0.1.2

## 0.1.1

### Patch Changes

- e32b499: Drop npm packaging config; the registry artifact is now the consolidated @solidix/solidix JSR package.
- Updated dependencies [e32b499]
  - @solidix/context@0.1.1
  - @solidix/env-check@0.1.1
  - @solidix/focus-scope@0.1.1
  - @solidix/menu@0.1.1
  - @solidix/primitive@0.1.1
  - @solidix/remove-scroll@0.1.1
  - @solidix/slot@0.1.1
  - @solidix/use-controllable-state@0.1.1

## 0.1.0

### Minor Changes

- efe4554: Initial release: the complete Radix UI primitives port to Solid 2 -
  30 component primitives plus shared internals, published as `@solidix/*`
  with the `solidix` umbrella re-exporting every component namespace.

### Patch Changes

- 2801e2c: Security hardening: cap the `solid-js`/`@solidjs/web` peer ranges below 2.1.0; escape consumer-controlled values in the announce live-region selector; ignore malformed event-handler tuples instead of throwing; skip prototype-chain keys when applying slot props.
- Updated dependencies [efe4554]
- Updated dependencies [4934614]
- Updated dependencies [2801e2c]
  - @solidix/context@0.1.0
  - @solidix/env-check@0.1.0
  - @solidix/focus-scope@0.1.0
  - @solidix/menu@0.1.0
  - @solidix/primitive@0.1.0
  - @solidix/remove-scroll@0.1.0
  - @solidix/slot@0.1.0
  - @solidix/use-controllable-state@0.1.0
