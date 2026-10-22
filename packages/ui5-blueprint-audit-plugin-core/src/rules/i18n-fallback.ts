import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";

interface Options {
  value?: string;
}

export const i18nFallbackRule: Rule<Options> = {
  meta: {
    descriptionKey: "i18n-fallback.description",
    defaultSeverity: "warn",
    // Nicht für LIB: Libraries haben kein manifest.json und damit kein konfigurierbares
    // fallbackLocale — die Basisdatei (messagebundle.properties) ist dort per UI5-Konvention
    // immer der Fallback, es gibt nichts, das falsch konfiguriert werden könnte.
    projectTypes: ["fs", "fe"],
  },
  check(ctx) {
    const expected = ctx.options?.value ?? "en";

    // sap.app/i18n (Descriptor-Ebene, u. a. für die Auflösung von sap.app/title und
    // sap.app/description durch Tools ohne laufende UI5-Runtime) und
    // sap.ui5/models/i18n (das Runtime-ResourceModel für {i18n>...}-Bindings in Views/
    // Controllern) sind getrennte Manifest-Knoten, die UI5 nicht automatisch synchronisiert.
    // Beide müssen fallbackLocale explizit setzen, sonst verhält sich der eine Kanal für
    // nicht unterstützte Sprachen anders als der andere.
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
