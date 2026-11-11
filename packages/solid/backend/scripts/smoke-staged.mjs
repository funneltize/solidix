// Staged-package smoke test: assembles the real JSR artifact with
// --stage-only, then proves the backend subpath staged completely
// (JS entry, types, and vendored-CSS documentation hooks). Run from
// the package directory after `pnpm build`:
//   node scripts/smoke-staged.mjs
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../../../..", import.meta.url).pathname;
const out = execFileSync("node", [join(root, "scripts/jsr-publish.mjs"), "--stage-only"], {
  cwd: root,
  encoding: "utf8",
});
const match = out.match(/staging in (\S+)/);
if (!match) {
  console.error("smoke: could not find staging dir in jsr-publish output");
  process.exit(1);
}
const stage = match[1];
const failures = [];
const check = (label, ok) => {
  console.log(`${ok ? "ok" : "FAIL"} ${label}`);
  if (!ok) failures.push(label);
};
try {
  const lib = join(stage, "lib", "backend");
  check("staged lib/backend/index.js exists", existsSync(join(lib, "index.js")));
  check("staged lib/backend/index.d.ts exists", existsSync(join(lib, "index.d.ts")));
  const pkg = JSON.parse(readFileSync(join(stage, "jsr.json"), "utf8"));
  check("jsr exports map the ./backend subpath", Boolean(pkg.exports?.["./backend"]));
  const dts = readFileSync(join(lib, "index.d.ts"), "utf8");
  for (const symbol of ["BackendTheme", "AppShell", "DataTable", "CommandMenu", "SaveBar"]) {
    check(`staged types export ${symbol}`, dts.includes(symbol));
  }
  const js = readFileSync(join(lib, "index.js"), "utf8");
  check("staged JS carries the @module header", js.includes("@module"));
} finally {
  rmSync(stage, { recursive: true, force: true });
}
if (failures.length > 0) {
  console.error(`smoke: ${failures.length} failure(s)`);
  process.exit(1);
}
console.log("smoke: staged backend package is complete");
