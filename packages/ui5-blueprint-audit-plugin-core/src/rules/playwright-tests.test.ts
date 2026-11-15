import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { playwrightTestsRule } from "./playwright-tests.js";

describe("playwright-tests", () => {
  it("passes with config file and dependency", () => {
    const ctx = createTestContext({
      files: { "playwright.config.ts": "" },
      packageJson: { devDependencies: { "@playwright/test": "^1.0.0" } },
    });

    expect(runRule(playwrightTestsRule, ctx)).toEqual([]);
  });

  it("reports a missing config and a missing dependency", () => {
    const ctx = createTestContext({ files: {}, packageJson: {} });

    expect(runRule(playwrightTestsRule, ctx)).toHaveLength(2);
  });
});
