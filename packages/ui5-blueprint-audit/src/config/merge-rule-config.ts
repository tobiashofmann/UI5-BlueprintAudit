import type { Severity } from "@abap/ui5-blueprint-audit-types";
import type { RuleConfigEntry, RuleConfigValue } from "./types.js";

export interface RuleDefault {
  severity: Severity;
}

function normalize(value: RuleConfigValue): RuleConfigEntry {
  if (Array.isArray(value)) {
    const [severity, options] = value;
    return { severity, options };
  }
  return { severity: value };
}

/**
 * Führt die Regel-Defaults der geladenen Plugins mit den Overrides aus der Config zusammen.
 * Die Config überschreibt nur, was sie angibt (siehe CLAUDE.md, Abschnitt "Konfiguration");
 * eine Regel ohne Override behält ihren Default.
 */
export function mergeRuleConfig(
  defaults: Record<string, RuleDefault>,
  overrides: Record<string, RuleConfigValue>,
): Record<string, RuleConfigEntry> {
  const merged: Record<string, RuleConfigEntry> = {};

  for (const [ruleId, ruleDefault] of Object.entries(defaults)) {
    merged[ruleId] = { severity: ruleDefault.severity };
  }

  for (const [ruleId, value] of Object.entries(overrides)) {
    merged[ruleId] = normalize(value);
  }

  return merged;
}
