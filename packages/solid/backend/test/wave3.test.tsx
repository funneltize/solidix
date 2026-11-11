import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { BackendTheme, CommandMenu, Confirm, EmptyState, SaveBar, Stat, StatGrid } from "../src/index";

// Frosted `Theme` reads `window.matchMedia`, which jsdom does not provide.
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: () => {},
    matches: false,
    removeEventListener: () => {},
  }));
});

const settle = async () => {
  await new Promise((r) => setTimeout(r, 0));
  flush();
};

describe("CommandMenu", () => {
  test("opens on Cmd+K, filters, and reports the chosen value", async () => {
    const onSelect = vi.fn();
    const { queryByText } = render(() => (
      <BackendTheme>
        <CommandMenu
          groups={[
            { label: "Pages", items: [{ value: "customers", label: "Customers" }, { value: "billing", label: "Billing" }] },
          ]}
          onSelect={onSelect}
          placeholder="Search commands"
        />
      </BackendTheme>
    ));
    await settle();
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    flush();
    const input = await screen.findByPlaceholderText("Search commands");
    expect(input).toBeTruthy();
    fireEvent.input(input, { target: { value: "bill" } });
    flush();
    expect(queryByText("Customers")).toBeNull();
    fireEvent.click(await screen.findByText("Billing"));
    flush();
    expect(onSelect).toHaveBeenCalledWith("billing");
  });

  test("shortcut=false disables the global shortcut", async () => {
    const { queryByPlaceholderText } = render(() => (
      <BackendTheme>
        <CommandMenu shortcut={false} groups={[{ label: "Pages", items: [{ value: "x", label: "Xray" }] }]} placeholder="Search commands" />
      </BackendTheme>
    ));
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    flush();
    expect(queryByPlaceholderText("Search commands")).toBeNull();
  });
});

describe("EmptyState, Stat, SaveBar", () => {
  test("EmptyState composes Frosted parts with an action slot", async () => {
    const { findByText, container } = render(() => (
      <BackendTheme>
        <EmptyState title="No customers yet" description="Import or invite your first customer." action={<button type="button">Add customer</button>} />
      </BackendTheme>
    ));
    expect(await findByText("No customers yet")).toBeTruthy();
    expect(await findByText("Add customer")).toBeTruthy();
    expect(container.querySelector('[data-backend-part="empty-state"]')).toBeTruthy();
  });

  test("Stat renders label, value, and delta direction; SaveBar gates on visible", async () => {
    const onSave = vi.fn();
    const onDiscard = vi.fn();
    const [dirty, setDirty] = createSignal(true);
    const { findByText, queryByText, container } = render(() => (
      <BackendTheme>
        <StatGrid>
          <Stat label="Monthly revenue" value="$48,200" delta="+12% vs last month" deltaDirection="up" />
          <Stat label="Churn" value="2.1%" delta="+0.3 pts" deltaDirection="down" />
        </StatGrid>
        <SaveBar visible={dirty()} onSave={() => { onSave(); setDirty(false); }} onDiscard={onDiscard} />
      </BackendTheme>
    ));
    expect(await findByText("$48,200")).toBeTruthy();
    expect(container.querySelector('[data-direction="up"]')).toBeTruthy();
    fireEvent.click(await findByText("Save changes"));
    flush();
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(queryByText("Unsaved changes")).toBeNull();
  });
});

describe("Confirm", () => {
  test("names the object and fires onConfirm only after confirming", async () => {
    const onConfirm = vi.fn();
    const [open, setOpen] = createSignal(false);
    const { findByText } = render(() => (
      <BackendTheme>
        <button type="button" onClick={() => setOpen(true)}>Delete workspace</button>
        <Confirm
          open={open()}
          onOpenChange={setOpen}
          title="Delete Acme workspace?"
          description="This permanently deletes Acme and all its data."
          confirmLabel="Delete Acme workspace"
          onConfirm={onConfirm}
        />
      </BackendTheme>
    ));
    fireEvent.click(await findByText("Delete workspace"));
    flush();
    await settle();
    expect(await screen.findByText("Delete Acme workspace?")).toBeTruthy();
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.click(await screen.findByText("Delete Acme workspace"));
    flush();
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(open()).toBe(false);
  });
});
