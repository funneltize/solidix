import { Toolbar } from "solidix";
import {
  FontBoldIcon,
  FontItalicIcon,
  StrikethroughIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
} from "../icons";

const ToolbarDemo = () => (
  <Toolbar.Root class="ToolbarRoot" aria-label="Formatting options">
    <Toolbar.ToggleGroup type="multiple" aria-label="Text formatting">
      <Toolbar.ToggleItem class="ToolbarToggleItem" value="bold" aria-label="Bold">
        <FontBoldIcon />
      </Toolbar.ToggleItem>
      <Toolbar.ToggleItem class="ToolbarToggleItem" value="italic" aria-label="Italic">
        <FontItalicIcon />
      </Toolbar.ToggleItem>
      <Toolbar.ToggleItem
        class="ToolbarToggleItem"
        value="strikethrough"
        aria-label="Strike through"
      >
        <StrikethroughIcon />
      </Toolbar.ToggleItem>
    </Toolbar.ToggleGroup>
    <Toolbar.Separator class="ToolbarSeparator" />
    <Toolbar.ToggleGroup type="single" defaultValue="center" aria-label="Text alignment">
      <Toolbar.ToggleItem class="ToolbarToggleItem" value="left" aria-label="Left aligned">
        <TextAlignLeftIcon />
      </Toolbar.ToggleItem>
      <Toolbar.ToggleItem class="ToolbarToggleItem" value="center" aria-label="Center aligned">
        <TextAlignCenterIcon />
      </Toolbar.ToggleItem>
      <Toolbar.ToggleItem class="ToolbarToggleItem" value="right" aria-label="Right aligned">
        <TextAlignRightIcon />
      </Toolbar.ToggleItem>
    </Toolbar.ToggleGroup>
    <Toolbar.Separator class="ToolbarSeparator" />
    <Toolbar.Link class="ToolbarLink" href="#" target="_blank" style={{ "margin-right": "10px" }}>
      Edited 2 hours ago
    </Toolbar.Link>
    <Toolbar.Button class="ToolbarButton" style={{ "margin-left": "auto" }}>
      Share
    </Toolbar.Button>
  </Toolbar.Root>
);

export default ToolbarDemo;
