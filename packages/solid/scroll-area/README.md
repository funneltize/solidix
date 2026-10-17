# `@soldix/scroll-area`

Scroll-area primitive. Port of `@radix-ui/react-scroll-area`, including all
four scrollbar types (`hover`/`scroll`/`auto`/`always`), both orientations,
the implicit content wrapper (#1666), the `disableImplicitContentElement` opt
out, the corner (#2383), and ref stability (#3963).

## Differences from Radix

- `class` replaces `className`; `ref` is a plain prop; `asChild` composes via
  `@soldix/slot`.
- Collected nodes and flags (`scrollArea`, `viewport`, `content`,
  `scrollbarX`/`scrollbarY`, enabled flags, thumb `sizes`) live in signals
  exposed through context as getters; static props pass through unchanged.
- `sizes` and `hasThumb` travel down the scrollbar internals as getters
  (documented in `ScrollAreaScrollbarAxisPrivateProps`): Solid props freeze
  at setup and would snapshot the initial zeros, while Radix re-renders on
  every measurement.
- Composed event handlers wrap the consumer's handler as
  `(event) => callEventHandler(rest.onX, event)` so Solid `[handler, data]`
  tuple handlers keep working.
- Solid JSX provides no `onPointerDownCapture`, so `ScrollAreaThumbImpl`
  accepts it explicitly and attaches it imperatively with capture, following
  the `@soldix/dismissable-layer` pattern. Consumer-first composition with
  `defaultPrevented` short-circuit matches `composeEventHandlers`.
- Effects return their cleanup functions (the house pattern); the corner's
  unmount reset uses `useLayoutEffect`'s cleanup.
- The scrollbar type branches (`Hover`/`Scroll`/`Auto`/`Always`) render as
  setup-level conditionals since `type` is static, and the orientation
  branches likewise.
- The viewport dev warning for misuse of `asChild` says "a single element
  child" (no framework name) and fires once from a mount effect.
- `useStateMachine`, `useDebounceCallback`, and `useResizeObserver` are
  ported locally (signals + two-arg effects); the resize observer accepts a
  node getter so it re-subscribes as nodes collect.
- Numeric `width`/`height` styles are stringified with `px` (Solid does not
  append units the way React does); all style keys are kebab-case and `style`
  props are object-only.
- The corner tests install a delivering `ResizeObserver` via `vi.stubGlobal`
  (the shared setup stub never delivers, by design).
