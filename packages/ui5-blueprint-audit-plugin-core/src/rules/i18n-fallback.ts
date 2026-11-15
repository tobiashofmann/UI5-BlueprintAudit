import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";

interface Options {
  value?: string;
}

/**
 * Checks that a fallback language is configured consistently: `fallbackLocale` matches `value` and is included in `supportedLocales`, checked in both `sap.app/i18n` and `sap.ui5/models/i18n/settings` (UI5 doesn't keep these in sync automatically).
 *
 * Default severity: `warn`. Project types: FS, FE.
 */
export const i18nFallbackRule: Rule<Options> = {
  meta: {
    descriptionKey: "i18n-fallback.description",
    defaultSeverity: "warn",
    // Not for LIB: libraries have no manifest.json and therefore no configurable
    // fallbackLocale — by UI5 convention the base file (messagebundle.properties) is always
    // the fallback there, so there is nothing that could be misconfigured.
    projectTypes: ["fs", "fe"],
  },
  check(ctx) {
    const expected = ctx.options?.value ?? "en";

    // sap.app/i18n (descriptor level, used among other things to resolve sap.app/title and
    // sap.app/description by tools without a running UI5 runtime) and sap.ui5/models/i18n
    // (the runtime ResourceModel for {i18n>...} bindings in views/controllers) are separate
    // manifest nodes that UI5 does not keep in sync automatically. Both have to set
    // fallbackLocale explicitly; otherwise one channel behaves differently from the other
    // for unsupported languages.
    const sources: Array<{ label: string; path: string[] }> = [
      { label: "sap.app/i18n", path: ["sap.app", "i18n"] },
      { label: "sap.ui5/models/i18n", path: ["sap.ui5", "models", "i18n", "settings"] },
    ];

    for (const { label, path } of sources) {
      const raw = get(ctx.projectContext.manifest, ...path);
      const settings = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
      const fallbackLocale = settings.fallbackLocale;
      const supportedLocales = Array.isArray(settings.supportedLocales) ? (settings.supportedLocales as string[]) : [];

      if (fallbackLocale !== expected) {
        ctx.report({
          message: ctx.t("i18n-fallback.wrongFallback", { source: label, fallbackLocale: String(fallbackLocale), expected }),
          file: "webapp/manifest.json",
        });
        continue;
      }
      if (!supportedLocales.includes(expected)) {
        ctx.report({
          message: ctx.t("i18n-fallback.notInSupported", { source: label, expected }),
          file: "webapp/manifest.json",
        });
      }
    }
  },
};
