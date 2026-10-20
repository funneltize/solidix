# Radix upstream baseline

Every Solidix primitive names its upstream in its README (`Port of ...`).
This file records the upstream version each port was last compared against,
so parity claims stay versioned. Checked 2026-10-20.

Versions come from the `next`-fresh `node_modules/.pnpm` store (populated by
a current install, so it resolves what `latest` resolves) plus direct
registry checks for packages outside the store. Six store versions were
spot-checked against the registry `latest` endpoint (dialog, select,
primitive, presence, menu, slot) and all matched.

## Version table

| Local package           | Upstream                                                 | Baseline                        |
| ----------------------- | -------------------------------------------------------- | ------------------------------- |
| accessible-icon         | @radix-ui/react-accessible-icon                          | 1.2.0                           |
| accordion               | @radix-ui/react-accordion                                | 1.3.1                           |
| alert-dialog            | @radix-ui/react-alert-dialog                             | 1.2.1                           |
| announce                | @radix-ui/react-announce                                 | 0.3.0 (registry; outside store) |
| arrow                   | @radix-ui/react-arrow                                    | 1.1.17                          |
| aspect-ratio            | @radix-ui/react-aspect-ratio                             | 1.2.0                           |
| avatar                  | @radix-ui/react-avatar                                   | 1.3.1                           |
| checkbox                | @radix-ui/react-checkbox                                 | 1.4.1                           |
| collapsible             | @radix-ui/react-collapsible                              | 1.2.1                           |
| collection              | @radix-ui/react-collection                               | 1.2.0                           |
| compose-refs            | @radix-ui/react-compose-refs                             | 1.1.5                           |
| context                 | @radix-ui/react-context                                  | 1.3.0                           |
| context-menu            | @radix-ui/react-context-menu                             | 2.4.1                           |
| dialog                  | @radix-ui/react-dialog                                   | 1.3.1                           |
| direction               | @radix-ui/react-direction                                | 1.2.0                           |
| dismissable-layer       | @radix-ui/react-dismissable-layer                        | 1.2.1                           |
| dropdown-menu           | @radix-ui/react-dropdown-menu                            | 2.2.1                           |
| focus-guards            | @radix-ui/react-focus-guards                             | 1.2.0                           |
| focus-scope             | @radix-ui/react-focus-scope                              | 1.3.1                           |
| form                    | @radix-ui/react-form                                     | 0.3.0                           |
| funnel                  | (no counterpart)                                         | -                               |
| hover-card              | @radix-ui/react-hover-card                               | 1.2.1                           |
| id                      | @radix-ui/react-id                                       | 1.1.4                           |
| label                   | @radix-ui/react-label                                    | 2.1.17                          |
| menu                    | @radix-ui/react-menu                                     | 2.2.1                           |
| menubar                 | @radix-ui/react-menubar                                  | 1.2.1                           |
| motion                  | (no counterpart)                                         | -                               |
| navigation-menu         | @radix-ui/react-navigation-menu                          | 1.4.1                           |
| one-time-password-field | @radix-ui/react-one-time-password-field                  | 0.2.1                           |
| password-toggle-field   | @radix-ui/react-password-toggle-field                    | 0.2.1                           |
| popover                 | @radix-ui/react-popover                                  | 1.3.1                           |
| popper                  | @radix-ui/react-popper                                   | 1.4.0                           |
| portal                  | @radix-ui/react-portal                                   | 1.2.0                           |
| presence                | @radix-ui/react-presence                                 | 1.1.11                          |
| primitive               | @radix-ui/react-primitive + @radix-ui/primitive (merged) | 2.2.0 + 1.2.0                   |
| progress                | @radix-ui/react-progress                                 | 1.2.1                           |
| radio-group             | @radix-ui/react-radio-group                              | 1.5.1                           |
| remove-scroll           | react-remove-scroll (+ react-remove-scroll-bar)          | 2.7.2 (registry; external)      |
| roving-focus            | @radix-ui/react-roving-focus                             | 1.2.1                           |
| scroll-area             | @radix-ui/react-scroll-area                              | 1.4.0                           |
| select                  | @radix-ui/react-select                                   | 2.4.1                           |
| separator               | @radix-ui/react-separator                                | 1.2.0                           |
| slider                  | @radix-ui/react-slider                                   | 1.6.1                           |
| slot                    | @radix-ui/react-slot                                     | 1.5.0                           |
| solidix                 | radix-ui (meta)                                          | 1.8.1 (store; informational)    |
| switch                  | @radix-ui/react-switch                                   | 1.4.1                           |
| tabs                    | @radix-ui/react-tabs                                     | 1.2.1                           |
| toast                   | @radix-ui/react-toast                                    | 1.3.1                           |
| toggle                  | @radix-ui/react-toggle                                   | 1.2.1                           |
| toggle-group            | @radix-ui/react-toggle-group                             | 1.2.1                           |
| toolbar                 | @radix-ui/react-toolbar                                  | 1.2.1                           |
| tooltip                 | @radix-ui/react-tooltip                                  | 1.4.1                           |
| use-callback-ref        | @radix-ui/react-use-callback-ref                         | 1.1.5                           |
| use-controllable-state  | @radix-ui/react-use-controllable-state                   | 1.3.0                           |
| use-effect-event        | @radix-ui/react-use-effect-event                         | 0.0.5                           |
| use-escape-keydown      | @radix-ui/react-use-escape-keydown                       | 1.1.6                           |
| use-is-hydrated         | @radix-ui/react-use-is-hydrated                          | 0.1.3                           |
| use-layout-effect       | @radix-ui/react-use-layout-effect                        | 1.1.4                           |
| use-previous            | @radix-ui/react-use-previous                             | 1.1.4                           |
| use-rect                | @radix-ui/react-use-rect                                 | 1.1.4                           |
| use-size                | @radix-ui/react-use-size                                 | 1.1.5                           |
| visually-hidden         | @radix-ui/react-visually-hidden                          | 1.2.13                          |
| core/env-check          | @radix-ui/env-check                                      | 0.0.1 (registry; outside store) |
| core/number             | @radix-ui/number                                         | 1.1.3                           |
| core/rect               | @radix-ui/rect                                           | 1.1.3                           |

## Side-compare log

Source-level comparisons performed against the baseline versions (upstream
sources extracted from published sourcemaps in the pnpm store):

- primitive: `composeEventHandlers` missing-event guard (`!event`) covered;
  `NODES` list identical (17 nodes, same order); `Root` alias,
  `dispatchDiscreteCustomEvent`, and the `Symbol.for('radix-ui')` marker
  match. The react-primitive 2.x major is React 19 and packaging related,
  with no behavioral delta for the port.
- presence 1.1.11: `mountAnimationName` perf read (#1634), `CSS.escape`
  animation matching, and the fill-mode flash guard (#1849) all ported.
  `useStableComposedRefs` (the 1.1.6 ref-loop fix, #3664) is React 19
  ref-identity churn with no Solid equivalent; correctly absent by design.
- dismissable-layer 1.2.1: `disableOutsidePointerEvents` body lock, the
  #3645 overlap handling, and the split unmount cleanup are ported. Local
  adds an IME composition guard on Escape (see below) that upstream lacks.
- use-escape-keydown 1.1.6: `@deprecated` status and `ownerDocument`
  parameter match. Local adds the same IME composition guard; upstream has
  none. The React 19.2 `useEffectEvent` workaround (#4014) in upstream
  dismissable-layer is React-only.
- select 2.4.1: export surface matched (including `unstable_` aliases for
  Provider and BubbleInput); behavior parity per the package README notes.
  Full behavior re-compare beyond exports remains open.
- password-toggle-field 0.2.1: dev warning text for the misspelled
  `onVisiblityChange` prop is identical.
- accordion 1.3.1: `onValueChange` bivariance-hack form is identical.
- menu family: context-menu, menubar, and dropdown-menu all wire through
  `@solidix/menu` shared components, matching upstream layering.
- collection 1.2.0: `sortByDocumentPosition` (including the `0` return when
  either entry lacks an element) and `isElementPreceding` are identical to
  upstream; the missing-element ordering question is upstream behavior, not
  a port bug, so no change was made.

Deliberate local improvements over upstream (documented in package READMEs):

- IME composition guard on Escape in dismissable-layer and
  use-escape-keydown: an Escape during IME composition belongs to the input
  method, so it no longer dismisses.

## Refreshing

1. Reinstall to refresh the store, then re-run the store inventory:
   `ls node_modules/.pnpm | grep radix`.
2. For packages outside the store (announce, remove-scroll, env-check),
   check `https://registry.npmjs.org/<name>/latest`.
3. Update this table, then side-compare any package whose version moved,
   prioritizing behavior and ARIA changes over React-only churn.
