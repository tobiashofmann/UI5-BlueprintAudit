import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { i18nFallbackRule } from "./i18n-fallback.js";

const VALID_I18N = { fallbackLocale: "en", supportedLocales: ["de", "en"] };

describe("i18n-fallback", () => {
  it("ist erfüllt, wenn fallbackLocale in sap.app/i18n und sap.ui5/models/i18n gesetzt ist und in supportedLocales steht", () => {
    const ctx = createTestContext({
      manifest: {
        "sap.app": { i18n: VALID_I18N },
        "sap.ui5": { models: { i18n: { settings: VALID_I18N } } },
      },
    });

    expect(runRule(i18nFallbackRule, ctx)).toEqual([]);
  });

  it("meldet eine fehlende fallbackLocale im sap.ui5-Model", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { i18n: VALID_I18N }, "sap.ui5": { models: { i18n: { settings: {} } } } },
    });

    const findings = runRule(i18nFallbackRule, ctx);
    expect(findings).toHaveLength(1);
    expect(findings[0]?.message).toContain("sap.ui5/models/i18n");
  });

  it("meldet eine fehlende fallbackLocale in sap.app/i18n, auch wenn das sap.ui5-Model korrekt ist", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { i18n: {} }, "sap.ui5": { models: { i18n: { settings: VALID_I18N } } } },
    });

    const findings = runRule(i18nFallbackRule, ctx);
    expect(findings).toHaveLength(1);
    expect(findings[0]?.message).toContain("sap.app/i18n");
  });

  it("behandelt sap.app/i18n als String (alte Kurzform ohne fallbackLocale) wie fehlende Angabe", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { i18n: "i18n/i18n.properties" }, "sap.ui5": { models: { i18n: { settings: VALID_I18N } } } },
    });

    const findings = runRule(i18nFallbackRule, ctx);
    expect(findings).toHaveLength(1);
    expect(findings[0]?.message).toContain("sap.app/i18n");
  });

  it("meldet beide Stellen, wenn beide falsch konfiguriert sind", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { i18n: {} }, "sap.ui5": { models: { i18n: { settings: {} } } } },
    });

    expect(runRule(i18nFallbackRule, ctx)).toHaveLength(2);
  });
});
