import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { frameworkRule } from "./framework.js";

describe("framework", () => {
  it("ist erfüllt bei framework.name SAPUI5", () => {
    const ctx = createTestContext({ ui5Yaml: { framework: { name: "SAPUI5" } } });

    expect(runRule(frameworkRule, ctx)).toEqual([]);
  });

  it("meldet ein abweichendes Framework", () => {
    const ctx = createTestContext({ ui5Yaml: { framework: { name: "OpenUI5" } } });

    expect(runRule(frameworkRule, ctx)).toHaveLength(1);
  });

  it("meldet einen fehlenden framework-Block", () => {
    const ctx = createTestContext({ ui5Yaml: { type: "application" } });

    expect(runRule(frameworkRule, ctx)).toHaveLength(1);
  });
});
