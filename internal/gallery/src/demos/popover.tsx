import { Popover } from "soldix";
import { Cross2Icon, MixerHorizontalIcon } from "../icons";

const PopoverDemo = () => (
  <Popover.Root>
    <Popover.Trigger asChild>
      <button class="IconButton" type="button" aria-label="Update dimensions">
        <MixerHorizontalIcon />
      </button>
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Content class="PopoverContent" sideOffset={5}>
        <div style={{ display: "flex", "flex-direction": "column", gap: "10px" }}>
          <p class="Text" style={{ "margin-bottom": "10px" }}>
            Dimensions
          </p>
          <fieldset class="Fieldset">
            <label class="Label" for="width">
              Width
            </label>
            <input class="Input" id="width" value="100%" />
          </fieldset>
          <fieldset class="Fieldset">
            <label class="Label" for="maxWidth">
              Max. width
            </label>
            <input class="Input" id="maxWidth" value="300px" />
          </fieldset>
          <fieldset class="Fieldset">
            <label class="Label" for="height">
              Height
            </label>
            <input class="Input" id="height" value="25px" />
          </fieldset>
          <fieldset class="Fieldset">
            <label class="Label" for="maxHeight">
              Max. height
            </label>
            <input class="Input" id="maxHeight" value="none" />
          </fieldset>
        </div>
        <Popover.Close class="PopoverClose" aria-label="Close">
          <Cross2Icon />
        </Popover.Close>
        <Popover.Arrow class="PopoverArrow" />
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
);

export default PopoverDemo;
