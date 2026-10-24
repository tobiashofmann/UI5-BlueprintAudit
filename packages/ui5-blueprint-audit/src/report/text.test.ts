import { describe, expect, it } from "vitest";
import type { ProjectResult } from "../engine/types.js";
import { renderTextSummary } from "./text.js";

describe("renderTextSummary", () => {
  it("markiert ein fehlerfreies Projekt mit ✓ und zeigt 0 Errors/Warnings", () => {
    const projects: ProjectResult[] = [
      {
        projectDir: "/p/ok",
        projectName: "ok-project",
        projectType: "fs",
        results: [{ ruleId: "namespace", description: "x", severity: "error", findings: [] }],
      },
    ];

    const text = renderTextSummary(projects);

    expect(text).toBe("✓ ok-project (fs): 0 error(s), 0 warning(s)");
  });

  it("markiert ein Projekt mit Error-Findings mit ✗ und listet die Findings", () => {
    const projects: ProjectResult[] = [
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
    ];

    const text = renderTextSummary(projects);

    expect(text).toContain("✗ broken-project (fs): 1 error(s), 0 warning(s)");
    expect(text).toContain("  error  tsconfig.json: fehlt");
  });

  it("markiert ein Projekt ohne Errors, aber mit Warnings, mit !", () => {
    const projects: ProjectResult[] = [
      {
        projectDir: "/p/warn",
        projectName: "warn-project",
        projectType: "fs",
        results: [
          {
            ruleId: "app-version",
            description: "x",
            severity: "warn",
            findings: [{ ruleId: "app-version", severity: "warn", message: "veraltet" }],
          },
        ],
      },
    ];

    const text = renderTextSummary(projects);

    expect(text).toContain("! warn-project (fs): 0 error(s), 1 warning(s)");
    expect(text).toContain("  warn   veraltet");
  });

  it("zeigt Findings ohne Datei ohne Datei-Präfix an", () => {
    const projects: ProjectResult[] = [
      {
        projectDir: "/p/nofile",
        projectName: "nofile-project",
        projectType: "fs",
        results: [
          {
            ruleId: "ui5-version",
            description: "x",
            severity: "error",
            findings: [{ ruleId: "ui5-version", severity: "error", message: "zu alt" }],
          },
        ],
      },
    ];

    const text = renderTextSummary(projects);

    expect(text).toContain("  error  zu alt");
    expect(text).not.toContain("undefined");
  });

  it("zeigt den Config-Fehler statt Findings, wenn das Projekt nicht geladen werden konnte", () => {
    const projects: ProjectResult[] = [
      { projectDir: "/p/err", projectName: "err-project", error: "No project type specified.", results: [] },
    ];

    const text = renderTextSummary(projects);

    expect(text).toBe("✗ err-project: No project type specified.");
  });

  it("verbindet mehrere Projekte mit Zeilenumbrüchen", () => {
    const projects: ProjectResult[] = [
      {
        projectDir: "/p/ok",
        projectName: "ok-project",
        projectType: "fs",
        results: [{ ruleId: "namespace", description: "x", severity: "error", findings: [] }],
      },
      { projectDir: "/p/err", projectName: "err-project", error: "No project type specified.", results: [] },
    ];

    const text = renderTextSummary(projects);

    expect(text).toBe(
      ["✓ ok-project (fs): 0 error(s), 0 warning(s)", "✗ err-project: No project type specified."].join("\n"),
    );
  });
});
