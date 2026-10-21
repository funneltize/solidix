# @solidix/slot

## 0.1.4

### Patch Changes

- Roll out the README header template to every package: Solid API mapping with guide link, gallery docs-site route where a demo exists, and a `Differences from Radix` section (explicit parity statements for behavior-identical ports, no-counterpart notes for motion/funnel). Docs-only change.

## 0.1.3

### Patch Changes

- 909b39c: Document every exported type and namespace, and inject @module headers into staged declarations for the JSR docs score. Comments only, no behavior change.
- Updated dependencies [909b39c]
  - @solidix/compose-refs@0.1.3

## 0.1.2

### Patch Changes

- Document every exported value with JSDoc and inject @module headers at staging for the JSR docs score. Comments only, no behavior change.
- 0d802dd: Bump the Solid 2 toolchain pins from rc.15 to rc.16 (`solid-js` and `@solidjs/web` exact pins plus the peer ranges). No API changes; the full gate suite (format, lint, typecheck, test, build) passes on rc.16, including the Slot, Presence, `For`, and accordion keyed-reorder coverage affected by the upstream insert-effect timing and keyed-reconciler changes.
- Updated dependencies
- Updated dependencies [0d802dd]
  - @solidix/compose-refs@0.1.2

## 0.1.1

### Patch Changes

- e32b499: Drop npm packaging config; the registry artifact is now the consolidated @solidix/solidix JSR package.
- Updated dependencies [e32b499]
  - @solidix/compose-refs@0.1.1

## 0.1.0

### Minor Changes

- efe4554: Initial release: the complete Radix UI primitives port to Solid 2 -
  30 component primitives plus shared internals, published as `@solidix/*`
  with the `solidix` umbrella re-exporting every component namespace.

### Patch Changes

- 4934614: Fix menubar submenus closing when the pointer crosses into them. Nested portalled layers (eg. submenus) now resolve as inside their ancestor layer for focus and pointerdown outside checks, slotted props update in place without transient removal that drops focus, and slotted props above popper content land on the inner content element instead of the positioning wrapper.
- 2801e2c: Security hardening: cap the `solid-js`/`@solidjs/web` peer ranges below 2.1.0; escape consumer-controlled values in the announce live-region selector; ignore malformed event-handler tuples instead of throwing; skip prototype-chain keys when applying slot props.
- Updated dependencies [efe4554]
- Updated dependencies [2801e2c]
  - @solidix/compose-refs@0.1.0
