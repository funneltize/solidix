#!/usr/bin/env node
// Shared library build for solidix packages (mirrors Radix's `radix-build`).
// Run from a package directory.
//
//   solidix-build [entry] [outBase] [--no-empty]
//
// Defaults: entry `src/index.ts`, outBase `index` (→ dist/index.mjs + dist/index.js).
// Declarations are emitted separately via `tsc -p tsconfig.build.json`.
import { build } from "vite";
import solidPlugin from "@solidjs/vite-plugin";

const [, , entry = "src/index.ts", outBase = "index", ...rest] = process.argv;
const emptyOutDir = !rest.includes("--no-empty");

await build({
  root: process.cwd(),
  logLevel: "warn",
  plugins: [solidPlugin()],
  build: {
    outDir: "dist",
    emptyOutDir,
    sourcemap: true,
    minify: false,
    target: "es2022",
    lib: {
      entry,
      formats: ["es", "cjs"],
      fileName: (format) => `${outBase}.${format === "es" ? "mjs" : "js"}`,
    },
    rollupOptions: {
      external: [/^solid-js$/, /^@solidjs\//, /^@solidix\//, /^@repo\//],
    },
  },
});
