import { createRequire } from "node:module";
import { dirname, isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { Plugin, Rule } from "@abap/ui5-blueprint-audit-types";
import corePlugin from "@abap/ui5-blueprint-audit-plugin-core";

const SUPPORTED_API_VERSION = "1";
const VALID_SEVERITIES = new Set<string>(["off", "warn", "error"]);

/** Like ConfigError: key/params for localized display, message as the English fallback. */
export class PluginLoadError extends Error {
  constructor(
    public readonly key: string,
    public readonly params: Record<string, string> | undefined,
    fallbackMessage: string,
  ) {
    super(fallbackMessage);
  }
}

function isLocalSpecifier(spec: string): boolean {
  return spec.startsWith("./") || spec.startsWith("../") || isAbsolute(spec);
}

function isValidRule(candidate: unknown): boolean {
  const rule = candidate as Partial<Rule> | null | undefined;
  const meta = rule?.meta as Partial<Rule["meta"]> | null | undefined;
  return (
    typeof rule?.check === "function" &&
    typeof meta === "object" &&
    meta !== null &&
    typeof meta.descriptionKey === "string" &&
    typeof meta.defaultSeverity === "string" &&
    VALID_SEVERITIES.has(meta.defaultSeverity) &&
    Array.isArray(meta.projectTypes)
  );
}

function validatePlugin(spec: string, candidate: unknown): Plugin {
  const plugin = candidate as Partial<Plugin> | undefined;
  if (
    !plugin ||
    typeof plugin.name !== "string" ||
    typeof plugin.apiVersion !== "string" ||
    typeof plugin.rules !== "object" ||
    plugin.rules === null
  ) {
    throw new PluginLoadError(
      "plugin.invalidDefaultExport",
      { spec },
      `Plugin "${spec}" has no valid default export ({ name, apiVersion, rules }).`,
    );
  }
  if (plugin.apiVersion !== SUPPORTED_API_VERSION) {
    throw new PluginLoadError(
      "plugin.unsupportedApiVersion",
      { name: plugin.name, apiVersion: plugin.apiVersion, supported: SUPPORTED_API_VERSION },
      `Plugin "${plugin.name}" declares apiVersion "${plugin.apiVersion}", supported is apiVersion "${SUPPORTED_API_VERSION}".`,
    );
  }
  for (const [ruleId, rule] of Object.entries(plugin.rules)) {
    if (!isValidRule(rule)) {
      throw new PluginLoadError(
        "plugin.invalidRule",
        { name: plugin.name, ruleId },
        `Plugin "${plugin.name}": rule "${ruleId}" needs meta ({ descriptionKey, defaultSeverity, projectTypes }) and a check function.`,
      );
    }
  }
  return plugin as Plugin;
}

/**
 * Loads a single plugin via dynamic import(). Local paths (./, ../, absolute) are resolved
 * relative to the config file, npm packages from the project directory (see CLAUDE.md,
 * "Plugins" section) — not from this tool's directory.
 */
async function loadOnePlugin(spec: string, configPath: string): Promise<Plugin> {
  let moduleUrl: string;

  if (isLocalSpecifier(spec)) {
    moduleUrl = pathToFileURL(resolve(dirname(configPath), spec)).href;
  } else {
    const require = createRequire(configPath);
    let resolved: string;
    try {
      resolved = require.resolve(spec);
    } catch {
      throw new PluginLoadError(
        "plugin.npmResolveFailed",
        { spec },
        `Plugin "${spec}" could not be resolved from the project directory.`,
      );
    }
    moduleUrl = pathToFileURL(resolved).href;
  }

  const imported = (await import(moduleUrl)) as { default?: unknown };
  return validatePlugin(spec, imported.default);
}

/**
 * Loads the core plugin (always, as the first element) plus the plugins given in the
 * config. The core plugin is a regular plugin with no special treatment (see CLAUDE.md,
 * "Architecture decisions").
 *
 * @param configPath - Path to the config file; local plugin specs are resolved relative to it.
 * @param pluginSpecs - The `plugins` entries from the config (local paths or npm package names).
 * @returns The core plugin followed by every configured plugin, in config order.
 * @throws {PluginLoadError} If a plugin can't be resolved/imported, or its default export is invalid.
 */
export async function loadPlugins(configPath: string, pluginSpecs: string[]): Promise<Plugin[]> {
  const extraPlugins = await Promise.all(pluginSpecs.map((spec) => loadOnePlugin(spec, configPath)));
  return [corePlugin, ...extraPlugins];
}

/**
 * Builds the flat rule map from all plugins. The first plugin (the core plugin) stays
 * unprefixed, every other plugin's rules get `<plugin>/<rule>` (see CLAUDE.md, "Namespacing").
 *
 * @param plugins - Plugins as returned by `loadPlugins`, core plugin first.
 * @returns Every rule, keyed by its effective (possibly prefixed) rule ID.
 */
export function buildRuleMap(plugins: Plugin[]): Record<string, Rule> {
  const map: Record<string, Rule> = {};
  plugins.forEach((plugin, index) => {
    const prefix = index === 0 ? "" : `${plugin.name}/`;
    for (const [ruleId, rule] of Object.entries(plugin.rules)) {
      map[`${prefix}${ruleId}`] = rule;
    }
  });
  return map;
}
