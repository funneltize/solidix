# `@solidix/form`

Form primitive. Port of `@radix-ui/react-form`, including native-validity
tracking, sync/async custom matchers, server-invalid handling, message-id
`aria-describedby` wiring, and first-invalid-control focus.

Solid API mapping: `class` for `className`; `ref` is a plain prop; `asChild` composes via `@solidix/slot` (see the [Composition guide](../../../docs/composition.md)). Docs site: Form page (`#/form` route) with a live demo and API reference.

## Differences from Radix

- `class` replaces `className`; `ref` is a plain prop; `asChild` replaces
  Radix's `Slot`/`asChild` composition via `@solidix/slot`.
- Validity, custom-error, matcher-entry, and message-id maps live in Solid
  signals; consumers read them through getters so `data-valid`/`data-invalid`,
  `aria-describedby`, message matching, and `FormValidityState` stay reactive
  without re-rendering the tree. `serverInvalid` is likewise a getter in the
  field context, so late server responses propagate (invisible externally).
- `data-valid`/`data-invalid` render `"true"` (stringified): Solid would
  otherwise serialize a boolean `true` data attribute as `""`.
- `htmlFor` is accepted (Radix API) but rendered as the `for` attribute:
  Solid outputs `htmlFor` literally (`htmlfor`), which associates nothing.
- Custom-matcher entries register once per setup with a stable identity
  (Solid props don't re-run setup), rather than memoizing on `[id, match]`.
