import type { Finding, LocaleCode, LocaleRegistry, ProjectType, Severity } from "@abap/ui5-blueprint-audit-types";

export interface RuleResult {
  ruleId: string;
  description: string;
  severity: Severity;
  findings: Finding[];
}

export interface ProjectResult {
  projectDir: string;
  projectName: string;
  projectType?: ProjectType;
  /** Gesetzt, wenn Config/Context nicht geladen werden konnten (z. B. fehlender Projekttyp). */
  error?: string;
  results: RuleResult[];
}

/** Ergebnis eines Projekts, einmal pro aktiver Ausgabesprache (immer inkl. "en", siehe runProject). */
export type ProjectResultsByLocale = Record<LocaleCode, ProjectResult>;

/**
 * Rückgabe von runProject: die Ergebnisse pro Sprache plus die für dieses Projekt
 * zusammengeführte LocaleRegistry (Kern- + geladene Plugins, inkl. etwaiger
 * Locale-Add-ons). Reporter nutzen die Registry, um auch ihre eigenen Report-Chrome-
 * Labels (Titel, Spaltenüberschriften etc.) in einer Add-on-Sprache darzustellen.
 */
export interface RunProjectResult {
  byLocale: ProjectResultsByLocale;
  registry: LocaleRegistry;
}

export function hasErrorFindings(project: ProjectResult): boolean {
  if (project.error) return true;
  return project.results.some((result) => result.severity === "error" && result.findings.length > 0);
}
