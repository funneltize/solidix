# solidix

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
