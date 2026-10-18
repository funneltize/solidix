# `@solidix/remove-scroll`

RemoveScroll primitive. Port of `react-remove-scroll` (+ `react-remove-scroll-bar`).

Locks body scroll while mounted: sets the `data-scroll-locked` counter
attribute, injects the scrollbar-compensation stylesheet (first mount wins),
and stops wheel/touch scrolls outside the lock (and at scroll boundaries
inside it) via capture listeners on the lock element plus non-passive document
listeners. Nested locks stack; only the topmost decides.

## Differences from react-remove-scroll

- No SSR sidecar medium: the lock is purely client-side (effects don't run on
  the server). Callback indirection the original needs for fresh React
  closures (`setCallbacks`, `lastProps`) is dropped - Solid closures read
  reactive state lazily.
- `as={Slot}` becomes the standard `asChild` prop; the `as` (string/component),
  `forwardProps`, and `sideCar` props are not supported.
- Container capture listeners attach from the ref callback instead of JSX
  props, so they are always in place before the document listeners can observe
  anything. Like the original, they take precedence over user handlers with the
  same names.
- `class` replaces `className`; `ref` is a plain prop.
