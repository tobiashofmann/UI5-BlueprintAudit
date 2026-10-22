import { describe, expect, it } from "vitest";
import type { ProjectResult } from "../engine/types.js";
import { renderJUnitReport } from "./junit.js";

const projects: ProjectResult[] = [
  {
    projectDir: "/p/a",
    projectName: "project-a",
    projectType: "fs",
    results: [
      { ruleId: "no-error-rule", description: "x", severity: "error", findings: [] },
      {
        ruleId: "broken-rule",
        description: "x",
        severity: "error",
        findings: [{ ruleId: "broken-rule", severity: "error", message: "kaputt" }],
      },
      {
        ruleId: "warn-rule",
        description: "x",
        severity: "warn",
        findings: [{ ruleId: "warn-rule", severity: "warn", message: "achtung" }],
      },
    ],
  },
  { projectDir: "/p/b", projectName: "project-b", error: "Kein Projekttyp angegeben.", results: [] },
];

describe("renderJUnitReport", () => {
  it("erzeugt pro Projekt eine testsuite und pro Regel einen testcase", () => {
    const xml = renderJUnitReport(projects);

    expect(xml).toContain('<testsuite name="project-a" tests="3" failures="1" errors="0">');
    expect(xml).toContain('<testcase name="broken-rule" classname="project-a">');
    expect(xml).toContain('<failure message="kaputt">kaputt</failure>');
  });

  it("meldet warn-Findings als system-out, nicht als failure", () => {
    const xml = renderJUnitReport(projects);

    expect(xml).toContain("<system-out>achtung</system-out>");
    expect(xml).not.toContain('<failure message="achtung"');
  });

  it("bildet einen Config-Fehler als eigene fehlgeschlagene testsuite ab", () => {
    const xml = renderJUnitReport(projects);

    expect(xml).toContain('<testsuite name="project-b" tests="1" failures="1" errors="0">');
    expect(xml).toContain("Kein Projekttyp angegeben.");
  });
});
