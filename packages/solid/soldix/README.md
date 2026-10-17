# `soldix`

Umbrella package re-exporting all Soldix primitives under one dependency,
mirroring the `radix-ui` meta-package.

```tsx
import { Accordion, Dialog } from "soldix";

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

## Differences from Radix

- Internal utilities (`@soldix/primitive`, `@soldix/slot`, `@soldix/portal`,
  `@soldix/presence`, collections, hooks, and the rest of `@soldix/*`) stay
  separate imports, exactly like the `radix-ui` package excludes Radix
  internals.
- Each namespace re-exports its package's full public API, so importing from
  `soldix` is equivalent to importing from `@soldix/*` directly. Prefer the
  per-primitive packages when bundle size matters.
