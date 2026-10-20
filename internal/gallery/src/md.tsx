import { For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { CodeBlock } from "./highlight";

const INLINE =
  /(`[^`\n]+`|\*\*[^*\n]+\*\*|\[[^\]\n]+\]\((?:https?:[^)\s]+|#\/[^)\s]+|\.{0,2}\/[^)\s]+\.md)\)|<kbd>[^<]+<\/kbd>)/g;

function resolveHref(raw: string): { href: string; external: boolean } {
  const guide = /^(?:\.\/)?([a-z0-9-]+)\.md$/.exec(raw);
  if (guide) return { href: `#/guides/${guide[1]}`, external: false };
  if (raw.startsWith("#/")) return { href: raw, external: false };
  return { href: raw, external: true };
}

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
      const resolved = resolveHref(mm[2]!);
      if (resolved.external) {
        out.push(
          <a href={resolved.href} target="_blank" rel="noreferrer">
            {mm[1]}
          </a>,
        );
      } else {
        out.push(<a href={resolved.href}>{mm[1]}</a>);
      }
    } else out.push(<kbd>{tok.slice(5, -6)}</kbd>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Inline(props: { text: string }) {
  return <>{renderInline(props.text)}</>;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** `## ` headings outside fenced code, for the guide table of contents. */
export function guideHeadings(markdown: string): { id: string; label: string }[] {
  const noFences = markdown.replace(/```[\s\S]*?```/g, "");
  return noFences
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => {
      const label = line.slice(3).trim();
      return { id: slugifyHeading(label), label };
    });
}

function rowCells(row: string): string[] {
  return row
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isSeparatorRow(row: string): boolean {
  const cells = rowCells(row);
  return cells.length > 0 && cells.every((cell) => /^:?-+:?$/.test(cell));
}

function TableBlock({ lines }: { lines: string[] }) {
  const head = rowCells(lines[0]!);
  const rows = lines.slice(2).map(rowCells);
  return (
    <div class="table-scroll">
      <table class="props-table">
        <thead>
          <tr>
            <For each={head}>{(cell) => <th>{renderInline(cell)}</th>}</For>
          </tr>
        </thead>
        <tbody>
          <For each={rows}>
            {(row) => (
              <tr>
                <For each={row}>{(cell) => <td>{renderInline(cell)}</td>}</For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}

function Block({ text }: { text: string }) {
  const lines = text.split("\n");
  if (
    lines.length >= 3 &&
    lines.every((line) => line.trimStart().startsWith("|")) &&
    isSeparatorRow(lines[1]!)
  ) {
    return <TableBlock lines={lines} />;
  }
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
  if (text.startsWith("## ")) {
    const label = text.slice(3);
    return <h2 id={slugifyHeading(label)}>{renderInline(label)}</h2>;
  }
  if (text.startsWith("### ")) {
    const label = text.slice(4);
    return <h3 id={slugifyHeading(label)}>{renderInline(label)}</h3>;
  }
  if (text.startsWith("#### ")) return <h4>{renderInline(text.slice(5))}</h4>;
  return <p>{renderInline(text)}</p>;
}

type MdPart = { kind: "md"; text: string } | { kind: "code"; lang: string; code: string };

function splitFences(text: string): MdPart[] {
  const parts: MdPart[] = [];
  const rx = /```([a-zA-Z0-9+-]*)\n([\s\S]*?)```/g;
  let last = 0;
  for (let m = rx.exec(text); m; m = rx.exec(text)) {
    if (m.index > last) parts.push({ kind: "md", text: text.slice(last, m.index) });
    parts.push({
      kind: "code",
      lang: m[1] === "" ? "text" : m[1]!,
      code: m[2]!.replace(/\n$/, ""),
    });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ kind: "md", text: text.slice(last) });
  return parts;
}

function MdBlocks({ text }: { text: string }) {
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

export function Markdown(props: { text: string }) {
  // Read through the getter on every pass so doc-to-doc and guide-to-guide
  // navigation re-renders without a remount (props destructure would freeze).
  const parts = () => splitFences(props.text);
  return (
    <For each={parts()}>
      {(part) =>
        part.kind === "code" ? (
          <CodeBlock code={part.code} lang={part.lang} />
        ) : (
          <MdBlocks text={part.text} />
        )
      }
    </For>
  );
}
