import { ToggleGroup } from "solidix";
import { TextAlignCenterIcon, TextAlignLeftIcon, TextAlignRightIcon } from "../icons";

const ToggleGroupDemo = () => (
  <ToggleGroup.Root
    class="ToggleGroup"
    type="single"
    defaultValue="center"
    aria-label="Text alignment"
  >
    <ToggleGroup.Item class="ToggleGroupItem" value="left" aria-label="Left aligned">
      <TextAlignLeftIcon />
    </ToggleGroup.Item>
    <ToggleGroup.Item class="ToggleGroupItem" value="center" aria-label="Center aligned">
      <TextAlignCenterIcon />
    </ToggleGroup.Item>
    <ToggleGroup.Item class="ToggleGroupItem" value="right" aria-label="Right aligned">
      <TextAlignRightIcon />
    </ToggleGroup.Item>
  </ToggleGroup.Root>
);

export default ToggleGroupDemo;
