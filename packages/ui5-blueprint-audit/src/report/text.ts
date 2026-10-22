import type { ProjectResult } from "../engine/types.js";

export function renderTextSummary(projects: ProjectResult[]): string {
  const lines: string[] = [];

  for (const project of projects) {
    if (project.error) {
      lines.push(`✗ ${project.projectName}: ${project.error}`);
      continue;
    }

    const findings = project.results.flatMap((result) =>
      result.findings.map((f) => ({ ...f, severity: result.severity })),
    );
    const errorCount = findings.filter((f) => f.severity === "error").length;
    const warnCount = findings.filter((f) => f.severity === "warn").length;

    const icon = errorCount > 0 ? "✗" : warnCount > 0 ? "!" : "✓";
    lines.push(`${icon} ${project.projectName} (${project.projectType}): ${errorCount} error(s), ${warnCount} warning(s)`);

    for (const finding of findings) {
      const prefix = finding.severity === "error" ? "  error" : "  warn ";
      const location = finding.file ? `${finding.file}: ` : "";
      lines.push(`${prefix}  ${location}${finding.message}`);
    }
  }

  return lines.join("\n");
}
