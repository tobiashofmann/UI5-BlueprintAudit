import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import type { LocaleCode, ProjectType, Severity } from "@abap/ui5-blueprint-audit-types";
import type { RawConfig, ResolvedConfig } from "./types.js";

const VALID_PROJECT_TYPES: ProjectType[] = ["fs", "fe", "lib"];
const VALID_SEVERITIES: Severity[] = ["off", "warn", "error"];
const DEFAULT_LANGUAGES: LocaleCode[] = ["de", "en"];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isSeverity(value: unknown): value is Severity {
  return VALID_SEVERITIES.includes(value as Severity);
}

/** A rule entry is either a severity, or a list `[severity]` / `[severity, options]`. */
function isRuleConfigValue(value: unknown): boolean {
  if (isSeverity(value)) return true;
  if (!Array.isArray(value) || value.length < 1 || value.length > 2) return false;
  return isSeverity(value[0]) && (value.length === 1 || isPlainObject(value[1]));
}

/**
 * Validates the shape of the parsed config file. Without this, a misspelled severity
 * (e.g. `eror`) would still run the rule but never count as an error, silently turning
 * a failing audit green.
 *
 * @throws {ConfigError} Naming the first invalid part of the config.
 */
function validateRawConfig(parsed: unknown, configPath: string): RawConfig {
  if (!isPlainObject(parsed)) {
    throw new ConfigError("config.notAMapping", { configPath }, `${configPath} must contain a YAML mapping.`);
  }
  if (parsed.languages !== undefined && !isStringArray(parsed.languages)) {
    throw new ConfigError(
      "config.invalidLanguages",
      { configPath },
      `"languages" in ${configPath} must be a list of language codes, e.g. [de, en].`,
    );
  }
  if (parsed.plugins !== undefined && !isStringArray(parsed.plugins)) {
    throw new ConfigError(
      "config.invalidPlugins",
      { configPath },
      `"plugins" in ${configPath} must be a list of plugin paths or package names.`,
    );
  }
  if (parsed.rules !== undefined) {
    if (!isPlainObject(parsed.rules)) {
      throw new ConfigError(
        "config.invalidRules",
        { configPath },
        `"rules" in ${configPath} must be a mapping of rule ID to severity.`,
      );
    }
    for (const [ruleId, value] of Object.entries(parsed.rules)) {
      if (!isRuleConfigValue(value)) {
        throw new ConfigError(
          "config.invalidRuleConfig",
          { ruleId, severities: VALID_SEVERITIES.join(", ") },
          `Invalid configuration for rule "${ruleId}". Expected one of ${VALID_SEVERITIES.join(", ")}, or a list [severity, options].`,
        );
      }
    }
  }
  return parsed as RawConfig;
}

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
 * @throws {ConfigError} If the config file has an invalid shape (e.g. a misspelled severity),
 *   no project type is specified, or an invalid one is given.
 */
export function loadConfig(projectRoot: string, options: LoadConfigOptions = {}): ResolvedConfig {
  const configPath = resolve(projectRoot, options.configPath ?? "ui5-blueprint-audit.yaml");

  const raw: RawConfig = existsSync(configPath)
    ? validateRawConfig(parse(readFileSync(configPath, "utf8")) ?? {}, configPath)
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
