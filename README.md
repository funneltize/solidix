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

- `className` becomes `class`; `ref` is a plain prop.
- `asChild` composes via `@solidix/slot` (same semantics, including `Slottable`).
- `style` props are objects with kebab-case keys (Solid semantics).
- Everything else - props, data attributes, keyboard behavior, ARIA -
  matches Radix; per-package deviations are documented in each package's
  README under "Differences from Radix".

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

- `solidix` - umbrella re-exporting the 30 component namespaces at the
  package root.
- `@solidix/solidix/motion` - the built-in motion system (see
  [Motion](#motion)): spring easing compiler, preset tokens, View
  Transitions helper, and swipe gestures.
- `packages/solid/*` - Solid primitives:
  the 30 components (Accordion, AlertDialog, AspectRatio, Avatar, Checkbox,
  Collapsible, ContextMenu, Dialog, DropdownMenu, Form, HoverCard, Label,
  Menubar, NavigationMenu, OneTimePasswordField, PasswordToggleField, Popover,
  Progress, RadioGroup, ScrollArea, Select, Separator, Slider, Switch, Tabs,
  Toast, Toggle, ToggleGroup, Toolbar, Tooltip) plus shared internals
  (`primitive`, `slot`, `portal`, `presence`, collections, hooks, …).
- `packages/core/*` - framework-agnostic utilities (mirrors Radix
  `packages/core`).
- `internal/*` - private workspace tooling (`@repo/builder`,
  `@repo/typescript-config`, `@repo/smoke`).

JSR exports must be JS modules, so the funnel and motion stylesheets
(`tokens.css`, `blocks.css`, `springs.css`) are not in the package: copy
them from the repo into your project (see the funnel and motion READMEs).

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
