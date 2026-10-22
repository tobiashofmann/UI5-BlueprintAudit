import type { Translator } from "@abap/ui5-blueprint-audit-types";
import type { ProjectResult } from "../engine/types.js";

function escapeMd(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function statusIcon(hasFindings: boolean, severity: string): string {
  if (!hasFindings) return "✅";
  return severity === "error" ? "❌" : "⚠️";
}

function projectSummaryRow(project: ProjectResult, t: Translator): string {
  if (project.error) {
    return `| ${project.projectName} | – | – | – | ❌ ${t("report.loadError", { error: escapeMd(project.error) })} |`;
  }
  const errorCount = project.results.filter((r) => r.severity === "error" && r.findings.length > 0).length;
  const warnCount = project.results.filter((r) => r.severity === "warn" && r.findings.length > 0).length;
  const status = errorCount > 0 ? "❌" : warnCount > 0 ? "⚠️" : "✅";
  return `| ${project.projectName} | ${project.projectType ?? "–"} | ${errorCount} | ${warnCount} | ${status} |`;
}

function projectDetailSection(project: ProjectResult, t: Translator): string {
  if (project.error) {
    return `## ${project.projectName}\n\n❌ **${t("report.loadError", { error: escapeMd(project.error) })}**\n`;
  }

  const rows = project.results.map((result) => {
    const hasFindings = result.findings.length > 0;
    const findingsText = hasFindings
      ? result.findings.map((f) => escapeMd(f.file ? `${f.file}: ${f.message}` : f.message)).join("<br>")
      : "–";
    return `| \`${result.ruleId}\` | ${result.severity} | ${statusIcon(hasFindings, result.severity)} | ${findingsText} |`;
  });

  return [
    `## ${project.projectName}`,
    "",
    `${t("report.projectType", { type: project.projectType ?? "" })}`,
    "",
    `| ${t("report.col.rule")} | ${t("report.col.severity")} | ${t("report.col.status")} | ${t("report.col.findings")} |`,
    "|---|---|---|---|",
    ...rows,
    "",
  ].join("\n");
}

export function renderMarkdownReport(projects: ProjectResult[], t: Translator): string {
  const generatedAt = new Date().toISOString();

  const summaryRows = projects.map((project) => projectSummaryRow(project, t));

  return [
    `# ${t("report.title")}`,
    "",
    t("report.generatedAt", { date: generatedAt }),
    "",
    `## ${t("report.summary")}`,
    "",
    `| ${t("report.col.project")} | ${t("report.col.type")} | ${t("report.col.errors")} | ${t("report.col.warnings")} | ${t("report.col.status")} |`,
    "|---|---|---|---|---|",
    ...summaryRows,
    "",
    ...projects.map((project) => projectDetailSection(project, t)),
  ].join("\n");
}
