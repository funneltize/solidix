# Testing

Solid 2 batches reactive updates on the microtask queue, so state changes
from clicks and signal writes land asynchronously. Tests that worked
synchronously under React `act()` need one adjustment: drain the queue
before asserting.

## The flush rule

After any setter write or event dispatch made outside a component, `flush()`
from `solid-js` before asserting on emitted state or handler calls.
Prefer `findBy*` queries, which poll until the DOM settles:

```tsx
import { flush } from "solid-js";
import { fireEvent, render, screen } from "@solidjs/testing-library";

render(() => <Switch.Root onCheckedChange={onCheckedChange} />);
fireEvent.click(await screen.findByRole("switch"));
await flush();
expect(onCheckedChange).toHaveBeenCalledWith(true);
```

Both `fireEvent` and `@testing-library/user-event` work. Because dispatches
are async, never assert synchronously right after an interaction: always
`await findBy*` or `vi.waitFor` instead of `getBy*`.

## Settling portalled content

Refs fire at element creation, before portal insertion adopts the node, so
document-dependent setup (outside dismissal, body scroll locks, delegated
slot listeners) completes on the insertion mutation, not synchronously after
render. Tests asserting overlays, focus, or lock state must settle first with
`findBy*` or `vi.waitFor`, the same way the primitive suites do.

Two timing details follow from the same root cause:

- Document listeners attach in effects, so they are not in place
  synchronously after render. `flush()` before firing outside interactions.
- The `pointerdown` outside-dismissal listener additionally defers one
  macrotask (Radix parity). Await a macrotask (or `vi.waitFor`) before firing
  `pointerdown` outside an open overlay.

## Change notifications are async

Uncontrolled `onXChange` callbacks fire from a deferred effect. Wrap the
interaction in `flush()` before asserting the handler call, as in the example
above.

## Environment stubs

The shared setup provides two jsdom stubs that mirror Radix's own setup:

- `ResizeObserver` is a no-op stub. Tests asserting resize-driven rendering
  install a delivering observer with `vi.stubGlobal` plus
  `unstubAllGlobals`.
- `Element.prototype.scrollIntoView` is a no-op. Focus management calls it
  unconditionally and never needs mocking.

## Driving prop updates

Signal reads in plain test helpers are one-shot. To drive prop updates, pass
the read as a component prop so it stays reactive:

```tsx
const [open, setOpen] = createSignal(false);
render(() => <Dialog.Root open={open()} />);
setOpen(true);
expect(await screen.findByRole("dialog")).not.toBe(null);
```

Solid compiles component props to reactive getters, so `open={open()}`
re-resolves on every change. Reading the signal into a local first would
freeze the initial value.
