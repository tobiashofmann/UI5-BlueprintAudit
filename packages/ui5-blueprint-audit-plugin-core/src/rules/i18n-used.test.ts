import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { i18nUsedRule } from "./i18n-used.js";

describe("i18n-used", () => {
  it("passes with a configured i18n model and base file", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui5": { models: { i18n: { type: "sap.ui.model.resource.ResourceModel" } } } },
      files: { "webapp/i18n/i18n.properties": "appTitle=Title" },
    });

    expect(runRule(i18nUsedRule, ctx)).toEqual([]);
  });

  it("reports a missing i18n model and a missing base file", () => {
    const ctx = createTestContext({ manifest: { "sap.ui5": {} }, files: {} });

    expect(runRule(i18nUsedRule, ctx)).toHaveLength(2);
  });

  it("checks only messagebundle.properties for libraries, no i18n model (no manifest.json)", () => {
    const ctx = createTestContext({
      projectType: "lib",
      ui5Yaml: { metadata: { name: "ns.lib" } },
      files: { "src/ns/lib/messagebundle.properties": "appTitle=Title" },
    });

    expect(runRule(i18nUsedRule, ctx)).toEqual([]);
  });

  it("reports a missing messagebundle.properties for libraries", () => {
    const ctx = createTestContext({
      projectType: "lib",
      ui5Yaml: { metadata: { name: "ns.lib" } },
      files: {},
    });

    expect(runRule(i18nUsedRule, ctx)).toHaveLength(1);
  });
});
