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
  registry: LocaleRegistry;
}

/** Whether a project has at least one error-severity finding, or failed to load at all. */
export function hasErrorFindings(project: ProjectResult): boolean {
  if (project.error) return true;
  return project.results.some((result) => result.severity === "error" && result.findings.length > 0);
}
