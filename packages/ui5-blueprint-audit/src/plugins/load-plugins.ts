import { createRequire } from "node:module";
import { dirname, isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { Plugin, Rule } from "@abap/ui5-blueprint-audit-types";
import corePlugin from "@abap/ui5-blueprint-audit-plugin-core";

const SUPPORTED_API_VERSION = "1";

/** Wie ConfigError: key/params für lokalisierte Darstellung, message als englischer Fallback. */
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
  return plugin as Plugin;
}

/**
 * Lädt ein einzelnes Plugin per dynamischem import(). Lokale Pfade (./, ../, absolut)
 * werden relativ zur Config-Datei aufgelöst, NPM-Pakete aus dem Projektverzeichnis
 * (siehe CLAUDE.md, Abschnitt "Plugins") — nicht aus dem Verzeichnis dieses Tools.
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
 * Lädt das Kern-Plugin (immer, als erstes Element) plus die in der Config angegebenen
 * Plugins. Das Kern-Plugin ist dabei ein normales Plugin ohne Sonderbehandlung
 * (siehe CLAUDE.md, Abschnitt "Architekturentscheidungen").
 */
export async function loadPlugins(configPath: string, pluginSpecs: string[]): Promise<Plugin[]> {
  const extraPlugins = await Promise.all(pluginSpecs.map((spec) => loadOnePlugin(spec, configPath)));
  return [corePlugin, ...extraPlugins];
}

/**
 * Baut die flache Regel-Map aus allen Plugins. Das erste Plugin (Kern-Plugin) bleibt
 * ohne Präfix, alle weiteren bekommen `<plugin>/<regel>` (siehe CLAUDE.md, "Namespacing").
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
