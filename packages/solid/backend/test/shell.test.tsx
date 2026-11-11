import { render } from "@solidjs/testing-library";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AppShell, BackendTheme, DataRow, Main, PageHeader, Sidebar, TopBar } from "../src/index";

// Frosted `Theme` reads `window.matchMedia`, which jsdom does not provide.
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: () => {},
    matches: false,
    removeEventListener: () => {},
  }));
});

describe("BackendTheme and AppShell", () => {
  test("renders frame-first shell with density and one data row", async () => {
    const { findByText, container } = render(() => (
      <BackendTheme density="compact">
        <AppShell>
          <Sidebar>Customers nav</Sidebar>
          <Main>
            <TopBar>Acme Console</TopBar>
            <PageHeader title="Customers" description="All accounts" />
            <DataRow
              record={{
                id: "c1",
                primary: "Ada Lovelace",
                secondary: "ada@example.com",
                value: "$1,240",
                status: "Active",
              }}
            />
          </Main>
        </AppShell>
      </BackendTheme>
    ));

    expect(await findByText("Customers")).toBeTruthy();
    expect(await findByText("Ada Lovelace")).toBeTruthy();
    expect(await findByText("$1,240")).toBeTruthy();
    const root = container.querySelector("[data-backend-root]");
    expect(root?.getAttribute("data-density")).toBe("compact");
    expect(container.querySelector('[data-backend-part="shell"]')).toBeTruthy();
    expect(container.querySelector('[data-backend-part="sidebar"]')).toBeTruthy();
    expect(container.querySelector('[data-backend-part="data-row"]')).toBeTruthy();
  });

  test("comfortable density is inherited from the theme root", async () => {
    const { container, findByText } = render(() => (
      <BackendTheme density="comfortable">
        <AppShell>
          <Main>
            <PageHeader title="Billing" />
            <DataRow record={{ id: "b1", primary: "Invoice 1042", value: "$99", status: "Paid" }} />
          </Main>
        </AppShell>
      </BackendTheme>
    ));
    expect(await findByText("Billing")).toBeTruthy();
    expect(container.querySelector("[data-backend-root]")?.getAttribute("data-density")).toBe(
      "comfortable",
    );
  });

  test("selected row exposes the selected state hook", async () => {
    const { container, findByText } = render(() => (
      <BackendTheme>
        <DataRow selected record={{ id: "c2", primary: "Grace Hopper", status: "Active" }} />
      </BackendTheme>
    ));
    expect(await findByText("Grace Hopper")).toBeTruthy();
    expect(
      container.querySelector('[data-backend-part="data-row"]')?.getAttribute("data-selected"),
    ).toBe("true");
  });
});
