# Backend UI design: compact SaaS layer for Solidix

Status: approved (2026-11-11). Locked decisions: Solid 2 package inside
Solidix as `@solidix/backend`, design spec before code, first focus is
SaaS shell plus data UI. Wave 0 in progress.
before Wave 0 if the plainer name is preferred - decide once, then never
rename tokens or classes after release).

This file is a design doc, not a user guide, so it stays out of
`internal/gallery/src/guides.ts` until implementation produces user docs.
Read `docs/frosted-principles.md` and
`packages/solid/funnel/PHILOSOPHY.md` first: this package inherits both
disciplines and adds a third surface on top of them.

## 1. Goal and non-goals

Goal: make polished, clean, modern, compact, intuitive SaaS backends
(admin panels, consoles, dashboards, internal tools, settings-heavy
products) fast to build correctly for both humans and coding agents.
The package sits above `@solidix/frosted` and the headless
`@solidix/*` primitives. Frosted supplies the themed primitives and
token layer; this package supplies the backend opinions Frosted
deliberately leaves to the app: shell chrome, density, data density,
page structure, and recurring SaaS workflows.

Non-goals:

- Re-styling Frosted or forking its components. No second button, no
  second dialog. If a control exists in Frosted, this package composes
  it, never repaints it.
- Touching headless packages. No primitive changes itself for this
  layer, same boundary as `docs/frosted-design.md` section 1.
- Marketing or funnel surfaces. `@solidix/funnel` owns landing pages
  and direct-response blocks. This package never imports funnel.
- Owning app policy. Routing, data fetching, permissions, billing
  rules, and save/publish workflows stay in the consuming app. The
  library owns presentation, interaction, and layout contracts only.
- A 150-component catalogue. Astryx scale is a lesson in discipline,
  not a target count. Every component here must earn its place in a
  backend workflow (section 8).

## 2. Inspirations and what we take from each

### Frosted UI (Whop)

Source: `whopio/frosted-ui`, already ported as `@solidix/frosted`
(see `docs/frosted-design.md` for the pinned baseline). Take:

- Token-first styling with Radix 12-step color scales, semantic
  roles over numbered steps, and one-file retuning.
- Compact, dense defaults tuned for product UI rather than marketing.
- `Theme` root with appearance, accent, and gray controls, nested
  theme scopes, and dark mode through data attributes.
- Thin wrappers over headless primitives so accessibility, keyboard
  models, and focus management come from the primitive layer.

Do not take: the single-package 79-component breadth as a checklist.
Backend UI is a curated subset plus shell and data patterns Frosted
leaves as app-owned composition today (see `docs/app-shell.md`).

### Astryx (Meta)

Source: [meta/astryx](https://github.com/meta/astryx) and
[astryx.atmeta.com](https://astryx.atmeta.com/docs/principles)
(React 19 plus StyleX, 150+ components, beta at time of writing).
Astryx is a reference for method, never a dependency. Take:

- Agent-ready by construction: a CLI `init` that writes agent docs
  into `AGENTS.md`, a machine-readable component index, predictable
  prop patterns, and docs an agent can load in full without guessing
  props. Section 10 ports this idea to Solidix conventions.
- Frame-first layout: pick the shell and budget regions before
  writing content. Section 7 makes this the first API decision.
- Components over raw HTML, semantic tokens over hardcoded values,
  and theme-agnostic app code (never reference a hex value or a
  specific theme in consumer code).
- Dense data renders as edge-to-edge rows with dividers; cards are
  for widgets, galleries, and settings groups, never as a wrapper
  around every table.
- Controlled form inputs (`value` plus change handler) as the
  default contract, with uncontrolled support where Solid idioms
  prefer it (section 9).

Do not take: StyleX, React APIs, or the theme package model. The
Solid port keeps Frosted CSS tokens, `class` over `className`, and
Solid fine-grained reactivity throughout.

### Solidix house rules that still apply

- Parity and accessibility come from `@solidix/*` primitives; this
  layer adds no new keyboard models where a primitive exists.
- `exactOptionalPropertyTypes` (`prop?: T | undefined`), lowercase
  `tabindex`, `aria-hidden="true"`, kebab-case style keys, and the
  `children()` memo discipline from AGENTS.md apply unchanged.
- JSR docs are load-bearing: `@module` via the publish script only,
  JSDoc on every exported value and type in the same change.

## 3. Where this package sits

```text
@solidix/backend   (this package: shell, data, backend workflows)
  depends on
@solidix/frosted   (themed primitives, Theme, fui-* styles, tokens)
  depends on
@solidix/*         (headless primitives: dialog, select, menu, ...)
  depends on
solid-js 2         (reactivity, no VDOM)
```

Rules:

- Backend may import Frosted and any headless primitive Frosted
  already depends on. It never reaches past Frosted to repaint a
  Frosted component internal.
- Frosted and primitives never import backend. The dependency arrow
  points one way, so the headless and themed layers stay usable
  without backend opinions.
- Funnel and backend are siblings. An app may use both (marketing
  site plus product) with two theme roots; neither imports the other.

## 4. Governing principles

Eight principles. Each has an enforcement hook, not just intent.
Where a principle repeats `docs/frosted-principles.md`, this package
inherits the Frosted text and adds only the backend consequence.

1. Tokens first, roles over steps. Every color, space, radius,
   elevation, and duration comes from tokens. Backend code reaches
   for semantic roles (`--solidix-backend-surface-raised`,
   `--solidix-backend-row-height`) that alias Frosted steps. A literal in
   component CSS is a review failure. Extending the scale is the
   fix, never a one-off value.
2. Compact by default, comfortable by token. Backends are scanned,
   compared, and operated for hours. Default density targets 13px
   to 14px UI text, 32px controls, and 36px to 40px table rows.
   A single density token set flips a subtree to comfortable
   (section 6). No component hardcodes its own density.
3. Frame first. Every page starts from a shell region budget
   (sidebar, top bar, content, inspector) before content. Content
   never invents its own page chrome. This is the Astryx layout
   rule adapted to Frosted `Stack`, `Row`, and `SplitPane`.
4. Parents own spacing. Components carry no outer margins. Shell
   and layout primitives own gaps through the `--space-*` scale.
   A page sets rhythm in exactly one place per region.
5. Data as rows, cards as widgets. Tables, lists, and feeds render
   edge-to-edge with hairline dividers inside a region. `Card` is
   reserved for dashboard widgets, settings groups, and repeated
   entities in a gallery. Wrapping a table in a floating card on a
   tinted canvas is the anti-pattern this rule exists to prevent
   (see Astryx principles, rule 3).
6. Composition over configuration. Export small parts with slots
   and compound context (shell parts, table parts, page-header
   parts). A component with twenty boolean props is a design
   failure; split it. Leaf parts stay usable alone.
7. One tempo, no decoration motion. Interactions use Frosted
   duration tokens; panels use the dialog duration. No scroll
   reveals, no parallax, no chart animation choreography in this
   layer. `prefers-reduced-motion` collapses everything.
8. Agent-ready by construction. Every export carries JSDoc, every
   component ships a machine-readable prop definition, and the
   package ships a short agent cheat sheet an assistant can load in
   full (section 10). If an agent must guess a prop, the API is
   wrong, not the agent.

## 5. Package layout

One package: `@solidix/backend`.

Rationale: mirrors the Frosted single-package shape, keeps the JSR
surface to one subpath (`./console`), and keeps backend opinions
genuinely optional. Per-component packages would multiply
scaffolding for wrappers that all resolve through the shared
Frosted theme.

```text
packages/solid/backend/
  package.json          @solidix/backend, deps: frosted + primitives
  README.md             follows the repo header template
  PHILOSOPHY.md         short pointer to this doc plus package rules
  src/
    index.ts            public entry (Shell, data, workflow exports)
    theme.ts            BackendTheme: density + Frosted Theme bridge
    tokens.ts           backend token source (density, shell sizes)
    tokens.css          GENERATED from tokens.ts, committed
    backend.css         shell + data styles, imports tokens.css
    shell/              AppShell, Sidebar, TopBar, PageHeader, ...
    data/               DataTable, DataList, FilterBar, Pagination, ...
    workflow/           CommandMenu, EmptyState, Confirm, Stat, ...
    helpers/            cx re-export, prop defs, density context
  test/                 test/*.test.tsx per component group
  scripts/gen-tokens.mjs
```

Conventions carried from siblings:

- Token names are the stable API. All backend tokens live under
  `--solidix-backend-*`. No unprefixed custom properties.
- Edit `tokens.ts`, then run `pnpm gen:tokens`. A drift test fails
  if committed `tokens.css` differs, same as funnel.
- Component roots carry `data-backend-part="<name>"` plus a
  `sbx-*` class. Variants ride on `data-*` attributes (`data-density`,
  `data-tone`, `data-state`), never conditional class soup.
- CSS ships as vendored copies (`tokens.css`, `backend.css`) because
  JSR ships JS modules only, same model as funnel and Frosted. The
  README documents the copy flow prominently.
- Umbrella wiring on first release: `export * as Backend` in
  `packages/solid/solidix/src/index.ts` plus the test-table row,
  per the meta-package convention.

## 6. Token and density architecture

Backend adds a thin backend token layer over Frosted tokens. It
never redefines a Frosted color; it aliases roles and adds the
values Frosted does not own: density, shell dimensions, and data
surface roles.

Token groups:

- Density: `--solidix-backend-density-scale` (compact `1`,
  comfortable `1.25`) plus derived roles for control height, row
  height, cell padding, and shell gaps. Density is set once on
  `BackendTheme` (`density="compact" | "comfortable"`) and inherited
  by every part through CSS custom properties. No per-component
  density prop except an explicit subtree override.
- Shell: sidebar width (collapsed and expanded), top bar height,
  inspector width, content max width (none by default: backends
  fill the frame), and region gap roles.
- Data surfaces: row divider color role, row hover role, selected
  row role, sticky header surface role, and zebra role (off by
  default; dividers carry the rhythm).
- Type roles for backend text: UI text, micro metadata, tabular
  numbers (`font-variant-numeric: tabular-nums` on numeric cells),
  and mono for identifiers and keys. All steps come from the
  Frosted typography scale; backend adds roles, never sizes.

Rules:

- Dark mode, accent, and gray all ride the Frosted `Theme`. Backend
  tokens resolve through `light-dark()` pairs or Frosted semantic
  roles so a backend subtree follows its enclosing Theme with no
  extra provider work.
- Contrast pairs for every documented text and background pair are
  pinned in `tokens.ts` and enforced by test, same as funnel.
  Faint text is decorative only and never renders data.
- Retuning density or shell sizes is a one-file token change.
  Component CSS references roles only; a literal fails review.

## 7. Shell and layout system

Frame-first means the shell is the first component an app renders
and the last one it customizes. The app owns routing and policy;
the shell owns region geometry, scrolling, and chrome rhythm.

### AppShell

```tsx
<BackendTheme density="compact">
  <AppShell>
    <AppShell.Sidebar>...</AppShell.Sidebar>
    <AppShell.Main>
      <AppShell.TopBar>...</AppShell.TopBar>
      <Page>...</Page>
    </AppShell.Main>
    <AppShell.Inspector>...</AppShell.Inspector>
  </AppShell>
</BackendTheme>
```

Contracts:

- Regions scroll independently; the shell itself never scrolls.
  Sidebar and inspector keep their own scroll position across
  navigation.
- Sidebar collapses to icon rail by token-driven width, with full
  accessible names on every icon-only item. Collapse state is
  controllable (`collapsed` plus `onCollapsedChange`) with an
  uncontrolled default, per repo controllable-state precedent.
- Top bar is a budget, not a component with opinions about titles:
  leading (breadcrumb or title), center (search or command
  trigger), trailing (actions, avatar). The app fills slots; the
  shell sets height, divider, and spacing.
- Inspector is optional and overlays on narrow viewports rather
  than squeezing the canvas. Breakpoint behavior comes from token
  literals in media queries (custom properties do not work in
  media query conditions, per funnel precedent).
- Overlays (`Dialog`, `Sheet`, `CommandMenu`, `Toast` via Frosted)
  portal at the shell root, inside the app Theme. Shell provides
  the mount point convention; Frosted provides the behavior.

### Page structure

Every backend page composes the same three parts so humans and
agents can navigate any screen without relearning it:

1. `PageHeader`: title, description, breadcrumb, status, and one
   primary action plus overflow menu. Exactly one primary action
   per page. Tabs or segmented control for sibling views sit
   directly under the header, never inside content.
2. `FilterBar` (when the page lists data): search, filters, view
   toggle, result count. Filters report values; the app fetches.
3. Content region: a data surface (section 8), a form (section 9),
   a dashboard grid of widget cards, or a settings stack. One
   content type per page region; mixed pages use shell regions,
   not nested cards.

`SplitPane` from Frosted covers editor-shaped pages (outline,
canvas, inspector) with keyboard separators and min sizes. Backend
does not ship a second splitter.

## 8. Component inventory

Curated by backend workflow, not by catalogue size. Frosted already
supplies every control below the line; backend ships only what
Frosted leaves as repeated app composition.

### Ships in backend (new)

| Group    | Components                                                   | Job |
| -------- | ------------------------------------------------------------ | --- |
| Shell    | `BackendTheme`, `AppShell` (Sidebar, TopBar, Main, Inspector), `PageHeader`, `NavList` (grouped sidebar nav with badges) | Frame, navigation, page chrome |
| Data     | `DataTable` (sort, selection, pagination slots), `DataList`, `FilterBar`, `Pagination`, `BulkBar` (appears on selection) | Dense, scannable records |
| Workflow | `CommandMenu` (Cmd+K), `EmptyState`, `Stat` plus `StatGrid`, `Confirm` (destructive naming pattern), `SaveBar` (dirty-state bar) | Recurring SaaS tasks |
| Settings | `SettingsLayout` (section nav plus panel), `FieldRow` (label, control, hint, error in one row rhythm) | Settings-heavy products |

### Composed from Frosted (never reimplemented)

Buttons, inputs, select, combobox, checkbox, switch, slider, tabs,
dialog, sheet, popover, menus, tooltip, toast, avatar, badge, card,
table primitives, form and field, skeleton, spinner, separator,
scroll area, sortable. Backend styles none of these directly; it
places them.

Inventory rules:

- A candidate component must appear in at least two distinct
  backend workflows (for example, `FilterBar` in users and billing)
  before it ships. One-page needs stay in the app.
- Data components present rows they are given. Sorting state,
  selection keys, and pagination cursors are props with change
  handlers; fetching, filtering the full set, and permissions
  stay in the app (extends `docs/app-shell.md` DataTable rule).
- Row selection uses stable keys, never row indexes. Bulk actions
  appear in `BulkBar`, replacing the filter bar in place so the
  frame never jumps.
- `DataTable` cells: identifiers and numbers are tabular or mono
  per type role; row actions live in a trailing menu, not a column
  of buttons. Sticky header is on by default inside a scrolling
  region.

## 9. API conventions (humans and agents)

The same surface must be obvious to a person reading JSX and to an
agent generating it. These conventions are testable.

- Props mirror Frosted and Radix names wherever a Frosted
  counterpart exists. Solid mapping applies: `class` over
  `className`, `onX` handlers, `children` as Solid children.
- Controlled by default for workflow state (shell collapse,
  selection, sort, page, filters) with uncontrolled defaults via
  the repo controllable-state helper. Astryx requires controlled
  form inputs; backend follows for form and filter values, and
  documents the Solid uncontrolled escape hatch per component.
- Data in, events out. Components take plain data props (rows,
  columns, nav items as typed arrays or composed parts where
  ordering matters) and report typed change events. No component
  fetches, routes, or reads a global store.
- Compound parts over config objects for structure (shell regions,
  table header and body); data arrays over JSX for records (rows,
  nav entries). The README shows both shapes once, canonically.
- Every component ships: the component, a `*.props.ts` prop
  definition (machine-readable source for props, defaults, and
  classes, per Frosted precedent), full JSDoc, and one canonical
  usage example. Prop defs are the single source agents read;
  docs prose never contradicts them.
- No `asChild` on backend blocks. Frosted controls keep `asChild`;
  backend blocks have fixed structure restyled through tokens and
  documented `sbx-*` classes, same call as funnel blocks.
- Events are DOM events through props (`onSortChange`,
  `onSelectionChange`), not a global event bus. Analytics stays
  the app's job; backend dispatches no analytics payloads.

## 10. Agent readiness

Astryx proves the CLI plus generated docs pattern; backend adapts
it to a monorepo that already has AGENTS.md discipline.

Deliverables in Wave 0:

- `packages/solid/backend/AGENT.md`: a short cheat sheet (under
  200 lines) an agent can load in full. Contents: package purpose,
  import path, shell-first recipe, token rules, density rule,
  component index with one-line jobs, canonical page example,
  and anti-patterns (section 12). Written for agents, readable by
  humans, single source for both.
- Machine-readable index: each component's prop defs already serve
  this role; Wave 0 adds a generated `components.json` (name,
  import, props ref, one-line job) checked by a drift test, so an
  agent or a future CLI can look up a component without scanning
  source.
- Canonical recipes in the README: shell page, data page, settings
  page, dashboard page. Agents assemble recipes; they do not
  invent layout. Each recipe is also a gallery demo and a test
  fixture, so the documented shape is the tested shape.
- Future CLI (out of scope until Wave 2 proves the need): a
  `solidix backend init` that writes the AGENT.md pointer into a
  consumer's AGENTS.md and copies the vendored CSS, modeled on
  Astryx `cli init`. The files ship first; automation follows
  only if manual setup shows friction.

Agent failure modes this design prevents: inventing props (prop
defs plus index), hardcoding colors (token roles plus lint),
card-wrapping tables (principle 5 plus recipes), and building
page chrome per page (shell-first rule plus PageHeader).

## 11. Accessibility and quality bars

- All interactive behavior comes from Frosted and headless
  primitives: keyboard models, focus traps, roving focus, and
  ARIA are inherited, never reimplemented. Icon-only controls
  carry complete accessible names; decorative SVGs are
  `aria-hidden="true"`.
- Focus is always visible through the Frosted focus ring; density
  never shrinks a focus indicator or a hit target below platform
  minimums. Compact means shorter, not harder to operate.
- Tables keep native table semantics (Frosted `Table` underneath),
  sortable headers expose sort state to assistive tech, and
  selection announces count through a polite live region.
- Motion: token durations only, transform and opacity only, full
  reduced-motion collapse. A test pins token-only timing, same
  as funnel `motion.test.ts`.
- CSS budgets: `tokens.css` and `backend.css` get byte budgets
  enforced by test from Wave 0. Growth requires a conscious
  budget change in the same commit, never silent creep.
- Tests: behavior tests per component group in `test/*.test.tsx`
  from the root vitest run with `findBy*` plus `flush()` per repo
  convention. Visual proof is gallery demos plus headless-Chrome
  spot checks in light, dark, compact, and comfortable - jsdom
  alone never proves a visual change.

## 12. Anti-patterns

| Never | Why | Do instead |
| ----- | --- | ---------- |
| Repaint a Frosted component inside backend | Two sources of truth for one control | Compose it; fix gaps in Frosted |
| Hardcode a hex, px size, or duration | Breaks theming, density, and dark mode | Add or alias a token role |
| Wrap a table in a floating card | Destroys row rhythm and wastes frame | Edge-to-edge rows with dividers |
| Per-page shell or header markup | Every page drifts; agents cannot navigate | AppShell plus PageHeader slots |
| Twenty-prop mega component | Unguessable for humans and agents | Compound parts with context |
| Fetch or route inside a component | Couples library to app policy | Data in, events out |
| Placeholder-only form labels | Fails accessibility and completion | Static labels (Frosted Field) |
| Density prop on every component | Subtrees drift out of rhythm | BackendTheme density, inherited |

## 13. Phased waves

Each wave is one focused change set: components, styles, tests,
gallery demos, README updates, and a `minor` changeset (new 0.x
surface). No wave starts before the prior wave's gallery page is
verified in a browser.

- Wave 0 (foundation): scaffold `@solidix/backend`, `BackendTheme`
  bridging Frosted `Theme` with density, token layer plus
  generated CSS with budgets, `AppShell` with one presentational
  part styled end to end, `AGENT.md` plus `components.json` with
  drift tests, gallery wiring, umbrella export. Acceptance: shell
  renders in light and dark, compact and comfortable, one data
  row styled through tokens, `pnpm release:dry-run` green.
- Wave 1 (shell): full AppShell parts, NavList, PageHeader,
  SettingsLayout. Gallery: shell recipe plus settings recipe.
- Wave 2 (data): DataTable, DataList, FilterBar, Pagination,
  BulkBar. Gallery: data page recipe with sort, selection, and
  bulk actions against local fixture data.
- Wave 3 (workflow): CommandMenu, EmptyState, Stat and StatGrid,
  Confirm, SaveBar. Gallery: dashboard recipe plus command
  palette wired to shell navigation.
- Wave 4 (hardening): density and theme matrix spot checks,
  keyboard and screen-reader pass over shell and table, docs
  guide promoted into the gallery Guides section, CLI decision
  revisited with real setup friction as evidence.
  Status: done. Matrix and keyboard coverage lives in
  `test/wave4.test.tsx`; the guide is `docs/backend.md` in the
  gallery Guides section. CLI decision: no CLI ships. Setup is
  install plus two vendored CSS copies, already stated in the
  first screen of AGENT.md and the README; that friction does not
  justify a scaffolding tool. Revisit only when a second consumer
  reports setup pain or a third file joins the copy list. Waves
  0-4 are complete; new surface needs a fresh mini-design.

Out of scope for all waves: charts (owned by `@solidix/charts`
design), rich text editing, billing or auth flows, icon set
(consumer-provided, per Frosted precedent), and any React or
framework adapter.

## 14. Risks and open questions

1. Name: locked as `@solidix/backend` (2026-11-11). The name is
   now frozen in the package, token prefix, and JSR subpath.
2. Density scope: subtree density override (nested compact inside
   comfortable) is specced through CSS inheritance but unproven
   against Frosted control sizing. Wave 0 spike decides whether
   density stays shell-global for v1.
3. Frosted drift: Frosted is pre-1.0 with a pinned commit baseline.
   Console inherits that drift; each wave re-checks the Frosted
   parts it composes.
4. DataTable ambition: virtualization, column resizing, and
   server-driven everything are app concerns today. If two
   consuming apps need the same virtualization contract, it gets
   a mini-design then, not speculative API now.
5. JSR CSS: consumers copy vendored CSS, which is friction agents
   will hit first. AGENT.md must state the copy step in its first
   screen, and Wave 4 judges the CLI by that evidence.

## 15. Next step

Approve this doc (or amend the name, wave order, and out-of-scope
list), then scaffold `@solidix/backend` per the scaffold
conventions and start Wave 0. No code, changeset, or gallery
wiring ships with this doc change.
