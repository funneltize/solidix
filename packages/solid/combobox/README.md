# `@solidix/combobox`

Combobox primitive. Solidix-native: Radix has no combobox to port, so
this follows the WAI-ARIA combobox pattern directly.

Solid API mapping: `class` for `className`; `ref` is a plain prop (see
the [Composition guide](../../../docs/composition.md)).

## Model

`Combobox` owns open state, input text, selection, and highlight.
Filtering is the consumer's job: render only the `ComboboxOption`s that
match the current input. The input reports `aria-expanded`,
`aria-controls`, and `aria-activedescendant`; Arrow keys move the
highlight, Enter selects, Escape closes, and options select on click
or hover-highlight plus Enter.

```tsx
const [query, setQuery] = createSignal("");
<Combobox inputValue={query()} onInputValueChange={setQuery} onValueChange={choose}>
  <ComboboxInput placeholder="Search" />
  <ComboboxListbox>
    <For each={matches()}>
      {(item) => <ComboboxOption value={item.id}>{item.label}</ComboboxOption>}
    </For>
  </ComboboxListbox>
</Combobox>;
```
