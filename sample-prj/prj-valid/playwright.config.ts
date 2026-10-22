import { defineConfig } from "@playwright/test";

// Minimale Playwright-Konfiguration für die ui5-blueprint-audit-Regel "playwright-tests".
export default defineConfig({
  testDir: "./webapp/test/e2e-playwright",
  use: {
    baseURL: "http://localhost:8080",
  },
});
