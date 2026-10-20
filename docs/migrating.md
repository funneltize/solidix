# Migrating from Radix

If you know Radix UI, you know most of Solidix: part names, props, data
attributes, keyboard interaction, and ARIA carry over unchanged. What changes
is the React layer underneath: signals instead of state hooks, native events
instead of synthetic ones, and platform attribute names instead of React's
renames. This page collects those deltas in one place; each section links to
the guide that covers it in depth.

## State lives in signals

Replace `useState` plus the controlled props with a Solid signal. The getter
feeds the current value back in; the change handler writes the signal:

```tsx
// React
const [open, setOpen] = useState(false);
<Dialog.Root open={open} onOpenChange={setOpen}>;

// Solidix
const [open, setOpen] = createSignal(false);
<Dialog.Root open={open()} onOpenChange={setOpen}>;
```

Pass the signal read (`open={open()}`), which stays reactive. Reading the
signal into a local first freezes the initial value. The uncontrolled
(`defaultX`) mode works exactly as in Radix. See the
[State management](./state.md) guide.

There is no stale-closure risk (inline handlers read signals lazily) and no
`key` remount dance: this Solid 2 RC has no `Key`, so drive resets through
signals instead of remounts.

## Refs are plain props

There is no `forwardRef` and no ref-object convention. `ref` is a plain
callback prop, composed internally when several parties need the same node:

```tsx
<Dialog.Trigger ref={setTriggerNode}>Open</Dialog.Trigger>
```

Callback refs fire with the element on mount and with `null` on unmount, as
in React. See the [Composition](./composition.md) guide for ref composition
under `asChild`.

## Events are native

Handlers receive real DOM events, not React synthetic events. Three
consequences bite on first contact:

- `onChange` is the native `change` event. On text inputs it fires on blur or
  Enter, not per keystroke (React listens to the native `input` event
  instead). Put per-keystroke logic on `onInput` and keep `onChange` for
  commit semantics.
- There is no `isPropagationStopped()`; call `event.stopPropagation()` (or set
  `event.cancelBubble`) as with any DOM listener.
- Handlers may be `[handler, data]` tuples, and Solid passes `data` as the
  first argument. Parts compose consumer handlers with their own, child
  first; see the [Composition](./composition.md) guide for the merge order.

Form behavior is otherwise unchanged: bubble inputs keep submit, reset,
validation, and `FormData` working. See the [Forms](./forms.md) guide.

## Styling uses platform names

`class` replaces `className`, `for` replaces `htmlFor` on labels, style
objects take kebab-case keys (`"background-color"`), and composed elements
take lowercase `tabindex`. Data attributes, CSS variables, and the
unstyled-by-default philosophy are identical. See the
[Styling](./styling.md) guide.

## Children and render props

Dynamic children arrive as zero-arg thunks internally, which matters in one
place: `Presence` treats only functions with declared parameters as render
props (`({ present }) => …`), and the state arrives as an accessor to call in
JSX. Element children behave as in Radix. See the
[Animation](./animation.md) guide.

## Tests drain the queue

Solid batches reactive updates on the microtask queue, so the synchronous
assertions that worked under React `act()` need a flush: `await findBy*` or
`vi.waitFor` instead of `getBy*`, and `flush()` from `solid-js` before
asserting handler calls. See the [Testing](./testing.md) guide.

## Checklist

Porting a Radix usage to Solidix, in mechanical order:

1. `className` to `class`, `htmlFor` to `for`, style objects to kebab-case.
2. `useState` to `createSignal`, controlled values to signal reads.
3. Refs to plain callback props; delete `forwardRef` wrappers.
4. Audit `onChange` handlers: per-keystroke logic moves to `onInput`.
5. Async-ify test assertions (`findBy*`, `flush()`).
6. Check the primitive's "Differences from Radix" README section for anything
   specific to that part.
