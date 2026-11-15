import { dirname, isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { resolve as resolveEsm } from "import-meta-resolve";
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
 * Resolves an npm package name to a file URL, as `import` would from a module in the
 * project: ESM conditions (`import`, `default`), so packages that only declare an `import`
 * condition in `exports` work, and a dual package resolves to its ESM build. `require.resolve`
 * can't be used for this (CommonJS conditions), and `import.meta.resolve(spec, parent)` needs
 * an experimental flag on current Node versions, hence the `import-meta-resolve` ponyfill.
 *
 * @throws {PluginLoadError} With a distinct key for "not installed", "installed but not
 *   exported under that name", and any other resolution failure (with Node's reason).
 */
function resolveNpmPlugin(spec: string, configPath: string): string {
  try {
    return resolveEsm(spec, pathToFileURL(configPath).href);
  } catch (error) {
    const code = (error as { code?: unknown } | null)?.code;
    if (code === "ERR_MODULE_NOT_FOUND") {
      throw new PluginLoadError(
        "plugin.npmResolveFailed",
        { spec },
        `Plugin "${spec}" could not be resolved from the project directory.`,
      );
    }
    if (code === "ERR_PACKAGE_PATH_NOT_EXPORTED") {
      throw new PluginLoadError(
        "plugin.npmNotExported",
        { spec },
        `Plugin "${spec}" is installed, but its package.json "exports" does not export it for ESM "import".`,
      );
    }
    const reason = error instanceof Error ? error.message : String(error);
    throw new PluginLoadError(
      "plugin.npmResolveError",
      { spec, error: reason },
      `Plugin "${spec}" could not be resolved: ${reason}`,
    );
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * `import()` of a CommonJS module puts `module.exports` into `default`. A plugin compiled
 * to CommonJS with `exports.default = plugin` (TypeScript's default output) therefore
 * arrives as `{ default: plugin }`. Unwrap that, but leave a real plugin object alone.
 */
function unwrapDefaultExport(candidate: unknown): unknown {
  if (isObject(candidate) && !("rules" in candidate) && isObject(candidate.default)) {
    return candidate.default;
  }
  return candidate;
}

/**
 * Loads a single plugin via dynamic import(). Local paths (./, ../, absolute) are resolved
 * relative to the config file, npm packages from the project directory (see CLAUDE.md,
 * "Plugins" section) — not from this tool's directory. Both ESM and CommonJS plugins work.
 */
async function loadOnePlugin(spec: string, configPath: string): Promise<Plugin> {
  const moduleUrl = isLocalSpecifier(spec)
    ? pathToFileURL(resolve(dirname(configPath), spec)).href
    : resolveNpmPlugin(spec, configPath);

  const imported = (await import(moduleUrl)) as { default?: unknown };
  return validatePlugin(spec, unwrapDefaultExport(imported.default));
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
