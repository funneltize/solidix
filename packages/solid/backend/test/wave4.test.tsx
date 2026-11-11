import { fireEvent, render } from "@solidjs/testing-library";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { flush } from "solid-js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import * as Backend from "../src/index";

// Frosted `Theme` reads `window.matchMedia`, which jsdom does not provide.
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: () => {},
    matches: false,
    removeEventListener: () => {},
  }));
});

function workspaceFile(...segments: string[]): string {
  let dir = process.cwd();
  for (;;) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) return join(dir, ...segments);
    const parent = dirname(dir);
    if (parent === dir) throw new Error("[backend] workspace root not found");
    dir = parent;
  }
}

describe("theme and density matrix", () => {
  const densities = ["compact", "comfortable"] as const;
  const appearances = ["light", "dark"] as const;
  for (const density of densities) {
    for (const appearance of appearances) {
      test(`${appearance} + ${density} stamps root hooks and renders a row`, async () => {
        const { container, findByText } = render(() => (
          <Backend.BackendTheme density={density} appearance={appearance}>
            <Backend.AppShell>
              <Backend.Main>
                <Backend.PageHeader title="Customers" />
                <Backend.DataRow record={{ id: "c1", primary: "Ada Lovelace", value: "$1,240" }} />
              </Backend.Main>
            </Backend.AppShell>
          </Backend.BackendTheme>
        ));
        expect(await findByText("Ada Lovelace")).toBeTruthy();
        const root = container.querySelector("[data-backend-root]");
        expect(root?.getAttribute("data-density")).toBe(density);
        expect(root?.getAttribute("data-backend-theme")).toBe(
          appearance === "dark" ? "dark" : null,
        );
      });
    }
  }

  test("comfortable overrides only density tokens, never colors", () => {
    const css = readFileSync(
      workspaceFile("packages", "solid", "backend", "src", "tokens.css"),
      "utf8",
    );
    const comfortable = css.slice(css.indexOf('[data-density="comfortable"]'));
    expect(comfortable).toContain("--solidix-backend-row-height: 48px");
    expect(comfortable).not.toContain("--solidix-backend-ink:");
    expect(comfortable).not.toContain("--solidix-backend-surface:");
  });
});

describe("keyboard and assistive pass", () => {
  test("every NavList item is a tabbable native control with a complete name", async () => {
    const { findByText, container } = render(() => (
      <Backend.BackendTheme>
        <Backend.NavList
          items={[
            { id: "overview", label: "Overview" },
            { id: "customers", label: "Customers", badge: 3 },
          ]}
          defaultActiveId="overview"
        />
      </Backend.BackendTheme>
    ));
    expect(await findByText("Overview")).toBeTruthy();
    const controls = [...container.querySelectorAll(".sbx-nav-link")];
    expect(controls.length).toBe(2);
    for (const control of controls) {
      expect(["BUTTON", "A"]).toContain(control.tagName);
      expect(control.textContent?.trim().length).toBeGreaterThan(0);
    }
    (controls[1] as HTMLElement).focus();
    expect(document.activeElement).toBe(controls[1]);
    fireEvent.keyDown(controls[1]!, { key: "Enter" });
    fireEvent.click(controls[1]!);
    flush();
    expect(controls[1]?.getAttribute("aria-current")).toBe("page");
  });

  test("table sort and selection controls are native and labelled", async () => {
    const { findByText, findByLabelText, container } = render(() => (
      <Backend.BackendTheme>
        <Backend.DataTable
          selectable
          rows={[{ id: "c1", name: "Ada", spend: 10 }]}
          columns={[
            {
              key: "name",
              header: "Name",
              sortable: true,
              sortValue: (r: { name: string }) => r.name,
            },
            { key: "spend", header: "Spend" },
          ]}
        />
      </Backend.BackendTheme>
    ));
    const sortButton = (await findByText("Name")).closest("button");
    expect(sortButton?.tagName).toBe("BUTTON");
    expect(await findByLabelText("Select all rows")).toBeTruthy();
    expect(await findByLabelText("Select row c1")).toBeTruthy();
    sortButton?.focus();
    expect(document.activeElement).toBe(sortButton);
    expect(container.querySelector('[role="status"]')?.textContent).toContain("0 selected");
  });

  test("focus and reduced-motion guards ship in the token layer", () => {
    const css = readFileSync(
      workspaceFile("packages", "solid", "backend", "src", "tokens.css"),
      "utf8",
    );
    expect(css).toContain("[data-backend-root] :focus-visible");
    expect(css).toContain("prefers-reduced-motion");
  });

  test("decorative sort glyphs stay hidden from assistive tech", async () => {
    const { container, findByText } = render(() => (
      <Backend.BackendTheme>
        <Backend.DataTable
          rows={[{ id: "c1", name: "Ada" }]}
          columns={[
            {
              key: "name",
              header: "Name",
              sortable: true,
              sortValue: (r: { name: string }) => r.name,
            },
          ]}
          defaultSort={{ key: "name", direction: "asc" }}
        />
      </Backend.BackendTheme>
    ));
    expect(await findByText("Name")).toBeTruthy();
    const glyph = container.querySelector(".sbx-table-sort span");
    expect(glyph?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("public surface completeness", () => {
  test("every runtime export is in the machine-readable index", () => {
    const indexed = new Set(Backend.backendComponents.map((c) => c.name));
    const runtimeExports = Object.keys(Backend).filter(
      // `Root` is the umbrella-convention alias of `BackendTheme`, indexed once.
      (key) => /^[A-Z]/.test(key) && !["backendComponents", "Root"].includes(key),
    );
    for (const name of runtimeExports) {
      expect(indexed.has(name), `${name} missing from components.json`).toBe(true);
    }
    // Token helpers are utilities, not components: excluded by design.
    expect(indexed.has("renderTokensCss")).toBe(false);
  });
});
