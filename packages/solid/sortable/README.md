# `@solidix/sortable`

Sortable list primitive. Solidix-native: Radix has no sortable to port,
so this follows the WAI drag-and-drop pattern directly.

Solid API mapping: `class` for `className`; `ref` is a plain prop (see
the [Composition guide](../../../docs/composition.md)).

## Model

Order is consumer state. `Sortable` takes `items` (ids in display
order) and reports every new order through `onOrderChange`. Each
`SortableItem` carries one `SortableHandle`: Space or Enter picks the
item up, arrow keys move it, Space or Enter drops it, Escape cancels
and restores the order from pickup. Moves are announced through a
polite live region. Pointer users drag the handle directly (pointer events, so touch
works too): the item under the pointer becomes the drop target and
the list reorders live.
