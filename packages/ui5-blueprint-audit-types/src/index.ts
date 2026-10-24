/** The UI5 project type a rule applies to: Freestyle, Fiori Elements, or Library. */
export type ProjectType = "fs" | "fe" | "lib";

/** A rule's active severity, or `"off"` to disable it. */
export type Severity = "off" | "warn" | "error";

/** The parsed contents of a project's `manifest.json`. */
export interface ManifestJson {
  [key: string]: unknown;
}

/** One entry of a project's file tree, as read by {@link ProjectContext.fileTree}. */
export interface FileTreeEntry {
  path: string;
  isDirectory: boolean;
}

/**
 * The central, read-once context of a UI5 project.
 * Rules never access the file system themselves — they only read from this context.
 */
export interface ProjectContext {
  projectRoot: string;
  projectType: ProjectType;
  manifest: ManifestJson | undefined;
  ui5Yaml: unknown;
  /** Further `ui5-*.yaml` files in the project root, parsed, keyed by file name (e.g. `"ui5-deploy.yaml"`). */
  ui5YamlExtensions: Record<string, unknown>;
  packageJson: Record<string, unknown> | undefined;
  indexHtml: string | undefined;
  fileTree: FileTreeEntry[];
  /** Reads a file relative to {@link projectRoot}, or `undefined` if it doesn't exist. */
  readFile(path: string): string | undefined;
}

/** A single violation reported by a rule via {@link RuleContext.report}. */
export interface Finding {
  ruleId: string;
  severity: Severity;
  message: string;
  file?: string;
  /** 1-indexed line number within {@link file}, if known. */
  line?: number;
  /** 1-indexed column number within {@link file}, if known. */
  column?: number;
}

/** A locale code, e.g. `"de"`, `"en"`, `"pt-BR"`. Deliberately not a closed union, so add-ons can register their own locales. */
export type LocaleCode = string;

/** Resolves a localized message for `key`, interpolating `params` into it. */
export interface Translator {
  (key: string, params?: Record<string, string | number>): string;
}

/** The context passed to a rule's {@link Rule.check} function. */
export interface RuleContext<TOptions = unknown> {
  projectContext: ProjectContext;
  options: TOptions;
  t: Translator;
  /** Reports one violation. `ruleId` and `severity` are filled in by the engine, not the rule. */
  report(finding: Omit<Finding, "ruleId" | "severity">): void;
}

/** Static metadata describing a rule, independent of any particular project. */
export interface RuleMeta {
  descriptionKey: string;
  defaultSeverity: Severity;
  /** The project types this rule runs for; the engine skips it for any other type. */
  projectTypes: ProjectType[];
}

/** A single check against a project's {@link ProjectContext}. */
export interface Rule<TOptions = unknown> {
  meta: RuleMeta;
  check(ctx: RuleContext<TOptions>): void | Promise<void>;
}

/** A loadable unit of rules (and optionally configs/locales), as declared by `plugins:` in `ui5-blueprint-audit.yaml`. */
export interface Plugin {
  name: string;
  apiVersion: string;
  rules: Record<string, Rule>;
  configs?: Record<string, Record<string, unknown>>;
  /** Translation bundles for this plugin's message keys, keyed by locale. This is how add-ons register new languages. */
  locales?: Record<LocaleCode, Record<string, string>>;
}

/** The merged translation bundles of all loaded plugins, as built by {@link buildLocaleRegistry}. */
export interface LocaleRegistry {
  bundles: Record<LocaleCode, Record<string, string>>;
  referenceLocale: LocaleCode;
}

/**
 * Merges the `locales` bundles of all given plugins (in load order; a later plugin can
 * override individual keys of an earlier one — this is the add-on patch mechanism).
 *
 * @param referenceLocale - The locale {@link createTranslator} falls back to when a key is missing elsewhere.
 */
export function buildLocaleRegistry(plugins: Plugin[], referenceLocale: LocaleCode = "en"): LocaleRegistry {
  const bundles: Record<LocaleCode, Record<string, string>> = {};
  for (const plugin of plugins) {
    for (const [locale, keyMap] of Object.entries(plugin.locales ?? {})) {
      bundles[locale] = { ...bundles[locale], ...keyMap };
    }
  }
  return { bundles, referenceLocale };
}

/**
 * Merges several {@link LocaleRegistry} objects (e.g. one per project in a multi-project
 * run, if different projects load different locale add-ons). A later registry overrides
 * individual keys of an earlier one, analogous to {@link buildLocaleRegistry}.
 */
export function mergeLocaleRegistries(registries: LocaleRegistry[], referenceLocale: LocaleCode = "en"): LocaleRegistry {
  const bundles: Record<LocaleCode, Record<string, string>> = {};
  for (const registry of registries) {
    for (const [locale, keyMap] of Object.entries(registry.bundles)) {
      bundles[locale] = { ...bundles[locale], ...keyMap };
    }
  }
  return { bundles, referenceLocale };
}

/** Lists the locales that have at least one bundle loaded in `registry`. */
export function availableLocales(registry: LocaleRegistry): LocaleCode[] {
  return Object.keys(registry.bundles);
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/**
 * Binds a {@link Translator} to a fixed locale. If a key is missing there, it falls back
 * to `registry.referenceLocale`, and finally to the raw key itself.
 */
export function createTranslator(registry: LocaleRegistry, locale: LocaleCode): Translator {
  return (key, params) => {
    const template = registry.bundles[locale]?.[key] ?? registry.bundles[registry.referenceLocale]?.[key] ?? key;
    return interpolate(template, params);
  };
}

/**
 * Throws if a requested locale is present in none of the loaded bundles (not even partially).
 *
 * @throws {Error} Listing the unknown locale(s) and the locales that are actually available.
 */
export function assertLocalesAvailable(registry: LocaleRegistry, requested: LocaleCode[]): void {
  const available = new Set(availableLocales(registry));
  const unknown = requested.filter((locale) => !available.has(locale));
  if (unknown.length > 0) {
    throw new Error(
      `Unbekannte Sprache(n): ${unknown.join(", ")}. Verfügbar: ${[...available].join(", ")}.`,
    );
  }
}
