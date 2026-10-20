# @solidix/popper

## 0.1.1

### Patch Changes

- e32b499: Drop npm packaging config; the registry artifact is now the consolidated @solidix/solidix JSR package.
- Updated dependencies [e32b499]
  - @solidix/arrow@0.1.1
  - @solidix/compose-refs@0.1.1
  - @solidix/context@0.1.1
  - @solidix/primitive@0.1.1
  - @solidix/rect@0.1.1
  - @solidix/slot@0.1.1
  - @solidix/use-callback-ref@0.1.1
  - @solidix/use-size@0.1.1

## 0.1.0

### Minor Changes

- efe4554: Initial release: the complete Radix UI primitives port to Solid 2 -
  30 component primitives plus shared internals, published as `@solidix/*`
  with the `solidix` umbrella re-exporting every component namespace.

### Patch Changes

- 4934614: Fix menubar submenus closing when the pointer crosses into them. Nested portalled layers (eg. submenus) now resolve as inside their ancestor layer for focus and pointerdown outside checks, slotted props update in place without transient removal that drops focus, and slotted props above popper content land on the inner content element instead of the positioning wrapper.
- 2801e2c: Security hardening: cap the `solid-js`/`@solidjs/web` peer ranges below 2.1.0; escape consumer-controlled values in the announce live-region selector; ignore malformed event-handler tuples instead of throwing; skip prototype-chain keys when applying slot props.
- Updated dependencies [efe4554]
- Updated dependencies [4934614]
- Updated dependencies [2801e2c]
  - @solidix/arrow@0.1.0
  - @solidix/compose-refs@0.1.0
  - @solidix/context@0.1.0
  - @solidix/primitive@0.1.0
  - @solidix/rect@0.1.0
  - @solidix/slot@0.1.0
  - @solidix/use-callback-ref@0.1.0
  - @solidix/use-size@0.1.0
