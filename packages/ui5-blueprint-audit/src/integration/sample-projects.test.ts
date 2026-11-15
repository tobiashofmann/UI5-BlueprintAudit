import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { runProject } from "../engine/run-project.js";

/**
 * End-to-end check: runs the real engine (config loader, plugin loader, project context,
 * all core rules) against the reference projects in sample-prj. Serves as a regression
 * test for the interplay of all parts (see sample-prj/testcases.md for the expected
 * mapping).
 */
const sampleProjectsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..", "sample-prj");

async function violatedRuleIds(projectDir: string, cliProjectType: "fs" | "fe" | "lib" = "fs"): Promise<string[]> {
  const { byLocale } = await runProject(join(sampleProjectsDir, projectDir), { cliProjectType });
  const result = byLocale.en;
  if (!result) throw new Error(`No "en" results for ${projectDir}`);
  if (result.error) throw new Error(`Unexpected config error for ${projectDir}: ${result.error}`);
  return result.results.filter((r) => r.findings.length > 0).map((r) => r.ruleId).sort();
}

describe("sample-prj reference projects", () => {
  it("prj-js violates exactly the documented rules (generator scaffold, JS)", async () => {
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

  it("prj-ts violates exactly the documented rules (generator scaffold, TS)", async () => {
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

  it("prj-ts-lib violates exactly the documented rules (real OpenUI5 TS library)", async () => {
    expect(await violatedRuleIds("prj-ts-lib", "lib")).toEqual(["framework", "ui5-version", "app-version"].sort());
  });

  it("prj-violations-1 violates exactly the 7 purpose-built rules plus the test/metadata rules added later", async () => {
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

  it("prj-valid violates no rule", async () => {
    expect(await violatedRuleIds("prj-valid")).toEqual([]);
  });

  it("prj-violations-2 violates exactly the 10 rules that no other fixture violates", async () => {
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

  it("prj-js-flp-plugin violates exactly the documented rules (generator scaffold, JS, FLP plugin)", async () => {
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

  it("prj-ts-flp-plugin violates exactly the documented rules (generator scaffold, TS, FLP plugin)", async () => {
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
