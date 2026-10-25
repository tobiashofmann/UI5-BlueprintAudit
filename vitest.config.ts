import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "**/sample-prj/**", "**/.stryker-tmp/**"],
    coverage: {
      provider: "v8",
      include: ["packages/*/src/**"],
      exclude: ["**/*.test.ts", "**/dist/**"],
      reporter: ["text", "html", "json-summary", "json"],
    },
  },
});
