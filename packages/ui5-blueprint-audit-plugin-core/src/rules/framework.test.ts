import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { frameworkRule } from "./framework.js";

describe("framework", () => {
  it("passes with framework.name SAPUI5", () => {
    const ctx = createTestContext({ ui5Yaml: { framework: { name: "SAPUI5" } } });

    expect(runRule(frameworkRule, ctx)).toEqual([]);
  });

  it("reports a deviating framework", () => {
    const ctx = createTestContext({ ui5Yaml: { framework: { name: "OpenUI5" } } });

    expect(runRule(frameworkRule, ctx)).toHaveLength(1);
  });

  it("reports a missing framework block", () => {
    const ctx = createTestContext({ ui5Yaml: { type: "application" } });

    expect(runRule(frameworkRule, ctx)).toHaveLength(1);
  });
});
