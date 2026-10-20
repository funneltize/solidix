# `@solidix/solidix`

Umbrella package re-exporting all Solidix primitives under one dependency,
mirroring the `radix-ui` meta-package.

```sh
pnpm add jsr:@solidix/solidix
```

```tsx
import { Accordion, Dialog } from "@solidix/solidix";

<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>…</Dialog.Content>
</Dialog.Root>;
```

## Members

Accordion, AlertDialog, AspectRatio, Avatar, Checkbox, Collapsible,
ContextMenu, Dialog, DropdownMenu, Form, HoverCard, Label, Menubar,
NavigationMenu, OneTimePasswordField, PasswordToggleField, Popover, Progress,
RadioGroup, ScrollArea, Select, Separator, Slider, Switch, Tabs, Toast,
Toggle, ToggleGroup, Toolbar, Tooltip.

## Subpath imports

Every workspace package is also importable directly, so bundlers only see
what you use:

```tsx
import * as Dialog from "@solidix/solidix/dialog";
import { Slot } from "@solidix/solidix/slot";
```

## Motion

Animation lives outside the component namespaces: pair any primitive with
`@solidix/solidix/motion` - spring easings, preset tokens, View Transitions,
and swipe gestures, all keyed off the `data-state` attributes every primitive
exposes.

## Differences from Radix

- Internal utilities (`primitive`, `slot`, `portal`, `presence`,
  collections, hooks, and the rest) stay separate subpath imports, exactly
  like the `radix-ui` package excludes Radix internals.
- Each namespace re-exports its package's full public API, so importing from
  the root is equivalent to importing from the subpath directly. Prefer the
  per-primitive subpaths when bundle size matters.
