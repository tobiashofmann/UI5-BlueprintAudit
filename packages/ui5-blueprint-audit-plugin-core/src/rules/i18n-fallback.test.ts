import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { i18nFallbackRule } from "./i18n-fallback.js";

const VALID_I18N = { fallbackLocale: "en", supportedLocales: ["de", "en"] };

describe("i18n-fallback", () => {
  it("passes if fallbackLocale is set in sap.app/i18n and sap.ui5/models/i18n and is listed in supportedLocales", () => {
    const ctx = createTestContext({
      manifest: {
        "sap.app": { i18n: VALID_I18N },
        "sap.ui5": { models: { i18n: { settings: VALID_I18N } } },
      },
    });

    expect(runRule(i18nFallbackRule, ctx)).toEqual([]);
  });

  it("reports a missing fallbackLocale in the sap.ui5 model", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { i18n: VALID_I18N }, "sap.ui5": { models: { i18n: { settings: {} } } } },
    });

    const findings = runRule(i18nFallbackRule, ctx);
    expect(findings).toHaveLength(1);
    expect(findings[0]?.message).toContain("sap.ui5/models/i18n");
  });

  it("reports a missing fallbackLocale in sap.app/i18n, even if the sap.ui5 model is correct", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { i18n: {} }, "sap.ui5": { models: { i18n: { settings: VALID_I18N } } } },
    });

    const findings = runRule(i18nFallbackRule, ctx);
    expect(findings).toHaveLength(1);
    expect(findings[0]?.message).toContain("sap.app/i18n");
  });

  it("treats sap.app/i18n as a string (old short form without fallbackLocale) like a missing setting", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { i18n: "i18n/i18n.properties" }, "sap.ui5": { models: { i18n: { settings: VALID_I18N } } } },
    });

    const findings = runRule(i18nFallbackRule, ctx);
    expect(findings).toHaveLength(1);
    expect(findings[0]?.message).toContain("sap.app/i18n");
  });

  it("reports both places if both are misconfigured", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { i18n: {} }, "sap.ui5": { models: { i18n: { settings: {} } } } },
    });

    expect(runRule(i18nFallbackRule, ctx)).toHaveLength(2);
  });
});
