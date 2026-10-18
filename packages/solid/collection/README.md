# `@solidix/collection`

Ordered item collections. Port of `@radix-ui/react-collection`, including
`unstable_createCollection`.

## Differences from Radix

- Item registration runs in effects with cleanup (unregister on dispose);
  reactive item props are tracked automatically, so no memoization rules apply.
- `ref` is a real prop here (Solid has no `forwardRef`); it is excluded from
  item data like `scope` and `children`.
- The `unstable_` collection's stateful context exposes accessors
  (`collection()` / `collectionElement()`), so `useCollection` returns an
  accessor instead of a snapshot. `useGetCollection` is unchanged (already a
  getter).
- The `data-radix-collection-item` attribute is kept verbatim.
