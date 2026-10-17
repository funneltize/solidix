import { omit, type Component } from "solid-js";
import { Select } from "soldix";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "../icons";

const SelectDemo = () => (
  <Select.Root>
    <Select.Trigger class="SelectTrigger" aria-label="Food">
      <Select.Value placeholder="Select a fruit…" />
      <Select.Icon class="SelectIcon">
        <ChevronDownIcon />
      </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content class="SelectContent">
        <Select.ScrollUpButton class="SelectScrollButton">
          <ChevronUpIcon />
        </Select.ScrollUpButton>
        <Select.Viewport class="SelectViewport">
          <Select.Group>
            <Select.Label class="SelectLabel">Fruits</Select.Label>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="blueberry">Blueberry</SelectItem>
            <SelectItem value="grapes">Grapes</SelectItem>
            <SelectItem value="pineapple">Pineapple</SelectItem>
          </Select.Group>

          <Select.Separator class="SelectSeparator" />

          <Select.Group>
            <Select.Label class="SelectLabel">Vegetables</Select.Label>
            <SelectItem value="aubergine">Aubergine</SelectItem>
            <SelectItem value="broccoli">Broccoli</SelectItem>
            <SelectItem value="carrot" disabled>
              Carrot
            </SelectItem>
            <SelectItem value="courgette">Courgette</SelectItem>
            <SelectItem value="leek">Leek</SelectItem>
          </Select.Group>

          <Select.Separator class="SelectSeparator" />

          <Select.Group>
            <Select.Label class="SelectLabel">Meat</Select.Label>
            <SelectItem value="beef">Beef</SelectItem>
            <SelectItem value="chicken">Chicken</SelectItem>
            <SelectItem value="lamb">Lamb</SelectItem>
            <SelectItem value="pork">Pork</SelectItem>
          </Select.Group>
        </Select.Viewport>
        <Select.ScrollDownButton class="SelectScrollButton">
          <ChevronDownIcon />
        </Select.ScrollDownButton>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);

const SelectItem: Component<Select.SelectItemProps> = (props) => {
  const rest = omit(props, "children", "class");
  return (
    <Select.Item class={`SelectItem ${props.class ?? ""}`} {...rest}>
      <Select.ItemText>{props.children}</Select.ItemText>
      <Select.ItemIndicator class="SelectItemIndicator">
        <CheckIcon />
      </Select.ItemIndicator>
    </Select.Item>
  );
};

export default SelectDemo;
