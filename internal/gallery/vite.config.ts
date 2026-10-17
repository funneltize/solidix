import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "vite";
import solid from "@solidjs/vite-plugin";

// Workspace-linked @soldix/* packages resolve to raw TS source
// (`main: ./src/index.ts`), so keep them out of esbuild pre-bundling —
// only the Solid transform understands the JSX.
function soldixDepNames(): string[] {
  const names = new Set<string>(["soldix"]);
  for (const area of ["core", "solid"]) {
    const dir = join(import.meta.dirname, "..", "..", "packages", area);
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      try {
        const manifest = JSON.parse(
          readFileSync(join(dir, entry.name, "package.json"), "utf8"),
        ) as { name?: unknown };
        if (typeof manifest.name === "string") names.add(manifest.name);
      } catch {
        // Not a package dir — ignore.
      }
    }
  }
  return [...names].sort();
}

export default defineConfig({
  plugins: [solid()],
  server: {
    // Linked workspace sources live outside the app root.
    fs: { allow: [join(import.meta.dirname, "..", "..")] },
  },
  optimizeDeps: { exclude: soldixDepNames() },
});
