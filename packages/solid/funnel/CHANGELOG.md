# @solidix/funnel

## 0.3.0

### Minor Changes

- Add `variant="cards"` to `Benefits`: a tight icon-led bento grid for pillar content, riding on `data-variant="cards"`. The default checklist and media zig-zag rows are unchanged; the cards variant ignores `media`. The gallery reference demo's Value stage now uses the cards variant, and the `blocks.css` budget moves 40 kB to 42 kB to cover the new styles.

## 0.2.1

### Patch Changes

- a0033da: Fix exit-intent CTA overflow: buttons and the modal use border-box sizing so portalled content no longer overflows where consumer resets don't reach. Studio editing outlines are now persistent (stronger on hover) so the mode is visible on toggle.
- 909b39c: Document every exported type and namespace, and inject @module headers into staged declarations for the JSR docs score. Comments only, no behavior change.
- Updated dependencies [909b39c]
  - @solidix/accordion@0.1.3
  - @solidix/aspect-ratio@0.1.3
  - @solidix/dialog@0.1.3
  - @solidix/form@0.1.3
  - @solidix/primitive@0.1.3
  - @solidix/radio-group@0.1.3

## 0.2.0

### Minor Changes

- 0715acf: Add the studio editing contract: `Root` accepts `editable`, and when set, blocks render `data-funnel-part` markers (plus `data-funnel-part-index` for repeats and `tabindex` on static text) so visual editors can resolve clicks to content fields. `CTAButton` takes `part`/`partIndex` overrides for composed siblings. Off by default with byte-identical public output.

### Patch Changes

- Document every exported value with JSDoc and inject @module headers at staging for the JSR docs score. Comments only, no behavior change.
- 0d802dd: Bump the Solid 2 toolchain pins from rc.15 to rc.16 (`solid-js` and `@solidjs/web` exact pins plus the peer ranges). No API changes; the full gate suite (format, lint, typecheck, test, build) passes on rc.16, including the Slot, Presence, `For`, and accordion keyed-reorder coverage affected by the upstream insert-effect timing and keyed-reconciler changes.
- Updated dependencies
- Updated dependencies [0d802dd]
  - @solidix/accordion@0.1.2
  - @solidix/aspect-ratio@0.1.2
  - @solidix/dialog@0.1.2
  - @solidix/form@0.1.2
  - @solidix/primitive@0.1.2
  - @solidix/radio-group@0.1.2

## 0.1.1

### Patch Changes

- e32b499: Drop npm packaging config; the registry artifact is now the consolidated @solidix/solidix JSR package.
- Updated dependencies [e32b499]
  - @solidix/accordion@0.1.1
  - @solidix/aspect-ratio@0.1.1
  - @solidix/dialog@0.1.1
  - @solidix/form@0.1.1
  - @solidix/primitive@0.1.1
  - @solidix/radio-group@0.1.1

## 0.1.0

### Minor Changes

- 6cdffb0: New package: design language for direct-response landing pages. Ships `tokens.css` (zero-JS design tokens with a dark variant) plus themed funnel blocks built on Solidix primitives.

### Patch Changes

- Updated dependencies [efe4554]
- Updated dependencies [2801e2c]
  - @solidix/accordion@0.1.0
  - @solidix/aspect-ratio@0.1.0
  - @solidix/dialog@0.1.0
  - @solidix/form@0.1.0
  - @solidix/primitive@0.1.0
  - @solidix/radio-group@0.1.0
