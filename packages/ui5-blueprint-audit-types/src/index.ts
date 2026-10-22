export type ProjectType = "fs" | "fe" | "lib";

export type Severity = "off" | "warn" | "error";

export interface ManifestJson {
  [key: string]: unknown;
}

export interface FileTreeEntry {
  path: string;
  isDirectory: boolean;
}

/**
 * Zentraler, einmalig eingelesener Kontext eines UI5-Projekts.
 * Regeln greifen nicht selbst aufs Dateisystem zu, sondern lesen aus diesem Kontext.
 */
export interface ProjectContext {
  projectRoot: string;
  projectType: ProjectType;
  manifest: ManifestJson | undefined;
  ui5Yaml: unknown;
  /** Weitere `ui5-*.yaml`-Dateien im Projektroot, geparst, keyed nach Dateiname (z. B. "ui5-deploy.yaml"). */
  ui5YamlExtensions: Record<string, unknown>;
  packageJson: Record<string, unknown> | undefined;
  indexHtml: string | undefined;
  fileTree: FileTreeEntry[];
  readFile(path: string): string | undefined;
}

export interface Finding {
  ruleId: string;
  severity: Severity;
  message: string;
  file?: string;
  line?: number;
  column?: number;
}

/** Sprachcode, z. B. "de", "en", "pt-BR". Kein geschlossener Union-Typ, damit Add-ons eigene Sprachen registrieren können. */
export type LocaleCode = string;

export interface Translator {
  (key: string, params?: Record<string, string | number>): string;
}

export interface RuleContext<TOptions = unknown> {
  projectContext: ProjectContext;
  options: TOptions;
  t: Translator;
  report(finding: Omit<Finding, "ruleId" | "severity">): void;
}

export interface RuleMeta {
  descriptionKey: string;
  defaultSeverity: Severity;
  projectTypes: ProjectType[];
}

export interface Rule<TOptions = unknown> {
  meta: RuleMeta;
  check(ctx: RuleContext<TOptions>): void | Promise<void>;
}

export interface Plugin {
  name: string;
  apiVersion: string;
  rules: Record<string, Rule>;
  configs?: Record<string, Record<string, unknown>>;
  /** Übersetzungs-Bundles für die Message-Keys dieses Plugins, keyed nach Locale. Add-ons registrieren so neue Sprachen. */
  locales?: Record<LocaleCode, Record<string, string>>;
}

export interface LocaleRegistry {
  bundles: Record<LocaleCode, Record<string, string>>;
  referenceLocale: LocaleCode;
}

/**
 * Merged die `locales`-Bundles aller Plugins (in Ladereihenfolge; ein späteres Plugin
 * kann einzelne Keys eines früheren überschreiben — das ist der Add-on-Patch-Mechanismus).
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
 * Führt mehrere LocaleRegistry-Objekte zusammen (z. B. eine pro Projekt in einem
 * Mehrprojekt-Lauf, falls unterschiedliche Projekte unterschiedliche Locale-Add-ons
 * laden). Spätere Registries überschreiben einzelne Keys früherer, analog zu buildLocaleRegistry.
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

export function availableLocales(registry: LocaleRegistry): LocaleCode[] {
  return Object.keys(registry.bundles);
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/** Bindet einen Translator an eine feste Sprache. Fehlt ein Key dort, wird auf `referenceLocale` zurückgefallen, zuletzt auf den rohen Key selbst. */
export function createTranslator(registry: LocaleRegistry, locale: LocaleCode): Translator {
  return (key, params) => {
    const template = registry.bundles[locale]?.[key] ?? registry.bundles[registry.referenceLocale]?.[key] ?? key;
    return interpolate(template, params);
  };
}

/** Wirft, wenn eine angeforderte Sprache in KEINEM geladenen Bundle vorkommt (auch nicht teilweise). */
export function assertLocalesAvailable(registry: LocaleRegistry, requested: LocaleCode[]): void {
  const available = new Set(availableLocales(registry));
  const unknown = requested.filter((locale) => !available.has(locale));
  if (unknown.length > 0) {
    throw new Error(
      `Unbekannte Sprache(n): ${unknown.join(", ")}. Verfügbar: ${[...available].join(", ")}.`,
    );
  }
}
