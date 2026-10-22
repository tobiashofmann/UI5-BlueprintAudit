import { createTranslator, buildLocaleRegistry } from "@abap/ui5-blueprint-audit-types";
import { describe, expect, it } from "vitest";
import type { ProjectResult } from "../engine/types.js";
import { cliLocalesPlugin } from "../locales/index.js";
import { renderHtmlReport } from "./html.js";

const registry = buildLocaleRegistry([cliLocalesPlugin], "en");

const projects: ProjectResult[] = [
  {
    projectDir: "/p/a",
    projectName: "project-a",
    projectType: "fs",
    results: [
      {
        ruleId: "broken-rule",
        description: "Testbeschreibung",
        severity: "error",
        findings: [{ ruleId: "broken-rule", severity: "error", message: "kaputt", file: "x.json" }],
      },
    ],
  },
  { projectDir: "/p/b", projectName: "project-b", error: "No project type specified.", results: [] },
];

describe("renderHtmlReport", () => {
  it("erzeugt ein vollständiges HTML-Dokument mit einem Sprach-Panel", () => {
    const t = createTranslator(registry, "en");
    const html = renderHtmlReport({ en: projects }, { en: t }, ["en"]);

    expect(html.trim().startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("<title>UI5 BlueprintAudit Report</title>");
    expect((html.match(/<details class="project">/g) ?? []).length).toBe(2);
  });

  it("escaped Nutzdaten und zeigt Findings sowie Config-Fehler lokalisiert an", () => {
    const t = createTranslator(registry, "en");
    const html = renderHtmlReport({ en: projects }, { en: t }, ["en"]);

    expect(html).toContain("Testbeschreibung");
    expect(html).toContain("kaputt");
    expect(html).toContain(t("report.loadError", { error: "No project type specified." }));
  });

  it("bettet ein Panel pro aktiver Sprache ein, mit Umschalt-Buttons", () => {
    const tEn = createTranslator(registry, "en");
    const tDe = createTranslator(registry, "de");
    const html = renderHtmlReport({ en: projects, de: projects }, { en: tEn, de: tDe }, ["en", "de"]);

    expect((html.match(/class="locale-panel"/g) ?? []).length).toBe(2);
    expect(html).toContain('data-locale="en"');
    expect(html).toContain('data-locale="de"');
    expect(html).toContain("English");
    expect(html).toContain("Deutsch");
  });
});
