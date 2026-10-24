import type { LocaleCode, Translator } from "@abap/ui5-blueprint-audit-types";
import type { ProjectResult } from "../engine/types.js";

const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  de: "Deutsch",
  en: "English",
  "pt-BR": "Português (BR)",
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function statusBadge(status: "ok" | "warn" | "error", t: Translator): string {
  const key = status === "ok" ? "report.badge.ok" : status === "warn" ? "report.badge.warn" : "report.badge.error";
  return `<span class="badge badge-${status}">${escapeHtml(t(key))}</span>`;
}

function projectStatus(project: ProjectResult): "ok" | "warn" | "error" {
  if (project.error) return "error";
  const hasError = project.results.some((r) => r.severity === "error" && r.findings.length > 0);
  if (hasError) return "error";
  const hasWarn = project.results.some((r) => r.severity === "warn" && r.findings.length > 0);
  return hasWarn ? "warn" : "ok";
}

function renderProjectDetail(project: ProjectResult, t: Translator): string {
  if (project.error) {
    return `
    <details class="project">
      <summary>${escapeHtml(project.projectName)} ${statusBadge("error", t)}</summary>
      <p class="config-error">${escapeHtml(t("report.loadError", { error: project.error }))}</p>
    </details>`;
  }

  const rows = project.results
    .map((result) => {
      const hasFindings = result.findings.length > 0;
      const rowStatus = !hasFindings ? "ok" : result.severity === "error" ? "error" : "warn";
      const findingsHtml = hasFindings
        ? `<ul>${result.findings
            .map((f) => `<li>${f.file ? `<code>${escapeHtml(f.file)}</code>: ` : ""}${escapeHtml(f.message)}</li>`)
            .join("")}</ul>`
        : "<em>–</em>";

      return `
        <tr class="row-${rowStatus}">
          <td><code>${escapeHtml(result.ruleId)}</code></td>
          <td>${escapeHtml(result.description)}</td>
          <td>${escapeHtml(result.severity)}</td>
          <td>${statusBadge(rowStatus, t)}</td>
          <td>${findingsHtml}</td>
        </tr>`;
    })
    .join("");

  return `
    <details class="project">
      <summary>${escapeHtml(project.projectName)} (${escapeHtml(project.projectType ?? "?")}) ${statusBadge(
        projectStatus(project),
        t,
      )}</summary>
      <table class="rules">
        <thead>
          <tr><th>${escapeHtml(t("report.col.rule"))}</th><th>${escapeHtml(t("report.col.description"))}</th><th>${escapeHtml(t("report.col.severity"))}</th><th>${escapeHtml(t("report.col.status"))}</th><th>${escapeHtml(t("report.col.findings"))}</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </details>`;
}

function renderLocalePanel(locale: LocaleCode, projects: ProjectResult[], t: Translator): string {
  const generatedAt = new Date().toISOString();

  const summaryRows = projects
    .map((project) => {
      const errorCount = project.error
        ? 1
        : project.results.filter((r) => r.severity === "error" && r.findings.length > 0).length;
      const warnCount = project.error
        ? 0
        : project.results.filter((r) => r.severity === "warn" && r.findings.length > 0).length;
      return `
        <tr>
          <td>${escapeHtml(project.projectName)}</td>
          <td>${escapeHtml(project.projectType ?? "–")}</td>
          <td>${errorCount}</td>
          <td>${warnCount}</td>
          <td>${statusBadge(projectStatus(project), t)}</td>
        </tr>`;
    })
    .join("");

  return `
  <div class="locale-panel" data-locale="${escapeHtml(locale)}" lang="${escapeHtml(locale)}" hidden>
    <h1>${escapeHtml(t("report.title"))}</h1>
    <p class="meta">${escapeHtml(t("report.generatedAt", { date: generatedAt }))}</p>

    <h2>${escapeHtml(t("report.summary"))}</h2>
    <table>
      <thead><tr><th>${escapeHtml(t("report.col.project"))}</th><th>${escapeHtml(t("report.col.type"))}</th><th>${escapeHtml(t("report.col.errors"))}</th><th>${escapeHtml(t("report.col.warnings"))}</th><th>${escapeHtml(t("report.col.status"))}</th></tr></thead>
      <tbody>${summaryRows}</tbody>
    </table>

    <h2>${escapeHtml(t("report.details"))}</h2>
    ${projects.map((project) => renderProjectDetail(project, t)).join("\n")}
  </div>`;
}

/**
 * Renders report.html: a single self-contained document with every active language
 * embedded (one `.locale-panel` each), switchable via buttons, with the selection
 * persisted in `localStorage`. The button labels (language names) deliberately do NOT
 * come from the translator, since the switcher must stay readable in every language at once.
 *
 * @param projectsByLocale - Project results, keyed by each active locale.
 * @param translators - A translator per active locale, used to render that locale's panel.
 * @param activeLocales - The languages to embed, and the order their switch buttons appear in.
 * @returns The full HTML document, as a string.
 */
export function renderHtmlReport(
  projectsByLocale: Record<LocaleCode, ProjectResult[]>,
  translators: Record<LocaleCode, Translator>,
  activeLocales: LocaleCode[],
): string {
  const switchButtons = activeLocales
    .map(
      (locale) =>
        `<button type="button" data-locale="${escapeHtml(locale)}">${escapeHtml(LANGUAGE_DISPLAY_NAMES[locale] ?? locale)}</button>`,
    )
    .join("\n      ");

  const panels = activeLocales
    .map((locale) => renderLocalePanel(locale, projectsByLocale[locale] ?? [], translators[locale]!))
    .join("\n");

  return `<!doctype html>
<html lang="${escapeHtml(activeLocales[0] ?? "en")}">
<head>
<meta charset="utf-8">
<title>UI5 BlueprintAudit Report</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #ffffff;
    --fg: #1a1a1a;
    --muted: #595959;
    --border: #ccc;
    --th-bg: #f0f0f0;
    --row-error-bg: rgba(198, 40, 40, 0.12);
    --row-warn-bg: rgba(184, 134, 11, 0.14);
    --code-bg: rgba(0, 0, 0, 0.08);
    --error-text: #b3261e;
    --accent: #2457c5;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #1e1e1e;
      --fg: #e8e8e8;
      --muted: #b0b0b0;
      --border: #555;
      --th-bg: #2b2b2b;
      --row-error-bg: rgba(248, 113, 113, 0.18);
      --row-warn-bg: rgba(250, 204, 21, 0.18);
      --code-bg: rgba(255, 255, 255, 0.14);
      --error-text: #ff8a80;
      --accent: #7aa2ff;
    }
  }
  body { font-family: -apple-system, system-ui, sans-serif; margin: 2rem; max-width: 1000px; background: var(--bg); color: var(--fg); }
  h1, h2, h3 { color: var(--fg); margin-bottom: 0.25rem; }
  .meta { color: var(--muted); margin-bottom: 1.5rem; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 1rem; color: var(--fg); }
  th, td { border: 1px solid var(--border); padding: 0.4rem 0.6rem; text-align: left; vertical-align: top; }
  th { background: var(--th-bg); color: var(--fg); }
  .badge { display: inline-block; padding: 0.1rem 0.5rem; border-radius: 0.75rem; font-size: 0.85em; color: #fff; }
  .badge-ok { background: #2e7d32; }
  .badge-warn { background: #9a6b00; }
  .badge-error { background: #b3261e; }
  .row-error { background: var(--row-error-bg); }
  .row-warn { background: var(--row-warn-bg); }
  details.project { border: 1px solid var(--border); border-radius: 0.5rem; margin-bottom: 0.75rem; padding: 0.5rem 0.75rem; }
  details.project summary { cursor: pointer; font-weight: 600; color: var(--fg); }
  table.rules { margin-top: 0.75rem; }
  ul { margin: 0; padding-left: 1.2rem; }
  code { background: var(--code-bg); color: var(--fg); padding: 0.1rem 0.3rem; border-radius: 0.25rem; }
  .config-error { color: var(--error-text); }
  .lang-switch { margin-bottom: 1.5rem; }
  .lang-switch button { border: 1px solid var(--border); background: transparent; color: var(--fg); padding: 0.3rem 0.8rem; border-radius: 0.5rem; margin-right: 0.4rem; cursor: pointer; font: inherit; }
  .lang-switch button[aria-pressed="true"] { background: var(--accent); color: #fff; border-color: var(--accent); }
</style>
</head>
<body>
  <div class="lang-switch" role="group" aria-label="Language">
      ${switchButtons}
  </div>
${panels}
  <script>
  (function () {
    var panels = document.querySelectorAll(".locale-panel");
    var buttons = document.querySelectorAll(".lang-switch button");
    function show(locale) {
      panels.forEach(function (p) { p.hidden = p.dataset.locale !== locale; });
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.locale === locale)); });
      try { localStorage.setItem("ui5-blueprint-audit-report-lang", locale); } catch (e) {}
    }
    var saved = null;
    try { saved = localStorage.getItem("ui5-blueprint-audit-report-lang"); } catch (e) {}
    var firstLocale = panels.length ? panels[0].dataset.locale : null;
    var initial = (saved && document.querySelector('.locale-panel[data-locale="' + saved + '"]')) ? saved : firstLocale;
    buttons.forEach(function (b) { b.addEventListener("click", function () { show(b.dataset.locale); }); });
    if (initial) show(initial);
  })();
  </script>
</body>
</html>
`;
}
