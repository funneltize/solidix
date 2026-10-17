import { defineConfig } from "vitest/config";
import solid from "@solidjs/vite-plugin";

export default defineConfig({
  plugins: [solid()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["internal/*/test/**/*.test.{ts,tsx}", "packages/*/*/test/**/*.test.{ts,tsx}"],
  },
  resolve: {
    conditions: ["development", "browser"],
  },
});
