# `@solidix/funnel`

Design language for direct-response landing pages and funnels: design tokens
plus themed funnel blocks built on Solidix primitives. The token layer is a
plain stylesheet with zero JavaScript; blocks are opinionated by design (this
package deliberately departs from the headless philosophy of the primitives)
but every visual choice flows through tokens, so rebranding never touches
component code.

Blocks are data-driven (content in, themed markup out) with fixed structure and visuals: no `asChild`, no render props. Restyle through tokens and the documented `.fx-*` classes. Docs site: Funnel page (`#/funnel` route) with the 8-stage reference demo.

Implementing or reviewing funnel work? Read
[`PHILOSOPHY.md`](./PHILOSOPHY.md) first: it is the agent-ready source of
truth for the system's principles, patterns, budgets, and anti-patterns.

```bash
pnpm add jsr:@solidix/solidix
```

```tsx
import "./blocks.css"; // vendored copy, pulls tokens.css in too
import { Section, CTAButton } from "@solidix/solidix/funnel";
```

Or theme without components:

```css
@import "./tokens.css";
```

JSR ships JS only, so the stylesheets are not in the package: copy
`tokens.css` and `blocks.css` from `packages/solid/funnel/src/` in the repo
into your project, side by side, and import them relatively (re-copy after
upgrading).

## Tokens

Token names are the stable API, all under `--solidix-funnel-*`. Values are
placeholder brand defaults (slate ink, vermilion CTA) meant to be overridden
per brand. `tokens.css` is generated from
[`src/tokens.ts`](./src/tokens.ts) - edit that file and run `pnpm gen:tokens`;
a test fails if the checked-in CSS drifts.

| Family      | Tokens                                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Color       | `paper`, `ink`, `ink-body`, `muted`, `faint` (decorative-only), `line`, `line-soft`, `subtle`, `inverse`, `elevated`                                         |
| Brand       | `brand`, `brand-strong`, `brand-tint`, `brand-line`                                                                                                          |
| CTA         | `cta`, `cta-strong`, `cta-ink` (kept distinct from brand; `data-cta="emerald"` / `"cobalt"` re-points the hue)                                               |
| Feedback    | `success`, `success-tint`, `warning-strong`, `warning-tint`, `danger`, `danger-tint`                                                                         |
| Ratings     | `star`, `star-empty`                                                                                                                                         |
| Highlight   | `highlight` (skimmer marker)                                                                                                                                 |
| Fields      | `field-bg`, `field-ink`, `field-line`, `field-placeholder` (always light, never re-scoped by tones)                                                          |
| Type        | `sans`, `serif-accent`, `mono`, `text-display` through `text-caption` (fluid `clamp()` scale), leading, tracking, weights                                    |
| Spacing     | `space-0` through `space-24` (4px base, plus `space-1-5` for the 6px label step)                                                                             |
| Layout      | `section-pad`, `container-wide`, `container-standard`, `container-reading`, `container-pad`                                                                  |
| Radius      | `radius-sm`, `radius-md`, `radius-lg`, `radius-xl`, `radius-full`                                                                                            |
| Shadow      | `shadow-sm`, `shadow-md`, `shadow-lg` (neutral only)                                                                                                         |
| Breakpoints | `breakpoint-sm`, `breakpoint-md`, `breakpoint-lg`, `breakpoint-xl` (640/768/1024/1280px reference values; media queries take literals)                       |
| Layering    | `z-sticky`, `z-overlay`, `z-toast`                                                                                                                           |
| Motion      | `duration-instant`, `duration-fast`, `duration-base`, `duration-slow`, `duration-glow` (CTA halo rotation), `ease-out` (all block motion runs through these) |

Dark variant: set `data-funnel-theme="dark"` on a wrapping element. The base
also ships `:focus-visible` rings, `::selection` styling, and a
`prefers-reduced-motion` guard that collapses animation and transition
durations.

### Contrast

Measured ratios for the documented text/background pairs (pinned by tests;
`faint` is decorative-only, never text; orange and emerald CTAs are
large/UI-only by guidance):

| Pair                             | Ratio |
| -------------------------------- | ----: |
| ink / paper (light)              | 17.85 |
| ink-body / paper (light)         | 10.35 |
| muted / paper (light)            |  4.76 |
| brand / paper (light)            |  5.18 |
| brand-strong / paper (light)     |  7.31 |
| success / paper (light)          |  5.02 |
| danger / paper (light)           |  6.47 |
| field-ink / field-bg             | 17.85 |
| field-placeholder / field-bg     |  4.76 |
| ink / highlight (light)          | 15.34 |
| cta-ink / cta cobalt             |  5.17 |
| ink / paper (dark)               | 17.06 |
| ink-body / paper (dark)          | 12.02 |
| muted / paper (dark)             |  6.96 |
| brand-strong / paper (dark)      | 10.59 |
| cta-ink / cta (dark)             |  7.89 |
| ink / highlight (dark)           |  8.29 |
| cta-ink / cta (light, large/UI)  |  3.56 |
| cta-ink / cta emerald (large/UI) |  3.77 |

## Blocks

Block components render stable `.fx-*` class names styled by `blocks.css`;
class names are public API for theme overrides. Blocks also carry
`data-funnel-block` attributes and dispatch funnel analytics events
(`funnel:cta`, `funnel:submit`, `funnel:view`) that any snippet can observe -
no analytics SDK is bundled. See the gallery for live demos and recipes.

Layout: `Root` (theme, CTA hue, A/B variant), `Section` (`primary` / `subtle`
/ `inverse` chapter tones, `compact` strips), `Container` (`wide` / `standard` / `reading`
tiers), `Header` (zero-escape bar), `SectionHeading`, `Eyebrow`, `Prose`
(skimmer bolds plus `mark` highlighter). Conversion: `Hero`, `CtaCluster`
(button plus friction-killer microcopy), `CTAButton` (tactile primary, optional rotating `glow`),
`OptInForm`, `VideoFrame` (VSL thumbnail), `Countdown`, `StickyBar`
(mobile-only, reveals past the hero CTA), `ExitIntent`, `Footer` (zero-leak:
`utility` / `trust` / `sitemap` archetypes, containment-typed links, trust
badges instead of social icons).
Consideration: `Benefits` (checklist, `variant="cards"` bento grid,
or zig-zag rows with `media`),
`HowItWorks`, `ComparisonTable` (featured us-column), `Pricing`,
`Guarantee`, `Faq`. Proof: `LogoBar`, `Testimonials`,
`TestimonialCarousel`, `StatsBar`, `StarRating`.

## Editing

`Root` accepts `editable`, a studio-only flag (default off). When on, blocks
render `data-funnel-part` markers on elements bound to block-prop data, plus
`data-funnel-part-index` for repeated items (`"1-2"` for nested repeats)
and `tabindex` on static text so parts stay keyboard reachable. Editors
resolve clicks via `closest("[data-funnel-part]")`, pair the part with the
nearest `data-funnel-block`, and map `(block, part, index)` to their content
model; `CTAButton` also takes `part`/`partIndex` overrides so composing
blocks can name sibling buttons distinctly. When off, no markers render and
output is byte-identical to unmarked markup. Part names are stable public
API; see section 19 of `PHILOSOPHY.md` for the full contract.

## Motion

State changes animate with pure CSS keyed on the primitives' `data-state`
attributes - no JavaScript animation runtime, no scroll listeners:

- FAQ answers slide open and closed on the accordion's measured
  `--radix-accordion-content-height`.
- Pricing toggle options cross-fade their checked pill; the indicator dot
  pops in.
- Exit-intent overlay fades in while the dialog rises slightly.
- Testimonial carousel slides remount per index so the entry fade replays;
  CTA buttons, the sticky bar, and the FAQ plus icon transition.
- Primary CTAs take an optional `glow`: a rotating conic halo behind the
  button on `data-glow`, timed by the `duration-glow` token.
- Exit animations are entry-only for the dialog (it unmounts on close, same
  as Radix without `Presence`).

Every duration and easing references the motion tokens (enforced by
`test/motion.test.ts`), and the `prefers-reduced-motion` guard in
`tokens.css` collapses them all. There are deliberately no scroll-triggered
reveals: they cost a scroll observer and a11y risk for little conversion
value, and the blocks must stay readable with motion fully disabled.

## Differences from Radix

This package has no Radix counterpart. Unlike the headless primitives, funnel
blocks ship opinionated visuals: the deviation is the product. Behavior still
comes from Solidix primitives wherever one exists (Dialog, Accordion, Form,
RadioGroup, AspectRatio), so keyboard interaction, focus management, and ARIA
stay consistent with the rest of the library. Blocks are fixed-structure and
do not offer `asChild`; restyle through tokens and the documented classes.
