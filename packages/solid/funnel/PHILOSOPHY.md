# Funnel system: philosophy and practices

Agent-ready source of truth for `@solidix/funnel`. Read this before adding,
changing, or reviewing any funnel token, block, style, test, demo, or doc. If
this file and an implementation disagree, the implementation wins only when a
test pins it; otherwise update the implementation to match this file.

Source-of-truth order for values: `src/tokens.ts`, then generated
`src/tokens.css`, then `src/blocks.css`, then components, then tests as
enforcement. For behavior intent, this file wins over memory and over
third-party summaries.

## 1. What this package is

`@solidix/funnel` is an opinionated design language for direct-response
landing pages and funnels. It inverts the headless philosophy of the rest of
Solidix on purpose: blocks ship fixed structure plus fixed visuals, and every
visual choice flows through tokens. Rebranding overrides tokens, never
component code.

The package has three layers:

1. `tokens.css` (generated from `src/tokens.ts`): zero-JavaScript theme layer.
   Importable alone for theming without components.
2. `blocks.css` (imports `tokens.css`): all block visuals. One stylesheet
   import styles every block.
3. Components (`layout`, `cta-button`, `conversion`, `consideration`,
   `proof`): data-driven blocks composed from Solidix primitives wherever a
   primitive exists (Dialog, Accordion, Form, RadioGroup, AspectRatio), so
   keyboard interaction, focus management, and ARIA stay consistent with the
   library.

Token names are the stable API. Token values are placeholder brand defaults
(slate ink, vermilion CTA) meant to be overridden per brand.

## 2. Governing principles

Three principles drive every decision. Each has concrete implementation
consequences, not just vibes.

### Cognitive Fluency: minimize mental effort

- One idea per section, one primary action per viewport.
- Single-column forms and single-column copy (reading container, 60ch-68ch).
- Static top labels, never placeholder-only labels.
- Skimmer anchors: bold the core benefit clause every 3-4 paragraphs, plus a
  warm highlighter on 2-4 critical words per viewport.
- Restrict choice: no nav menus, no carousels with autoplay, no competing
  persistent chrome.

### Von Restorff Isolation: the primary action is impossible to miss

- Exactly one isolation color exists: `--solidix-funnel-cta`. It is reserved
  for buttons, active states, and conversion triggers.
- Brand color (`--solidix-funnel-brand`) and CTA color are separate tokens.
  Eyebrows and badges use brand; CTAs use CTA. Never share one token.
- The CTA hue is switchable per vertical via `data-cta`: orange default
  (urgency), emerald (fintech, health, checkout trust), cobalt (enterprise,
  medical).
- Footer links are anti-salient by design: muted, small, no underline until
  hover. Nothing below the final CTA competes with it.

### Directional Momentum: the eye slides down, never sideways or back up

- Sections alternate tone (primary/subtle) as psychological chapter breaks,
  resetting attention without divider rules.
- Copy widths narrow where reading matters (reading container for agitation,
  story, FAQ, offer stack) and widen where proof needs expanse (wide container
  for grids, tables, pricing).
- Footer funnel links are on-page `#anchor` jumps that cycle the user back
  into the funnel instead of leaking out.
- A high-contrast final CTA block always sits directly above the footer (the
  "final net" dam) so skimmers hit an action trigger before utility links.

## 3. The 8-stage blueprint

High-converting funnels compose these stages in order. Tones alternate to
create chapter breaks; `inverse` is reserved for stage 4.

| Stage          | Section                      | Layout                        | Tone            | Container                   | Job                                                        |
| -------------- | ---------------------------- | ----------------------------- | --------------- | --------------------------- | ---------------------------------------------------------- |
| 1. Hook        | Zero-escape Header + Hero    | Split 55/45 or centered 680px | primary         | standard                    | Match ad intent, state outcome + timeframe, CTA above fold |
| 2. Authority   | Trust bar (LogoBar, stars)   | Full-bleed strip              | subtle, compact | standard                    | Neutralize skepticism in 3 seconds                         |
| 3. Agitation   | Problem                      | Centered single column        | primary         | reading                     | Articulate pain so the prospect feels understood           |
| 4. Mechanism   | Solution reveal (HowItWorks) | Headline + 3-card flow        | inverse         | standard                    | Proprietary mechanism: why past attempts failed            |
| 5. Value       | Benefits                     | Bento cards or 50/50 zig-zag  | primary         | standard                    | Pillar cards, or product visuals + outcome headlines       |
| 6. Validation  | Proof wall                   | 3-column grid (1200px)        | subtle          | wide                        | Metric outcomes, pull quotes, verified avatars             |
| 7. Conversion  | Offer stack / Pricing        | 1-card or 3-tier anchor grid  | primary         | wide, then reading for form | Anchor value vs cost, isolate checkout trigger             |
| 8. Reassurance | Guarantee + FAQ + final CTA  | Seal box + accordion (680px)  | subtle          | reading                     | Reverse risk, answer objections, final CTA dam             |

Composition rules:

- Alternate `primary`/`subtle` down the page. Use `inverse` once, for the
  mechanism reveal.
- Match container tier to content: proof grids, pricing, and comparison
  tables get `wide`; hero rows and zig-zag get `standard`; copy, VSL, FAQ,
  and single-column offer stacks get `reading`.
- `compact` sections are strips only (trust bar, footer wrap).
- Eyebrows are sparing by design: not every section needs one.

The gallery reference (`internal/gallery/src/demos/funnel.tsx`) implements
this blueprint end to end. New blocks must fit a stage; new pages should
follow the order.

## 4. Token architecture

Rules for working with tokens:

- Names are API, values are defaults. Never rename a token casually; never
  treat a value as brand identity.
- Edit `src/tokens.ts`, then run `pnpm gen:tokens`. The drift test fails if
  checked-in `tokens.css` differs from rendered output.
- All tokens live under `--solidix-funnel-*`. No unprefixed custom
  properties, no component-scoped token inventions.
- Dark mode is a token override under `[data-funnel-theme="dark"]`, set via
  `Root theme="dark"` (light sets no attribute). Fields stay light in both
  themes (see section 7).
- CTA hues are re-points under `[data-cta="emerald"|"cobalt"]` in the base
  CSS. Tactile depth derives from the CTA tokens via `color-mix`, so hue
  switches change no other rule.
- Motion has tokens (`duration-*`, `ease-out`) and every animation or
  transition in `blocks.css` references them. Literals are test failures.
- Breakpoint tokens are reference values only. Media queries take literals
  (custom properties do not work in media query conditions).
- Shadows are neutral slate only. Colored glows come from the CTA shadow in
  the tactile recipe, not the shadow tokens.

Tone-scope gotcha (pinned by `css-scopes.test.ts`): custom properties
resolve against overrides in their own block. A tone scope must set literal
values, never `var()` references to tokens it also overrides, or the page
token silently wins. The `inverse` scope therefore sets literal dark
surfaces.

## 5. Color and type rules

Color follows the 60-30-10 direct-response ratio:

- 60% high-luminance canvas: white and alabaster (`paper`, `subtle`).
  Light backgrounds outperform dark pages for long-form reading.
- 30% structural ink and framing: deep slate headlines (`ink`), charcoal
  body (`ink-body`), hairline borders (`line`). Never pure `#000000` on
  `#ffffff`: 21:1 contrast causes halation fatigue on long pages.
- 10% isolation action color: CTA only (section 2).

Contrast is pinned, not hoped for: `contrastPairs` in `tokens.ts` lists
every documented text/background pair with its minimum ratio, and tests
enforce it. Body pairs hold 4.5:1; the light CTA pairs are large-text/UI-only
at 3:1 and the README labels them as such. `faint` is decorative-only and
must never render text.

Type rules:

- Body copy is 18px (`text-body`) with 1.65 leading on desktop, never
  14px/15px sales copy. Inputs are 16px minimum (iOS zoom prevention).
- Display headlines (36-56px) get tight tracking (-0.025em to -0.035em) and
  tight leading (1.08-1.15). Loose leading fragments multi-line headlines.
- Font stack: high-x-height neo-grotesques (Inter first). Serif
  (`serif-accent`) is accent-only: italic keyword spans inside headlines via
  `.fx-serif-accent`, never body.
- `text-wrap: balance` on headings, `text-wrap: pretty` on prose. No
  headline orphans.
- One radius role per step (`radius-sm` through `radius-full`); never a
  single radius everywhere.

## 6. CTA system

Every primary conversion trigger is a three-part CTA cluster:

1. The action button: 56px minimum height (`md`), 64px (`lg`, the
   default), 32px horizontal padding, 8px radius (or 9999px pill for
   consumer/DTC), semibold 18-20px, first-person or outcome-driven copy
   ("Get My Custom Growth Plan", not "Submit").
2. Tactile depth (micro-skeuomorphism): 1px top inner specular highlight
   (`inset 0 1px 0 rgb(255 255 255 / 0.35)`), pressed bottom edge
   (`inset 0 -2px 0 rgb(0 0 0 / 0.2)`), vertical gradient (lightened top
   through CTA at 48% to darkened bottom), CTA-hued ambient shadow (55%,
   65% on hover, collapsing to 40% on press), darkened border, and a
   subtle text emboss (dropped in dark theme, where it would muddy dark
   text on a light CTA). Hue pieces derive from `--solidix-funnel-cta`
   via `color-mix` so `data-cta` switches just work. Flat fallbacks
   precede each `color-mix` declaration for older browsers. Hover lifts
   1px, active presses 1px with an inner shadow.
3. Friction-killer microcopy 8px beneath in 14px muted text, resolving the
   top unspoken objection at click hesitation ("100% Free for 14 Days, No
   Credit Card Required").

Component rules (`CTAButton`, `CtaCluster`):

- `primary` is the single page-level action; `secondary`/`ghost` are
  supporting weights. Default size is `lg`.
- `href` renders an anchor, otherwise a button (discriminated union props).
  Disabled/loading anchors get `aria-disabled` and ignore activation;
  loading buttons show a spinner and block clicks.
- `fullWidth` stretches (always full width on small screens via CSS).
- `glow` adds an opt-in rotating conic halo behind `primary` only (other
  variants ignore it). The halo derives from the CTA tokens, so hue
  switches and dark theme just work; the reduced-motion guard collapses
  it with all other motion.
- Every CTA click dispatches `funnel:cta` with block, variant, label, href
  before invoking consumer `onClick`.

## 7. Forms

`OptInForm` follows NN/g conformance plus mobile conversion rules:

- Single-column law: never side-by-side name fields. The eye travels one
  vertical line.
- Static 14px medium labels 6px above each input. Placeholders are hints,
  never labels. Optional fields are explicitly marked.
- Inputs use body size (18px), satisfying the 16px iOS-zoom minimum,
  with dedicated field tokens (`field-bg`, `field-ink`, `field-line`,
  `field-placeholder`). Tones never re-scope field tokens: fields stay
  light and legible on every tone (pinned by `css-scopes.test.ts`).
- High-visibility `:focus-visible` ring (3px brand/action tint).
- Native validation plus inline success (`role="status"`); errors use
  danger tokens with multi-cue messaging (color plus text/icon, never color
  alone).
- `funnel:submit` detail carries field names only, never values. No PII in
  analytics, ever. Values go only to the consumer `onSubmit` callback.

## 8. Conversion patterns

### StickyBar: one persistent element per viewport

- Mobile only (`display: none` at 768px+). Fixed bottom bar with blur
  backdrop, blur-safe padding, top hairline border.
- Reveals via `IntersectionObserver` on the hero CTA (`observe` selector)
  once it scrolls out of view; falls back to `showAfter` scroll depth
  (default 600px) when the target is missing or observers are unavailable.
- When hidden it is `aria-hidden` and its CTA is `tabindex="-1"`.
- Desktop keeps the sticky header instead. On mobile the header scrolls
  away (`position: static` under 768px) and the bar takes over. Two sticky
  competing elements reads as spam; the responsive-chrome test pins exactly
  one per viewport.

### Countdown: honest urgency only

- Takes a real deadline (`endsAt` epoch ms), ticks every second, pads units,
  fires `onExpire` exactly once. `now` and `interval` are injectable for
  tests.
- Uses a `timer` role with tabular digits. Fake scarcity (resetting timers,
  evergreen countdowns) is out of scope and must not be added.
- Layout: centered column (caption over centered units row with a leading
  icon chip), composed inside a `reading` container. Never left-aligned
  orphan blocks.

### ExitIntent: dialog-backed, capped, desktop-only

- Built on the Dialog primitive (full focus management and Escape handling).
- Frequency-capped via localStorage (default key, 30 days, `null`
  disables). Disabled on touch devices (no exit gesture) and via `disabled`.
- Entry animation only: overlay fades, content rises. No exit animation
  (unmounts on close, Radix parity).

### Supporting patterns

- `VideoFrame`: VSL thumbnail with `fetchpriority="high"`, `loading="eager"`,
  and AspectRatio-reserved space. Never lazy-load hero media.
- `ComparisonTable`: featured us-column with elevated surface, accent
  top/bottom borders, success checkmarks, heavier weight; competitor columns
  muted with gray/red crosses. The scroller is `position: relative` with
  `overflow-x: auto` so clipped labels cannot expand page scrollWidth on
  narrow viewports (verified in headless Chrome, pinned by test).
- `Pricing`: annual billing default, controlled or uncontrolled period,
  cross-fading toggle pill with popping indicator dot, highlighted plan
  re-scopes its surface (literals, same gotcha as section tones).
  One-time offers pass a single `periods` entry: the toggle hides and the
  price lines carry the one-time cost (the period name never surfaces).
- `Guarantee`: seal box with icon seal, risk-reversal copy.
- `Faq`: divider accordion with deep-linkable `#faq-<id>` items, defaulting
  to the location hash. Answers animate on the accordion's measured
  `--radix-accordion-content-height`.
- `Header`: zero-escape bar. Brand renders as text, never a link; one CTA.
  `sticky` pins on desktop only (see StickyBar rule above).
- `Hero`: the secondary CTA carries `.fx-hero-secondary` and hides below
  640px, so mobile shows the single primary action; it returns at sm and up.

## 9. Footer: zero-leak design

Four containment rules apply to every footer link:

1. Categorize by containment type. `funnel` links stay in-page (use
   `#anchor` hrefs into the funnel). `legal` links (privacy, terms, refund,
   cookies) open in a new tab with `target="_blank" rel="noopener
   noreferrer"` so a mid-funnel click never destroys session momentum.
   `support` links trigger chat (`onClick`), a modal, or direct
   `mailto:`/`tel:` with operating hours. Legal links passed via
   `legalLinks` are always forced legal.
2. Ban social icons. Social feeds are near-100% conversion killers. The
   space holds trust badges (payment marks, seals, support hours) instead.
   There is intentionally no social-icon slot.
3. Dampen link contrast (anti-salience): muted 14px links, no underline
   until hover. Never brand blue or CTA orange.
4. Install the final-net CTA dam: a high-contrast CTA block directly above
   the footer (section 2).

Three archetypes, chosen by link count:

- `utility` (3-6 links): single muted row above a narrow legal block. Paid
  traffic, VSLs, lead gen. Flattens columns into one row.
- `trust` (6-10 links): 2-column link cluster plus verified-business
  identity block (address, phone, registration, hours). High-ticket,
  fintech, health, coaching.
- `sitemap` (10-18+ links, default): anchor-mirrored columns that look
  corporate but mostly jump back into the funnel. DTC, enterprise SaaS.

Trust badges: `FooterBadge` is `string | { label, icon }`. Built-in generic
glyphs are `lock | shield | check | card` (fresh element per call: never
share one node across pills). Payment-brand marks are consumer-provided via
the `JSX.Element` slot; trademarked artwork stays out of the system. This
trademark boundary is deliberate, not a gap.

## 10. Motion

State changes animate with pure CSS keyed on primitives' `data-state`
attributes. There is no JavaScript animation runtime and no scroll
listener anywhere in the package.

What animates:

- FAQ answers slide on accordion open/close via the measured content
  height variable.
- Pricing toggle options cross-fade the checked pill; the indicator dot
  pops in.
- Exit-intent overlay fades while content rises (entry only).
- Testimonial carousel slides remount per index so the entry fade replays.
- CTA buttons, the sticky bar, and the FAQ plus icon run small transitions.
- Primary CTAs with `glow` rotate a conic halo behind the button (one
  `@property`-registered angle, `duration-glow` timing).

Hard rules (enforced by `motion.test.ts`):

- Every duration/easing references motion tokens. A literal `ms`/`s` or
  `cubic-bezier(` inside any `animation`/`transition` declaration fails.
- Every animation name is an `fx-`-prefixed keyframe defined in
  `blocks.css`.
- Animate `transform` and `opacity` only (the glow's registered angle is
  paint-only). The FAQ accordion height animation is the documented
  exception (Radix measured-height parity); `scaleY` would distort text
  and the grid-rows trick triggers layout anyway.
- The `prefers-reduced-motion` guard in `tokens.css` collapses all
  durations. Blocks must stay fully readable with motion disabled.
- No scroll-triggered reveals: they cost an observer plus a11y risk for
  little conversion value. IntersectionObservers exist only for StickyBar
  reveal and hero `funnel:view`, never for animation.

## 11. Accessibility

- Behavior comes from primitives: FAQ keeps full accordion keyboard
  support, pricing toggle keeps radiogroup semantics, exit intent keeps
  dialog focus trap and Escape, carousel announces via polite live region.
- Countdown uses a `timer` role; star ratings use `role="img"` with
  computed labels; form success uses `role="status"`.
- Decorative SVGs are always `aria-hidden="true"` (bare `aria-hidden`
  renders as `""`, which is visible to AT: always write the explicit
  `"true"`).
- Focus is always visible: a `:focus-visible` ring scoped to
  `[data-funnel-root]` descendants and `[data-funnel-block]` roots (so
  consumer pages outside funnel markup keep their own focus style), plus
  3px field rings. Carousel has no autoplay; all controls are Tab-reachable
  in order.
- Errors and status are multi-cue (color plus text or icon).

## 12. Performance

Budgets are decisions, enforced by `css-budget.test.ts`:

- `tokens.css` under 12 kB, `blocks.css` under 43 kB (raised from 42 kB
  for balanced flex wrapping on the short item rows). Growth past budget
  requires a conscious budget change, not silent creep. (blocks.css sits
  near its ceiling: check bytes before adding block styles.)
- Hero media is eager with reserved AspectRatio space (no CLS). Below-fold
  images lazy-load.
- No analytics SDK is bundled. Blocks dispatch `funnel:cta`,
  `funnel:submit`, `funnel:view` as bubbling composed CustomEvents; any
  snippet observes them.
- Observers over scroll listeners. The only scroll listener is StickyBar's
  fallback path, passive.

## 13. Events and A/B variants

- `Root` takes `theme`, `cta` hue, and `variant`. The variant flows through
  context into every event's `detail.variant`.
- Event detail always includes `block` and `variant`. CTA events add label
  and href; submit events add field names only (no PII, section 7); view
  events fire once per mount at 25% hero visibility.
- Consumers forward events to any analytics snippet with three
  `addEventListener` calls (see gallery docs example). The package never
  imports analytics code.

## 14. Component code patterns

How blocks are built (follow these exactly for new blocks):

- Data-driven props: pass content, get themed markup. Fixed structure, no
  `asChild`, no render props. Restyle through tokens and documented
  `.fx-*` classes, which are public API.
- Every block root carries `data-funnel-block="<name>"` and an `fx-*`
  class via `cx()`. Variants ride on `data-*` attributes
  (`data-tone`, `data-size`, `data-variant`, `data-state`), never on
  conditional class soup.
- Internal plumbing uses `omit()` to strip consumed props; the rest
  spreads onto the rendered element. `ref` is a plain prop passed
  through. `class` merges via `cx()`, consumer classes appended last so
  they win ties.
- Behavior from primitives: reach for Dialog, Accordion, Form,
  RadioGroup, AspectRatio before hand-rolling. Match sibling block file
  organization (`layout`, `cta-button`, `conversion`, `consideration`,
  `proof`) and add exports plus types to `index.ts` together.
- Icons are inline SVG, `aria-hidden="true"`, `currentcolor` strokes.
  `footerBadgeIcon()` returns a fresh element per call because sharing one
  node across pills would move it.
- Style objects use kebab-case keys and object form only; lowercase
  `tabindex` in spreads that flow through merges.
- `submit` handling: `preventDefault`, `checkValidity` gate, then
  dispatch event, then consumer callback.

## 15. Testing and enforcement

Each test file pins one contract. Touching a contract means updating its
test in the same change:

| Test file                | Contract                                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `tokens.test.ts`         | Generated CSS matches `tokens.ts`; contrast pairs meet minima; README ratio table matches computed values              |
| `css-budget.test.ts`     | Byte budgets for both stylesheets                                                                                      |
| `css-scopes.test.ts`     | Tone-scope literals, field-token isolation, container tiers, one-chrome-per-viewport, comparison containment           |
| `motion.test.ts`         | Token-only timing, `fx-` keyframes resolve, `data-state` hooks exist, reduced-motion guard                             |
| `cta-button.test.tsx`    | Tactile variants, sizes, loading/disabled, anchor/button union, event emission                                         |
| `layout.test.tsx`        | Containers, tones, header zero-escape, prose/highlight                                                                 |
| `proof.test.tsx`         | Ratings, logos, testimonials, carousel remount + live region                                                           |
| `consideration.test.tsx` | Benefits, comparison, pricing toggle, guarantee, FAQ deep links                                                        |
| `conversion.test.tsx`    | Hero, forms (no PII in events), countdown honesty, sticky reveal, exit intent caps, footer containment/variants/badges |
| `events.test.ts`         | Event contract shape (bubbles, composed, detail)                                                                       |

Verification for any funnel change: `pnpm --filter @solidix/funnel
typecheck`, `npx vitest run packages/solid/funnel`, package `lint`, and
`pnpm --filter @repo/gallery build` when demos or docs change. Browser-verify
visual changes in the gallery reference page (headless Chrome CDP), never by
jsdom alone.

## 16. Checklists

### Add a new block

1. Assign it a funnel stage (section 3) and a home file (section 14).
2. Design props as data, not slots: content in, themed markup out.
3. Root gets `data-funnel-block` plus `fx-*` class; variants via `data-*`.
4. Style with tokens only; add tokens to `tokens.ts` first if a value is
   missing, then regenerate. Check the CSS byte budget.
5. Motion, if any, is CSS on `data-state` with token timing (section 10).
6. Dispatch the matching funnel event with block + variant (section 13).
7. Add tests mirroring sibling coverage, update README block list and
   gallery docs (`docs/funnel.ts`), extend the reference demo, add a
   changeset.
8. Assign `data-funnel-part` names per section 19 and pin them in
   `test/editable.test.tsx` (markers on, zero residue off).

### Rebrand for a client

1. Override tokens in one stylesheet (`:root` plus optional
   `[data-funnel-theme="dark"]`), never component code.
2. Pick the CTA hue (`data-cta`) by vertical; keep brand and CTA distinct.
3. Re-check contrast pairs if any text/background token changed; update the
   pinned table.
4. Verify the gallery reference page in both themes, desktop and 360px
   mobile, with motion both enabled and reduced.

## 17. Anti-patterns

| Never                                      | Why                                     | Do instead                                  |
| ------------------------------------------ | --------------------------------------- | ------------------------------------------- |
| Hand-edit `tokens.css`                     | Drift test fails; source is `tokens.ts` | Edit `tokens.ts`, run `pnpm gen:tokens`     |
| Put values in components                   | Breaks zero-JS theming                  | Reference tokens in CSS                     |
| Share one token for brand and CTA          | Destroys isolation effect               | Keep `brand-*` and `cta-*` distinct         |
| Pure black text on white                   | Halation fatigue on long pages          | Slate `ink` on `paper`                      |
| 14px sales copy                            | Kills reading velocity                  | 18px body, 1.65 leading                     |
| Placeholder-only labels                    | Fails NN/g, hurts completion            | Static labels above inputs                  |
| Side-by-side form fields                   | Breaks single-column law                | Stack vertically                            |
| Social icons in footer                     | Near-100% conversion killer             | Trust badges                                |
| Same-tab legal links                       | Destroys session momentum               | `target="_blank" rel="noopener noreferrer"` |
| Sticky header + sticky bar on one viewport | Competing chrome reads as spam          | Exactly one persistent element per viewport |
| Fake urgency (resetting timers)            | Erodes trust; out of scope              | Honest `endsAt` deadlines                   |
| Scroll-triggered reveals                   | Observer cost + a11y risk, low value    | `data-state` CSS transitions only           |
| Literal durations/easings in CSS           | Motion test fails                       | Motion tokens                               |
| JS animation runtime                       | Weight + reduced-motion risk            | Pure CSS keyed on `data-state`              |
| PII in event detail                        | Privacy violation                       | Field names only; values to `onSubmit`      |
| Analytics SDK in package                   | Bundle + coupling                       | `funnel:*` CustomEvents, consumer snippet   |
| `asChild` on blocks                        | Breaks fixed-structure guarantee        | Tokens + `.fx-*` overrides                  |
| Autoplay anywhere                          | A11y + attention cost                   | User-triggered motion only                  |

## 18. File map

| Path                                    | Role                                                                               |
| --------------------------------------- | ---------------------------------------------------------------------------------- |
| `PHILOSOPHY.md` (this file)             | Intent and rules agents implement from                                             |
| `README.md`                             | Consumer reference: install, tokens, contrast table, blocks, motion                |
| `src/tokens.ts`                         | Token source of truth + contrast pairs + CSS renderer                              |
| `src/tokens.css` (generated)            | Zero-JS theme layer, dark variant, CTA hues, focus/selection, reduced-motion guard |
| `src/blocks.css`                        | All block visuals; `.fx-*` public API                                              |
| `src/root.tsx`                          | Theme/CTA/variant scope                                                            |
| `src/layout.tsx`                        | Section, Container, Header, SectionHeading, Eyebrow, Prose                         |
| `src/cta-button.tsx`                    | CTAButton, CtaCluster                                                              |
| `src/conversion.tsx`                    | Hero, OptInForm, VideoFrame, Countdown, StickyBar, ExitIntent, Footer              |
| `src/consideration.tsx`                 | Benefits, HowItWorks, ComparisonTable, Pricing, Guarantee, Faq                     |
| `src/proof.tsx`                         | LogoBar, Testimonials, TestimonialCarousel, StatsBar, StarRating                   |
| `src/events.ts`                         | `funnel:*` event contract                                                          |
| `src/index.ts`                          | Public exports (components + types together)                                       |
| `test/*`                                | Contracts in section 15                                                            |
| `internal/gallery/src/demos/funnel.tsx` | 8-stage reference implementation                                                   |
| `internal/gallery/src/docs/funnel.ts`   | Live docs for the gallery site                                                     |

## 19. Studio editing contract

Editors (visual studios, click-to-edit canvases) resolve edit targets from
stable markers instead of owning block internals. The contract has three
pieces: a flag, markers, and a map owned by the consumer.

Mechanism. `Root` accepts `editable?: boolean` (default off), inherited
through context. When on, blocks render `data-funnel-part="<name>"` on
elements bound to block-prop data, plus `data-funnel-part-index` for
repeated items and `tabindex="0"` on static text so parts stay keyboard
reachable. Root renders `data-funnel-editable`, which scopes the cursor and
part-outline affordances in `blocks.css` (persistent light outlines, stronger
on hover). When off, none of these attributes render
and public output is byte-identical to unmarked markup; every `editable`
readiness test in `test/editable.test.tsx` asserts both directions.

Naming. Part names are kebab-case, block-scoped (the same name in two blocks
is fine; resolution always pairs the nearest `data-funnel-block` with the
nearest `data-funnel-part`), and stable public API at the same bar as token
names: renaming a part breaks consumer maps, so pin the per-block inventory
in tests. Indices are positional; nested repeats join with `-`
(`column-link` at `"1-2"`). Prefer names that mirror the data model
(`primary-cta`, `plan-cta`) over generic ones.

Marking rules. Mark the innermost element that fully represents the datum:
the text element for copy, the control root for single-text controls
(`CTAButton` marks its own root so the full hit area resolves), the image
for image props, the control for inputs. Skip computed values (countdown
units, carousel counts), derived text (form errors, toggle labels),
decorative icons, and pure layout (`Section`, `Container` take no parts).
Children-passthrough text blocks (`Eyebrow`, `Prose`) mark their root as
`text`. Nested blocks resolve through the block path (a rating inside a
testimonial needs no special casing), except same-block siblings with
different field sources: composing parents pass `part`/`partIndex` to the
inner `CTAButton` (`primary-cta`, `plan-cta` plus the plan index) so each
sibling resolves distinctly.

`part`/`partIndex` render only when editable, even when passed; explicitly
passed props never leak markers into public output. Editors own the
`(block, part, index)` to field map and resolve clicks via
`closest("[data-funnel-part]")`, falling through to section selection for
unmapped regions. Values stay in the consumer model; markers carry identity
only, never PII. The editing affordance CSS must fit the section 12 budget
and stay scoped under `[data-funnel-editable]` so it is dead for shipped
output.
