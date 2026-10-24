import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";
import { getDefaultI18nBasePath, getI18nPrefix } from "../util/library.js";

interface Options {
  basePath?: string;
}

/**
 * Checks that i18n is actually used: an i18n model is configured in the manifest and the base `i18n.properties` file exists. Hardcoded texts in views are not checked.
 *
 * Default severity: `error`. Project types: FS, FE, LIB.
 */
export const i18nUsedRule: Rule<Options> = {
  meta: {
    descriptionKey: "i18n-used.description",
    defaultSeverity: "error",
    projectTypes: ["fs", "fe", "lib"],
  },
  check(ctx) {
    const projectContext = ctx.projectContext;
    const basePath = ctx.options?.basePath ?? getDefaultI18nBasePath(projectContext);
    if (!basePath) return; // Library ohne auflösbaren Namensraum (ui5.yaml#metadata.name) — nichts zu prüfen.

    const prefix = getI18nPrefix(projectContext);

    // Bei Libraries gibt es kein manifest.json und damit keine explizite i18n-Model-
    // Deklaration — das messagebundle wird von UI5 per Konvention automatisch geladen.
    if (projectContext.projectType !== "lib") {
      const i18nModel = get(projectContext.manifest, "sap.ui5", "models", "i18n") as
        | Record<string, unknown>
        | undefined;
      if (!i18nModel || i18nModel.type !== "sap.ui.model.resource.ResourceModel") {
        ctx.report({ message: ctx.t("i18n-used.noModel"), file: "webapp/manifest.json" });
      }
    }

    if (projectContext.readFile(`${basePath}/${prefix}.properties`) === undefined) {
      ctx.report({
        message: ctx.t("i18n-used.missingBaseFile", { basePath, prefix }),
        file: `${basePath}/${prefix}.properties`,
      });
    }
  },
};
