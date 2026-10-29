# @solidix/frosted

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
