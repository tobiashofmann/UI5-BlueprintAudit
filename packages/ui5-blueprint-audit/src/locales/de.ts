import type en from "./en.js";

/** German translation of the CLI/reporters/engine's own labels; see `en.ts` for the reference bundle. */
const de: Record<keyof typeof en, string> = {
  "report.title": "UI5 BlueprintAudit Report",
  "report.generatedAt": "Erstellt: {date}",
  "report.summary": "Zusammenfassung",
  "report.details": "Details",
  "report.projectType": "Projekttyp: {type}",
  "report.loadError": "Fehler beim Laden des Projekts: {error}",
  "report.col.project": "Projekt",
  "report.col.type": "Typ",
  "report.col.errors": "Fehler",
  "report.col.warnings": "Warnungen",
  "report.col.status": "Status",
  "report.col.rule": "Regel",
  "report.col.description": "Beschreibung",
  "report.col.severity": "Severity",
  "report.col.findings": "Findings",
  "report.badge.ok": "OK",
  "report.badge.warn": "Warnung",
  "report.badge.error": "Fehler",

  "config.missingProjectType":
    'Kein Projekttyp angegeben. Setze --type fs|fe|lib auf der Kommandozeile oder "projectType" in {configPath}.',
  "config.invalidProjectType": 'Ungültiger Projekttyp "{projectType}". Erlaubt sind: {types}.',
  "config.unknownLanguage": "Unbekannte Sprache(n): {requested}. Verfügbar: {available}.",
  "config.notAMapping": "{configPath} muss ein YAML-Mapping enthalten.",
  "config.invalidLanguages": '"languages" in {configPath} muss eine Liste von Sprachcodes sein, z. B. [de, en].',
  "config.invalidPlugins": '"plugins" in {configPath} muss eine Liste von Plugin-Pfaden oder Paketnamen sein.',
  "config.invalidRules": '"rules" in {configPath} muss ein Mapping von Regel-ID auf Severity sein.',
  "config.invalidRuleConfig":
    'Ungültige Konfiguration für Regel "{ruleId}". Erwartet wird {severities} oder eine Liste [Severity, Optionen].',
  "config.unknownRule": "Unbekannte Regel(n) in der Konfiguration: {rules}.",

  "context.unparseableFile": "{file} konnte nicht gelesen werden: {error}",

  "plugin.invalidDefaultExport": 'Plugin "{spec}" hat keinen gültigen Default-Export ({{ name, apiVersion, rules }}).',
  "plugin.unsupportedApiVersion":
    'Plugin "{name}" deklariert apiVersion "{apiVersion}", unterstützt wird apiVersion "{supported}".',
  "plugin.npmResolveFailed": 'Plugin "{spec}" konnte nicht aus dem Projektverzeichnis aufgelöst werden.',
  "plugin.invalidRule":
    'Plugin "{name}": Regel "{ruleId}" braucht meta ({{ descriptionKey, defaultSeverity, projectTypes }}) und eine check-Funktion.',

  "engine.unexpectedError": "Unerwarteter Fehler: {error}",
  "engine.ruleCrashed": "Die Regel ist abgestürzt und konnte nicht ausgewertet werden: {error}",
};

export default de;
