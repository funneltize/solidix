import { For, Show, createSignal, type Component } from "solid-js";
import { Dynamic } from "@solidjs/web";
import type { DemoEntry } from "./demos/registry";
import { docs } from "./docs/index";
import { Inline, Markdown } from "./md";
import { CodeBlock } from "./highlight";

const TocLink: Component<{ id: string; label: string }> = (props) => (
  <li>
    <a href={`#${props.id}`}>{props.label}</a>
  </li>
);

const DocPage: Component<{ demo: DemoEntry; prev?: DemoEntry; next?: DemoEntry }> = (props) => {
  const doc = () => docs[props.demo.slug]!;
  const [tab, setTab] = createSignal<"preview" | "code">("preview");

  return (
    <div class="doc-layout">
      <article class="doc-article">
        <nav class="crumbs" aria-label="Breadcrumb">
          <a href="#/">Primitives</a>
          <span aria-hidden="true"> / </span>
          <span>{props.demo.title}</span>
        </nav>
        <h1 class="doc-title">{props.demo.title}</h1>
        <p class="doc-lede">{doc().metaDescription || doc().description}</p>
        <div class="doc-meta">
          <code class="pkg-chip">@solidix/{props.demo.slug}</code>
          <Show when={doc().ariaLink !== ""}>
            <a class="aria-link" href={doc().ariaLink} target="_blank" rel="noreferrer">
              WAI-ARIA pattern
            </a>
          </Show>
        </div>

        <Show when={doc().features.length > 0}>
          <ul class="feature-list">
            <For each={doc().features}>
              {(f) => (
                <li>
                  <span class="feature-check" aria-hidden="true">
                    ✓
                  </span>
                  <Inline text={f} />
                </li>
              )}
            </For>
          </ul>
        </Show>

        <h2 id="overview">
          Overview
          <a class="h-anchor" href="#overview" aria-hidden="true" tabindex="-1">
            #
          </a>
        </h2>
        <div class="demo-tabs" role="tablist" aria-label="Demo views">
          <button
            type="button"
            role="tab"
            aria-selected={tab() === "preview" ? "true" : "false"}
            class={tab() === "preview" ? "demo-tab active" : "demo-tab"}
            onClick={() => {
              setTab("preview");
            }}
          >
            Preview
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab() === "code" ? "true" : "false"}
            class={tab() === "code" ? "demo-tab active" : "demo-tab"}
            onClick={() => {
              setTab("code");
            }}
          >
            Code
          </button>
        </div>
        <Show
          when={tab() === "preview"}
          fallback={
            <CodeBlock code={props.demo.code} lang="tsx" title={`${props.demo.slug}.tsx`} />
          }
        >
          <div class={props.demo.stage === "tall" ? "demo-stage tall" : "demo-stage"}>
            <Dynamic component={props.demo.component} />
          </div>
        </Show>

        <h2 id="anatomy">
          Anatomy
          <a class="h-anchor" href="#anatomy" aria-hidden="true" tabindex="-1">
            #
          </a>
        </h2>
        <Show when={doc().anatomyIntro !== ""}>
          <Markdown text={doc().anatomyIntro} />
        </Show>
        <Show when={doc().anatomy.code !== ""}>
          <CodeBlock code={doc().anatomy.code} lang="jsx" />
        </Show>

        <h2 id="api">
          API Reference
          <a class="h-anchor" href="#api" aria-hidden="true" tabindex="-1">
            #
          </a>
        </h2>
        <For each={doc().parts}>
          {(part) => (
            <>
              <h3 class="part-name">{part.name}</h3>
              <Show when={part.description !== ""}>
                <Markdown text={part.description} />
              </Show>
              <Show when={part.props.length > 0}>
                <div class="table-scroll">
                  <table class="props-table">
                    <thead>
                      <tr>
                        <th>Prop</th>
                        <th>Type</th>
                        <th>Default</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={part.props}>
                        {(p) => (
                          <tr>
                            <td class="cell-prop">
                              <code>{p.name}</code>
                              <Show when={p.required === true}>
                                <span class="req-chip">Required</span>
                              </Show>
                            </td>
                            <td class="cell-type">
                              <Show when={p.type} fallback={<span class="na">—</span>}>
                                <code>{p.type}</code>
                              </Show>
                            </td>
                            <td class="cell-default">
                              <Show
                                when={p.default !== undefined}
                                fallback={<span class="na">—</span>}
                              >
                                <code>{String(p.default)}</code>
                              </Show>
                            </td>
                            <td class="cell-desc">
                              <Markdown text={p.description} />
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </Show>
              <Show when={part.dataAttributes.length > 0}>
                <h4>Data attributes</h4>
                <div class="table-scroll">
                  <table class="props-table narrow">
                    <thead>
                      <tr>
                        <th>Attribute</th>
                        <th>Values</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={part.dataAttributes}>
                        {(a) => (
                          <tr>
                            <td class="cell-prop">
                              <code>{a.attribute}</code>
                            </td>
                            <td>
                              <For each={a.values}>{(v) => <code class="val-chip">{v}</code>}</For>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </Show>
              <Show when={part.cssVariables.length > 0}>
                <h4>CSS variables</h4>
                <div class="table-scroll">
                  <table class="props-table narrow">
                    <thead>
                      <tr>
                        <th>Variable</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={part.cssVariables}>
                        {(v) => (
                          <tr>
                            <td class="cell-prop">
                              <code>{v.cssVariable}</code>
                            </td>
                            <td class="cell-desc">
                              <Markdown text={v.description} />
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </Show>
            </>
          )}
        </For>

        <Show when={doc().examples.length > 0}>
          <h2 id="examples">
            Examples
            <a class="h-anchor" href="#examples" aria-hidden="true" tabindex="-1">
              #
            </a>
          </h2>
          <For each={doc().examples}>
            {(ex) => (
              <>
                <h3>{ex.title}</h3>
                <Show when={ex.description !== ""}>
                  <Markdown text={ex.description} />
                </Show>
                <For each={ex.blocks}>
                  {(b) => <CodeBlock code={b.code} lang={b.lang} highlights={b.highlights} />}
                </For>
              </>
            )}
          </For>
        </Show>

        <Show when={doc().customApis.length > 0}>
          <h2 id="custom-apis">
            Custom APIs
            <a class="h-anchor" href="#custom-apis" aria-hidden="true" tabindex="-1">
              #
            </a>
          </h2>
          <For each={doc().customApis}>
            {(ex) => (
              <>
                <h3>{ex.title}</h3>
                <Show when={ex.description !== ""}>
                  <Markdown text={ex.description} />
                </Show>
                <For each={ex.blocks}>
                  {(b) => <CodeBlock code={b.code} lang={b.lang} highlights={b.highlights} />}
                </For>
              </>
            )}
          </For>
        </Show>

        <Show when={doc().accessibility !== "" || doc().keyboard.length > 0}>
          <h2 id="accessibility">
            Accessibility
            <a class="h-anchor" href="#accessibility" aria-hidden="true" tabindex="-1">
              #
            </a>
          </h2>
          <Show when={doc().accessibility !== ""}>
            <Markdown text={doc().accessibility} />
          </Show>
          <Show when={doc().keyboard.length > 0}>
            <h3>Keyboard interactions</h3>
            <div class="table-scroll">
              <table class="props-table narrow">
                <thead>
                  <tr>
                    <th>Keys</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={doc().keyboard}>
                    {(k) => (
                      <tr>
                        <td class="cell-keys">
                          <For each={k.keys}>{(key) => <kbd>{key}</kbd>}</For>
                        </td>
                        <td class="cell-desc">
                          <Markdown text={k.description} />
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </Show>
        </Show>

        <Show when={doc().notes.trim() !== ""}>
          <h2 id="notes">
            Notes
            <a class="h-anchor" href="#notes" aria-hidden="true" tabindex="-1">
              #
            </a>
          </h2>
          <Markdown text={doc().notes} />
        </Show>

        <nav class="prevnext" aria-label="More primitives">
          <Show when={props.prev} fallback={<span />}>
            {(prev) => (
              <a class="prevnext-link prev" href={`#/${prev().slug}`}>
                <span class="prevnext-dir">← Previous</span>
                <span class="prevnext-title">{prev().title}</span>
              </a>
            )}
          </Show>
          <Show when={props.next} fallback={<span />}>
            {(next) => (
              <a class="prevnext-link next" href={`#/${next().slug}`}>
                <span class="prevnext-dir">Next →</span>
                <span class="prevnext-title">{next().title}</span>
              </a>
            )}
          </Show>
        </nav>
      </article>

      <aside class="toc-rail" aria-label="On this page">
        <h2>On this page</h2>
        <ul>
          <TocLink id="overview" label="Overview" />
          <TocLink id="anatomy" label="Anatomy" />
          <TocLink id="api" label="API Reference" />
          <Show when={doc().examples.length > 0}>
            <TocLink id="examples" label="Examples" />
          </Show>
          <Show when={doc().customApis.length > 0}>
            <TocLink id="custom-apis" label="Custom APIs" />
          </Show>
          <Show when={doc().accessibility !== "" || doc().keyboard.length > 0}>
            <TocLink id="accessibility" label="Accessibility" />
          </Show>
          <Show when={doc().notes.trim() !== ""}>
            <TocLink id="notes" label="Notes" />
          </Show>
        </ul>
      </aside>
    </div>
  );
};

export default DocPage;
