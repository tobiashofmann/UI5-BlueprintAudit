import { buildLocaleRegistry, createTranslator } from "@abap/ui5-blueprint-audit-types";
import { describe, expect, it } from "vitest";
import type { ProjectResult } from "../engine/types.js";
import { cliLocalesPlugin } from "../locales/index.js";
import { renderMarkdownTable } from "./markdown-table.js";

const t = createTranslator(buildLocaleRegistry([cliLocalesPlugin], "en"), "en");

const project: ProjectResult = {
  projectDir: "/p/demo",
  projectName: "demo",
  projectType: "fs",
  results: [
    { ruleId: "namespace", description: "x", severity: "error", findings: [] },
    {
      ruleId: "app-version",
      description: "x",
      severity: "warn",
      findings: [{ ruleId: "app-version", severity: "warn", message: "still 0.0.1", file: "webapp/manifest.json" }],
    },
    {
      ruleId: "ui5-version",
      description: "x",
      severity: "error",
      findings: [{ ruleId: "ui5-version", severity: "error", message: "too old | bad" }],
    },
  ],
};

describe("renderMarkdownTable", () => {
  const md = renderMarkdownTable([project], t, new Date("2026-11-14T10:00:00Z"));

  it("has title, scan date and project name", () => {
    expect(md).toContain("# UI5 BlueprintAudit Report");
    expect(md).toContain("Generated: 2026-11-14");
    expect(md).toContain("## demo");
  });

  it("shows rule, status icon and details", () => {
    expect(md).toContain("| `namespace` | ✅ OK |  |");
    expect(md).toContain("| `app-version` | ⚠️ Warning | webapp/manifest.json: still 0.0.1 |");
    expect(md).toContain("| `ui5-version` | ❌ Error | too old \\| bad |");
  });

  it("shows the load error for a failed project", () => {
    const out = renderMarkdownTable([{ projectDir: "/p/e", projectName: "e", error: "boom", results: [] }], t);
    expect(out).toContain("## e");
    expect(out).toContain("boom");
  });
});
