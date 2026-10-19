import { For, createSignal, onCleanup } from "solid-js";
import type { JSX } from "@solidjs/web";

type Tok = { text: string; cls: string };

const KEYWORDS = new Set(
  "import,from,export,default,const,let,var,function,return,if,else,for,of,in,new,typeof,true,false,null,undefined,type,interface,extends,as,this,try,catch,throw,switch,case,break,continue,while,do,await,async".split(
    ",",
  ),
);

type TsxState = { blockComment: boolean };
type CssState = { blockComment: boolean; depth: number };

const MULTI_PUNCT = [
  "===",
  "!==",
  "=>",
  "?.",
  "??",
  "&&",
  "||",
  "<=",
  ">=",
  "==",
  "!=",
  "...",
  "++",
  "--",
];

function readString(line: string, i: number): number {
  const quote = line[i]!;
  let j = i + 1;
  while (j < line.length) {
    if (line[j] === "\\") j += 2;
    else if (line[j] === quote) return j + 1;
    else j++;
  }
  return j;
}

function tokenizeTsxLine(line: string, state: TsxState): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  const push = (text: string, cls: string) => {
    const prev = toks[toks.length - 1];
    if (prev && prev.cls === cls) prev.text += text;
    else toks.push({ text, cls });
  };
  if (state.blockComment) {
    const end = line.indexOf("*/");
    if (end < 0) {
      push(line, "tok-com");
      return toks;
    }
    push(line.slice(0, end + 2), "tok-com");
    i = end + 2;
    state.blockComment = false;
  }
  let prevSig = "";
  let adjacent = false;
  while (i < line.length) {
    const rest = line.slice(i);
    const ws = /^[\s]+/.exec(rest);
    if (ws) {
      push(ws[0], "");
      i += ws[0].length;
      adjacent = false;
      continue;
    }
    if (rest.startsWith("//")) {
      push(rest, "tok-com");
      break;
    }
    if (rest.startsWith("/*")) {
      const end = rest.indexOf("*/", 2);
      if (end < 0) {
        push(rest, "tok-com");
        state.blockComment = true;
        break;
      }
      push(rest.slice(0, end + 2), "tok-com");
      i += end + 2;
      adjacent = false;
      continue;
    }
    const ch = rest[0]!;
    if (ch === '"' || ch === "'" || ch === "`") {
      const end = readString(line, i);
      push(line.slice(i, end), "tok-str");
      i = end;
      prevSig = "str";
      adjacent = true;
      continue;
    }
    const num = /^\b\d[\w.]*/.exec(rest);
    if (num && /[\d]/.test(num[0][0]!)) {
      push(num[0], "tok-num");
      i += num[0].length;
      prevSig = "w";
      adjacent = true;
      continue;
    }
    const word = /^[A-Za-z_$][\w$]*/.exec(rest);
    if (word) {
      const w = word[0];
      let after = i + w.length;
      while (line[after] === " " || line[after] === "\t") after++;
      let cls = "";
      if (KEYWORDS.has(w)) cls = "tok-kw";
      else if (line[after] === "(") cls = "tok-fn";
      else if (prevSig === "<" && adjacent) cls = /^[A-Z]/.test(w) ? "tok-comp" : "tok-tag";
      else if (line[after] === "=" && line[after + 1] !== "=" && line[after + 1] !== ">")
        cls = "tok-attr";
      else if (/^[A-Z]/.test(w)) cls = "tok-comp";
      push(w, cls);
      i += w.length;
      prevSig = "w";
      adjacent = true;
      continue;
    }
    const multi = MULTI_PUNCT.find((p) => rest.startsWith(p));
    if (multi) {
      push(multi, "tok-punct");
      i += multi.length;
      prevSig = multi;
      adjacent = true;
      continue;
    }
    push(ch, "tok-punct");
    i++;
    prevSig = ch;
    adjacent = true;
  }
  return toks;
}

function tokenizeCssLine(line: string, state: CssState): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  const push = (text: string, cls: string) => {
    const prev = toks[toks.length - 1];
    if (prev && prev.cls === cls) prev.text += text;
    else toks.push({ text, cls });
  };
  if (state.blockComment) {
    const end = line.indexOf("*/");
    if (end < 0) {
      push(line, "tok-com");
      return toks;
    }
    push(line.slice(0, end + 2), "tok-com");
    i = end + 2;
    state.blockComment = false;
  }
  while (i < line.length) {
    const rest = line.slice(i);
    const ws = /^[\s]+/.exec(rest);
    if (ws) {
      push(ws[0], "");
      i += ws[0].length;
      continue;
    }
    if (rest.startsWith("/*")) {
      const end = rest.indexOf("*/", 2);
      if (end < 0) {
        push(rest, "tok-com");
        state.blockComment = true;
        break;
      }
      push(rest.slice(0, end + 2), "tok-com");
      i += end + 2;
      continue;
    }
    const ch = rest[0]!;
    if (ch === '"' || ch === "'") {
      const end = readString(line, i);
      push(line.slice(i, end), "tok-str");
      i = end;
      continue;
    }
    const at = /^@[\w-]+/.exec(rest);
    if (at) {
      push(at[0], "tok-kw");
      i += at[0].length;
      continue;
    }
    if (ch === "{") {
      state.depth++;
      push(ch, "tok-punct");
      i++;
      continue;
    }
    if (ch === "}") {
      state.depth = Math.max(0, state.depth - 1);
      push(ch, "tok-punct");
      i++;
      continue;
    }
    const word = /^(--[\w-]+|#(?:[\da-fA-F]{3,8})\b|[\w-]+)/.exec(rest);
    if (word) {
      const w = word[0];
      let after = i + w.length;
      while (line[after] === " " || line[after] === "\t") after++;
      let cls = "";
      if (w.startsWith("--")) cls = "tok-var";
      else if (w.startsWith("#")) cls = "tok-num";
      else if (state.depth > 0 && line[after] === ":") cls = "tok-prop";
      else if (line[after] === "(") cls = "tok-fn";
      else if (state.depth === 0) cls = "tok-sel";
      push(w, cls);
      i += w.length;
      continue;
    }
    const num = /^\b\d[\w.%]*/.exec(rest);
    if (num && /[\d]/.test(num[0][0]!)) {
      push(num[0], "tok-num");
      i += num[0].length;
      continue;
    }
    push(ch, "tok-punct");
    i++;
  }
  return toks;
}

export function CodeBlock(props: {
  code: string;
  lang: string;
  highlights?: number[] | undefined;
  title?: string | undefined;
}) {
  const [copied, setCopied] = createSignal(false);
  let timer = 0;
  onCleanup(() => window.clearTimeout(timer));
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(props.code);
      setCopied(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable - leave the button idle.
    }
  };
  const lines = (): Tok[][] => {
    const lang = props.lang === "css" ? "css" : "tsx";
    const raw = props.code.split("\n");
    if (lang === "css") {
      const state: CssState = { blockComment: false, depth: 0 };
      return raw.map((line) => tokenizeCssLine(line, state));
    }
    const state: TsxState = { blockComment: false };
    return raw.map((line) => tokenizeTsxLine(line, state));
  };
  const highlighted = (index: number) => (props.highlights ?? []).includes(index + 1);
  return (
    <div class="codeblock">
      <div class="codeblock-bar">
        <span class="codeblock-lang">{props.title ?? props.lang}</span>
        <button type="button" class="codeblock-copy" onClick={copy}>
          {copied() ? "Copied" : "Copy"}
        </button>
      </div>
      <pre class="codeblock-pre">
        <code>
          <For each={lines()}>
            {(toks, index) => (
              <span class={highlighted(index()) ? "code-line code-line-hl" : "code-line"}>
                <For each={toks}>
                  {(tok) => (tok.cls === "" ? tok.text : <span class={tok.cls}>{tok.text}</span>)}
                </For>
                {"\n"}
              </span>
            )}
          </For>
        </code>
      </pre>
    </div>
  );
}

export function InlineCode({ children }: { children: JSX.Element }) {
  return <code class="inline-code">{children}</code>;
}
