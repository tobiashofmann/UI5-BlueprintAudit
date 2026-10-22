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
    expect(namespaceResultEn?.findings[0]?.message).toContain('does not start with "de.itsfullofstars"');
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
});
