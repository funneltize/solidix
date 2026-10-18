# Solidix

A port of [Radix UI Primitives](https://www.radix-ui.com/primitives) to
[Solid 2](https://github.com/solidjs/solid): unstyled, accessible UI
primitives with close API/behavior parity, written as idiomatic Solid.

## Install

```sh
pnpm add solidix solid-js @solidjs/web
```

`solidix` is the umbrella package (mirrors `radix-ui`), re-exporting every
component primitive as a namespace. Prefer the per-primitive packages when
bundle size matters:

```sh
pnpm add @solidix/dialog solid-js @solidjs/web
```

Solid 2 is RC-stage: `solid-js` and `@solidjs/web` must satisfy
`>=2.0.0-rc.15 <2.1.0` (see [Toolchain pins](#toolchain-pins)).

## Usage

```tsx
import { Dialog } from "solidix";
// or: import * as Dialog from "@solidix/dialog";

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
- Everything else — props, data attributes, keyboard behavior, ARIA —
  matches Radix; per-package deviations are documented in each package's
  README under "Differences from Radix".

## Packages

All 63 packages live under `packages/` and publish at version 0.x while the
API tracks Radix:

- `solidix` — umbrella re-exporting the 30 component namespaces.
- `packages/solid/*` — Solid primitives, published as `@solidix/<name>`:
  the 30 components (Accordion, AlertDialog, AspectRatio, Avatar, Checkbox,
  Collapsible, ContextMenu, Dialog, DropdownMenu, Form, HoverCard, Label,
  Menubar, NavigationMenu, OneTimePasswordField, PasswordToggleField, Popover,
  Progress, RadioGroup, ScrollArea, Select, Separator, Slider, Switch, Tabs,
  Toast, Toggle, ToggleGroup, Toolbar, Tooltip) plus shared internals
  (`primitive`, `slot`, `portal`, `presence`, collections, hooks, …) and the
  CSS-first motion utilities (`motion`).
- `packages/core/*` — framework-agnostic utilities (mirrors Radix
  `packages/core`).
- `internal/*` — private workspace tooling (`@repo/builder`,
  `@repo/typescript-config`, `@repo/smoke`).

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

## Versioning and releases

Versions are managed with [Changesets](https://github.com/changesets/changesets).
Every PR that changes a publishable package must add a changeset
(`pnpm changeset`); pushing to `main` opens a Version Packages PR, and
merging it publishes to npm via the `release` workflow (needs an
`NPM_TOKEN` repo secret with publish access to the `@solidix` scope and the
`solidix` package).

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
