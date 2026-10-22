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
 * Jedes Projekt wird eine JUnit-Testsuite, jede ausgeführte Regel ein Testcase darin.
 * Eine Regel mit `error`-Findings wird als <failure> gemeldet. `warn`-Findings erzeugen
 * absichtlich keine <failure> (JUnit kennt keine Warnstufe) — sie landen als <system-out>,
 * damit sie sichtbar bleiben, ohne CI-Gates fälschlich scharf zu schalten
 * (siehe CLAUDE.md, Abschnitt "Ausgabe und Exit-Codes": nur `error` bricht ab).
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
