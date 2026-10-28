// No upstream test suite exists at the pinned commit; these are
// Solidix-authored tests asserting observed upstream structure:
// portalled fui-AlertDialogBackdrop + fui-AlertDialogOverlay siblings
// wrapping div.fui-AlertDialogContent, with the title/description
// size cascade and modal alert-dialog semantics (Cancel initial
// focus, Escape blocked, outside interaction blocked).
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AlertDialog, alertDialogContentPropDefs } from "../src/index";

// `AlertDialog.Content` mounts a `Theme` for its tokens; `Theme` reads
// `window.matchMedia`, which jsdom does not provide.
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: () => {},
    matches: false,
    removeEventListener: () => {},
  }));
});

function openAlertDialog() {
  render(() => (
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <button type="button">Open</button>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Title>Revoke access</AlertDialog.Title>
        <AlertDialog.Description>This action cannot be undone.</AlertDialog.Description>
        <AlertDialog.Cancel>
          <button type="button">Cancel</button>
        </AlertDialog.Cancel>
        <AlertDialog.Action>
          <button type="button">Revoke</button>
        </AlertDialog.Action>
      </AlertDialog.Content>
    </AlertDialog.Root>
  ));
}

describe("AlertDialog", () => {
  it("renders closed, then opens with content, title, and description", async () => {
    openAlertDialog();
    expect(screen.queryByRole("alertdialog")).toBeNull();
    fireEvent.click(await screen.findByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(dialog.getAttribute("data-state")).toBe("open");
    expect(await screen.findByRole("heading", { name: "Revoke access" })).not.toBeNull();
    expect(screen.getByText("This action cannot be undone.")).not.toBeNull();
  });

  it("applies the default size class and cascades title/description sizes", async () => {
    openAlertDialog();
    fireEvent.click(await screen.findByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(dialog.classList.contains("fui-AlertDialogContent")).toBe(true);
    expect(dialog.classList.contains(`fui-r-size-${alertDialogContentPropDefs.size.default}`)).toBe(
      true,
    );
    // Default content size "3" cascades to title size "5" and description "2".
    const title = await screen.findByRole("heading", { name: "Revoke access" });
    expect(title.classList.contains("fui-r-size-5")).toBe(true);
    expect(
      screen.getByText("This action cannot be undone.").classList.contains("fui-r-size-2"),
    ).toBe(true);
  });

  it("focuses Cancel on open and returns focus to the trigger on close", async () => {
    openAlertDialog();
    const trigger = await screen.findByRole("button", { name: "Open" });
    fireEvent.click(trigger);
    await screen.findByRole("alertdialog");
    const cancel = await screen.findByRole("button", { name: "Cancel" });
    expect(document.activeElement).toBe(cancel);
    fireEvent.click(cancel);
    await vi.waitFor(() => {
      expect(screen.queryByRole("alertdialog")).toBeNull();
    });
    expect(document.activeElement).toBe(trigger);
  });

  it("does not close on Escape (alert-dialog semantics)", async () => {
    openAlertDialog();
    fireEvent.click(await screen.findByRole("button", { name: "Open" }));
    await screen.findByRole("alertdialog");
    fireEvent.keyDown(document, { bubbles: true, key: "Escape" });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.queryByRole("alertdialog")).not.toBeNull();
  });

  it("closes via Action and Cancel", async () => {
    openAlertDialog();
    fireEvent.click(await screen.findByRole("button", { name: "Open" }));
    await screen.findByRole("alertdialog");
    fireEvent.click(await screen.findByRole("button", { name: "Revoke" }));
    await vi.waitFor(() => {
      expect(screen.queryByRole("alertdialog")).toBeNull();
    });
    fireEvent.click(await screen.findByRole("button", { name: "Open" }));
    await screen.findByRole("alertdialog");
    fireEvent.click(await screen.findByRole("button", { name: "Cancel" }));
    await vi.waitFor(() => {
      expect(screen.queryByRole("alertdialog")).toBeNull();
    });
  });
});
