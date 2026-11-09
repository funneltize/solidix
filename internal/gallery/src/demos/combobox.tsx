import { Combobox } from "solidix";

const ComboboxDemo = () => (
  <Combobox.Combobox>
    <Combobox.ComboboxInput aria-label="Fruit" placeholder="Pick a fruit" />
    <Combobox.ComboboxListbox>
      <Combobox.ComboboxOption value="apple">Apple</Combobox.ComboboxOption>
      <Combobox.ComboboxOption value="banana">Banana</Combobox.ComboboxOption>
      <Combobox.ComboboxOption value="cherry">Cherry</Combobox.ComboboxOption>
    </Combobox.ComboboxListbox>
  </Combobox.Combobox>
);

export default ComboboxDemo;
