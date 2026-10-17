import { createSignal } from "solid-js";
import { Collapsible } from "soldix";
import { Cross2Icon, RowSpacingIcon } from "../icons";

const CollapsibleDemo = () => {
  const [open, setOpen] = createSignal(false);
  return (
    <Collapsible.Root class="CollapsibleRoot" open={open()} onOpenChange={setOpen}>
      <div style={{ display: "flex", "align-items": "center", "justify-content": "space-between" }}>
        <span class="Text" style={{ color: "white" }}>
          @peduarte starred 3 repositories
        </span>
        <Collapsible.Trigger asChild>
          <button class="IconButton" type="button">
            {open() ? <Cross2Icon /> : <RowSpacingIcon />}
          </button>
        </Collapsible.Trigger>
      </div>

      <div class="Repository">
        <span class="Text">@radix-ui/primitives</span>
      </div>

      <Collapsible.Content>
        <div class="Repository">
          <span class="Text">@radix-ui/colors</span>
        </div>
        <div class="Repository">
          <span class="Text">@radix-ui/themes</span>
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

export default CollapsibleDemo;
