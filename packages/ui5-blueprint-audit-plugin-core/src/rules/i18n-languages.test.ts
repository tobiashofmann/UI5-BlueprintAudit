import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { i18nLanguagesRule } from "./i18n-languages.js";

function manifestWithLocales(locales: string[], fallbackLocale: string) {
  const settings = { supportedLocales: locales, fallbackLocale };
  return { "sap.app": { i18n: settings }, "sap.ui5": { models: { i18n: { settings } } } };
}

describe("i18n-languages", () => {
  it("passes if de/en are supported and the de file exists", () => {
    const ctx = createTestContext({
      manifest: manifestWithLocales(["de", "en"], "en"),
      files: { "webapp/i18n/i18n_de.properties": "" },
    });

    expect(runRule(i18nLanguagesRule, ctx)).toEqual([]);
  });

  it("reports a language missing from supportedLocales (in both places)", () => {
    const ctx = createTestContext({ manifest: manifestWithLocales(["en", "fr"], "en"), files: {} });

    expect(runRule(i18nLanguagesRule, ctx)).toHaveLength(2);
  });

  it("reports a missing language only in sap.app/i18n if sap.ui5/models/i18n is correct", () => {
    const settings = { supportedLocales: ["en", "fr"], fallbackLocale: "en" };
    const ctx = createTestContext({
      manifest: {
        "sap.app": { i18n: settings },
        "sap.ui5": { models: { i18n: { settings: { supportedLocales: ["de", "en"], fallbackLocale: "en" } } } },
      },
      files: { "webapp/i18n/i18n_de.properties": "" },
    });

    const findings = runRule(i18nLanguagesRule, ctx);
    expect(findings).toHaveLength(1);
    expect(findings[0]?.message).toContain("sap.app/i18n");
  });

  it("the fallback language needs no file of its own", () => {
    const ctx = createTestContext({ manifest: manifestWithLocales(["de", "en"], "en"), files: { "webapp/i18n/i18n_de.properties": "" } });

    expect(runRule(i18nLanguagesRule, ctx)).toEqual([]);
  });

  it("reports additional languages in strict mode (in both places)", () => {
    const ctx = createTestContext({
      manifest: manifestWithLocales(["de", "en", "fr"], "en"),
      files: { "webapp/i18n/i18n_de.properties": "", "webapp/i18n/i18n_fr.properties": "" },
    });

    expect(runRule(i18nLanguagesRule, ctx, { strict: true })).toHaveLength(2);
  });

  it("requires a separate messagebundle_<xx>.properties per language for libraries (no fallback free pass)", () => {
    const ctx = createTestContext({
      projectType: "lib",
      ui5Yaml: { metadata: { name: "ns.lib" } },
      files: {
        "src/ns/lib/messagebundle.properties": "",
        "src/ns/lib/messagebundle_de.properties": "",
        "src/ns/lib/messagebundle_en.properties": "",
      },
    });

    expect(runRule(i18nLanguagesRule, ctx)).toEqual([]);
  });

  it("reports a missing messagebundle_<xx>.properties for libraries", () => {
    const ctx = createTestContext({
      projectType: "lib",
      ui5Yaml: { metadata: { name: "ns.lib" } },
      files: { "src/ns/lib/messagebundle.properties": "", "src/ns/lib/messagebundle_de.properties": "" },
    });

    expect(runRule(i18nLanguagesRule, ctx)).toHaveLength(1);
  });
});
