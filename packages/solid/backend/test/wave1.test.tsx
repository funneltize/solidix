import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { BackendTheme, FieldRow, NavList, SettingsLayout } from "../src/index";

// Frosted `Theme` reads `window.matchMedia`, which jsdom does not provide.
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: () => {},
    matches: false,
    removeEventListener: () => {},
  }));
});

describe("NavList", () => {
  test("renders groups, badges, and active state, then reports selection", async () => {
    const onActiveChange = vi.fn();
    const { findByText, container } = render(() => (
      <BackendTheme>
        <NavList
          groups={[
            {
              label: "General",
              items: [
                { id: "overview", label: "Overview" },
                { id: "customers", label: "Customers", badge: 12 },
              ],
            },
            { label: "Workspace", items: [{ id: "settings", label: "Settings" }] },
          ]}
          defaultActiveId="overview"
          onActiveChange={onActiveChange}
        />
      </BackendTheme>
    ));
    expect(await findByText("General")).toBeTruthy();
    expect(await findByText("12")).toBeTruthy();
    const overview = container.querySelector('[data-backend-part="nav-list"] .sbx-nav-link');
    expect(overview?.getAttribute("data-active")).toBe("true");
    expect(overview?.getAttribute("aria-current")).toBe("page");
    fireEvent.click(await findByText("Customers"));
    flush();
    expect(onActiveChange).toHaveBeenCalledWith("customers");
  });

  test("controlled activeId wins and disabled items never select", async () => {
    const onActiveChange = vi.fn();
    const { findByText } = render(() => (
      <BackendTheme>
        <NavList
          items={[
            { id: "a", label: "Alpha" },
            { id: "b", label: "Beta", disabled: true },
          ]}
          activeId="a"
          onActiveChange={onActiveChange}
        />
      </BackendTheme>
    ));
    fireEvent.click(await findByText("Beta"));
    flush();
    expect(onActiveChange).not.toHaveBeenCalled();
  });

  test("href items render anchors with the same active contract", async () => {
    const { findByText } = render(() => (
      <BackendTheme>
        <NavList items={[{ id: "docs", label: "Docs", href: "/docs" }]} defaultActiveId="docs" />
      </BackendTheme>
    ));
    const link = (await findByText("Docs")).closest("a");
    expect(link?.getAttribute("href")).toBe("/docs");
    expect(link?.getAttribute("aria-current")).toBe("page");
  });
});

describe("SettingsLayout and FieldRow", () => {
  test("switches sections uncontrolled and renders the panel rhythm", async () => {
    const [section, setSection] = createSignal("profile");
    const { findByText, findByRole, container } = render(() => (
      <BackendTheme>
        <SettingsLayout
          sections={[
            { id: "profile", label: "Profile", description: "Name and avatar." },
            { id: "billing", label: "Billing" },
          ]}
          activeId={section()}
          onActiveChange={setSection}
        >
          <FieldRow label="Workspace name" htmlFor="ws-name" hint="Shown to members.">
            <input id="ws-name" value="Acme" />
          </FieldRow>
        </SettingsLayout>
      </BackendTheme>
    ));
    expect(await findByText("Name and avatar.")).toBeTruthy();
    expect(container.querySelector('[data-backend-part="settings-layout"]')).toBeTruthy();
    fireEvent.click(await findByText("Billing"));
    flush();
    expect(section()).toBe("billing");
    const billingTab = await findByRole("tab", { name: "Billing" });
    expect(billingTab.getAttribute("aria-selected")).toBe("true");
  });

  test("FieldRow error wins over hint with an alert role", async () => {
    const { findByText, queryByText } = render(() => (
      <BackendTheme>
        <FieldRow label="Email" hint="Work email only." error="Enter a valid email.">
          <input aria-label="Email" />
        </FieldRow>
      </BackendTheme>
    ));
    const error = await findByText("Enter a valid email.");
    expect(error.getAttribute("role")).toBe("alert");
    expect(queryByText("Work email only.")).toBeNull();
  });
});
