import { countFindings, type ProjectResult } from "../engine/types.js";

/**
 * Renders the plain-text console summary printed after every run: one line per project
 * (✓/!/✗ for no findings / warnings only / at least one error) followed by its findings
 * (severity, rule ID, file, message),
 * or the load error if the project's config/context couldn't be loaded. This is the only
 * report format not written to a file — it's printed directly to stdout.
 *
 * @param projects - Project results for a single locale (the first active output language).
 * @returns The summary text, one project per block, joined with newlines.
 */
export function renderTextSummary(projects: ProjectResult[]): string {
  const lines: string[] = [];

  for (const project of projects) {
    if (project.error) {
      lines.push(`✗ ${project.projectName}: ${project.error}`);
      continue;
    }

    const findings = project.results.flatMap((result) =>
      result.findings.map((f) => ({ ...f, severity: result.severity, ruleId: result.ruleId })),
    );
    const ruleWidth = Math.max(0, ...findings.map((f) => f.ruleId.length));
    const { errors: errorCount, warnings: warnCount } = countFindings(project);

    const icon = errorCount > 0 ? "✗" : warnCount > 0 ? "!" : "✓";
    lines.push(`${icon} ${project.projectName} (${project.projectType}): ${errorCount} error(s), ${warnCount} warning(s)`);

    for (const finding of findings) {
      const prefix = finding.severity === "error" ? "  error" : "  warn ";
      const location = finding.file ? `${finding.file}: ` : "";
      lines.push(`${prefix}  ${finding.ruleId.padEnd(ruleWidth)}  ${location}${finding.message}`);
    }
  }

  return lines.join("\n");
}
