import { basename } from "node:path";
import type { LocaleCode, ProjectType } from "@abap/ui5-blueprint-audit-types";
import { availableLocales, buildLocaleRegistry, createTranslator } from "@abap/ui5-blueprint-audit-types";
import { ConfigError, loadConfig } from "../config/load-config.js";
import { mergeRuleConfig, type RuleDefault } from "../config/merge-rule-config.js";
import { loadProjectContext } from "../context/load-project-context.js";
import { buildRuleMap, loadPlugins, PluginLoadError } from "../plugins/load-plugins.js";
import { cliLocalesPlugin } from "../locales/index.js";
import type { ProjectResultsByLocale, RunProjectResult, RuleResult } from "./types.js";

export interface RunProjectOptions {
  cliProjectType?: ProjectType;
  cliLanguages?: LocaleCode[];
  configFileName?: string;
}

function translateError(
  error: unknown,
  locale: LocaleCode,
  cliRegistry: ReturnType<typeof buildLocaleRegistry>,
): string {
  const t = createTranslator(cliRegistry, locale);
  if (error instanceof ConfigError || error instanceof PluginLoadError) {
    return t(error.key, error.params);
  }
  return t("engine.unexpectedError", { error: String(error) });
}

/**
 * Baut einen Fehler-Eintrag für jede ursprünglich angeforderte Sprache (plus immer "en").
 * Eine Sprache ohne eigenes Bundle (z. B. ein Tippfehler in --lang) bekommt trotzdem einen
 * Eintrag unter ihrem eigenen Locale-Key, gerendert in "en" als bestmöglicher Fallback —
 * sonst verschwindet der Fehler für genau die Sprache, die der Nutzer angefordert hat
 * (leeres report_<locale>.md statt der Fehlermeldung).
 */
function errorResultForAllLocales(
  requestedLocales: LocaleCode[],
  availableLocaleSet: Set<LocaleCode>,
  projectDir: string,
  projectName: string,
  error: unknown,
  projectType?: ProjectType,
): ProjectResultsByLocale {
  const cliRegistry = buildLocaleRegistry([cliLocalesPlugin], "en");
  const locales = requestedLocales.includes("en") ? requestedLocales : [...requestedLocales, "en"];
  const resultsByLocale: ProjectResultsByLocale = {};
  for (const locale of locales) {
    const renderLocale = availableLocaleSet.has(locale) ? locale : "en";
    resultsByLocale[locale] = {
      projectDir,
      projectName,
      projectType,
      error: translateError(error, renderLocale, cliRegistry),
      results: [],
    };
  }
  return resultsByLocale;
}

export async function runProject(projectDir: string, options: RunProjectOptions = {}): Promise<RunProjectResult> {
  const projectName = basename(projectDir);
  const cliOnlyRegistry = buildLocaleRegistry([cliLocalesPlugin], "en");

  let config;
  try {
    config = loadConfig(projectDir, {
      cliProjectType: options.cliProjectType,
      cliLanguages: options.cliLanguages,
      configPath: options.configFileName,
    });
  } catch (error) {
    const cliOnlyAvailable = new Set(availableLocales(cliOnlyRegistry));
    return {
      byLocale: errorResultForAllLocales(
        options.cliLanguages ?? ["de", "en"],
        cliOnlyAvailable,
        projectDir,
        projectName,
        error,
      ),
      registry: cliOnlyRegistry,
    };
  }

  let plugins;
  try {
    plugins = await loadPlugins(config.configPath, config.plugins);
  } catch (error) {
    const cliOnlyAvailable = new Set(availableLocales(cliOnlyRegistry));
    return {
      byLocale: errorResultForAllLocales(
        config.languages,
        cliOnlyAvailable,
        projectDir,
        projectName,
        error,
        config.projectType,
      ),
      registry: cliOnlyRegistry,
    };
  }

  const registry = buildLocaleRegistry([...plugins, cliLocalesPlugin], "en");
  const available = new Set(availableLocales(registry));
  const invalidLanguages = config.languages.filter((locale) => !available.has(locale));

  if (invalidLanguages.length > 0) {
    const error = new ConfigError(
      "config.unknownLanguage",
      { requested: invalidLanguages.join(", "), available: [...available].join(", ") },
      `Unknown language(s): ${invalidLanguages.join(", ")}. Available: ${[...available].join(", ")}.`,
    );
    return {
      byLocale: errorResultForAllLocales(config.languages, available, projectDir, projectName, error, config.projectType),
      registry,
    };
  }

  const ruleMap = buildRuleMap(plugins);
  const ruleDefaults: Record<string, RuleDefault> = {};
  for (const [ruleId, rule] of Object.entries(ruleMap)) {
    ruleDefaults[ruleId] = { severity: rule.meta.defaultSeverity };
  }
  const resolvedRules = mergeRuleConfig(ruleDefaults, config.rules);

  const projectContext = loadProjectContext(projectDir, config.projectType);

  // "en" läuft immer mit, auch wenn der Nutzer es nicht konfiguriert hat — report.xml ist
  // immer Englisch und braucht dafür eine ProjectResult-Quelle (siehe CLAUDE.md, Lokalisierung).
  const localesToRun = config.languages.includes("en") ? config.languages : [...config.languages, "en"];

  const resultsByLocale: ProjectResultsByLocale = {};
  for (const locale of localesToRun) {
    const t = createTranslator(registry, locale);
    const results: RuleResult[] = [];
    for (const [ruleId, rule] of Object.entries(ruleMap)) {
      if (!rule.meta.projectTypes.includes(config.projectType)) continue;
      const entry = resolvedRules[ruleId];
      if (!entry || entry.severity === "off") continue;

      const findings: RuleResult["findings"] = [];
      await rule.check({
        projectContext,
        options: entry.options ?? {},
        t,
        report: (finding) => findings.push({ ...finding, ruleId, severity: entry.severity }),
      });

      results.push({ ruleId, description: t(rule.meta.descriptionKey), severity: entry.severity, findings });
    }
    resultsByLocale[locale] = { projectDir, projectName, projectType: config.projectType, results };
  }

  return { byLocale: resultsByLocale, registry };
}
