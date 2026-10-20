# Composition

Every primitive part renders a default element (usually a `button` or `div`).
When you need a different element, or your own component, in its place, set
`asChild`: the part keeps its behavior and merges its props onto your element
instead of rendering its own.

```tsx
import { Dialog } from "@solidix/solidix";

<Dialog.Root>
  <Dialog.Trigger asChild>
    <button class="IconButton" aria-label="Edit profile">
      <PencilIcon />
    </button>
  </Dialog.Trigger>
</Dialog.Root>;
```

The rendered output is your `button`, with the trigger's click handling,
`data-state`, and accessibility wiring applied to it. Without `asChild` you
would get a button nested inside the default trigger button, which is invalid
HTML and broken behavior.

## Merge semantics

Composition is provided by `@solidix/slot` and matches Radix `mergeProps`:

- Child props win on conflict. Props the child does not set are filled in
  from the part.
- `class` lists concatenate, so both the part's and the child's classes apply.
- Style objects merge key by key, with the child's value winning per key.
- Event handlers compose: the child's handler runs first, then the part's.
  Calling `event.preventDefault()` in the child still lets the part observe
  the default-prevented state, following each part's documented contract.
- `aria-describedby` values concatenate, so labelling from both sides survives.

Refs compose too: pass `ref` on your child and it receives the same element
the part wires up.

## Rules

- Pass exactly one element child. Text, fragments, and multiple siblings
  cannot receive merged props.
- Write `tabindex` in lowercase on composed elements. Slot applies props
  imperatively and lowercase matches the DOM attribute it sets.
- Style objects use kebab-case keys (`"background-color"`), matching Solid
  conventions. See the [Styling](./styling.md) guide.
- Some parts merge base styles onto themselves (popper content, collapsible
  panels). Their `style` prop accepts objects only, never strings, so the
  merge has something to combine with.

## Slottable

When the part's element must wrap your content rather than become it, use
`Slottable` from `@solidix/slot` to mark where your content lands. This is an
advanced escape hatch for wrapper components; most apps only need `asChild`.

```tsx
import { Slot, Slottable } from "@solidix/solidix/slot";

const FancyButton = (props) => (
  <Slot class="fancy">
    <Slottable>{props.children}</Slottable>
  </Slot>
);
```

## Custom components as children

`asChild` also accepts component children, not just intrinsic elements. The
component must forward unconsumed props (including `ref` and event handlers)
to its underlying element, otherwise the merged behavior has nowhere to land:

```tsx
import { omit } from "solid-js";

const RedButton = (props) => {
  const rest = omit(props, "children", "ref");
  return (
    <button {...rest} ref={props.ref} class="red">
      {props.children}
    </button>
  );
};

<Dialog.Close asChild>
  <RedButton>Cancel</RedButton>
</Dialog.Close>;
```

Each primitive's API reference shows which parts support `asChild`. Opinionated
packages are the exception: funnel blocks ship fixed structure and do not
offer `asChild`; restyle them through tokens and classes instead.
