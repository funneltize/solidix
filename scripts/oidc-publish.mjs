#!/usr/bin/env node
// OIDC trusted publishing for @solidix/*.
//
// Runs in the release workflow via `pnpm release` (the changesets/action
// `publish:` input) after the Version Packages PR merges. For each workspace
// package whose local version is missing from the registry, it packs with
// pnpm (which resolves `workspace:` deps and applies publishConfig) and
// publishes the tarball with the npm CLI, which performs the OIDC
// trusted-publishing handshake and attaches provenance. No npm token is
// used or needed.
//
// Why not `changeset publish`: changesets shells out to `pnpm publish`,
// and pnpm 11.5.0 has no OIDC support, so the exchange never happens.
//
// Requirements:
// - GitHub Actions with `id-token: write` (npm mints OIDC per run).
// - npm >= 11.5.1 (trusted publishing + provenance support).
// - Every package already exists on the registry with this repo's workflow
//   registered as a trusted publisher (npm cannot create packages via
//   OIDC). First versions are published interactively, once, from a
//   maintainer machine; see the release workflow comments.
//
// Usage: node scripts/oidc-publish.mjs [--dry-run]
// --dry-run lists what would publish without packing or publishing. It is
// the only mode that runs outside CI.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DRY_RUN = process.argv.includes("--dry-run");
const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const MIN_NPM = [11, 5, 1];

function run(cmd, args, cwd) {
  return execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function shortError(error) {
  const lines = String((error && (error.stderr || error.message)) || error)
    .trim()
    .split("\n");
  // npm prints the actionable lines last; prefer those over the
  // tarball-contents preamble at the top.
  const npmErrors = lines.filter((line) => line.includes("npm error"));
  const picked = npmErrors.length > 0 ? npmErrors : lines.slice(-3);
  return picked.slice(0, 3).join(" | ");
}

// Fail closed: publish a version only when the registry proves it is
// missing. Any other registry error aborts that package, never publishes.
function versionOnRegistry(name, version) {
  try {
    return JSON.parse(run("npm", ["view", `${name}@${version}`, "version", "--json"], root)) ===
      version
      ? "present"
      : "error";
  } catch (error) {
    return String((error && error.stderr) || error).includes("E404") ? "missing" : "error";
  }
}

function npmVersionOk() {
  const parts = run("npm", ["--version"], root).trim().split(".").map(Number);
  for (let i = 0; i < MIN_NPM.length; i += 1) {
    if ((parts[i] || 0) > MIN_NPM[i]) return true;
    if ((parts[i] || 0) < MIN_NPM[i]) return false;
  }
  return true;
}

function workspacePackages() {
  const found = [];
  for (const group of ["core", "solid"]) {
    const groupDir = join(root, "packages", group);
    if (!existsSync(groupDir)) continue;
    for (const name of readdirSync(groupDir).sort()) {
      const manifestPath = join(groupDir, name, "package.json");
      if (!existsSync(manifestPath)) continue;
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      if (manifest.private) continue;
      found.push({ dir: join(groupDir, name), name: manifest.name, version: manifest.version });
    }
  }
  return found;
}

function packTarball(pkg, destDir) {
  const out = run("pnpm", ["pack", "--pack-destination", destDir], pkg.dir);
  const line = out.split("\n").find((l) => l.trim().endsWith(".tgz"));
  if (!line) throw new Error(`could not find tarball in pnpm pack output:\n${out}`);
  return line.trim();
}

function main() {
  if (!DRY_RUN) {
    if (!process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN || !process.env.ACTIONS_ID_TOKEN_REQUEST_URL) {
      console.error(
        "oidc-publish: error: requires GitHub Actions OIDC (id-token: write); refusing to run elsewhere. Pass --dry-run to list pending publishes.",
      );
      process.exitCode = 1;
      return;
    }
    if (process.env.NPM_TOKEN || process.env.NODE_AUTH_TOKEN) {
      console.error(
        "oidc-publish: error: refusing to run with NPM_TOKEN/NODE_AUTH_TOKEN set: a configured token disables the OIDC exchange. Remove the token env vars.",
      );
      process.exitCode = 1;
      return;
    }
    if (!npmVersionOk()) {
      console.error(
        `oidc-publish: error: requires npm >= ${MIN_NPM.join(".")} for trusted publishing.`,
      );
      process.exitCode = 1;
      return;
    }
  }
  const packages = workspacePackages();
  if (packages.length === 0) {
    console.error("oidc-publish: error: found no publishable packages under packages/*/*.");
    process.exitCode = 1;
    return;
  }
  const tmp = mkdtempSync(join(tmpdir(), "solidix-publish-"));
  const published = [];
  const skipped = [];
  const failed = [];
  try {
    for (const pkg of packages) {
      const id = `${pkg.name}@${pkg.version}`;
      const state = versionOnRegistry(pkg.name, pkg.version);
      if (state === "present") {
        skipped.push(id);
        continue;
      }
      if (state === "error") {
        failed.push(`${id} (could not query registry, refusing to guess)`);
        continue;
      }
      if (DRY_RUN) {
        published.push(`${id} (dry run)`);
        continue;
      }
      try {
        const tarball = packTarball(pkg, tmp);
        run("npm", ["publish", tarball, "--provenance", "--access", "public"], root);
        published.push(id);
        console.log(`oidc-publish: published ${id}`);
      } catch (error) {
        failed.push(`${id} (${shortError(error)})`);
      }
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  console.log(
    `oidc-publish: ${published.length} published, ${skipped.length} already present, ${failed.length} failed.`,
  );
  for (const id of published) {
    if (id.endsWith("(dry run)")) console.log(`oidc-publish: would publish ${id.slice(0, -10)}`);
  }
  for (const f of failed) console.error(`oidc-publish: FAILED ${f}`);
  if (failed.length > 0) process.exitCode = 1;
}

main();
