# `@solidix/use-escape-keydown`

Escape key listener. Port of `@radix-ui/react-use-escape-keydown`
(including the `@deprecated` status).

Deprecated upstream (kept for parity); most consumers want `DismissableLayer` instead, which owns Escape handling with branch and IME awareness.

## Differences from Radix

- Improvement over upstream: Escape during an IME composition (`isComposing`
  or `keyCode` 229) is ignored, since the keystroke belongs to the input
  method. Upstream fires on the key alone.
- The `ownerDocument` parameter defaults the same way but is typed
  `Document | undefined` so SSR callers can pass nothing; a missing document
  simply attaches nothing.
