# solidix

## 0.2.2

### Patch Changes

- Updated dependencies [e98bdd6]
  - @solidix/frosted@0.2.2

## 0.2.1

### Patch Changes

- Updated dependencies [64d134f]
  - @solidix/frosted@0.2.1

## 0.2.0

### Minor Changes

- 85f54c9: Add `@solidix/charts` (wave 1): bar and line chart primitives with container, scales, axes, grid, tooltip, legend, highlight parts, headless hooks, and gallery demos.
- 85f54c9: Add `@solidix/charts` wave 2: pie, scatter, sparkline, and gauge chart primitives with gallery demos and docs.
- 85f54c9: Record `@solidix/charts` delivery (wave 5): umbrella `Charts` namespace export, full gallery demo and API docs coverage for every wave, and the MUI X Charts 9.16.0 upstream baseline.
- ef6b177: Add `@solidix/frosted` (wave 1): theme plus type and layout presentational components (text, heading, link, code, blockquote, kbd, em, quote, inset, separator, skeleton, spinner) ported from frosted-ui, with the `Frosted` umbrella namespace and gallery demo.
- ef6b177: Add `@solidix/frosted` (wave 2): form controls ported from frosted-ui onto the `@solidix` headless primitives - base-button, button, icon-button, text-field, text-area, number-field, checkbox, radio-group, radio-button-group, switch, slider, select, otp-field, field, fieldset, form - with tests, gallery demo, and docs.
- ef6b177: Add `@solidix/frosted` (wave 3): overlays ported from frosted-ui - dialog, alert-dialog, drawer, popover, tooltip (+ TooltipProvider), hover-card, dropdown-menu, context-menu, lightbox - with tests, gallery demo, and docs.
- ef6b177: Add `@solidix/frosted` (wave 4): navigation and data display ported from frosted-ui - tabs, tabs-nav, segmented-control family, breadcrumbs, scroll-area, progress, circular-progress, data-list, table, card, badge, callout, avatar (+group/stack), scroll-gallery - with tests, gallery demo, and docs.
- ef6b177: Add `@solidix/frosted` (wave 5): complex and remainder components ported from frosted-ui - strong, shine, empty-state, portal, visually-hidden, filter-chip, country-flag, stacked-horizontal-bar-chart, widget-stack, accordion, credit-card, bot-avatar - with tests, gallery demo, and docs. Also backfills the missing shared `base-menu` stylesheet. Not ported (blocked on missing foundations, documented in the README): sheet, toast, combobox, autocomplete, calendar, date-picker, date-range-picker.
- de2be45: Resolve the funnel dark theme through `light-dark()` token pairs on `:root` instead of a `[data-funnel-theme="dark"]` override block. The attribute (set via `Root theme="dark"`) now only flips `color-scheme` for the subtree; every paired token ships its flat light value first so older browsers degrade to the light theme. Rendering is unchanged in supporting browsers, and plain rebrand overrides under `[data-funnel-theme="dark"]` keep working.

### Patch Changes

- Updated dependencies [85f54c9]
- Updated dependencies [85f54c9]
- Updated dependencies [85f54c9]
- Updated dependencies [85f54c9]
- Updated dependencies [85f54c9]
- Updated dependencies [85f54c9]
- Updated dependencies [85f54c9]
- Updated dependencies [ef6b177]
- Updated dependencies [ef6b177]
- Updated dependencies [ef6b177]
- Updated dependencies [ef6b177]
- Updated dependencies [ef6b177]
- Updated dependencies [ef6b177]
- Updated dependencies [de2be45]
  - @solidix/charts@0.2.0
  - @solidix/frosted@0.2.0
  - @solidix/funnel@0.6.0
  - @solidix/accordion@0.1.6
  - @solidix/checkbox@0.1.6
  - @solidix/collapsible@0.1.6
  - @solidix/context-menu@0.1.6
  - @solidix/dialog@0.1.6
  - @solidix/dropdown-menu@0.1.6
  - @solidix/hover-card@0.1.6
  - @solidix/menubar@0.1.6
  - @solidix/navigation-menu@0.1.6
  - @solidix/one-time-password-field@0.1.6
  - @solidix/password-toggle-field@0.1.6
  - @solidix/popover@0.1.6
  - @solidix/radio-group@0.1.6
  - @solidix/select@0.1.6
  - @solidix/slider@0.1.6
  - @solidix/switch@0.1.6
  - @solidix/tabs@0.1.6
  - @solidix/toast@0.1.6
  - @solidix/toggle@0.1.6
  - @solidix/toggle-group@0.1.6
  - @solidix/tooltip@0.1.6
  - @solidix/alert-dialog@0.1.6
  - @solidix/toolbar@0.1.6

## 0.1.10

### Patch Changes

- Updated dependencies
  - @solidix/funnel@0.5.1

## 0.1.9

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @solidix/funnel@0.5.0

## 0.1.8

### Patch Changes

- Updated dependencies [b7f9ac5]
  - @solidix/funnel@0.4.1

## 0.1.7

### Patch Changes

- 7a6c3d5: Raise the Solid 2 peer floor to rc.18, matching the pinned toolchain (rc.18 / vite-plugin next.51 / testing-library rc.2). No API or behavior change.
- Updated dependencies [013b5f0]
- Updated dependencies [013b5f0]
- Updated dependencies [7a6c3d5]
  - @solidix/funnel@0.4.0
  - @solidix/accordion@0.1.5
  - @solidix/alert-dialog@0.1.5
  - @solidix/aspect-ratio@0.1.5
  - @solidix/avatar@0.1.5
  - @solidix/checkbox@0.1.5
  - @solidix/collapsible@0.1.5
  - @solidix/context-menu@0.1.5
  - @solidix/dialog@0.1.5
  - @solidix/dropdown-menu@0.1.5
  - @solidix/form@0.1.5
  - @solidix/hover-card@0.1.5
  - @solidix/label@0.1.5
  - @solidix/menubar@0.1.5
  - @solidix/navigation-menu@0.1.5
  - @solidix/one-time-password-field@0.1.5
  - @solidix/password-toggle-field@0.1.5
  - @solidix/popover@0.1.5
  - @solidix/progress@0.1.5
  - @solidix/radio-group@0.1.5
  - @solidix/scroll-area@0.1.5
  - @solidix/select@0.1.5
  - @solidix/separator@0.1.5
  - @solidix/slider@0.1.5
  - @solidix/switch@0.1.5
  - @solidix/tabs@0.1.5
  - @solidix/toast@0.1.5
  - @solidix/toggle@0.1.5
  - @solidix/toggle-group@0.1.5
  - @solidix/toolbar@0.1.5
  - @solidix/tooltip@0.1.5

## 0.1.6

### Patch Changes

- Updated dependencies [646f0bd]
  - @solidix/funnel@0.3.2

## 0.1.5

### Patch Changes

- Roll out the README header template to every package: Solid API mapping with guide link, gallery docs-site route where a demo exists, and a `Differences from Radix` section (explicit parity statements for behavior-identical ports, no-counterpart notes for motion/funnel). Docs-only change.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @solidix/toast@0.1.4
  - @solidix/navigation-menu@0.1.4
  - @solidix/scroll-area@0.1.4
  - @solidix/select@0.1.4
  - @solidix/accordion@0.1.4
  - @solidix/dropdown-menu@0.1.4
  - @solidix/context-menu@0.1.4
  - @solidix/menubar@0.1.4
  - @solidix/tabs@0.1.4
  - @solidix/hover-card@0.1.4
  - @solidix/toggle-group@0.1.4
  - @solidix/toggle@0.1.4
  - @solidix/dialog@0.1.4
  - @solidix/popover@0.1.4
  - @solidix/collapsible@0.1.4
  - @solidix/switch@0.1.4
  - @solidix/password-toggle-field@0.1.4
  - @solidix/funnel@0.3.1
  - @solidix/alert-dialog@0.1.4
  - @solidix/checkbox@0.1.4
  - @solidix/form@0.1.4
  - @solidix/one-time-password-field@0.1.4
  - @solidix/radio-group@0.1.4
  - @solidix/slider@0.1.4
  - @solidix/tooltip@0.1.4
  - @solidix/avatar@0.1.4
  - @solidix/toolbar@0.1.4
  - @solidix/aspect-ratio@0.1.4
  - @solidix/label@0.1.4
  - @solidix/progress@0.1.4
  - @solidix/separator@0.1.4

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
