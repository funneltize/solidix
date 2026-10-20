#!/usr/bin/env node
// Publishes the consolidated `@solidix/solidix` JSR package.
//
// JSR has no workspace-aware publishing for this repo's layout (60+ split
// packages, `workspace:*` links, three names over JSR's 20-char limit), so
// the registry artifact is a single package assembled from every
// publishable workspace package's built output:
//
//   - each package's `dist/index.mjs` (Solid-compiled ESM) is staged as
//     `lib/<name>/index.js` with `dist/*.d.ts` alongside it,
//   - bare `@solidix/*` specifiers are rewritten to relative paths,
//   - every package is exposed as a subpath export (`./dialog`, ...), with
//     the umbrella re-export at `.`, so per-primitive installs keep working
//     as `jsr:@solidix/solidix` subpath imports.
//
// Raw `.tsx` source is deliberately NOT published: Solid needs its compiler
// (`@solidjs/vite-plugin`), and JSR's TSX transpile would emit a broken
// react-jsx transform. What ships is exactly what `pnpm build` produces.
//
// One deliberate deviation from the old per-package npm layout, forced by
// JSR having a single resolution per export:
//   - `@solidix/env-check/is-development` (dev/prod conditional exports on
//     npm) becomes one module reading `process.env.NODE_ENV` at runtime.
//     Bundlers fold that check statically, so dev warnings still shake out
//     of production builds.
//
// Known limitation: JSR exports must be JS/TS modules, so funnel's
// `tokens.css`/`blocks.css` cannot ship in the package (see the funnel
// README for the vendoring workaround). They are intentionally not staged.
//
// Usage:
//   node scripts/jsr-publish.mjs [--dry-run] [--stage-only]
//
// --dry-run runs `jsr publish --dry-run` (full JSR-side validation, no
// upload). --stage-only assembles the package into a temp dir, prints the
// path, and stops (the dir is kept for inspection).
//
// Auth: from a maintainer machine `jsr publish` opens a browser approval;
// in GitHub Actions it mints OIDC (the `@solidix/solidix` package must be
// linked to the repo in its JSR settings). Set JSR_TOKEN to publish with a
// personal access token instead (no provenance attestations). Re-running
// with an already published version is a no-op: `jsr publish` skips it.
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const DRY_RUN = process.argv.includes("--dry-run");
const STAGE_ONLY = process.argv.includes("--stage-only");

const JSR_NAME = "@solidix/solidix";
const UMBRELLA_DIR = join(root, "packages", "solid", "solidix");
const UMBRELLA_NPM_NAME = "solidix";

// Matches a module specifier position only (never doc comments or string
// content): `from "<spec>"`, `import "<spec>"`, `import("<spec>")`.
const SPECIFIER_RE = /(\bfrom\s+|\bimport\s*\(?\s*)(['"])@solidix\/([^'"]+)\2/g;
// Any remaining bare (non-relative) specifier after rewriting.
const BARE_RE = /(?:\bfrom\s+|\bimport\s*\(?\s*)(['"])([^'".][^'"]*)\1/g;

function fail(message) {
  console.error(`jsr-publish: error: ${message}`);
  process.exitCode = 1;
  process.exit(1);
}

function workspacePackages() {
  const found = [];
  for (const group of ["core", "solid"]) {
    const groupDir = join(root, "packages", group);
    if (!existsSync(groupDir)) continue;
    for (const name of readdirSync(groupDir).sort()) {
      const dir = join(groupDir, name);
      const manifestPath = join(dir, "package.json");
      if (!existsSync(manifestPath)) continue;
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      if (manifest.private) continue;
      found.push({ dir, shortName: name, manifest });
    }
  }
  return found;
}

// Runtime (not workspace) dependencies of every staged package, merged.
// JSR's npm-specifier parser rejects ranges (`>=a <b`), so versions must
// be exact pins: `dependencies` first, then the toolchain pins in
// `devDependencies`. A peer-only range with no exact pin anywhere passes
// through untouched and fails loudly in `jsr publish` if invalid.
function externalDeps(packages) {
  const exact = new Map();
  const ranges = new Map();
  const runtime = new Set();
  for (const pkg of packages) {
    for (const name of Object.keys(pkg.manifest.dependencies ?? {})) {
      if (!name.startsWith("@solidix/")) runtime.add(name);
    }
    for (const name of Object.keys(pkg.manifest.peerDependencies ?? {})) {
      if (!name.startsWith("@solidix/")) runtime.add(name);
    }
  }
  for (const pkg of packages) {
    for (const [name, version] of Object.entries(pkg.manifest.dependencies ?? {})) {
      if (name.startsWith("@solidix/")) continue;
      if (version.startsWith("workspace:")) {
        fail(
          `${pkg.manifest.name} depends on ${name}@${version}: only @solidix/* may use workspace:*`,
        );
      }
      if (exact.has(name) && exact.get(name) !== version) {
        fail(`conflicting versions for ${name}: ${exact.get(name)} vs ${version}`);
      }
      exact.set(name, version);
    }
    // Toolchain pins in devDependencies rescue peer-only ranges.
    for (const [name, version] of Object.entries(pkg.manifest.devDependencies ?? {})) {
      if (!runtime.has(name) || exact.has(name)) continue;
      if (/^[0-9]/.test(version)) exact.set(name, version);
    }
    for (const [name, version] of Object.entries(pkg.manifest.peerDependencies ?? {})) {
      if (name.startsWith("@solidix/")) continue;
      if (!exact.has(name) && !ranges.has(name)) ranges.set(name, version);
    }
  }
  return Object.fromEntries(
    [...exact.entries(), ...ranges.entries()].sort(([a], [b]) => (a < b ? -1 : 1)),
  );
}

// dist/**/*.mjs (ESM bundles) and dist/**/*.d.ts (declarations), excluding
// sourcemaps, the CJS builds, and stray "name 2.*" duplicates.
let strayCount = 0;

function distEntries(dir) {
  const out = [];
  const walk = (sub) => {
    const abs = join(dir, sub);
    if (!existsSync(abs)) return;
    for (const name of readdirSync(abs).sort()) {
      if (name.includes(" ")) {
        strayCount += 1;
        continue;
      }
      if (name.endsWith(".map")) continue;
      const rel = join(sub, name);
      if (name.endsWith(".mjs")) out.push({ kind: "js", rel });
      else if (name.endsWith(".d.ts")) out.push({ kind: "dts", rel });
      else if (!name.includes(".")) walk(rel);
    }
  };
  walk("dist");
  return out;
}

function toPosix(p) {
  return p.split(sep).join("/");
}

function main() {
  const packages = workspacePackages();
  if (packages.length === 0) fail("found no publishable packages under packages/*/*.");
  const umbrella = packages.find((p) => p.manifest.name === UMBRELLA_NPM_NAME);
  if (!umbrella) fail(`umbrella package ${UMBRELLA_NPM_NAME} not found.`);
  const version = umbrella.manifest.version;
  const deps = externalDeps(packages);

  const stage = mkdtempSync(join(tmpdir(), "solidix-jsr-"));
  const cleanup = () => rmSync(stage, { recursive: true, force: true });
  if (STAGE_ONLY) {
    console.log(`jsr-publish: staging in ${stage} (--stage-only keeps it)`);
  } else {
    process.on("exit", (code) => {
      if (code === 0) cleanup();
      else console.error(`jsr-publish: kept failed staging dir: ${stage}`);
    });
  }

  try {
    // 1. Copy dist artifacts, renaming ESM bundles .mjs -> .js so the
    // adjacent .d.ts pairs resolve under every moduleResolution.
    const stagedJs = new Set();
    for (const pkg of packages) {
      const entries = distEntries(pkg.dir).filter(
        // env-check's dev/prod variants are replaced by one generated
        // runtime module below; never stage them.
        (e) => pkg.shortName !== "env-check" || !e.rel.startsWith(join("dist", "internal")),
      );
      if (entries.length === 0 && pkg.shortName !== "env-check") {
        fail(`${pkg.manifest.name} has no built output in dist/ (run pnpm build first).`);
      }
      for (const entry of entries) {
        const stagedRel =
          entry.kind === "js"
            ? join(
                "lib",
                pkg.shortName,
                entry.rel.slice("dist".length + 1).replace(/\.mjs$/, ".js"),
              )
            : join("lib", pkg.shortName, entry.rel.slice("dist".length + 1));
        const dest = join(stage, stagedRel);
        mkdirSync(dirname(dest), { recursive: true });
        let text = readFileSync(join(pkg.dir, entry.rel), "utf8");
        // Sourcemaps are not staged; drop the dangling reference comment.
        text = text.replace(/^\/\/# sourceMappingURL=.*$/m, "");
        writeFileSync(dest, text);
        if (entry.kind === "js") stagedJs.add(toPosix(stagedRel));
      }
    }

    // 2. Generated runtime replacement for the env-check conditional
    // export: bundlers fold `process.env.NODE_ENV` statically, so dev
    // warnings still shake out of production builds.
    const envJs = join("lib", "env-check", "is-development.js");
    mkdirSync(join(stage, dirname(envJs)), { recursive: true });
    writeFileSync(
      join(stage, envJs),
      "export const IS_DEVELOPMENT =\n" +
        '  typeof process !== "undefined" &&\n' +
        "  process.env !== undefined &&\n" +
        '  process.env.NODE_ENV === "development";\n',
    );
    writeFileSync(
      join(stage, "lib", "env-check", "is-development.d.ts"),
      "export declare const IS_DEVELOPMENT: boolean;\n",
    );
    stagedJs.add(toPosix(envJs));

    // 3. Point each staged module at its declarations. JSR does not pair
    // sibling .d.ts files on its own; without this every entrypoint warns
    // `unsupported-javascript-entrypoint` and docs/npm types suffer.
    for (const rel of stagedJs) {
      const sibling = rel.replace(/\.js$/, ".d.ts");
      if (!existsSync(join(stage, sibling))) {
        fail(`no declarations for staged module ${rel} (want ${sibling}).`);
      }
      const base = sibling.slice(sibling.lastIndexOf("/") + 1);
      const abs = join(stage, rel);
      writeFileSync(abs, `/* @ts-self-types="./${base}" */\n${readFileSync(abs, "utf8")}`);
    }

    // 4. Rewrite bare @solidix/* specifiers to staged-relative paths.
    const resolveTarget = (spec) => {
      const [pkg, ...rest] = spec.split("/");
      if (pkg === "env-check" && rest.join("/") === "is-development") {
        return toPosix(envJs);
      }
      const target =
        rest.length === 0
          ? toPosix(join("lib", pkg, "index.js"))
          : toPosix(join("lib", pkg, ...rest) + ".js");
      if (!stagedJs.has(target)) fail(`no staged module for @solidix/${spec} (want ${target}).`);
      return target;
    };
    const rewriteFile = (stagedRel) => {
      const abs = join(stage, stagedRel);
      const fromDir = toPosix(dirname(stagedRel));
      const text = readFileSync(abs, "utf8").replace(SPECIFIER_RE, (match, prefix, quote, spec) => {
        const rel = toPosix(relative(fromDir, resolveTarget(spec)));
        return `${prefix}${quote}${rel.startsWith(".") ? rel : `./${rel}`}${quote}`;
      });
      writeFileSync(abs, text);
    };
    const walkStaged = (sub) => {
      for (const name of readdirSync(join(stage, sub)).sort()) {
        const rel = join(sub, name);
        if (name.endsWith(".js") || name.endsWith(".d.ts")) rewriteFile(rel);
        else if (!name.includes(".")) walkStaged(rel);
      }
    };
    walkStaged("lib");

    // 5. Fail closed: every surviving bare specifier must be an external
    // npm dep (JSR resolves those from package.json) or a node: builtin.
    const offenders = [];
    const checkFile = (abs) => {
      for (const match of readFileSync(abs, "utf8").matchAll(BARE_RE)) {
        const spec = match[2];
        const stem = spec.startsWith("@")
          ? spec.split("/").slice(0, 2).join("/")
          : spec.split("/")[0];
        if (spec.startsWith("node:") || Object.hasOwn(deps, spec) || Object.hasOwn(deps, stem)) {
          continue;
        }
        offenders.push(`${toPosix(relative(stage, abs))}: ${spec}`);
      }
    };
    const walkCheck = (sub) => {
      for (const name of readdirSync(join(stage, sub)).sort()) {
        const abs = join(stage, sub, name);
        if (name.endsWith(".js") || name.endsWith(".d.ts")) checkFile(abs);
        else if (!name.includes(".")) walkCheck(join(sub, name));
      }
    };
    walkCheck("lib");
    // "@solidix/" may still appear in comments/doc strings (e.g. funnel's
    // generated CSS header); those are inert text, not specifiers. Anything
    // in specifier position was rewritten or is reported above.
    if (offenders.length > 0) {
      fail(`unresolvable bare imports left after rewriting:\n  ${offenders.join("\n  ")}`);
    }

    // 6. Manifests: one export per staged entry, umbrella at ".".
    const exports = { ".": "./lib/solidix/index.js" };
    for (const rel of [...stagedJs].sort()) {
      const noJs = rel.slice("lib/".length, -".js".length);
      const key = `./${noJs.replace(/\/index$/, "")}`;
      if (key === "./solidix") continue; // "." covers the umbrella
      exports[key] = `./${rel}`;
    }
    writeFileSync(
      join(stage, "jsr.json"),
      JSON.stringify({ name: JSR_NAME, version, exports }, null, 2) + "\n",
    );
    writeFileSync(
      join(stage, "package.json"),
      JSON.stringify(
        {
          name: JSR_NAME,
          version,
          description: umbrella.manifest.description,
          license: "MIT",
          type: "module",
          sideEffects: false,
          dependencies: deps,
        },
        null,
        2,
      ) + "\n",
    );
    copyFileSync(join(UMBRELLA_DIR, "README.md"), join(stage, "README.md"));
    copyFileSync(join(root, "LICENSE"), join(stage, "LICENSE"));

    if (strayCount > 0) {
      console.warn(
        `jsr-publish: warning: skipped ${strayCount} stray "name N.*" dist duplicates (rebuild to clear).`,
      );
    }
    console.log(
      `jsr-publish: staged ${JSR_NAME}@${version} (${packages.length} packages, ` +
        `${Object.keys(exports).length} exports) in ${stage}`,
    );
    if (STAGE_ONLY) return;

    // 7. The JSR CLI resolves npm deps from node_modules (bring your own),
    // so install the staged manifest first. This only fetches
    // solid-js/@solidjs/web/@floating-ui/dom, which live on npm.
    execFileSync("npm", ["install", "--no-audit", "--no-fund", "--package-lock=false"], {
      cwd: stage,
      stdio: "inherit",
    });

    // 8. Hand off to the JSR CLI. Already-published versions no-op inside
    // `jsr publish`, so this is safe on every main push.
    const publishArgs = ["-y", "jsr", "publish", ...(DRY_RUN ? ["--dry-run"] : [])];
    if (process.env.JSR_TOKEN) publishArgs.push("--token", process.env.JSR_TOKEN);
    execFileSync("npx", publishArgs, {
      cwd: stage,
      stdio: "inherit",
    });
  } catch (error) {
    if (process.exitCode) throw error;
    fail(error instanceof Error ? error.message : String(error));
  }
}

main();
