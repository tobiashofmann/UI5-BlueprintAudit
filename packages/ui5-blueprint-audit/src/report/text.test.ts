import { describe, expect, it } from "vitest";
import type { ProjectResult } from "../engine/types.js";
import { renderTextSummary } from "./text.js";

describe("renderTextSummary", () => {
  it("marks a clean project with ✓ and shows 0 errors/warnings", () => {
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

  it("marks a project with error findings with ✗ and lists the findings", () => {
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
    expect(text).toContain("  error  typescript  tsconfig.json: fehlt");
  });

  it("marks a project without errors but with warnings with !", () => {
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
    expect(text).toContain("  warn   app-version  veraltet");
  });

  it("shows findings without a file without a file prefix", () => {
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

    expect(text).toContain("  error  ui5-version  zu alt");
    expect(text).not.toContain("undefined");
  });

  it("shows the config error instead of findings if the project could not be loaded", () => {
    const projects: ProjectResult[] = [
      { projectDir: "/p/err", projectName: "err-project", error: "No project type specified.", results: [] },
    ];

    const text = renderTextSummary(projects);

    expect(text).toBe("✗ err-project: No project type specified.");
  });

  it("joins several projects with line breaks", () => {
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
