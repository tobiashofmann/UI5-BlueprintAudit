/**
 * English reference bundle for the CLI/reporters/engine's own labels and error messages
 * (as opposed to the rule-specific messages, which live in @abap/ui5-blueprint-audit-plugin-core).
 */
const en = {
  "report.title": "UI5 BlueprintAudit Report",
  "report.generatedAt": "Generated: {date}",
  "report.summary": "Summary",
  "report.details": "Details",
  "report.projectType": "Project type: {type}",
  "report.loadError": "Error loading project: {error}",
  "report.col.project": "Project",
  "report.col.type": "Type",
  "report.col.errors": "Errors",
  "report.col.warnings": "Warnings",
  "report.col.status": "Status",
  "report.col.rule": "Rule",
  "report.col.description": "Description",
  "report.col.severity": "Severity",
  "report.col.findings": "Findings",
  "report.badge.ok": "OK",
  "report.badge.warn": "Warning",
  "report.badge.error": "Error",

  "config.missingProjectType":
    'No project type specified. Set --type fs|fe|lib on the command line or "projectType" in {configPath}.',
  "config.invalidProjectType": 'Invalid project type "{projectType}". Allowed: {types}.',
  "config.unknownLanguage": "Unknown language(s): {requested}. Available: {available}.",
  "config.notAMapping": "{configPath} must contain a YAML mapping.",
  "config.invalidLanguages": '"languages" in {configPath} must be a list of language codes, e.g. [de, en].',
  "config.invalidPlugins": '"plugins" in {configPath} must be a list of plugin paths or package names.',
  "config.invalidRules": '"rules" in {configPath} must be a mapping of rule ID to severity.',
  "config.invalidRuleConfig":
    'Invalid configuration for rule "{ruleId}". Expected one of {severities}, or a list [severity, options].',
  "config.unknownRule": "Unknown rule(s) in the configuration: {rules}.",

  "context.unparseableFile": "{file} could not be parsed: {error}",

  "plugin.invalidDefaultExport": 'Plugin "{spec}" has no valid default export ({{ name, apiVersion, rules }}).',
  "plugin.unsupportedApiVersion":
    'Plugin "{name}" declares apiVersion "{apiVersion}", supported is apiVersion "{supported}".',
  "plugin.npmResolveFailed": 'Plugin "{spec}" could not be resolved from the project directory.',
  "plugin.invalidRule":
    'Plugin "{name}": rule "{ruleId}" needs meta ({{ descriptionKey, defaultSeverity, projectTypes }}) and a check function.',

  "engine.unexpectedError": "Unexpected error: {error}",
  "engine.ruleCrashed": "The rule crashed and could not be evaluated: {error}",
} as const;

export default en;
