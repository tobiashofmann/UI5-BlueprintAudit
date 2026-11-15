import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { ui5VersionRule } from "./ui5-version.js";

describe("ui5-version", () => {
  it("passes with consistent, sufficient versions", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui5": { dependencies: { minUI5Version: "1.152.1" } } },
      ui5Yaml: { framework: { version: "1.152.1" } },
    });

    expect(runRule(ui5VersionRule, ctx)).toEqual([]);
  });

  it("reports a version that is too low", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui5": { dependencies: { minUI5Version: "1.120.0" } } },
      ui5Yaml: { framework: { version: "1.120.0" } },
    });

    expect(runRule(ui5VersionRule, ctx)).toHaveLength(2);
  });

  it("reports a missing framework.version", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui5": { dependencies: { minUI5Version: "1.152.1" } } },
      ui5Yaml: { type: "application" },
    });

    expect(runRule(ui5VersionRule, ctx)).toHaveLength(1);
  });

  it("reports an inconsistency between manifest and ui5.yaml", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui5": { dependencies: { minUI5Version: "1.152.1" } } },
      ui5Yaml: { framework: { version: "1.160.0" } },
    });

    expect(runRule(ui5VersionRule, ctx)).toHaveLength(1);
  });

  it("checks only framework.version for libraries, no consistency check (no manifest.json)", () => {
    const ctx = createTestContext({
      projectType: "lib",
      ui5Yaml: { framework: { version: "1.152.1" } },
    });

    expect(runRule(ui5VersionRule, ctx)).toEqual([]);
  });

  it("reports a framework.version that is too low for libraries", () => {
    const ctx = createTestContext({
      projectType: "lib",
      ui5Yaml: { framework: { version: "1.120.0" } },
    });

    expect(runRule(ui5VersionRule, ctx)).toHaveLength(1);
  });
  it("accepts a version that equals max semantically, even if written differently", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui5": { dependencies: { minUI5Version: "1.152.0" } } },
      ui5Yaml: { framework: { version: "1.152.0" } },
    });

    expect(runRule(ui5VersionRule, ctx, { max: "1.152" })).toEqual([]);
  });

  it("reports a version above max", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui5": { dependencies: { minUI5Version: "1.153.0" } } },
      ui5Yaml: { framework: { version: "1.153.0" } },
    });

    expect(runRule(ui5VersionRule, ctx, { max: "1.152" })).toHaveLength(2);
  });
});
