import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import type { LocaleCode, ProjectType } from "@abap/ui5-blueprint-audit-types";
import type { RawConfig, ResolvedConfig } from "./types.js";

const VALID_PROJECT_TYPES: ProjectType[] = ["fs", "fe", "lib"];
const DEFAULT_LANGUAGES: LocaleCode[] = ["de", "en"];

/**
 * Fehler beim Einlesen/Validieren der Config, bevor Plugins geladen sind. `key`/`params`
 * erlauben eine lokalisierte Darstellung über den Translator; `message` bleibt ein
 * garantiert vorhandener englischer Fallback-Text (z. B. für Logs ohne Locale-Kontext).
 */
export class ConfigError extends Error {
  constructor(
    public readonly key: string,
    public readonly params: Record<string, string> | undefined,
    fallbackMessage: string,
  ) {
    super(fallbackMessage);
  }
}

export interface LoadConfigOptions {
  /** Pfad zur Config-Datei, relativ zu projectRoot. Default: "ui5-blueprint-audit.yaml". */
  configPath?: string;
  /** Projekttyp von der Kommandozeile (--type). Hat Vorrang vor projectType in der Config. */
  cliProjectType?: ProjectType;
  /** Ausgabesprachen von der Kommandozeile (--lang). Hat Vorrang vor languages in der Config. */
  cliLanguages?: LocaleCode[];
}

export function loadConfig(projectRoot: string, options: LoadConfigOptions = {}): ResolvedConfig {
  const configPath = resolve(projectRoot, options.configPath ?? "ui5-blueprint-audit.yaml");

  const raw: RawConfig = existsSync(configPath)
    ? ((parse(readFileSync(configPath, "utf8")) ?? {}) as RawConfig)
    : {};

  const projectType = options.cliProjectType ?? raw.projectType;
  if (!projectType) {
    throw new ConfigError(
      "config.missingProjectType",
      { configPath },
      `No project type specified. Set --type fs|fe|lib on the command line or "projectType" in ${configPath}.`,
    );
  }
  if (!VALID_PROJECT_TYPES.includes(projectType)) {
    throw new ConfigError(
      "config.invalidProjectType",
      { projectType, types: VALID_PROJECT_TYPES.join(", ") },
      `Invalid project type "${projectType}". Allowed: ${VALID_PROJECT_TYPES.join(", ")}.`,
    );
  }

  const languages = options.cliLanguages ?? raw.languages ?? DEFAULT_LANGUAGES;

  return {
    projectType,
    languages,
    plugins: raw.plugins ?? [],
    rules: raw.rules ?? {},
    configPath,
  };
}
