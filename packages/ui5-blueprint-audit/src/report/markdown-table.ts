import type { Translator } from "@abap/ui5-blueprint-audit-types";
import type { ProjectResult, RuleResult } from "../engine/types.js";

function escapeMd(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ");
}

function statusCell(result: RuleResult, t: Translator): string {
  if (result.findings.length === 0) return `✅ ${t("report.badge.ok")}`;
  return result.severity === "error" ? `❌ ${t("report.badge.error")}` : `⚠️ ${t("report.badge.warn")}`;
}

function projectSection(project: ProjectResult, t: Translator): string {
  if (project.error) {
    return `## ${project.projectName}\n\n❌ ${t("report.loadError", { error: escapeMd(project.error) })}\n`;
  }

  const rows = project.results.map((result) => {
    const details = result.findings
      .map((f) => escapeMd(f.file ? `${f.file}: ${f.message}` : f.message))
      .join("<br>");
    return `| \`${result.ruleId}\` | ${statusCell(result, t)} | ${details} |`;
  });

  return [
    `## ${project.projectName}`,
    "",
    `| ${t("report.col.rule")} | ${t("report.col.status")} | ${t("report.col.findings")} |`,
    "|---|---|---|",
    ...rows,
    "",
  ].join("\n");
}

/**
 * Renders the compact `table_<locale>.md` file (opt-in via `--table`): per project one
 * table with rule ID, status (icon + label) and, for failed rules, what is wrong. The
 * header carries the scan date; each project section is headed by the project name.
 *
 * @param projects - Project results for the locale being rendered.
 * @param t - Translator bound to that locale.
 * @param scannedAt - Scan time; only the date part (UTC, `YYYY-MM-DD`) is printed. Injectable for tests.
 * @returns The Markdown document.
 */
export function renderMarkdownTable(projects: ProjectResult[], t: Translator, scannedAt = new Date()): string {
  return [
    `# ${t("report.title")}`,
    "",
    t("report.generatedAt", { date: scannedAt.toISOString().slice(0, 10) }),
    "",
    ...projects.map((project) => projectSection(project, t)),
  ].join("\n");
}
