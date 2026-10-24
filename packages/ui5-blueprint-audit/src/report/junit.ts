import type { ProjectResult } from "../engine/types.js";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function findingsMessage(result: ProjectResult["results"][number]): string {
  return result.findings.map((f) => (f.file ? `${f.file}: ${f.message}` : f.message)).join("\n");
}

/**
 * Renders a JUnit XML report: each project becomes a testsuite, each evaluated rule a
 * testcase within it. A rule with `error`-severity findings is reported as `<failure>`.
 * `warn`-severity findings deliberately produce no `<failure>` (JUnit has no warning
 * level) — they're emitted as `<system-out>` instead, so they stay visible without
 * falsely tripping CI gates (see CLAUDE.md, "Output and exit codes": only `error` fails
 * the run). Caller is responsible for always passing the English-locale project results
 * here, so report.xml stays English regardless of the active `languages`.
 *
 * @param projects - Project results for a single locale.
 * @returns The full JUnit XML document, as a string.
 */
export function renderJUnitReport(projects: ProjectResult[]): string {
  const suites = projects.map((project) => {
    if (project.error) {
      return [
        `  <testsuite name="${escapeXml(project.projectName)}" tests="1" failures="1" errors="0">`,
        `    <testcase name="config" classname="${escapeXml(project.projectName)}">`,
        `      <failure message="${escapeXml(project.error)}">${escapeXml(project.error)}</failure>`,
        "    </testcase>",
        "  </testsuite>",
      ].join("\n");
    }

    const failureCount = project.results.filter((r) => r.severity === "error" && r.findings.length > 0).length;
    const testcases = project.results.map((result) => {
      const hasFailure = result.severity === "error" && result.findings.length > 0;
      const hasWarning = result.severity === "warn" && result.findings.length > 0;

      const parts = [`    <testcase name="${escapeXml(result.ruleId)}" classname="${escapeXml(project.projectName)}">`];
      if (hasFailure) {
        const message = findingsMessage(result);
        parts.push(`      <failure message="${escapeXml(result.findings[0]?.message ?? "")}">${escapeXml(message)}</failure>`);
      } else if (hasWarning) {
        parts.push(`      <system-out>${escapeXml(findingsMessage(result))}</system-out>`);
      }
      parts.push("    </testcase>");
      return parts.join("\n");
    });

    return [
      `  <testsuite name="${escapeXml(project.projectName)}" tests="${project.results.length}" failures="${failureCount}" errors="0">`,
      ...testcases,
      "  </testsuite>",
    ].join("\n");
  });

  return ['<?xml version="1.0" encoding="UTF-8"?>', "<testsuites>", ...suites, "</testsuites>", ""].join("\n");
}
