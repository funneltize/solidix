import { For } from "solid-js";
import type { JSX } from "@solidjs/web";

const INLINE = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\[[^\]\n]+\]\(https?:[^)\s]+\)|<kbd>[^<]+<\/kbd>)/g;

function renderInline(text: string): (string | JSX.Element)[] {
  const out: (string | JSX.Element)[] = [];
  let last = 0;
  INLINE.lastIndex = 0;
  for (let m = INLINE.exec(text); m; m = INLINE.exec(text)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("`")) out.push(<code>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("**")) out.push(<strong>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("[")) {
      const mm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok)!;
      out.push(
        <a href={mm[2]} target="_blank" rel="noreferrer">
          {mm[1]}
        </a>,
      );
    } else out.push(<kbd>{tok.slice(5, -6)}</kbd>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Inline({ text }: { text: string }) {
  return <>{renderInline(text)}</>;
}

function Block({ text }: { text: string }) {
  const lines = text.split("\n");
  if (lines.length > 0 && lines.every((l) => l.startsWith("- "))) {
    return (
      <ul>
        <For each={lines}>{(l) => <li>{renderInline(l.slice(2))}</li>}</For>
      </ul>
    );
  }
  if (lines.length > 0 && lines.every((l) => /^\d+\. /.test(l))) {
    return (
      <ol>
        <For each={lines}>{(l) => <li>{renderInline(l.replace(/^\d+\. /, ""))}</li>}</For>
      </ol>
    );
  }
  if (text.startsWith("#### ")) return <h4>{renderInline(text.slice(5))}</h4>;
  if (text.startsWith("### ")) return <h3>{renderInline(text.slice(4))}</h3>;
  return <p>{renderInline(text)}</p>;
}

export function Markdown({ text }: { text: string }) {
  const blocks = text
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter((b) => b !== "");
  return (
    <For each={blocks}>
      {(b) => (
        <>
          <Block text={b} />
        </>
      )}
    </For>
  );
}
