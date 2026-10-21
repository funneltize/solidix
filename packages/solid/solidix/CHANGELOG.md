# solidix

## 0.1.4

### Patch Changes

- Updated dependencies
  - @solidix/funnel@0.3.0

## 0.1.3

### Patch Changes

- 909b39c: Document every exported type and namespace, and inject @module headers into staged declarations for the JSR docs score. Comments only, no behavior change.
- Updated dependencies [a0033da]
- Updated dependencies [909b39c]
  - @solidix/funnel@0.2.1
  - @solidix/accordion@0.1.3
  - @solidix/alert-dialog@0.1.3
  - @solidix/aspect-ratio@0.1.3
  - @solidix/avatar@0.1.3
  - @solidix/checkbox@0.1.3
  - @solidix/collapsible@0.1.3
  - @solidix/context-menu@0.1.3
  - @solidix/dialog@0.1.3
  - @solidix/dropdown-menu@0.1.3
  - @solidix/form@0.1.3
  - @solidix/hover-card@0.1.3
  - @solidix/label@0.1.3
  - @solidix/menubar@0.1.3
  - @solidix/navigation-menu@0.1.3
  - @solidix/one-time-password-field@0.1.3
  - @solidix/password-toggle-field@0.1.3
  - @solidix/popover@0.1.3
  - @solidix/progress@0.1.3
  - @solidix/radio-group@0.1.3
  - @solidix/scroll-area@0.1.3
  - @solidix/select@0.1.3
  - @solidix/separator@0.1.3
  - @solidix/slider@0.1.3
  - @solidix/switch@0.1.3
  - @solidix/tabs@0.1.3
  - @solidix/toast@0.1.3
  - @solidix/toggle@0.1.3
  - @solidix/toggle-group@0.1.3
  - @solidix/toolbar@0.1.3
  - @solidix/tooltip@0.1.3

## 0.1.2

### Patch Changes

- Document every exported value with JSDoc and inject @module headers at staging for the JSR docs score. Comments only, no behavior change.
- 0d802dd: Bump the Solid 2 toolchain pins from rc.15 to rc.16 (`solid-js` and `@solidjs/web` exact pins plus the peer ranges). No API changes; the full gate suite (format, lint, typecheck, test, build) passes on rc.16, including the Slot, Presence, `For`, and accordion keyed-reorder coverage affected by the upstream insert-effect timing and keyed-reconciler changes.
- Updated dependencies [0715acf]
- Updated dependencies
- Updated dependencies [2abf03d]
- Updated dependencies [0d802dd]
  - @solidix/funnel@0.2.0
  - @solidix/accordion@0.1.2
  - @solidix/alert-dialog@0.1.2
  - @solidix/aspect-ratio@0.1.2
  - @solidix/avatar@0.1.2
  - @solidix/checkbox@0.1.2
  - @solidix/collapsible@0.1.2
  - @solidix/context-menu@0.1.2
  - @solidix/dialog@0.1.2
  - @solidix/dropdown-menu@0.1.2
  - @solidix/form@0.1.2
  - @solidix/hover-card@0.1.2
  - @solidix/label@0.1.2
  - @solidix/menubar@0.1.2
  - @solidix/navigation-menu@0.1.2
  - @solidix/one-time-password-field@0.1.2
  - @solidix/password-toggle-field@0.1.2
  - @solidix/popover@0.1.2
  - @solidix/progress@0.1.2
  - @solidix/radio-group@0.1.2
  - @solidix/scroll-area@0.1.2
  - @solidix/select@0.1.2
  - @solidix/separator@0.1.2
  - @solidix/slider@0.1.2
  - @solidix/switch@0.1.2
  - @solidix/tabs@0.1.2
  - @solidix/toast@0.1.2
  - @solidix/toggle@0.1.2
  - @solidix/toggle-group@0.1.2
  - @solidix/toolbar@0.1.2
  - @solidix/tooltip@0.1.2

## 0.1.1

### Patch Changes

- e32b499: Drop npm packaging config; the registry artifact is now the consolidated @solidix/solidix JSR package.
- Updated dependencies [e32b499]
  - @solidix/accordion@0.1.1
  - @solidix/alert-dialog@0.1.1
  - @solidix/aspect-ratio@0.1.1
  - @solidix/avatar@0.1.1
  - @solidix/checkbox@0.1.1
  - @solidix/collapsible@0.1.1
  - @solidix/context-menu@0.1.1
  - @solidix/dialog@0.1.1
  - @solidix/dropdown-menu@0.1.1
  - @solidix/form@0.1.1
  - @solidix/funnel@0.1.1
  - @solidix/hover-card@0.1.1
  - @solidix/label@0.1.1
  - @solidix/menubar@0.1.1
  - @solidix/navigation-menu@0.1.1
  - @solidix/one-time-password-field@0.1.1
  - @solidix/password-toggle-field@0.1.1
  - @solidix/popover@0.1.1
  - @solidix/progress@0.1.1
  - @solidix/radio-group@0.1.1
  - @solidix/scroll-area@0.1.1
  - @solidix/select@0.1.1
  - @solidix/separator@0.1.1
  - @solidix/slider@0.1.1
  - @solidix/switch@0.1.1
  - @solidix/tabs@0.1.1
  - @solidix/toast@0.1.1
  - @solidix/toggle@0.1.1
  - @solidix/toggle-group@0.1.1
  - @solidix/toolbar@0.1.1
  - @solidix/tooltip@0.1.1

## 0.1.0

### Minor Changes

- 6cdffb0: New package: design language for direct-response landing pages. Ships `tokens.css` (zero-JS design tokens with a dark variant) plus themed funnel blocks built on Solidix primitives.
- efe4554: Initial release: the complete Radix UI primitives port to Solid 2 -
  30 component primitives plus shared internals, published as `@solidix/*`
  with the `solidix` umbrella re-exporting every component namespace.

### Patch Changes

- 2801e2c: Security hardening: cap the `solid-js`/`@solidjs/web` peer ranges below 2.1.0; escape consumer-controlled values in the announce live-region selector; ignore malformed event-handler tuples instead of throwing; skip prototype-chain keys when applying slot props.
- Updated dependencies [6cdffb0]
- Updated dependencies [efe4554]
- Updated dependencies [2801e2c]
  - @solidix/funnel@0.1.0
  - @solidix/accordion@0.1.0
  - @solidix/alert-dialog@0.1.0
  - @solidix/aspect-ratio@0.1.0
  - @solidix/avatar@0.1.0
  - @solidix/checkbox@0.1.0
  - @solidix/collapsible@0.1.0
  - @solidix/context-menu@0.1.0
  - @solidix/dialog@0.1.0
  - @solidix/dropdown-menu@0.1.0
  - @solidix/form@0.1.0
  - @solidix/hover-card@0.1.0
  - @solidix/label@0.1.0
  - @solidix/menubar@0.1.0
  - @solidix/navigation-menu@0.1.0
  - @solidix/one-time-password-field@0.1.0
  - @solidix/password-toggle-field@0.1.0
  - @solidix/popover@0.1.0
  - @solidix/progress@0.1.0
  - @solidix/radio-group@0.1.0
  - @solidix/scroll-area@0.1.0
  - @solidix/select@0.1.0
  - @solidix/separator@0.1.0
  - @solidix/slider@0.1.0
  - @solidix/switch@0.1.0
  - @solidix/tabs@0.1.0
  - @solidix/toast@0.1.0
  - @solidix/toggle@0.1.0
  - @solidix/toggle-group@0.1.0
  - @solidix/toolbar@0.1.0
  - @solidix/tooltip@0.1.0
