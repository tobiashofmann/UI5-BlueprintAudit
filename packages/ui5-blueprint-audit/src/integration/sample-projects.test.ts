import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { runProject } from "../engine/run-project.js";

/**
 * End-to-End-Check: führt die echte Engine (Config-Loader, Plugin-Loader, Project
 * Context, alle Kern-Regeln) gegen die Referenzprojekte in sample-prj aus. Dient als
 * Regressionstest für das Zusammenspiel aller Teile (siehe sample-prj/testcases.md
 * für die erwartete Zuordnung).
 */
const sampleProjectsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..", "sample-prj");

async function violatedRuleIds(projectDir: string, cliProjectType: "fs" | "fe" | "lib" = "fs"): Promise<string[]> {
  const { byLocale } = await runProject(join(sampleProjectsDir, projectDir), { cliProjectType });
  const result = byLocale.en;
  if (!result) throw new Error(`Keine "en"-Ergebnisse für ${projectDir}`);
  if (result.error) throw new Error(`Unerwarteter Config-Fehler für ${projectDir}: ${result.error}`);
  return result.results.filter((r) => r.findings.length > 0).map((r) => r.ruleId).sort();
}

describe("sample-prj Referenzprojekte", () => {
  it("prj-js verletzt genau die dokumentierten Regeln (Generator-Scaffold, JS)", async () => {
    expect(await violatedRuleIds("prj-js")).toEqual(
      [
        "typescript",
        "odata-service",
        "no-custom-css",
        "cache-buster",
        "i18n-languages",
        "i18n-fallback",
        "mockserver-config",
        "framework",
        "ui5-version",
        "flp-config",
        "deploy-config",
        "wdi5-tests",
        "playwright-tests",
        "app-icons",
        "app-version",
      ].sort(),
    );
  });

  it("prj-ts verletzt genau die dokumentierten Regeln (Generator-Scaffold, TS)", async () => {
    expect(await violatedRuleIds("prj-ts")).toEqual(
      [
        "odata-service",
        "no-custom-css",
        "cache-buster",
        "i18n-languages",
        "i18n-fallback",
        "mockserver-config",
        "framework",
        "ui5-version",
        "wdi5-tests",
        "playwright-tests",
        "app-icons",
        "app-version",
      ].sort(),
    );
  });

  it("prj-ts-lib verletzt genau die dokumentierten Regeln (echte OpenUI5-TS-Library)", async () => {
    expect(await violatedRuleIds("prj-ts-lib", "lib")).toEqual(["framework", "ui5-version", "app-version"].sort());
  });

  it("prj-violations-1 verletzt genau die gezielt gebauten 7 Regeln plus die später ergänzten Test-/Metadaten-Regeln", async () => {
    expect(await violatedRuleIds("prj-violations-1")).toEqual(
      [
        "controller-matches-view",
        "folder-structure",
        "theme",
        "consistent-namespace",
        "i18n-languages",
        "device-types",
        "content-densities",
        "qunit-opa-tests",
        "wdi5-tests",
        "playwright-tests",
        "app-icons",
        "app-version",
      ].sort(),
    );
  });

  it("prj-valid verletzt keine Regel", async () => {
    expect(await violatedRuleIds("prj-valid")).toEqual([]);
  });

  it("prj-violations-2 verletzt genau die 10 Regeln, die sonst kein anderes Fixture verletzt", async () => {
    expect(await violatedRuleIds("prj-violations-2")).toEqual(
      [
        "app-title-description",
        "dialogs-folder",
        "flex-enabled",
        "fragments-folder",
        "i18n-used",
        "no-custom-controls",
        "non-odata-json",
        "odata-metadata-local",
        "odata-mockdata",
        "xml-views",
      ].sort(),
    );
  });

  it("prj-js-flp-plugin verletzt genau die dokumentierten Regeln (Generator-Scaffold, JS, FLP-Plugin)", async () => {
    expect(await violatedRuleIds("prj-js-flp-plugin")).toEqual(
      [
        "typescript",
        "folder-structure",
        "cache-buster",
        "i18n-languages",
        "i18n-fallback",
        "flex-enabled",
        "content-densities",
        "mockserver-config",
        "ui5-version",
        "deploy-config",
        "wdi5-tests",
        "playwright-tests",
        "app-icons",
        "app-version",
      ].sort(),
    );
  });

  it("prj-ts-flp-plugin verletzt genau die dokumentierten Regeln (Generator-Scaffold, TS, FLP-Plugin)", async () => {
    expect(await violatedRuleIds("prj-ts-flp-plugin")).toEqual(
      [
        "folder-structure",
        "cache-buster",
        "flex-enabled",
        "i18n-languages",
        "i18n-fallback",
        "mockserver-config",
        "deploy-config",
        "app-title-description",
        "qunit-opa-tests",
        "wdi5-tests",
        "playwright-tests",
        "app-icons",
      ].sort(),
    );
  });
});
