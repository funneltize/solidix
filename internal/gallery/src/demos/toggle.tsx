import { Toggle } from "soldix";
import { FontItalicIcon } from "../icons";

const ToggleDemo = () => (
  <Toggle.Root class="Toggle" aria-label="Toggle italic">
    <FontItalicIcon />
  </Toggle.Root>
);

export default ToggleDemo;
