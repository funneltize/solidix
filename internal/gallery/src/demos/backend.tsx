import { createSignal } from "solid-js";
import { Backend } from "solidix";

type Customer = { id: string; name: string; email: string; spend: number; status: string };
const customers: Customer[] = [
  { id: "c1", name: "Ada Lovelace", email: "ada@example.com", spend: 1240, status: "Active" },
  { id: "c2", name: "Grace Hopper", email: "grace@example.com", spend: 980, status: "Active" },
  { id: "c3", name: "Alan Turing", email: "alan@example.com", spend: 2150, status: "Invited" },
  { id: "c4", name: "Edsger Dijkstra", email: "edsger@example.com", spend: 640, status: "Active" },
  { id: "c5", name: "Barbara Liskov", email: "barbara@example.com", spend: 1875, status: "Active" },
  { id: "c6", name: "Donald Knuth", email: "donald@example.com", spend: 2210, status: "Invited" },
];

const BackendDemo = () => {
  const [page, setPage] = createSignal("overview");
  const [dirty, setDirty] = createSignal(true);
  const [section, setSection] = createSignal("profile");
  const [query, setQuery] = createSignal("");
  const [selected, setSelected] = createSignal<string[]>([]);
  const [currentPage, setCurrentPage] = createSignal(1);
  const filtered = () =>
    customers.filter((c) => `${c.name} ${c.email}`.toLowerCase().includes(query().toLowerCase()));
  const pageRows = () => filtered().slice((currentPage() - 1) * 4, currentPage() * 4);
  return (
    <Backend.BackendTheme density="compact">
      <Backend.AppShell>
        <Backend.Sidebar>
          <strong>Acme</strong>
          <Backend.NavList
            groups={[
              {
                label: "General",
                items: [
                  { id: "overview", label: "Overview" },
                  { id: "customers", label: "Customers", badge: 12 },
                  { id: "billing", label: "Billing" },
                ],
              },
              { label: "Workspace", items: [{ id: "editor", label: "Editor" }, { id: "settings", label: "Settings" }] },
            ]}
            activeId={page()}
            onActiveChange={setPage}
          />
        </Backend.Sidebar>
        <Backend.Main>
          <Backend.TopBar>
            <span>Acme Console</span>
            <span>Press Cmd+K to jump anywhere</span>
          </Backend.TopBar>
          <Backend.CommandMenu
            groups={[
              {
                label: "Pages",
                items: [
                  { value: "overview", label: "Overview", keywords: "dashboard home" },
                  { value: "customers", label: "Customers", keywords: "users accounts" },
                  { value: "editor", label: "Editor", keywords: "canvas outline inspector" },
                  { value: "settings", label: "Settings", keywords: "workspace profile" },
                ],
              },
            ]}
            onSelect={setPage}
            placeholder="Search pages"
          />
          {page() === "overview" ? (
            <>
              <Backend.PageHeader title="Overview" description="Workspace health at a glance." />
              <Backend.StatGrid>
                <Backend.Stat label="Monthly revenue" value="$48,200" delta="+12% vs last month" deltaDirection="up" />
                <Backend.Stat label="Active customers" value="1,284" delta="+86 this week" deltaDirection="up" />
                <Backend.Stat label="Churn" value="2.1%" delta="+0.3 pts" deltaDirection="down" />
                <Backend.Stat label="Open tickets" value="17" delta="-4 today" deltaDirection="up" />
              </Backend.StatGrid>
              <Backend.SaveBar visible={dirty()} onSave={() => setDirty(false)} onDiscard={() => setDirty(false)} />
              {!dirty() ? (
                <Backend.EmptyState title="All caught up" description="No pending changes. Press Cmd+K to jump to Customers or Settings." />
              ) : null}
            </>
          ) : page() === "editor" ? (
            <>
              <Backend.PageHeader title="Editor" description="Outline, canvas, and inspector in one shell. The inspector region overlays on narrow windows." />
              <div style={{ display: "flex", gap: "0", "min-height": "260px" }}>
                <div style={{ width: "200px", flex: "none", "border-right": "1px solid var(--solidix-backend-line)" }}>
                  <Backend.DataList
                    records={[
                      { id: "o1", primary: "Introduction", secondary: "Section 1" },
                      { id: "o2", primary: "Getting started", secondary: "Section 2" },
                      { id: "o3", primary: "Advanced topics", secondary: "Section 3" },
                    ]}
                    selectedIds={["o2"]}
                  />
                </div>
                <div style={{ flex: "1 1 auto", padding: "20px" }}>
                  <strong>Getting started</strong>
                  <p>Canvas area. Regions scroll independently, so the outline and inspector keep their place while you edit.</p>
                  <Backend.DataSkeleton rows={2} columns={2} />
                </div>
              </div>
            </>
          ) : page() === "settings" ? (
            <>
              <Backend.PageHeader title="Settings" description="Workspace settings in one rhythm." />
              <Backend.SettingsLayout
                sections={[
                  { id: "profile", label: "Profile", description: "Name and public identity." },
                  { id: "billing", label: "Billing", description: "Plan and invoices." },
                  { id: "team", label: "Team", description: "Members and roles." },
                ]}
                activeId={section()}
                onActiveChange={setSection}
              >
                <Backend.FieldRow label="Workspace name" htmlFor="ws-name" hint="Shown to members.">
                  <input id="ws-name" value="Acme" />
                </Backend.FieldRow>
                <Backend.FieldRow label="Support email" htmlFor="ws-email" hint="Replies go here.">
                  <input id="ws-email" value="support@acme.example" />
                </Backend.FieldRow>
              </Backend.SettingsLayout>
            </>
          ) : (
            <>
              <Backend.PageHeader
                title="Customers"
                description="Sort, select, and page dense records without leaving the frame."
              />
              {selected().length > 0 ? (
                <Backend.BulkBar selectedCount={selected().length} onClear={() => setSelected([])}>
                  <button type="button">Export</button>
                  <button type="button">Archive</button>
                </Backend.BulkBar>
              ) : (
                <Backend.FilterBar
                  query={query()}
                  onQueryChange={(q) => { setQuery(q); setCurrentPage(1); }}
                  placeholder="Search customers"
                  resultCount={`${filtered().length} results`}
                />
              )}
              <Backend.DataTable
                caption="Customers"
                selectable
                selectedIds={selected()}
                onSelectionChange={setSelected}
                rows={pageRows()}
                columns={[
                  { key: "name", header: "Name", sortable: true, sortValue: (r: Customer) => r.name },
                  { key: "email", header: "Email" },
                  { key: "spend", header: "Spend", align: "end", sortable: true, sortValue: (r: Customer) => r.spend, render: (r: Customer) => `$${r.spend.toLocaleString()}` },
                  { key: "status", header: "Status" },
                ]}
                empty={<p>No customers match your filters.</p>}
              />
              <Backend.Pagination
                page={currentPage()}
                totalPages={Math.max(1, Math.ceil(filtered().length / 4))}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </Backend.Main>
        {page() === "editor" ? (
          <Backend.Inspector>
            <strong>Inspector</strong>
            <Backend.FieldRow label="Title" htmlFor="ed-title"><input id="ed-title" value="Getting started" /></Backend.FieldRow>
            <Backend.FieldRow label="Slug" htmlFor="ed-slug" hint="URL path for this section."><input id="ed-slug" value="getting-started" /></Backend.FieldRow>
          </Backend.Inspector>
        ) : null}
      </Backend.AppShell>
    </Backend.BackendTheme>
  );
};

export default BackendDemo;
