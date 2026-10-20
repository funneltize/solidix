# Solidix

A port of [Radix UI Primitives](https://www.radix-ui.com/primitives) to
[Solid 2](https://github.com/solidjs/solid): unstyled, accessible UI
primitives with close API/behavior parity, written as idiomatic Solid. Beyond
parity, Solidix ships a built-in CSS-first motion system - spring physics,
View Transitions, and swipe gestures with no animation engine (see
[Motion](#motion)).

## Install

```sh
pnpm add jsr:@solidix/solidix
```

`@solidix/solidix` is the umbrella package (mirrors `radix-ui`),
re-exporting every component primitive as a namespace. Prefer the
per-primitive subpath imports when bundle size matters:

```tsx
import * as Dialog from "@solidix/solidix/dialog";
```

`pnpm` 10.9 and later install `jsr:` packages natively; otherwise use
`npx jsr add @solidix/solidix` (see the
[JSR npm-compatibility docs](https://jsr.io/docs/npm-compatibility)).

Solid 2 is RC-stage: `solid-js` and `@solidjs/web` must satisfy
`>=2.0.0-rc.15 <2.1.0` (see [Toolchain pins](#toolchain-pins)).

## Usage

```tsx
import { Dialog } from "@solidix/solidix";
// or: import * as Dialog from "@solidix/solidix/dialog";

function Example() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Greeting</Dialog.Title>
          <Dialog.Description>Close-parity port of Radix Dialog.</Dialog.Description>
          <Dialog.Close>Done</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

The API mapping from Radix is small and uniform:

| Radix                          | Solidix                        | Notes                                                        |
| ------------------------------ | ------------------------------ | ------------------------------------------------------------ |
| `className`                    | `class`                        | Native attribute name.                                       |
| `style` object, camelCase      | `style` object, kebab-case     | `style={{ "background-color": ... }}`; object-only on parts that merge base styles. |
| `ref` callback / object        | `ref` plain prop               | Composed internally; no `forwardRef`.                        |
| `asChild` + `Slot`             | `asChild` via `@solidix/slot`  | Same merge semantics, including `Slottable`.                 |
| `children`                     | `children`                     | Same API; dynamic children arrive as thunks internally.      |
| `onX` handlers                 | `onX` handlers                 | Native events; `[handler, data]` tuples supported.           |
| `value` / `defaultValue` / `onValueChange` | Same names           | Feed controlled values from signal reads.                    |
| `htmlFor` on Label             | `for`                          | Native attribute (`Form.Label` still accepts `htmlFor`).     |
| Props, data attributes, keyboard behavior, ARIA | Same            | Per-package deviations live under "Differences from Radix" in each package README. |

## Guides

Task-oriented docs that apply across primitives (also served as the Guides
section of the docs site):

- [Composition](./docs/composition.md) - `asChild`, prop merging, refs.
- [State management](./docs/state.md) - controlled/uncontrolled, signals.
- [Styling](./docs/styling.md) - data attributes, classes, theming.
- [Animation](./docs/animation.md) - exits, `forceMount`, the motion package.
- [Forms](./docs/forms.md) - bubble inputs, labels, validation.
- [Testing](./docs/testing.md) - flushing, settling, jsdom stubs.

## Motion

Primitives stay headless, but animation is a first-class citizen:
`@solidix/motion` compiles spring physics to CSS `linear()` easings that run
on the compositor, wraps same-document View Transitions for layout morphing,
and tracks velocity-aware swipe gestures - all keyed off the `data-state`
attributes every primitive already exposes. No `AnimatePresence` wrappers, no
rAF loops, no JS animation engine:

```tsx
import { createSpring } from "@solidix/solidix/motion";
```

See the [package README](./packages/solid/motion/README.md) for the full API
and copy-paste recipes - the local gallery (`internal/gallery`) demos it live
on the Motion page.

## Packages

All 65 packages live under `packages/` and ship together as the single JSR
package `@solidix/solidix` (one version; every workspace package is a
subpath export, e.g. `@solidix/solidix/dialog`). The API tracks Radix at
version 0.x:

- `solidix` - umbrella re-exporting 31 namespaces at the package root:
  the 30 components plus Funnel.
- `@solidix/solidix/motion` - the built-in motion system (see
  [Motion](#motion)): spring easing compiler, preset tokens, View
  Transitions helper, and swipe gestures. Subpath-only, like Announce.
- `packages/solid/*` - Solid primitives: the 30 components (table below)
  plus shared internals (`primitive`, `slot`, `portal`, `presence`,
  collections, hooks, …).
- `packages/core/*` - framework-agnostic utilities (mirrors Radix
  `packages/core`).
- `internal/*` - private workspace tooling (`@repo/builder`,
  `@repo/typescript-config`, `@repo/smoke`) and the docs site
  (`@repo/gallery`).

Every component is importable from the umbrella root
(`import { Dialog } from "@solidix/solidix"`) and from its subpath
(`import * as Dialog from "@solidix/solidix/dialog"`); the docs site serves
each primitive's demo plus API reference at its route.

| Primitive | Package | Docs route |
| --------- | ------- | ---------- |
| Accordion | [accordion](./packages/solid/accordion) | `#/accordion` |
| AlertDialog | [alert-dialog](./packages/solid/alert-dialog) | `#/alert-dialog` |
| AspectRatio | [aspect-ratio](./packages/solid/aspect-ratio) | `#/aspect-ratio` |
| Avatar | [avatar](./packages/solid/avatar) | `#/avatar` |
| Checkbox | [checkbox](./packages/solid/checkbox) | `#/checkbox` |
| Collapsible | [collapsible](./packages/solid/collapsible) | `#/collapsible` |
| ContextMenu | [context-menu](./packages/solid/context-menu) | `#/context-menu` |
| Dialog | [dialog](./packages/solid/dialog) | `#/dialog` |
| DropdownMenu | [dropdown-menu](./packages/solid/dropdown-menu) | `#/dropdown-menu` |
| Form | [form](./packages/solid/form) | `#/form` |
| HoverCard | [hover-card](./packages/solid/hover-card) | `#/hover-card` |
| Label | [label](./packages/solid/label) | `#/label` |
| Menubar | [menubar](./packages/solid/menubar) | `#/menubar` |
| NavigationMenu | [navigation-menu](./packages/solid/navigation-menu) | `#/navigation-menu` |
| OneTimePasswordField | [one-time-password-field](./packages/solid/one-time-password-field) | `#/one-time-password-field` |
| PasswordToggleField | [password-toggle-field](./packages/solid/password-toggle-field) | `#/password-toggle-field` |
| Popover | [popover](./packages/solid/popover) | `#/popover` |
| Progress | [progress](./packages/solid/progress) | `#/progress` |
| RadioGroup | [radio-group](./packages/solid/radio-group) | `#/radio-group` |
| ScrollArea | [scroll-area](./packages/solid/scroll-area) | `#/scroll-area` |
| Select | [select](./packages/solid/select) | `#/select` |
| Separator | [separator](./packages/solid/separator) | `#/separator` |
| Slider | [slider](./packages/solid/slider) | `#/slider` |
| Switch | [switch](./packages/solid/switch) | `#/switch` |
| Tabs | [tabs](./packages/solid/tabs) | `#/tabs` |
| Toast | [toast](./packages/solid/toast) | `#/toast` |
| Toggle | [toggle](./packages/solid/toggle) | `#/toggle` |
| ToggleGroup | [toggle-group](./packages/solid/toggle-group) | `#/toggle-group` |
| Toolbar | [toolbar](./packages/solid/toolbar) | `#/toolbar` |
| Tooltip | [tooltip](./packages/solid/tooltip) | `#/tooltip` |
| Funnel | [funnel](./packages/solid/funnel) | `#/funnel` |
| Announce (subpath-only) | [announce](./packages/solid/announce) | `#/announce` |
| Motion (subpath-only) | [motion](./packages/solid/motion) | `#/motion` |

### Vendoring stylesheets

JSR exports must be JS modules, so stylesheets are not in the package. Copy
them from the repo into your project:

1. Funnel: copy `packages/solid/funnel/src/tokens.css` and
   `packages/solid/funnel/src/blocks.css` into your project side by side,
   then `import "./blocks.css"` (it pulls the tokens in). To theme without
   components, `@import "./tokens.css"` alone.
2. Motion: copy `packages/solid/motion/src/springs.css` next to your CSS
   and `@import "./springs.css"`.

Re-copy after upgrading. See the funnel and motion READMEs for the token APIs.

See [AGENTS.md](./AGENTS.md) for working agreements.

## Commands

| Command             | What it does                              |
| ------------------- | ----------------------------------------- |
| `pnpm install`      | Install all workspace dependencies        |
| `pnpm build`        | Build all publishable packages to `dist/` |
| `pnpm typecheck`    | `tsc --noEmit` in every package           |
| `pnpm lint`         | oxlint in every package                   |
| `pnpm test`         | vitest run (jsdom) over all package tests |
| `pnpm test:watch`   | vitest in watch mode                      |
| `pnpm format`       | Format everything with oxfmt              |
| `pnpm format:check` | Check formatting without writing          |

Requires [pnpm](https://pnpm.io) 11.5.0 (see `packageManager`) and Node 24+.

## Docs site

The gallery (`internal/gallery`) is the docs site: every primitive's demo
plus API docs, as a client-rendered static app (hash-routed, so it serves
from any static host with no rewrite rules). It builds to
`internal/gallery/dist`:

```sh
pnpm --filter @repo/gallery build
```

To host it on Cloudflare Pages (Git integration), use these project settings:

- Root directory: `/` (the repo root)
- Build command: `pnpm --filter @repo/gallery build`
- Build output directory: `internal/gallery/dist`
- Node version: 24 (pinned via `.nvmrc`; `pnpm-lock.yaml` makes Pages use
  pnpm automatically)

## Versioning and releases

Versions are managed with [Changesets](https://github.com/changesets/changesets).
Every PR that changes a publishable package must add a changeset
(`pnpm changeset`). To cut a release, run `pnpm version-packages` to
consume pending changesets into version bumps and changelogs, commit, and
push to `main`: the `release` workflow builds and publishes
`@solidix/solidix` to JSR, authenticating with OIDC trusted publishing (no
token stored). The release assembles every workspace package's `dist/`
into the single versioned package (`scripts/jsr-publish.mjs`) and no-ops
when the version is already published, so pushes without a version bump
ship nothing. `pnpm release:dry-run` validates the assembly without
uploading. One-time setup: link `@solidix/solidix` to this repo in its JSR
package settings so the OIDC handshake is trusted. (Actions may not open
PRs in this repo, so there is no Version Packages PR - versioning runs
locally instead.)

## Troubleshooting

Solid 2 RC notes that bite on first contact:

- Styles silently not applying: style objects need kebab-case keys
  (`"font-size"`), and parts that merge base styles reject string styles.
  See the [Styling guide](./docs/styling.md).
- `asChild` trigger renders nested buttons: put `asChild` on the part so it
  merges onto your element instead of wrapping it. See the
  [Composition guide](./docs/composition.md).
- Exit animation never plays: `Presence` tracks keyframe `animationend`,
  not transitions, so use `@keyframes` or add `forceMount`. Never wrap a
  portal in `Presence` directly; put `Presence` inside the portal. See the
  [Animation guide](./docs/animation.md).
- Tests see stale DOM after clicks: Solid flushes on microtask, so `await
  findBy*`/`vi.waitFor` and `flush()` from `solid-js` before asserting. See
  the [Testing guide](./docs/testing.md).
- SSR: `useId` determinism is best-effort until Solid 2 stable re-verifies,
  and this RC has no `Suspense`, `Key`, or `startTransition`.

## Toolchain pins

Solid 2 is RC-stage; versions are pinned exactly until stable:

- `solid-js` / `@solidjs/web`: `2.0.0-rc.15`
- `@solidjs/vite-plugin`: `3.0.0-next.50`
- `@solidjs/testing-library`: `1.0.0-beta.3`
- `vite` 8.3.4, `vitest` 5.0.5, `typescript` 5.9.3

When Solid 2 goes stable, re-verify before unpinning: bump the pins, run the
full gates (`format`, `lint`, `typecheck`, `test`, `build`), and re-check
the RC workarounds flagged `Solid 2` in [AGENTS.md](./AGENTS.md) (no `Key`,
no `startTransition`, `omit` variadic form, HMR-memo setup reads, SSR
`useId` determinism).

## License

MIT.
