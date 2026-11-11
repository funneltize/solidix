# Backend UI with @solidix/backend

Compact SaaS backends (admin panels, consoles, dashboards, settings)
built on Frosted. The package supplies shell, density, and data
opinions; Frosted supplies themed controls; your app owns routing,
fetching, and policy. Full design rationale lives in
`docs/backend-ui-design.md`.

## Start with the frame

Render `BackendTheme` once, then the shell. Regions scroll
independently; content never invents its own chrome.

```tsx
import { AppShell, BackendTheme, Main, NavList, PageHeader, Sidebar, TopBar } from "@solidix/backend";

<BackendTheme density="compact">
  <AppShell>
    <Sidebar>
      <NavList
        groups={[{ label: "General", items: [{ id: "customers", label: "Customers", badge: 12 }] }]}
        activeId={page()}
        onActiveChange={setPage}
      />
    </Sidebar>
    <Main>
      <TopBar>Acme Console</TopBar>
      <PageHeader title="Customers" description="All accounts" />
      {/* one content type per page */}
    </Main>
  </AppShell>
</BackendTheme>
```

Copy `tokens.css` and `backend.css` from the package into your
project and import them after Frosted styles (JSR ships JS only).
Density is set once on `BackendTheme` (`compact` default,
`comfortable` for spacious tools) and inherited everywhere.

## Data pages

`DataTable` presents rows it is given: sort presented rows with
`sortValue`, select by stable `id`, and let the app fetch and filter
the full set. Swap `FilterBar` for `BulkBar` while a selection is
active so the frame never jumps, and close the page with controlled
`Pagination`.

## Settings and workflow

Settings pages use `SettingsLayout` plus `FieldRow` so every field
shares one label, control, hint, and error rhythm. Dashboards use
`Stat` inside `StatGrid` (cards are widgets here, never wrappers
around tables). `CommandMenu` opens on Cmd+K or Ctrl+K and reports
stable values; `Confirm` titles and buttons name the object being
destroyed; `SaveBar` renders only while a form is dirty.

## Rules that keep pages consistent

Tokens only (never a hardcoded hex or size), parents own spacing,
data renders as edge-to-edge rows with dividers, exactly one primary
action per page in `PageHeader`, and stable keys for rows and
selection. Agents should load `packages/solid/backend/AGENT.md` in
full before writing backend UI; `src/components.json` is the
machine-readable component index.
