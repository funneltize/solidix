import { Dialog } from "soldix";
import { Cross2Icon } from "../icons";

const DialogDemo = () => (
  <Dialog.Root>
    <Dialog.Trigger asChild>
      <button class="Button violet" type="button">
        Edit profile
      </button>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay class="DialogOverlay" />
      <Dialog.Content class="DialogContent">
        <Dialog.Title class="DialogTitle">Edit profile</Dialog.Title>
        <Dialog.Description class="DialogDescription">
          Make changes to your profile here. Click save when you&apos;re done.
        </Dialog.Description>
        <fieldset class="Fieldset">
          <label class="Label" for="name">
            Name
          </label>
          <input class="Input" id="name" value="Pedro Duarte" />
        </fieldset>
        <fieldset class="Fieldset">
          <label class="Label" for="username">
            Username
          </label>
          <input class="Input" id="username" value="@peduarte" />
        </fieldset>
        <div style={{ display: "flex", "margin-top": "25px", "justify-content": "flex-end" }}>
          <Dialog.Close asChild>
            <button class="Button green" type="button">
              Save changes
            </button>
          </Dialog.Close>
        </div>
        <Dialog.Close asChild>
          <button class="IconButton" type="button" aria-label="Close">
            <Cross2Icon />
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

export default DialogDemo;
