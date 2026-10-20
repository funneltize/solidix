import { For, Show, type Component } from "solid-js";
import type { GuideEntry } from "./guides";
import { Markdown, guideHeadings } from "./md";

const GuidePage: Component<{ guide: GuideEntry; prev?: GuideEntry; next?: GuideEntry }> = (
  props,
) => {
  const headings = () => guideHeadings(props.guide.markdown);
  // The registry carries title and description; the markdown h1 is for GitHub readers.
  const body = () => props.guide.markdown.replace(/^# [^\n]*\n/, "");

  return (
    <div class="doc-layout">
      <article class="doc-article">
        <nav class="crumbs" aria-label="Breadcrumb">
          <a href="#/">Guides</a>
          <span aria-hidden="true"> / </span>
          <span>{props.guide.title}</span>
        </nav>
        <h1 class="doc-title">{props.guide.title}</h1>
        <p class="doc-lede">{props.guide.description}</p>
        <Markdown text={body()} />

        <nav class="prevnext" aria-label="More guides">
          <Show when={props.prev} fallback={<span />}>
            {(prev) => (
              <a class="prevnext-link prev" href={`#/guides/${prev().slug}`}>
                <span class="prevnext-dir">← Previous</span>
                <span class="prevnext-title">{prev().title}</span>
              </a>
            )}
          </Show>
          <Show when={props.next} fallback={<span />}>
            {(next) => (
              <a class="prevnext-link next" href={`#/guides/${next().slug}`}>
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
          <For each={headings()}>
            {(heading) => (
              <li>
                <a href={`#${heading.id}`}>{heading.label}</a>
              </li>
            )}
          </For>
        </ul>
      </aside>
    </div>
  );
};

export default GuidePage;
