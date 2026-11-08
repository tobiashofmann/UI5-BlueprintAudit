import type { Finding, LocaleCode, LocaleRegistry, ProjectType, Severity } from "@abap/ui5-blueprint-audit-types";

/** One rule's outcome for a project: its resolved severity, description, and findings. */
export interface RuleResult {
  ruleId: string;
  description: string;
  severity: Severity;
  findings: Finding[];
}

/** A project's check results for one output locale, as produced by `runProject`. */
export interface ProjectResult {
  projectDir: string;
  projectName: string;
  projectType?: ProjectType;
  /** Set when the config/context couldn't be loaded (e.g. a missing project type). */
  error?: string;
  results: RuleResult[];
}

/** A project's results, once per active output language (always incl. "en", see `runProject`). */
export type ProjectResultsByLocale = Record<LocaleCode, ProjectResult>;

/**
 * Return value of `runProject`: the results per language, plus the locale registry
 * merged for this project (core + loaded plugins, including any locale add-ons).
 * Reporters use the registry to render their own report-chrome labels (title, column
 * headers, etc.) in an add-on language too.
 */
export interface RunProjectResult {
  byLocale: ProjectResultsByLocale;
  /**
   * The output languages that are active for this project (`--lang`, else `languages` from
   * the config, else the default). Unlike the keys of `byLocale`, this does not include the
   * always-present "en" unless it was actually requested.
   */
  languages: LocaleCode[];
  registry: LocaleRegistry;
}

/** Whether a project has at least one error-severity finding, or failed to load at all. */
export function hasErrorFindings(project: ProjectResult): boolean {
  if (project.error) return true;
  return project.results.some((result) => result.severity === "error" && result.findings.length > 0);
}

/**
 * Counts a project's findings by severity (one per reported finding, not one per rule), so
 * every report format shows the same numbers.
 */
export function countFindings(project: ProjectResult): { errors: number; warnings: number } {
  let errors = 0;
  let warnings = 0;
  for (const result of project.results) {
    if (result.severity === "error") errors += result.findings.length;
    else if (result.severity === "warn") warnings += result.findings.length;
  }
  return { errors, warnings };
}
