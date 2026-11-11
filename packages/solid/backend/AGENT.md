# @solidix/backend - agent cheat sheet

Load this file in full before writing backend UI. It is the single
source humans and agents share. Full design: `docs/backend-ui-design.md`.

## Setup

- Install `@solidix/backend` and `@solidix/frosted`.
- Copy `src/tokens.css` and `src/backend.css` into your project and
  import them after Frosted styles (JSR ships JS only).
- Render `BackendTheme` once at the app root. Never nest a second one.

## Shell-first recipe

Every page starts from the frame, never from content chrome:

```tsx
<BackendTheme density="compact">
  <AppShell>
    <Sidebar>{/* NavList or app nav */}</Sidebar>
    <Main>
      <TopBar>{/* title, search, actions */}</TopBar>
      <PageHeader title="Customers" description="..." actions={...} />
      {/* one content type: data, form, dashboard, or settings */}
    </Main>
    <Inspector>{/* optional */}</Inspector>
  </AppShell>
</BackendTheme>
```

## Rules

- Tokens only. Reach for `--solidix-backend-*` roles. A hex, px size,
  or duration literal in component CSS is wrong; extend tokens first.
- Compact by default. Set `density` once on `BackendTheme`. Never add
  a density prop to a single component.
- Data as rows. Tables and lists are edge-to-edge with dividers.
  Never wrap a table in a floating card. Cards are for widgets.
- Parents own spacing. Components have no outer margins.
- Data in, events out. Components never fetch, route, or read a store.
- One primary action per page, in `PageHeader` actions.
- Stable keys for rows and selection, never row indexes.

## Component index

See `src/components.json` for the machine-readable list (name,
import, one-line job). Exports: `BackendTheme`, `AppShell`,
`Sidebar`, `Main`, `TopBar`, `Inspector`, `PageHeader`, `NavList`,
`SettingsLayout`, `FieldRow`, `CommandMenu`, `EmptyState`, `Stat`,
`StatGrid`, `Confirm`, `SaveBar`, `DataList`, `DataTable`, `FilterBar`,
`Pagination`, `BulkBar`, `DataRow`.
All other controls (Button, Dialog, Select, Table, Toast) come from
`@solidix/frosted`. Never reimplement a Frosted control here.

## Workflow rules

- `CommandMenu` opens on Cmd+K or Ctrl+K. Give items stable values;
  the app decides what a selection does.
- `Confirm` titles and buttons name the destroyed object. Never
  "Are you sure?" with a bare "Delete".
- `SaveBar` renders only while dirty. Save clears dirty in the app.

## Large and loading data

Pass `virtual` to `DataTable` for 1k+ row sets (windowed rendering),
mark columns `resizable` for drag and keyboard resizing, and render
`DataSkeleton` while a surface loads.

## Prop definitions

Read `*PropDefs` exports (`dataTablePropDefs`, `navListPropDefs`,
and friends) for types, enum values, and defaults without opening
component source. `DataTable sortMode="server"` reports sort via
`onSortChange` without reordering; re-fetch and pass sorted rows.

## Data recipe

`DataTable` presents rows it is given. Sort with `sortValue`, select
by stable `id`, and swap `FilterBar` for `BulkBar` while selected so
the frame never jumps. Fetching stays in the app.

## Settings recipe

```tsx
<SettingsLayout
  sections={[
    { id: "profile", label: "Profile" },
    { id: "billing", label: "Billing" },
  ]}
  defaultActiveId="profile"
  onActiveChange={(id) => setSection(id)}
>
  <FieldRow label="Workspace name" htmlFor="ws-name" hint="Shown to members.">
    <input id="ws-name" />
  </FieldRow>
</SettingsLayout>
```

## Anti-patterns

- Hardcoding colors, repainting Frosted, per-page shell markup,
  twenty-prop mega components, placeholder-only labels, fetching
  inside a component. Each has a do-instead in the design doc, section 12.
