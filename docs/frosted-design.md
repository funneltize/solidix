# Frosted UI port design: optional styled theme for Solidix

Status: proposal (2026-10-27). Locked decisions: full port of frosted-ui
(~79 components), a new package (headless primitives stay pure), and this
design doc before any code.

This file is a design doc, not a user guide, so it stays out of
`internal/gallery/src/guides.ts` until implementation produces user docs.

## 1. Goal and non-goals

Goal: a Solid port of [frosted-ui](https://github.com/whopio/frosted-ui)
(Whop's design system, MIT licensed) as an opt-in styled layer over
Solidix headless primitives: the Radix-Themes equivalent for Solid 2.

Non-goals:

- Restyling or forking the design. Frosted's look, tokens, and `fui-*`
  class names cross over intact; only React-isms adapt to Solid.
- Porting the native, icon, Tailwind, or Figma packages. The port covers
  `packages/frosted-ui` (components + styles) and the token/color CSS it
  needs. Icons stay consumer-provided; the 40 kB emoji-color table stays
  out unless a wave needs it.
- Touching headless packages. Styled components consume `@solidix/*`
  primitives; no primitive changes itself for the theme.

## 2. Upstream baseline

Upstream: `whopio/frosted-ui` at commit `56787900bfe0` (main,
2026-10-26). The package version is `0.0.0` (released via changesets
under a different flow), so the baseline pins the commit hash, not a
version. Frosted warns it is still a work in progress with breaking
changes: re-check the diff on each re-baseline and record the new hash.

License: MIT, copyright WorkOS + Whop (`license.md`). The port keeps the
attribution: copy the license text into the new package README (or a
`NOTICE` file) and keep per-file provenance (upstream path + pinned
commit) in ported CSS headers.

Upstream shape (verified against the repo):

- One package, `frosted-ui`, with subpath exports per component plus
  `./styles.css` (everything) and `./styles.lite.css` (tokens/theme
  layer without component styles, built by `scripts/build-lite-css.js`).
- `src/styles/`: reset, fonts, animations, breakpoints, scrollbars,
  utilities, and `tokens/` (color, semantic-color, radius, shadow,
  space, typography, cursor), bundled with postcss from `index.css`.
- Per component: `<name>.tsx` + `<name>.css` + `<name>.props.ts`
  (centralized prop defs), thin wrappers over shared `base-*`
  components (`base-button`, `base-menu`, `base-tabs-list`,
  `base-segmented-control-list`) with `fui-*` classes.
- Base primitives come from `@base-ui/react` (the Radix successor API),
  not Radix directly. The Solid port swaps this layer for `@solidix/*`
  headless primitives with equivalent behavior.
- `Theme` root: `appearance`, `accentColor`, `grayColor`, info / success
  / warning / danger colors, `hasBackground`, each controlled or
  uncontrolled with change handlers; nested `Theme` scopes overrides.
  `TooltipProvider` (delay grouping) stays separate and opt-in, same as
  upstream.

## 3. Package layout

One package: `@solidix/frosted`.

Rationale: mirrors the upstream single-package shape, keeps the JSR
surface to one subpath (`./frosted`), and makes the theme genuinely
optional - nothing headless depends on it. Per-component packages would
multiply scaffolding for 79 thin wrappers with no isolation benefit,
since all styling resolves through the shared theme CSS.

Internal module sketch:

```text
packages/solid/frosted/src/
  index.ts            public entry (Theme, TooltipProvider, all components)
  theme.tsx           Theme root + nested overrides + useThemeContext
  theme-options.ts    ThemeOptions, prop defs, gray-color matching
  styles/
    index.css         postcss entry -> styles.css (full bundle)
    tokens/           ported token layer (color, radius, space, ...)
    reset.css         ported reset, SCOPED (section 5)
    utilities/        ported utilities
  components/
    button/           button.tsx + button.css + button.props.ts + index.ts
    ...               one directory per component, same files
  styles.css          GENERATED bundle (committed, vendored-copy model)
  styles.lite.css     GENERATED tokens-only bundle (committed)
```

Umbrella wiring on first release: `export * as Frosted` in
`packages/solid/solidix/src/index.ts` plus the test-table row, per the
meta-package convention.

## 4. Base-primitive mapping

Every frosted component that wraps a Base UI primitive maps to the
`@solidix/*` equivalent. The overlapping set (verify each mapping at
build time, since Base UI and Radix APIs drift):

| Frosted component(s)                      | Solidix base                                                 |
| ----------------------------------------- | ------------------------------------------------------------ |
| Dialog, AlertDialog, Drawer               | `@solidix/dialog`, `-alert-dialog`                           |
| Popover, Tooltip, HoverCard               | `@solidix/popover`, `-tooltip`, `-hover-card`                |
| DropdownMenu, ContextMenu, Menubar pieces | `@solidix/dropdown-menu`, `-context-menu`, `-menubar`        |
| Select, Combobox, Autocomplete            | `@solidix/select` (+ custom filtering where Base UI differs) |
| Checkbox, RadioGroup, Switch, Slider      | matching `@solidix/*`                                        |
| Tabs, SegmentedControl family             | `@solidix/tabs` (+ custom segmented styling)                 |
| Accordion, Collapsible                    | `@solidix/accordion`, `-collapsible`                         |
| Progress, ScrollArea                      | `@solidix/progress`, `-scroll-area`                          |
| OTPField, Form/Field pieces               | `@solidix/one-time-password-field`, `-form`, `-label`        |
| Avatar, Separator, AspectRatio            | matching `@solidix/*`                                        |

Presentational components (text, heading, link, code, blockquote, card,
badge, callout, kbd, data-list, table pieces, container, section, grid,
inset, spinner, skeleton, empty-state, breadcrumbs, country-flag,
credit-card) need no headless base and port as pure Solid components
plus CSS. Flag at build time anything whose Base UI behavior has no
Solidix counterpart (calendar grid, date-field segments, lightbox focus
trap scope): those get a mini-design before code.

## 5. CSS strategy

Port CSS nearly verbatim, with three deliberate deviations:

1. **Keep `fui-*` class names.** Renaming would break ecosystem
   familiarity and make upstream diffs unreadable. The port reads as
   frosted-ui for Solid, which is the point.
2. **Scope the reset.** Upstream `styles.css` applies a global reset;
   an optional theme must not restyle the consumer's page. Port reset
   rules under the Theme root selector and document the deviation.
   Tokens likewise attach to the Theme root (plus `:root` fallbacks
   only where upstream requires them for `color-scheme`).
3. **Assemble two bundles.** `styles.css` (tokens + all component
   styles) and `styles.lite.css` (tokens/theme only), generated by a
   repo script from colocated sources and COMMITTED, following the
   funnel/motion vendored-copy model: JSR ships JS modules only, so
   consumers copy the CSS files from the repo. Re-verify the exact
   lite/full split against upstream `build-lite-css.js` at build time.

Dark mode, accent/gray/semantic color switching, and radius/scaling all
ride the Theme data attributes exactly as upstream; verify the attribute
names and the `.dark` (or equivalent) selector mechanism from
`theme.tsx` + token CSS at build time rather than assuming Radix Themes
shapes.

Stylelint (or the repo's configured CSS gate, if any) runs over ported
CSS per wave; visual verification is gallery demos plus headless-Chrome
screenshot spot-checks (charts precedent), not snapshots.

## 6. Solid API mapping

| Frosted (React + Base UI)     | Solidix port                                                             |
| ----------------------------- | ------------------------------------------------------------------------ |
| `className`, `style`          | `class`, `style` (kebab-case keys per repo rule)                         |
| `asChild` / `render` props    | `asChild` via `@solidix/slot` where the base supports it                 |
| `React.createContext` theme   | Solid context (context is its own provider)                              |
| `useState` + `useEffect` sync | `useControllableState` per option (repo precedent)                       |
| `useRender`, `mergeProps`     | Solid JSX + `mergeProps` from `solid-js`                                 |
| `DirectionProvider`           | Existing direction support if the repo has one; otherwise port minimally |
| `displayName`                 | Kept for devtools parity                                                 |
| Event props (`onOpenChange`)  | `onX` Solid events with the same payloads                                |

`exactOptionalPropertyTypes` (`prop?: T | undefined`), lowercase
`tabindex`, `aria-hidden="true"`, boolean-aria normalization, and the
`children()` memo discipline all apply per AGENTS.md. Class merging
follows the repo's existing helper (check funnel/motion for the
convention at build time; do not add `classnames`).

## 7. Test strategy

- Behavior tests port from frosted-ui's vitest suite where it exists;
  where it does not, write Solidix-authored tests asserting observed
  upstream behavior (same rule as Radix grounding: never invent
  expectations from memory).
- Theme tests: controlled/uncontrolled options, nested overrides,
  dark + accent switching reflected in attributes.
- Per-component tests live in `test/*.test.tsx`, run from root vitest
  with `findBy*` + `flush()` per repo convention.
- jsdom cannot verify visuals: each wave adds gallery demos, and
  screenshot spot-checks (light + dark + one accent) prove the CSS
  landed. No CSS snapshots.

## 8. Phased waves

Each wave is its own change with components, styles, tests, gallery
demos, README/docs updates, and a `minor` changeset (new `0.x` surface).

- Wave 0 (foundation): scaffold `@solidix/frosted`, Theme +
  theme-options + TooltipProvider, full token layer, CSS build script
  producing committed `styles.css` / `styles.lite.css`, gallery wiring,
  license/attribution files, umbrella export.
- Wave 1 (type + layout): text, heading, link, code, blockquote, kbd,
  em, quote, container, section, grid, flex, box, inset, separator,
  skeleton, spinner. Presentational, high volume, low risk.
- Wave 2 (form controls): button, icon-button, base-button, text-field,
  text-area, number-field, date-field, checkbox, radio-group,
  radio-button-group, switch, slider, select, otp-field, field,
  fieldset, form, label. Needs the base-primitive mapping verified.
- Wave 3 (overlays): dialog, alert-dialog, drawer, popover, tooltip,
  hover-card, dropdown-menu, context-menu, lightbox. Focus management
  and Portal/Presence discipline per repo rules.
- Wave 4 (navigation + data): tabs, segmented-control family,
  breadcrumbs, scroll-area, progress, circular-progress, data-list,
  table pieces, card, badge, callout, avatar (+group/stack),
  scroll-gallery.
- Wave 5 (complex + remainder): calendar, date-picker, date-range-picker,
  combobox, autocomplete, filter-chip, empty-state, credit-card,
  country-flag, bot-avatar, and anything flagged in earlier waves.
  Calendar/date-field segments get their mini-designs here.

Out of scope: icons package, emoji colors, Tailwind plugin,
react-native, theme-panel devtool, Figma sync.

Wave 0 acceptance: `Theme` renders with tokens applied in light + dark,
one presentational component (e.g. Button) styled end to end, gallery
demo page live, both CSS bundles generated and committed, and
`pnpm release:dry-run` still green with the new package staged.

## 9. Risks and open questions

1. Frosted is pre-1.0 and warns of breaking changes; the commit pin is
   load-bearing and every wave re-checks upstream drift for the files
   it ports.
2. Base UI and Radix APIs differ in details (render props, field
   parts); each Wave 2-3 mapping needs source-level verification, not
   name matching.
3. The global-reset scoping (deviation 2) may subtly change
   pixel-parity with upstream where frosted relies on reset side
   effects; screenshot spot-checks against the frosted Storybook decide
   these case by case.
4. CSS volume: 95 source files bundling into vendored copies grows the
   repo and the gallery build; watch build output size per wave.
5. JSR consumers cannot `import` the CSS (JS modules only); the README
   must document the vendored-copy flow prominently, like funnel/motion.

## 10. Next step

Approve this doc (or amend wave order and the out-of-scope list), then
scaffold `@solidix/frosted` per the scaffold conventions and start
Wave 0. No code, changeset, or gallery wiring ships with this doc change.
