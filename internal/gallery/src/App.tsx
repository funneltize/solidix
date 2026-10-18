import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  type Component,
} from "solid-js";
import { demos } from "./demos/registry";
import DocPage from "./DocPage";
import Landing from "./Landing";

function routeFromHash(): string | null {
  const hash = window.location.hash;
  if (hash.startsWith("#/")) return decodeURIComponent(hash.slice(2));
  return null; // in-page anchor, not a route change
}

const App: Component = () => {
  const [path, setPath] = createSignal(routeFromHash() ?? "");
  const [query, setQuery] = createSignal("");
  const onHashChange = () => {
    const route = routeFromHash();
    if (route !== null) setPath(route);
  };
  window.addEventListener("hashchange", onHashChange);
  onCleanup(() => window.removeEventListener("hashchange", onHashChange));

  const index = createMemo(() => demos.findIndex((demo) => demo.slug === path()));
  const isDoc = () => index() >= 0;
  const filtered = createMemo(() => {
    const q = query().trim().toLowerCase();
    if (q === "") return demos;
    return demos.filter((demo) => demo.title.toLowerCase().includes(q) || demo.slug.includes(q));
  });

  // One demo stylesheet at a time (see DocPage): swap it on navigation, drop
  // it entirely on the landing page.
  createEffect(
    () => (isDoc() ? demos[index()]!.css : null),
    (css) => {
      const existing = document.getElementById("demo-css") as HTMLLinkElement | null;
      if (css === null || css === undefined) {
        existing?.remove();
        return;
      }
      if (existing) existing.href = css;
      else {
        const link = document.createElement("link");
        link.id = "demo-css";
        link.rel = "stylesheet";
        link.href = css;
        document.head.appendChild(link);
      }
    },
  );

  createEffect(
    () => path(),
    () => {
      window.scrollTo(0, 0);
    },
  );

  return (
    <div class="app">
      <header class="site-header">
        <a class="brand" href="#/">
          <span class="brand-mark" aria-hidden="true" />
          <span class="brand-word">solidix</span>
          <span class="brand-tag">Solid 2 port of Radix UI</span>
        </a>
        <div class="header-right">
          <span class="version-chip">0.x</span>
          <a href="https://github.com/eggfloat/solidix" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </header>
      <Show
        when={isDoc()}
        fallback={
          <main class="landing-wrap">
            <Landing />
          </main>
        }
      >
        <div class="shell">
          <aside class="sidebar">
            <div class="search-wrap">
              <input
                type="search"
                class="search"
                placeholder="Filter primitives…"
                aria-label="Filter primitives"
                value={query()}
                onInput={(event) => setQuery(event.currentTarget.value)}
              />
            </div>
            <h2>Primitives</h2>
            <nav>
              <ul>
                <For each={filtered()} fallback={<li class="no-match">No matches.</li>}>
                  {(demo) => (
                    <li>
                      <a
                        href={`#/${demo.slug}`}
                        class={path() === demo.slug ? "active" : undefined}
                      >
                        {demo.title}
                      </a>
                    </li>
                  )}
                </For>
              </ul>
            </nav>
          </aside>
          <main class="doc-wrap">
            <DocPage
              demo={demos[index()]!}
              prev={index() > 0 ? demos[index() - 1] : undefined}
              next={index() < demos.length - 1 ? demos[index() + 1] : undefined}
            />
          </main>
        </div>
      </Show>
    </div>
  );
};

export default App;
