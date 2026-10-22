import { createTranslator, buildLocaleRegistry } from "@abap/ui5-blueprint-audit-types";
import { describe, expect, it } from "vitest";
import type { ProjectResult } from "../engine/types.js";
import { cliLocalesPlugin } from "../locales/index.js";
import { renderMarkdownReport } from "./markdown.js";

const registry = buildLocaleRegistry([cliLocalesPlugin], "en");
const t = createTranslator(registry, "en");

const projects: ProjectResult[] = [
  {
    projectDir: "/p/ok",
    projectName: "ok-project",
    projectType: "fs",
    results: [{ ruleId: "namespace", description: "x", severity: "error", findings: [] }],
  },
  {
    projectDir: "/p/broken",
    projectName: "broken-project",
    projectType: "fs",
    results: [
      {
        ruleId: "typescript",
        description: "x",
        severity: "error",
        findings: [{ ruleId: "typescript", severity: "error", message: "fehlt", file: "tsconfig.json" }],
      },
    ],
  },
  { projectDir: "/p/err", projectName: "err-project", error: "No project type specified.", results: [] },
];

describe("renderMarkdownReport", () => {
  it("enthält eine Zusammenfassungstabelle mit Status pro Projekt", () => {
    const markdown = renderMarkdownReport(projects, t);

    expect(markdown).toContain("| ok-project | fs | 0 | 0 | ✅ |");
    expect(markdown).toContain("| broken-project | fs | 1 | 0 | ❌ |");
    expect(markdown).toContain(t("report.loadError", { error: "No project type specified." }));
  });

  it("listet Findings im Detailabschnitt", () => {
    const markdown = renderMarkdownReport(projects, t);

    expect(markdown).toContain("## broken-project");
    expect(markdown).toContain("tsconfig.json: fehlt");
  });

  it("nutzt den Titel aus dem Translator", () => {
    const markdown = renderMarkdownReport(projects, t);

    expect(markdown).toContain(`# ${t("report.title")}`);
  });
});
