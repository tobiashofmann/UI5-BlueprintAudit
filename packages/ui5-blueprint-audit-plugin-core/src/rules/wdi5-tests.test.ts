import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { wdi5TestsRule } from "./wdi5-tests.js";

describe("wdi5-tests", () => {
  it("ist erfüllt bei Config-Datei und Dependency", () => {
    const ctx = createTestContext({
      files: { "wdio.conf.ts": "" },
      packageJson: { devDependencies: { "wdio-ui5-service": "^1.0.0" } },
    });

    expect(runRule(wdi5TestsRule, ctx)).toEqual([]);
  });

  it("meldet fehlende Config und fehlende Dependency", () => {
    const ctx = createTestContext({ files: {}, packageJson: {} });

    expect(runRule(wdi5TestsRule, ctx)).toHaveLength(2);
  });
});
