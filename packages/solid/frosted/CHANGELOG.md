# @solidix/frosted

## 0.3.0

### Minor Changes

- a726af9: Add the date stack (new `@solidix/calendar` with Frosted Calendar,
  DatePicker, and DateRangePicker) and deepen the native components:
  combobox auto-flip placement, Sheet detents, Toast limit and tones,
  pointer-based sortable drag, SplitPane persistence and reset, funnel
  inverse tokens with rich hero titles and slots, gallery demos for the
  new packages, a bundle size budget, and structural a11y checks.
- a726af9: Add a Solidix-native discipline layer to frosted: semantic role tokens
  for radius and elevation, a named micro type step, motion duration
  tokens, and the `Stack` and `Row` layout primitives that own spacing
  between children. Component stylesheets now take interaction timing and
  scale-matched corners from the tokens instead of restating literals.
- a726af9: Add native editor foundations: Frosted Toast with a signal queue,
  Combobox and CommandMenu, Sheet, SplitPane, DataTable, and styled
  Sortable parts; new headless `@solidix/combobox` and `@solidix/sortable`
  packages, re-exported from the `solidix` meta package.

## 0.2.3

### Patch Changes

- Move the `cx` class-name helper (plus `CxInput` type) into `@solidix/primitive` as the single shared implementation; frosted and funnel now re-export it. Frosted's public `cx` API is unchanged; funnel's internal copy adopts the shared classnames-compatible semantics (all falsy entries dropped) and its `ctaAttrs` helper types `class` as `JSX.ClassValue` instead of `unknown`.
- Remove unused dependencies (22 runtime entries plus orphaned charts type packages) and delete the unreferenced `env-check` index stub. No runtime or API changes.
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @solidix/form@0.1.6
  - @solidix/primitive@0.3.0
  - @solidix/accordion@0.1.7
  - @solidix/context-menu@0.1.7
  - @solidix/dialog@0.1.7
  - @solidix/dropdown-menu@0.1.7
  - @solidix/hover-card@0.1.7
  - @solidix/select@0.1.7
  - @solidix/tooltip@0.1.7
  - @solidix/popover@0.1.7
  - @solidix/alert-dialog@0.1.7
  - @solidix/avatar@0.1.6
  - @solidix/checkbox@0.1.7
  - @solidix/navigation-menu@0.1.7
  - @solidix/one-time-password-field@0.1.7
  - @solidix/progress@0.1.6
  - @solidix/radio-group@0.1.7
  - @solidix/scroll-area@0.1.6
  - @solidix/separator@0.1.6
  - @solidix/slider@0.1.7
  - @solidix/switch@0.1.7
  - @solidix/tabs@0.1.7
  - @solidix/visually-hidden@0.1.6
  - @solidix/use-controllable-state@0.1.7

## 0.2.2

### Patch Changes

- e98bdd6: Fix TextArea chrome intercepting pointer input when stacking is disturbed: the decorative `.fui-TextAreaChrome` layer now ships `pointer-events: none` so the textarea stays usable even if an external stylesheet restacks it above the input.

## 0.2.1

### Patch Changes

- 64d134f: Fix unstyled and misrendered docs elements: re-port the radio-group, slider, button, icon-button, and fieldset stylesheets from upstream frosted-ui (they carried Radix Themes rules), bridge Base UI selected/checked/open attributes the frosted CSS targets (`data-selected` on tabs and segments, `data-checked` on radio segments, `hidden` plus `data-panel-open` on accordion panels and triggers), emit the missing `fui-FieldControl` and `fui-CreditCardTextField` classes, and recompose the gallery demo per the upstream stories (TextField inside Field, card-style radio buttons, IconButton gallery/carousel/trigger controls, sized widget stack, full-width separators).

## 0.2.0

### Minor Changes

- ef6b177: Scaffold the frosted theme package: Theme provider with options, design-token layer, committed full/lite CSS bundles, and gallery wiring.
- ef6b177: Add `@solidix/frosted` (wave 1): theme plus type and layout presentational components (text, heading, link, code, blockquote, kbd, em, quote, inset, separator, skeleton, spinner) ported from frosted-ui, with the `Frosted` umbrella namespace and gallery demo.
- ef6b177: Add `@solidix/frosted` (wave 2): form controls ported from frosted-ui onto the `@solidix` headless primitives - base-button, button, icon-button, text-field, text-area, number-field, checkbox, radio-group, radio-button-group, switch, slider, select, otp-field, field, fieldset, form - with tests, gallery demo, and docs.
- ef6b177: Add `@solidix/frosted` (wave 3): overlays ported from frosted-ui - dialog, alert-dialog, drawer, popover, tooltip (+ TooltipProvider), hover-card, dropdown-menu, context-menu, lightbox - with tests, gallery demo, and docs.
- ef6b177: Add `@solidix/frosted` (wave 4): navigation and data display ported from frosted-ui - tabs, tabs-nav, segmented-control family, breadcrumbs, scroll-area, progress, circular-progress, data-list, table, card, badge, callout, avatar (+group/stack), scroll-gallery - with tests, gallery demo, and docs.
- ef6b177: Add `@solidix/frosted` (wave 5): complex and remainder components ported from frosted-ui - strong, shine, empty-state, portal, visually-hidden, filter-chip, country-flag, stacked-horizontal-bar-chart, widget-stack, accordion, credit-card, bot-avatar - with tests, gallery demo, and docs. Also backfills the missing shared `base-menu` stylesheet. Not ported (blocked on missing foundations, documented in the README): sheet, toast, combobox, autocomplete, calendar, date-picker, date-range-picker.

### Patch Changes

- Updated dependencies [85f54c9]
  - @solidix/use-controllable-state@0.1.6
  - @solidix/accordion@0.1.6
  - @solidix/checkbox@0.1.6
  - @solidix/context-menu@0.1.6
  - @solidix/dialog@0.1.6
  - @solidix/dropdown-menu@0.1.6
  - @solidix/hover-card@0.1.6
  - @solidix/navigation-menu@0.1.6
  - @solidix/one-time-password-field@0.1.6
  - @solidix/popover@0.1.6
  - @solidix/radio-group@0.1.6
  - @solidix/select@0.1.6
  - @solidix/slider@0.1.6
  - @solidix/switch@0.1.6
  - @solidix/tabs@0.1.6
  - @solidix/tooltip@0.1.6
  - @solidix/alert-dialog@0.1.6
