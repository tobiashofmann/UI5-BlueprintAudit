import type { LocaleCode, ProjectType, Severity } from "@abap/ui5-blueprint-audit-types";

/** A rule's config value: either just a severity, or `[severity, options]`. */
export type RuleConfigValue = Severity | [Severity, Record<string, unknown>];

/** The shape of `ui5-blueprint-audit.yaml` as parsed, before CLI options are applied. */
export interface RawConfig {
  projectType?: ProjectType;
  languages?: LocaleCode[];
  plugins?: string[];
  rules?: Record<string, RuleConfigValue>;
}

/** A rule's effective severity and options, after merging config overrides with defaults. */
export interface RuleConfigEntry {
  severity: Severity;
  options?: Record<string, unknown>;
}

/**
 * Config after reading ui5-blueprint-audit.yaml, with the project type and output
 * languages resolved (CLI options take precedence over the config file in each case).
 */
export interface ResolvedConfig {
  projectType: ProjectType;
  languages: LocaleCode[];
  plugins: string[];
  rules: Record<string, RuleConfigValue>;
  configPath: string;
}
