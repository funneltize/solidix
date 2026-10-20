# @solidix/toolbar

## 0.1.1

### Patch Changes

- e32b499: Drop npm packaging config; the registry artifact is now the consolidated @solidix/solidix JSR package.
- Updated dependencies [e32b499]
  - @solidix/context@0.1.1
  - @solidix/direction@0.1.1
  - @solidix/primitive@0.1.1
  - @solidix/roving-focus@0.1.1
  - @solidix/separator@0.1.1
  - @solidix/toggle-group@0.1.1

## 0.1.0

### Minor Changes

- efe4554: Initial release: the complete Radix UI primitives port to Solid 2 -
  30 component primitives plus shared internals, published as `@solidix/*`
  with the `solidix` umbrella re-exporting every component namespace.

### Patch Changes

- 2801e2c: Security hardening: cap the `solid-js`/`@solidjs/web` peer ranges below 2.1.0; escape consumer-controlled values in the announce live-region selector; ignore malformed event-handler tuples instead of throwing; skip prototype-chain keys when applying slot props.
- Updated dependencies [efe4554]
- Updated dependencies [2801e2c]
  - @solidix/context@0.1.0
  - @solidix/direction@0.1.0
  - @solidix/primitive@0.1.0
  - @solidix/roving-focus@0.1.0
  - @solidix/separator@0.1.0
  - @solidix/toggle-group@0.1.0
