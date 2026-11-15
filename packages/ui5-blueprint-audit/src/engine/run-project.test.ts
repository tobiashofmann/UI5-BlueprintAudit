import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runProject } from "./run-project.js";

function createProject(manifest: Record<string, unknown>): string {
  const root = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-run-"));
  mkdirSync(join(root, "webapp"), { recursive: true });
  writeFileSync(join(root, "webapp", "manifest.json"), JSON.stringify(manifest), "utf8");
  return root;
}

describe("runProject", () => {
  it("liefert einen lokalisierten Fehler-Eintrag ohne Projekttyp, für de und en", async () => {
    const root = createProject({ "sap.app": { id: "ns.app" } });

    const { byLocale } = await runProject(root);

    expect(byLocale.de?.error).toContain("Kein Projekttyp angegeben");
    expect(byLocale.en?.error).toContain("No project type specified");
    expect(byLocale.de?.results).toEqual([]);
  });

  it("führt Regeln aus und sammelt Findings pro Regel, pro aktiver Sprache", async () => {
    const root = createProject({ "sap.app": { id: "ns.app" } });

    const { byLocale } = await runProject(root, { cliProjectType: "fs" });

    expect(byLocale.de?.error).toBeUndefined();
    expect(byLocale.de?.projectType).toBe("fs");
    const namespaceResultDe = byLocale.de?.results.find((r) => r.ruleId === "namespace");
    expect(namespaceResultDe?.findings.length).toBeGreaterThan(0);

    const flexEnabledResult = byLocale.de?.results.find((r) => r.ruleId === "flex-enabled");
    expect(flexEnabledResult?.severity).toBe("warn");

    // "en" läuft immer intern mit, auch ohne explizite Konfiguration (für report.xml).
    expect(byLocale.en).toBeDefined();
    const namespaceResultEn = byLocale.en?.results.find((r) => r.ruleId === "namespace");
    expect(namespaceResultEn?.findings[0]?.message).toContain('is not in the namespace "de.itsfullofstars"');
  });

  it("überspringt Regeln, die per Config auf off gesetzt sind", async () => {
    const root = createProject({ "sap.app": { id: "ns.app" } });
    writeFileSync(join(root, "ui5-blueprint-audit.yaml"), "projectType: fs\nrules:\n  namespace: off\n", "utf8");

    const { byLocale } = await runProject(root);

    expect(byLocale.de?.results.find((r) => r.ruleId === "namespace")).toBeUndefined();
  });

  it("wendet Regel-Optionen aus der Config an", async () => {
    const root = createProject({ "sap.app": { id: "com.firma.app" } });
    writeFileSync(
      root + "/ui5-blueprint-audit.yaml",
      'projectType: fs\nrules:\n  namespace:\n    - error\n    - value: "com.firma"\n',
      "utf8",
    );

    const { byLocale } = await runProject(root);

    const namespaceResult = byLocale.de?.results.find((r) => r.ruleId === "namespace");
    expect(namespaceResult?.findings).toEqual([]);
  });

  it("bricht bei einer unbekannten Sprache klar ab, auch unter dem angeforderten Locale-Key", async () => {
    const root = createProject({ "sap.app": { id: "ns.app" } });

    const { byLocale } = await runProject(root, { cliProjectType: "fs", cliLanguages: ["xx-XX"] });

    expect(byLocale.en?.error).toContain("Unknown language(s): xx-XX");
    // Die angeforderte (ungültige) Sprache bekommt trotzdem einen Eintrag (Fallback-Rendering auf Englisch),
    // damit report_xx-XX.md nicht leer aussieht, sondern den Fehler zeigt.
    expect(byLocale["xx-XX"]?.error).toContain("Unknown language(s): xx-XX");
  });

  it("merged Locale-Add-ons aus geladenen Plugins in die zurückgegebene Registry", async () => {
    const root = createProject({ "sap.app": { id: "ns.app" } });
    const pluginPath = join(root, "fr-addon.mjs");
    writeFileSync(
      pluginPath,
      'export default { name: "fr-addon", apiVersion: "1", rules: {}, locales: { fr: { "report.title": "Rapport" } } };\n',
      "utf8",
    );
    writeFileSync(
      join(root, "ui5-blueprint-audit.yaml"),
      `projectType: fs\nplugins:\n  - ./fr-addon.mjs\n`,
      "utf8",
    );

    const { registry } = await runProject(root);

    expect(registry.bundles.fr?.["report.title"]).toBe("Rapport");
  });

  it("reports the active languages: the config languages, without the always-present internal \"en\"", async () => {
    const root = createProject({ "sap.app": { id: "ns.app" } });
    writeFileSync(join(root, "ui5-blueprint-audit.yaml"), "projectType: fs\nlanguages: [de]\n", "utf8");

    const { languages, byLocale } = await runProject(root);

    expect(languages).toEqual(["de"]);
    expect(byLocale.en).toBeDefined();
  });

  it("falls back to the default languages when the project type is missing", async () => {
    const root = createProject({ "sap.app": { id: "ns.app" } });

    const { languages } = await runProject(root);

    expect(languages).toEqual(["de", "en"]);
  });
  it("turns an unknown rule ID in the config into a project error", async () => {
    const root = createProject({ "sap.app": { id: "ns.app" } });
    writeFileSync(join(root, "ui5-blueprint-audit.yaml"), "projectType: fs\nrules:\n  no-such-rule: error\n", "utf8");

    const { byLocale } = await runProject(root);

    expect(byLocale.en?.error).toContain("Unknown rule(s) in the configuration: no-such-rule");
    expect(byLocale.de?.error).toContain("no-such-rule");
  });

  it("turns a misspelled severity into a project error", async () => {
    const root = createProject({ "sap.app": { id: "ns.app" } });
    writeFileSync(join(root, "ui5-blueprint-audit.yaml"), "projectType: fs\nrules:\n  namespace: eror\n", "utf8");

    const { byLocale } = await runProject(root);

    expect(byLocale.en?.error).toContain('Invalid configuration for rule "namespace"');
  });

  it("reports an unparseable manifest.json as a project error, not as a missing manifest", async () => {
    const root = createProject({});
    writeFileSync(join(root, "webapp", "manifest.json"), '{ "sap.app": { ', "utf8");

    const { byLocale } = await runProject(root, { cliProjectType: "fs" });

    expect(byLocale.en?.error).toContain("webapp/manifest.json could not be parsed");
    expect(byLocale.en?.results).toEqual([]);
  });

  it("reports a crashing rule as an error finding and still runs the other rules", async () => {
    // A null inbound makes flp-config throw; a throwing plugin rule covers third-party code.
    const root = createProject({ "sap.app": { id: "ns.app", crossNavigation: { inbounds: { a: null } } } });
    writeFileSync(
      join(root, "crashing.mjs"),
      `export default {
        name: "crashing",
        apiVersion: "1",
        rules: {
          boom: {
            meta: { descriptionKey: "boom.description", defaultSeverity: "warn", projectTypes: ["fs"] },
            check() { throw new Error("kaputt"); },
          },
        },
      };`,
      "utf8",
    );
    writeFileSync(join(root, "ui5-blueprint-audit.yaml"), "projectType: fs\nplugins:\n  - ./crashing.mjs\n", "utf8");

    const { byLocale } = await runProject(root);

    expect(byLocale.en?.error).toBeUndefined();
    const boom = byLocale.en?.results.find((r) => r.ruleId === "crashing/boom");
    expect(boom?.severity).toBe("error");
    expect(boom?.findings).toHaveLength(1);
    expect(boom?.findings[0]?.message).toContain("kaputt");
    expect(byLocale.en?.results.find((r) => r.ruleId === "namespace")?.findings).toHaveLength(1);
  });
});
