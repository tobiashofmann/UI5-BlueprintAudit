import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { wdi5TestsRule } from "./wdi5-tests.js";

describe("wdi5-tests", () => {
  it("passes with config file and dependency", () => {
    const ctx = createTestContext({
      files: { "wdio.conf.ts": "" },
      packageJson: { devDependencies: { "wdio-ui5-service": "^1.0.0" } },
    });

    expect(runRule(wdi5TestsRule, ctx)).toEqual([]);
  });

  it("reports a missing config and a missing dependency", () => {
    const ctx = createTestContext({ files: {}, packageJson: {} });

    expect(runRule(wdi5TestsRule, ctx)).toHaveLength(2);
  });
});
