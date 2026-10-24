import type { Severity } from "@abap/ui5-blueprint-audit-types";
import type { RuleConfigEntry, RuleConfigValue } from "./types.js";

/** A rule's default severity, as declared by the plugin that registers it. */
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
 * Merges the loaded plugins' rule defaults with the overrides from the config file.
 * The config only overrides what it explicitly specifies (see CLAUDE.md, "Configuration"
 * section); a rule without an override keeps its default severity and no options.
 *
 * @param defaults - Default severity per rule ID, as declared by the loaded plugins.
 * @param overrides - Raw `rules` entries from the config file, keyed by rule ID.
 * @returns The effective severity (and options, if given) per rule ID.
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
