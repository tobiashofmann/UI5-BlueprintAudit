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
    if (!basePath) return; // Library without a resolvable namespace (ui5.yaml#metadata.name) — nothing to check.

    const prefix = getI18nPrefix(projectContext);

    if (projectContext.projectType === "lib") {
      // Libraries declare supportedLocales/fallbackLocale nowhere (no manifest.json) — UI5
      // automatically loads whichever messagebundle_<xx>.properties exist. As there is no
      // declared fallback, every required language needs its own file; the base file alone
      // deliberately does not count as coverage here.
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

    // sap.app/i18n (descriptor level) and sap.ui5/models/i18n (runtime model) are separate
    // manifest nodes that UI5 does not keep in sync automatically (see i18n-fallback) —
    // supportedLocales has to be listed in both.
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
    // The physical file is loaded by the runtime model — its supportedLocales/fallbackLocale
    // stay authoritative for that, regardless of what the descriptor says.
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
