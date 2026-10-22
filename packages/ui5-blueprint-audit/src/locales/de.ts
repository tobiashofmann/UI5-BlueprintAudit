import type en from "./en.js";

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

  "plugin.invalidDefaultExport": 'Plugin "{spec}" hat keinen gültigen Default-Export ({{ name, apiVersion, rules }}).',
  "plugin.unsupportedApiVersion":
    'Plugin "{name}" deklariert apiVersion "{apiVersion}", unterstützt wird apiVersion "{supported}".',
  "plugin.npmResolveFailed": 'Plugin "{spec}" konnte nicht aus dem Projektverzeichnis aufgelöst werden.',

  "engine.unexpectedError": "Unerwarteter Fehler: {error}",
};

export default de;
