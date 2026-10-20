# State management

Interactive primitives follow one uniform pattern, ported from Radix: every
piece of state can be uncontrolled (the component owns it) or controlled (you
own it). The prop names tell you which mode you are in.

| Mode         | Props                              | Example                                  |
| ------------ | ---------------------------------- | ---------------------------------------- |
| Uncontrolled | `defaultValue`                     | `<Select.Root defaultValue="apple">`     |
| Controlled   | `value` plus `onValueChange`       | `<Select.Root value={v()} onValueChange={setV}>` |

The state key varies (`open`, `value`, `checked`, `pressed`, `active`), but
the shape is always the same: `defaultX` seeds internal state, while `x` plus
`onXChange` hands ownership to you. Never mix `defaultX` and `x` on one
component.

## Controlled usage

Pair the primitive with a Solid signal. The getter feeds the current state
back in; the change handler writes the signal:

```tsx
import { createSignal } from "solid-js";
import { Dialog } from "@solidix/solidix";

const [open, setOpen] = createSignal(false);

<Dialog.Root open={open()} onOpenChange={setOpen}>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Content>Controlled content.</Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>;
```

Because props are read reactively, updating the signal updates the component
with no extra wiring. There is no `key` remount dance and no stale-closure
risk: inline handlers read signals lazily at call time.

Some props additionally accept a reactive getter (`() => value`) for values
that change over time, for example `Presence`'s `present` prop. Plain values
work too and are treated as static; when in doubt, pass the signal read
(`open={open()}`), which is always correct.

## Uncontrolled usage

Use `defaultX` when you need an initial value but no ongoing ownership. The
component manages state internally and still reports changes through `onXChange`,
so you can observe without controlling:

```tsx
<Select.Root defaultValue="apple" onValueChange={(v) => console.log("picked", v)}>
```

A controlled-or-uncontrolled component never flips modes mid-life: if the
resolved controlled value is `undefined`, the component stays uncontrolled.

## Reading state for styling and logic

Every primitive exposes its state as data attributes on the rendered parts
(`data-state="open"`, `data-disabled`, `data-orientation`, and so on). Prefer
these over mirroring state yourself: they are always in sync, they work in
both modes, and they double as styling and animation hooks. See the
[Styling](./styling.md) and [Animation](./animation.md) guides.

## Async change notifications

Uncontrolled `onXChange` callbacks fire from a deferred effect, so they run on
a microtask after the interaction, not synchronously inside the event handler.
This is invisible in application code, but tests asserting the handler must
await a flush first. See the [Testing](./testing.md) guide.
