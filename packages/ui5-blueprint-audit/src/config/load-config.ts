import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import type { LocaleCode, ProjectType } from "@abap/ui5-blueprint-audit-types";
import type { RawConfig, ResolvedConfig } from "./types.js";

const VALID_PROJECT_TYPES: ProjectType[] = ["fs", "fe", "lib"];
const DEFAULT_LANGUAGES: LocaleCode[] = ["de", "en"];

/**
 * Error reading/validating the config, before plugins are loaded. `key`/`params`
 * allow a localized display via the translator; `message` stays a guaranteed
 * English fallback text (e.g. for logs without locale context).
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
  /** Path to the config file, relative to projectRoot. Default: "ui5-blueprint-audit.yaml". */
  configPath?: string;
  /** Project type from the command line (--type). Takes precedence over projectType in the config. */
  cliProjectType?: ProjectType;
  /** Output languages from the command line (--lang). Takes precedence over languages in the config. */
  cliLanguages?: LocaleCode[];
}

/**
 * Reads and validates `ui5-blueprint-audit.yaml` (or the configured path) for a project,
 * resolving the project type and output languages with CLI options taking precedence
 * over the config file. Missing files are treated as an empty config, not an error —
 * only a missing/invalid project type throws.
 *
 * @param projectRoot - Absolute path to the project directory the config is read from.
 * @returns The resolved config, ready for plugin loading and rule evaluation.
 * @throws {ConfigError} If no project type is specified, or an invalid one is given.
 */
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
