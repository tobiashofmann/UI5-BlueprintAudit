import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { i18nLanguagesRule } from "./i18n-languages.js";

function manifestWithLocales(locales: string[], fallbackLocale: string) {
  const settings = { supportedLocales: locales, fallbackLocale };
  return { "sap.app": { i18n: settings }, "sap.ui5": { models: { i18n: { settings } } } };
}

describe("i18n-languages", () => {
  it("ist erfüllt, wenn de/en unterstützt sind und die de-Datei existiert", () => {
    const ctx = createTestContext({
      manifest: manifestWithLocales(["de", "en"], "en"),
      files: { "webapp/i18n/i18n_de.properties": "" },
    });

    expect(runRule(i18nLanguagesRule, ctx)).toEqual([]);
  });

  it("meldet eine fehlende Sprache in supportedLocales (an beiden Stellen)", () => {
    const ctx = createTestContext({ manifest: manifestWithLocales(["en", "fr"], "en"), files: {} });

    expect(runRule(i18nLanguagesRule, ctx)).toHaveLength(2);
  });

  it("meldet eine fehlende Sprache nur in sap.app/i18n, wenn sap.ui5/models/i18n korrekt ist", () => {
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

  it("die Fallback-Sprache braucht keine eigene Datei", () => {
    const ctx = createTestContext({ manifest: manifestWithLocales(["de", "en"], "en"), files: { "webapp/i18n/i18n_de.properties": "" } });

    expect(runRule(i18nLanguagesRule, ctx)).toEqual([]);
  });

  it("meldet zusätzliche Sprachen im strict-Modus (an beiden Stellen)", () => {
    const ctx = createTestContext({
      manifest: manifestWithLocales(["de", "en", "fr"], "en"),
      files: { "webapp/i18n/i18n_de.properties": "", "webapp/i18n/i18n_fr.properties": "" },
    });

    expect(runRule(i18nLanguagesRule, ctx, { strict: true })).toHaveLength(2);
  });

  it("verlangt bei Libraries für jede Sprache eine eigene messagebundle_<xx>.properties (kein Fallback-Freifahrtschein)", () => {
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

  it("meldet bei Libraries eine fehlende messagebundle_<xx>.properties", () => {
    const ctx = createTestContext({
      projectType: "lib",
      ui5Yaml: { metadata: { name: "ns.lib" } },
      files: { "src/ns/lib/messagebundle.properties": "", "src/ns/lib/messagebundle_de.properties": "" },
    });

    expect(runRule(i18nLanguagesRule, ctx)).toHaveLength(1);
  });
});
