import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { i18nUsedRule } from "./i18n-used.js";

describe("i18n-used", () => {
  it("ist erfüllt bei konfiguriertem i18n-Model und Basisdatei", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui5": { models: { i18n: { type: "sap.ui.model.resource.ResourceModel" } } } },
      files: { "webapp/i18n/i18n.properties": "appTitle=Title" },
    });

    expect(runRule(i18nUsedRule, ctx)).toEqual([]);
  });

  it("meldet fehlendes i18n-Model und fehlende Basisdatei", () => {
    const ctx = createTestContext({ manifest: { "sap.ui5": {} }, files: {} });

    expect(runRule(i18nUsedRule, ctx)).toHaveLength(2);
  });

  it("prüft bei Libraries nur die messagebundle.properties, kein i18n-Model (kein manifest.json)", () => {
    const ctx = createTestContext({
      projectType: "lib",
      ui5Yaml: { metadata: { name: "ns.lib" } },
      files: { "src/ns/lib/messagebundle.properties": "appTitle=Title" },
    });

    expect(runRule(i18nUsedRule, ctx)).toEqual([]);
  });

  it("meldet bei Libraries eine fehlende messagebundle.properties", () => {
    const ctx = createTestContext({
      projectType: "lib",
      ui5Yaml: { metadata: { name: "ns.lib" } },
      files: {},
    });

    expect(runRule(i18nUsedRule, ctx)).toHaveLength(1);
  });
});
