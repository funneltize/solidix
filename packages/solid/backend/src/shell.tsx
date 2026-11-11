import { For, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { cx } from "@solidix/primitive";
import { useControllableState } from "@solidix/use-controllable-state";

/** Props for `AppShell`, the frame-first backend layout root. */
export type AppShellProps = Omit<JSX.IntrinsicElements["div"], "ref"> & {
  /** Rendered via ref callback or element ref from Solid. */
  ref?: ((el: HTMLDivElement | null) => void) | HTMLDivElement | undefined;
};

/**
 * Frame-first app shell. Regions scroll independently; the shell itself
 * never scrolls. Compose with `Sidebar`, `Main`, `TopBar`, `Inspector`.
 */
export const AppShell: Component<AppShellProps> = (props) => {
  const rest = omit(props, "class", "children");
  return (
    <div data-backend-part="shell" class={cx("sbx-shell", props.class)} {...rest}>
      {props.children}
    </div>
  );
};

/** Props for the shell sidebar region. */
export type SidebarProps = Omit<JSX.IntrinsicElements["aside"], "ref"> & {
  /** When true, renders the collapsed icon-rail width. */
  collapsed?: boolean | undefined;
  /** Rendered via ref callback or element ref from Solid. */
  ref?: ((el: HTMLElement | null) => void) | HTMLElement | undefined;
};

/** Sidebar region of `AppShell`. Keeps its own scroll position. */
export const Sidebar: Component<SidebarProps> = (props) => {
  const rest = omit(props, "class", "children", "collapsed");
  return (
    <aside
      data-backend-part="sidebar"
      data-collapsed={props.collapsed ? "true" : undefined}
      class={cx("sbx-sidebar", props.class)}
      {...rest}
    >
      {props.children}
    </aside>
  );
};

/** Props for the shell main region. */
export type MainProps = Omit<JSX.IntrinsicElements["main"], "ref"> & {
  /** Rendered via ref callback or element ref from Solid. */
  ref?: ((el: HTMLElement | null) => void) | HTMLElement | undefined;
};

/** Main content region of `AppShell`. */
export const Main: Component<MainProps> = (props) => {
  const rest = omit(props, "class", "children");
  return (
    <main data-backend-part="main" class={cx("sbx-main", props.class)} {...rest}>
      {props.children}
    </main>
  );
};

/** Props for the shell top bar. A budget with slots, not a title opinion. */
export type TopBarProps = Omit<JSX.IntrinsicElements["header"], "ref"> & {
  /** Rendered via ref callback or element ref from Solid. */
  ref?: ((el: HTMLElement | null) => void) | HTMLElement | undefined;
};

/** Top bar region. Fill leading, center, and trailing slots from the app. */
export const TopBar: Component<TopBarProps> = (props) => {
  const rest = omit(props, "class", "children");
  return (
    <header data-backend-part="topbar" class={cx("sbx-topbar", props.class)} {...rest}>
      {props.children}
    </header>
  );
};

/** Props for the optional inspector region. */
export type InspectorProps = Omit<JSX.IntrinsicElements["aside"], "ref"> & {
  /** Rendered via ref callback or element ref from Solid. */
  ref?: ((el: HTMLElement | null) => void) | HTMLElement | undefined;
};

/** Inspector region of `AppShell`. Overlays on narrow viewports. */
export const Inspector: Component<InspectorProps> = (props) => {
  const rest = omit(props, "class", "children");
  return (
    <aside data-backend-part="inspector" class={cx("sbx-inspector", props.class)} {...rest}>
      {props.children}
    </aside>
  );
};

/** Props for `PageHeader`, the canonical backend page chrome. */
export type PageHeaderProps = Omit<JSX.IntrinsicElements["div"], "ref"> & {
  /** Page title. Rendered as the header heading text. */
  title: string;
  /** Optional supporting description under the title. */
  description?: string | undefined;
  /** Primary and overflow actions. Exactly one primary action per page. */
  actions?: JSX.Element | undefined;
  /** Rendered via ref callback or element ref from Solid. */
  ref?: ((el: HTMLDivElement | null) => void) | HTMLDivElement | undefined;
};

/** Canonical page header: title, description, and one primary action slot. */
export const PageHeader: Component<PageHeaderProps> = (props) => {
  const rest = omit(props, "class", "children", "title", "description", "actions");
  return (
    <div data-backend-part="page-header" class={cx("sbx-page-header", props.class)} {...rest}>
      <div class="sbx-page-header-text">
        <h1 class="sbx-page-title">{props.title}</h1>
        {props.description ? <p class="sbx-page-desc">{props.description}</p> : null}
      </div>
      {props.actions ? <div class="sbx-page-actions">{props.actions}</div> : null}
      {props.children}
    </div>
  );
};

/** One sidebar navigation entry. `id` is the stable selection key. */
export type NavItem = {
  /** Stable item key, reported by `onActiveChange`. Never an index. */
  id: string;
  /** Visible label, also the accessible name when collapsed. */
  label: string;
  /** Link target. When set the item renders an anchor, else a button. */
  href?: string | undefined;
  /** Optional badge text or count shown after the label. */
  badge?: string | number | undefined;
  /** Disables the item without removing it from navigation. */
  disabled?: boolean | undefined;
};

/** A labelled group of navigation entries in `NavList`. */
export type NavGroup = {
  /** Optional group heading shown above its items. */
  label?: string | undefined;
  /** Entries in this group, in display order. */
  items: NavItem[];
};

/** Props for `NavList`, grouped sidebar navigation with badges. */
export type NavListProps = Omit<JSX.IntrinsicElements["nav"], "ref" | "children" | "onSelect"> & {
  /** Grouped entries. Takes precedence over `items` when both are set. */
  groups?: NavGroup[] | undefined;
  /** Ungrouped entries, shorthand for a single group without a heading. */
  items?: NavItem[] | undefined;
  /** Controlled active item id. */
  activeId?: string | undefined;
  /** Initial active item id for uncontrolled use. */
  defaultActiveId?: string | undefined;
  /** Called with the newly selected item id. */
  onActiveChange?: ((id: string) => void) | undefined;
  /** Collapsed icon-rail mode: labels hide, accessible names remain. */
  collapsed?: boolean | undefined;
  /** Rendered via ref callback or element ref from Solid. */
  ref?: ((el: HTMLElement | null) => void) | HTMLElement | undefined;
};

/**
 * Grouped sidebar navigation with badges and a single active item.
 * Data in, event out: selection is reported, routing stays in the app.
 */
export const NavList: Component<NavListProps> = (props) => {
  const rest = omit(
    props,
    "class",
    "groups",
    "items",
    "activeId",
    "defaultActiveId",
    "onActiveChange",
    "collapsed",
  );
  const [activeId, setActiveId] = useControllableState<string>({
    prop: () => props.activeId,
    defaultProp: props.defaultActiveId ?? "",
    onChange: props.onActiveChange as ((value: string) => void) | undefined,
    caller: "NavList",
  });
  const groups = (): NavGroup[] => props.groups ?? (props.items ? [{ items: props.items }] : []);
  const select = (item: NavItem) => {
    if (item.disabled) return;
    setActiveId(item.id);
  };
  return (
    <nav
      data-backend-part="nav-list"
      data-collapsed={props.collapsed ? "true" : undefined}
      class={cx("sbx-nav-list", props.class)}
      aria-label={props["aria-label"] ?? "Primary"}
      {...rest}
    >
      <For each={groups()}>
        {(group) => (
          <div class="sbx-nav-group">
            {group.label && !props.collapsed ? (
              <p class="sbx-nav-group-label">{group.label}</p>
            ) : null}
            <ul class="sbx-nav-items">
              <For each={group.items}>
                {(item) => {
                  const active = () => activeId() === item.id;
                  const content = (
                    <>
                      <span class="sbx-nav-label">{item.label}</span>
                      {item.badge !== undefined && !props.collapsed ? (
                        <span class="sbx-nav-badge">{item.badge}</span>
                      ) : null}
                    </>
                  );
                  return (
                    <li class="sbx-nav-item">
                      {item.href ? (
                        <a
                          class="sbx-nav-link"
                          href={item.href}
                          data-active={active() ? "true" : undefined}
                          aria-current={active() ? "page" : undefined}
                          aria-disabled={item.disabled ? "true" : undefined}
                          onClick={() => select(item)}
                        >
                          {content}
                        </a>
                      ) : (
                        <button
                          type="button"
                          class="sbx-nav-link"
                          data-active={active() ? "true" : undefined}
                          aria-current={active() ? "page" : undefined}
                          disabled={item.disabled}
                          onClick={() => select(item)}
                        >
                          {content}
                        </button>
                      )}
                    </li>
                  );
                }}
              </For>
            </ul>
          </div>
        )}
      </For>
    </nav>
  );
};

/** One section entry in `SettingsLayout`. */
export type SettingsSection = {
  /** Stable section key, reported by `onActiveChange`. */
  id: string;
  /** Visible section label in the settings nav. */
  label: string;
  /** Optional supporting description under the panel heading. */
  description?: string | undefined;
};

/** Props for `SettingsLayout`, section nav plus panel for settings pages. */
export type SettingsLayoutProps = Omit<JSX.IntrinsicElements["div"], "ref" | "onSelect"> & {
  /** Sections in display order. The first is the uncontrolled default. */
  sections: SettingsSection[];
  /** Controlled active section id. */
  activeId?: string | undefined;
  /** Initial active section id for uncontrolled use. */
  defaultActiveId?: string | undefined;
  /** Called with the newly selected section id. */
  onActiveChange?: ((id: string) => void) | undefined;
  /** Rendered via ref callback or element ref from Solid. */
  ref?: ((el: HTMLDivElement | null) => void) | HTMLDivElement | undefined;
};

/**
 * Settings page layout: section navigation on the left, one panel on
 * the right. The app renders panel content for the active section.
 */
export const SettingsLayout: Component<SettingsLayoutProps> = (props) => {
  const rest = omit(
    props,
    "class",
    "children",
    "sections",
    "activeId",
    "defaultActiveId",
    "onActiveChange",
  );
  const [activeId, setActiveId] = useControllableState<string>({
    prop: () => props.activeId,
    defaultProp: props.defaultActiveId ?? props.sections[0]?.id ?? "",
    onChange: props.onActiveChange as ((value: string) => void) | undefined,
    caller: "SettingsLayout",
  });
  const activeSection = () => props.sections.find((s) => s.id === activeId()) ?? props.sections[0];
  return (
    <div data-backend-part="settings-layout" class={cx("sbx-settings", props.class)} {...rest}>
      <div class="sbx-settings-nav" role="tablist" aria-label="Settings sections">
        <For each={props.sections}>
          {(section) => (
            <button
              type="button"
              role="tab"
              class="sbx-settings-tab"
              data-active={activeId() === section.id ? "true" : undefined}
              aria-selected={activeId() === section.id ? "true" : "false"}
              onClick={() => setActiveId(section.id)}
            >
              {section.label}
            </button>
          )}
        </For>
      </div>
      <section class="sbx-settings-panel" aria-label={activeSection()?.label}>
        {activeSection()?.description ? (
          <p class="sbx-settings-desc">{activeSection()?.description}</p>
        ) : null}
        {props.children}
      </section>
    </div>
  );
};

/** Props for `FieldRow`, one labelled settings field in a single rhythm. */
export type FieldRowProps = Omit<JSX.IntrinsicElements["div"], "ref"> & {
  /** Static field label. Never rely on a placeholder as the label. */
  label: string;
  /** Id of the control the label describes. */
  htmlFor?: string | undefined;
  /** Optional hint text under the control. */
  hint?: string | undefined;
  /** Optional error text. Rendered with an alert role when set. */
  error?: string | undefined;
  /** Rendered via ref callback or element ref from Solid. */
  ref?: ((el: HTMLDivElement | null) => void) | HTMLDivElement | undefined;
};

/** Label, control, hint, and error in one row rhythm for settings forms. */
export const FieldRow: Component<FieldRowProps> = (props) => {
  const rest = omit(props, "class", "children", "label", "htmlFor", "hint", "error");
  return (
    <div data-backend-part="field-row" class={cx("sbx-field-row", props.class)} {...rest}>
      <label class="sbx-field-label" for={props.htmlFor}>
        {props.label}
      </label>
      <div class="sbx-field-control">{props.children}</div>
      {props.error ? (
        <p class="sbx-field-error" role="alert">
          {props.error}
        </p>
      ) : props.hint ? (
        <p class="sbx-field-hint">{props.hint}</p>
      ) : null}
    </div>
  );
};
