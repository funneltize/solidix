# `@solidix/calendar`

Calendar primitive. Solidix-native: Radix has no calendar to port, and
the tree carries no date library, so days are ISO strings (YYYY-MM-DD).

Solid API mapping: `class` for `className`; `ref` is a plain prop (see
the [Composition guide](../../../docs/composition.md)).

## Model

Single or range selection, controlled or not. The grid follows the WAI
pattern: one tabbable day, arrows move by day and week, PageUp and
PageDown move by month (with Shift, by year), Home and End jump to the
week edges, Enter or Space selects. `min`, `max`, and `isDisabled`
bound selection; `weekStartsOn` and `locale` shape labels through
`Intl`. Helpers (`addDays`, `addMonths`, `formatDay`, `today`) are
exported for consumers building their own fields.
