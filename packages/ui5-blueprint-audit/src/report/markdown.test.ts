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
  it("contains a summary table with the status per project", () => {
    const markdown = renderMarkdownReport(projects, t);

    expect(markdown).toContain("| ok-project | fs | 0 | 0 | ✅ |");
    expect(markdown).toContain("| broken-project | fs | 1 | 0 | ❌ |");
    expect(markdown).toContain(t("report.loadError", { error: "No project type specified." }));
  });

  it("lists findings in the detail section", () => {
    const markdown = renderMarkdownReport(projects, t);

    expect(markdown).toContain("## broken-project");
    expect(markdown).toContain("tsconfig.json: fehlt");
  });

  it("uses the title from the translator", () => {
    const markdown = renderMarkdownReport(projects, t);

    expect(markdown).toContain(`# ${t("report.title")}`);
  });

  it("escapes backslashes before pipes so the table structure does not break", () => {
    const withBackslash: ProjectResult[] = [
      {
        projectDir: "/p/win",
        projectName: "win-project",
        projectType: "fs",
        results: [
          {
            ruleId: "namespace",
            description: "x",
            severity: "error",
            findings: [{ ruleId: "namespace", severity: "error", message: "msg", file: "C:\\views|evil" }],
          },
        ],
      },
    ];

    const markdown = renderMarkdownReport(withBackslash, t);

    // A raw backslash directly before the escaped pipe would cancel its escaping
    // ("\\|" instead of "\|") and thus break the table structure.
    expect(markdown).toContain("C:\\\\views\\|evil");
    expect(markdown).not.toContain("C:\\views|evil");
  });
});

describe("renderMarkdownReport summary counts", () => {
  it("counts findings, not rules with findings", () => {
    const twoFindings: ProjectResult = {
      projectDir: "/p/x",
      projectName: "x-project",
      projectType: "fs",
      results: [
        {
          ruleId: "folder-structure",
          description: "x",
          severity: "error",
          findings: [
            { ruleId: "folder-structure", severity: "error", message: "a" },
            { ruleId: "folder-structure", severity: "error", message: "b" },
          ],
        },
        {
          ruleId: "app-icons",
          description: "x",
          severity: "warn",
          findings: [
            { ruleId: "app-icons", severity: "warn", message: "c" },
            { ruleId: "app-icons", severity: "warn", message: "d" },
            { ruleId: "app-icons", severity: "warn", message: "e" },
          ],
        },
      ],
    };

    expect(renderMarkdownReport([twoFindings], t)).toContain("| x-project | fs | 2 | 3 |");
  });
});
