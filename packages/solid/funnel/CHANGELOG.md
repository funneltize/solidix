# @solidix/funnel

## 0.5.0

### Minor Changes

- Responsive images and cheaper below-fold blocks: media shapes (hero, video thumbnail, benefits, logos) accept `srcSet`/`sizes`, with `width`/`height` on benefits and logos; benefits media renders in an AspectRatio frame with an overridable `ratio`; lazy images decode async and the header logo loads eager. `VideoFrame` defaults to lazy with low priority and upgrades just before entering the viewport (`eager` opts back in). `Countdown` ticks adaptively (minute granularity beyond a day out), pauses offscreen, and stops after expiry, with `interval` as the manual override. `StickyBar` and `Header` accept a controlled `visible` signal for shared reveals, and the sticky fallback scroll listener is rAF-throttled.

### Patch Changes

- Strengthen the optional primary CTA glow: wider halo spread, richer base ring, and an opaque comet peak so the halo and its rotation read at a glance.

## 0.4.1

### Patch Changes

- b7f9ac5: Scope the `:focus-visible` ring to funnel markup (`[data-funnel-root]` descendants and `[data-funnel-block]` roots). The bare global rule restyled the consumer's own page, painting brand outlines on their inputs.

## 0.4.0

### Minor Changes

- 013b5f0: Add an optional `glow` prop to `CTAButton` and `CtaCluster`: a rotating conic halo behind the primary action, timed by the new `duration-glow` motion token. The halo derives from the CTA tokens, so `data-cta` hue switches and dark theme apply automatically.

### Patch Changes

- 013b5f0: Balance short wrapped rows (`flex-wrap: balance` on the logo bar, footer links, trust badges, and legal nav) so items split evenly instead of orphaning; progressive enhancement over `wrap`.
- 7a6c3d5: Raise the Solid 2 peer floor to rc.18, matching the pinned toolchain (rc.18 / vite-plugin next.51 / testing-library rc.2). No API or behavior change.
- Updated dependencies [7a6c3d5]
  - @solidix/accordion@0.1.5
  - @solidix/aspect-ratio@0.1.5
  - @solidix/dialog@0.1.5
  - @solidix/form@0.1.5
  - @solidix/primitive@0.2.1
  - @solidix/radio-group@0.1.5

## 0.3.2

### Patch Changes

- 646f0bd: Benefits `variant="cards"` bento grid auto-adjusts below the three-column threshold: a trailing lone card spans the full row instead of leaving a half-width orphan (3 items render 2 plus full-width on narrow viewports).

## 0.3.1

### Patch Changes

- Add the missing `| undefined` suffix to optional props (`children`, `forceLegal`, `class`), per the repo's `exactOptionalPropertyTypes` convention. Types-only change; allows explicitly passing `undefined`.
- Roll out the README header template to every package: Solid API mapping with guide link, gallery docs-site route where a demo exists, and a `Differences from Radix` section (explicit parity statements for behavior-identical ports, no-counterpart notes for motion/funnel). Docs-only change.
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @solidix/accordion@0.1.4
  - @solidix/dialog@0.1.4
  - @solidix/primitive@0.2.0
  - @solidix/form@0.1.4
  - @solidix/radio-group@0.1.4
  - @solidix/aspect-ratio@0.1.4

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
