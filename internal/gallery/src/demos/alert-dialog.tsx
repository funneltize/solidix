import { AlertDialog } from "soldix";

const AlertDialogDemo = () => (
  <AlertDialog.Root>
    <AlertDialog.Trigger asChild>
      <button class="Button violet" type="button">
        Delete account
      </button>
    </AlertDialog.Trigger>
    <AlertDialog.Portal>
      <AlertDialog.Overlay class="AlertDialogOverlay" />
      <AlertDialog.Content class="AlertDialogContent">
        <AlertDialog.Title class="AlertDialogTitle">Are you absolutely sure?</AlertDialog.Title>
        <AlertDialog.Description class="AlertDialogDescription">
          This action cannot be undone. This will permanently delete your account and remove your
          data from our servers.
        </AlertDialog.Description>
        <div style={{ display: "flex", gap: "25px", "justify-content": "flex-end" }}>
          <AlertDialog.Cancel asChild>
            <button class="Button mauve" type="button">
              Cancel
            </button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild>
            <button class="Button red" type="button">
              Yes, delete account
            </button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);

export default AlertDialogDemo;
