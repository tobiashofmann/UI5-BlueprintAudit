import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { ui5VersionRule } from "./ui5-version.js";

describe("ui5-version", () => {
  it("ist erfüllt bei konsistenten, ausreichenden Versionen", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui5": { dependencies: { minUI5Version: "1.152.1" } } },
      ui5Yaml: { framework: { version: "1.152.1" } },
    });

    expect(runRule(ui5VersionRule, ctx)).toEqual([]);
  });

  it("meldet eine zu niedrige Version", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui5": { dependencies: { minUI5Version: "1.120.0" } } },
      ui5Yaml: { framework: { version: "1.120.0" } },
    });

    expect(runRule(ui5VersionRule, ctx)).toHaveLength(2);
  });

  it("meldet eine fehlende framework.version", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui5": { dependencies: { minUI5Version: "1.152.1" } } },
      ui5Yaml: { type: "application" },
    });

    expect(runRule(ui5VersionRule, ctx)).toHaveLength(1);
  });

  it("meldet eine Inkonsistenz zwischen Manifest und ui5.yaml", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui5": { dependencies: { minUI5Version: "1.152.1" } } },
      ui5Yaml: { framework: { version: "1.160.0" } },
    });

    expect(runRule(ui5VersionRule, ctx)).toHaveLength(1);
  });

  it("prüft bei Libraries nur framework.version, kein Konsistenz-Abgleich (kein manifest.json)", () => {
    const ctx = createTestContext({
      projectType: "lib",
      ui5Yaml: { framework: { version: "1.152.1" } },
    });

    expect(runRule(ui5VersionRule, ctx)).toEqual([]);
  });

  it("meldet bei Libraries eine zu niedrige framework.version", () => {
    const ctx = createTestContext({
      projectType: "lib",
      ui5Yaml: { framework: { version: "1.120.0" } },
    });

    expect(runRule(ui5VersionRule, ctx)).toHaveLength(1);
  });
});
