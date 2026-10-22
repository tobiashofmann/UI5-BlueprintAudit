import type { LocaleCode, ProjectType, Severity } from "@abap/ui5-blueprint-audit-types";

export type RuleConfigValue = Severity | [Severity, Record<string, unknown>];

export interface RawConfig {
  projectType?: ProjectType;
  languages?: LocaleCode[];
  plugins?: string[];
  rules?: Record<string, RuleConfigValue>;
}

export interface RuleConfigEntry {
  severity: Severity;
  options?: Record<string, unknown>;
}

/**
 * Konfiguration nach dem Einlesen der ui5-blueprint-audit.yaml, mit aufgelöstem Projekttyp
 * und aufgelösten Ausgabesprachen (CLI hat jeweils Vorrang vor der Config-Datei).
 */
export interface ResolvedConfig {
  projectType: ProjectType;
  languages: LocaleCode[];
  plugins: string[];
  rules: Record<string, RuleConfigValue>;
  configPath: string;
}
