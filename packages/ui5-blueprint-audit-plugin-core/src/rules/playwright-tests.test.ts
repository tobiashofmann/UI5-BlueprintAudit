import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { playwrightTestsRule } from "./playwright-tests.js";

describe("playwright-tests", () => {
  it("ist erfüllt bei Config-Datei und Dependency", () => {
    const ctx = createTestContext({
      files: { "playwright.config.ts": "" },
      packageJson: { devDependencies: { "@playwright/test": "^1.0.0" } },
    });

    expect(runRule(playwrightTestsRule, ctx)).toEqual([]);
  });

  it("meldet fehlende Config und fehlende Dependency", () => {
    const ctx = createTestContext({ files: {}, packageJson: {} });

    expect(runRule(playwrightTestsRule, ctx)).toHaveLength(2);
  });
});
