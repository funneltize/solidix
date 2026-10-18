# `solidix`

Umbrella package re-exporting all Solidix primitives under one dependency,
mirroring the `radix-ui` meta-package.

```tsx
import { Accordion, Dialog } from "solidix";

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

## Motion

Animation lives outside the component namespaces: pair any primitive with
`@solidix/motion` - spring easings, preset tokens, View Transitions, and
swipe gestures, all keyed off the `data-state` attributes every primitive
exposes.

## Differences from Radix

- Internal utilities (`@solidix/primitive`, `@solidix/slot`, `@solidix/portal`,
  `@solidix/presence`, collections, hooks, and the rest of `@solidix/*`) stay
  separate imports, exactly like the `radix-ui` package excludes Radix
  internals.
- Each namespace re-exports its package's full public API, so importing from
  `solidix` is equivalent to importing from `@solidix/*` directly. Prefer the
  per-primitive packages when bundle size matters.
