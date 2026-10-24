import { createRequire } from "node:module";
import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "./vitest.config.ts";

const require = createRequire(import.meta.url);

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      setupFiles: [require.resolve("allure-vitest/setup")],
      reporters: [
        "default",
        ["allure-vitest/reporter", { resultsDir: "allure-results" }],
      ],
    },
  }),
);
