import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";
import { getDefaultI18nBasePath, getI18nPrefix } from "../util/library.js";

interface Options {
  languages?: string[];
  strict?: boolean;
  basePath?: string;
}

/**
 * Checks that every required language is listed in `supportedLocales` (both `sap.app/i18n` and `sap.ui5/models/i18n/settings`, which UI5 doesn't keep in sync automatically) and has a corresponding `i18n_<xx>.properties` file - the base file is enough for the fallback language.
 *
 * Default severity: `error`. Project types: FS, FE, LIB.
 */
export const i18nLanguagesRule: Rule<Options> = {
  meta: {
    descriptionKey: "i18n-languages.description",
    defaultSeverity: "error",
    projectTypes: ["fs", "fe", "lib"],
  },
  check(ctx) {
    const projectContext = ctx.projectContext;
    const languages = ctx.options?.languages ?? ["de", "en"];
    const basePath = ctx.options?.basePath ?? getDefaultI18nBasePath(projectContext);
    if (!basePath) return; // Library ohne auflösbaren Namensraum (ui5.yaml#metadata.name) — nichts zu prüfen.

    const prefix = getI18nPrefix(projectContext);

    if (projectContext.projectType === "lib") {
      // Libraries deklarieren supportedLocales/fallbackLocale nirgends (kein manifest.json) —
      // UI5 lädt automatisch, welche messagebundle_<xx>.properties existieren. Da es keinen
      // deklarierten Fallback gibt, wird für jede vorgegebene Sprache eine eigene Datei
      // verlangt; die Basisdatei allein zählt hier bewusst nicht als Abdeckung.
      for (const lang of languages) {
        if (projectContext.readFile(`${basePath}/${prefix}_${lang}.properties`) === undefined) {
          ctx.report({
            message: ctx.t("i18n-languages.missingFile", { basePath, prefix, lang }),
            file: `${basePath}/${prefix}_${lang}.properties`,
          });
        }
      }
      return;
    }

    const strict = ctx.options?.strict ?? false;

    // sap.app/i18n (Descriptor-Ebene) und sap.ui5/models/i18n (Runtime-Model) sind getrennte
    // Manifest-Knoten, die UI5 nicht automatisch synchronisiert (siehe i18n-fallback) —
    // supportedLocales muss in beiden stehen.
    const sources = [
      { label: "sap.app/i18n", path: ["sap.app", "i18n"] },
      { label: "sap.ui5/models/i18n", path: ["sap.ui5", "models", "i18n", "settings"] },
    ] as const;

    const parsedSources = sources.map(({ label, path }) => {
      const raw = get(projectContext.manifest, ...path);
      const settings = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
      return {
        label,
        supportedLocales: Array.isArray(settings.supportedLocales) ? (settings.supportedLocales as string[]) : [],
      };
    });
    // Die physische Datei wird vom Runtime-Model geladen — dessen supportedLocales/fallbackLocale
    // bleiben dafür maßgeblich, unabhängig davon, was im Descriptor steht.
    const runtimeSettings = (get(projectContext.manifest, "sap.ui5", "models", "i18n", "settings") ?? {}) as Record<
      string,
      unknown
    >;
    const runtimeSupportedLocales = parsedSources[1]!.supportedLocales;
    const fallbackLocale = typeof runtimeSettings.fallbackLocale === "string" ? runtimeSettings.fallbackLocale : undefined;

    for (const lang of languages) {
      for (const { label, supportedLocales } of parsedSources) {
        if (!supportedLocales.includes(lang)) {
          ctx.report({
            message: ctx.t("i18n-languages.missingSupportedLocale", { source: label, lang }),
            file: "webapp/manifest.json",
          });
        }
      }

      if (!runtimeSupportedLocales.includes(lang)) continue;

      const fileNeeded = lang !== fallbackLocale;
      if (fileNeeded && projectContext.readFile(`${basePath}/${prefix}_${lang}.properties`) === undefined) {
        ctx.report({
          message: ctx.t("i18n-languages.missingFile", { basePath, prefix, lang }),
          file: `${basePath}/${prefix}_${lang}.properties`,
        });
      }
    }

    if (strict) {
      for (const { label, supportedLocales } of parsedSources) {
        const extra = supportedLocales.filter((lang) => !languages.includes(lang));
        for (const lang of extra) {
          ctx.report({
            message: ctx.t("i18n-languages.extraLanguage", { source: label, lang }),
            file: "webapp/manifest.json",
          });
        }
      }
    }
  },
};
