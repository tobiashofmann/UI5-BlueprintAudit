import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";
import { listFiles, matchesAny } from "../util/files.js";

interface Options {
  allow?: string[];
}

/**
 * Checks that the project has no custom CSS: no `.css` files under `webapp`, and `sap.ui5/resources/css` is empty or absent. Inline `style=` attributes in XML are not checked.
 *
 * Default severity: `error`. Project types: FS, FE.
 */
export const noCustomCssRule: Rule<Options> = {
  meta: {
    descriptionKey: "no-custom-css.description",
    defaultSeverity: "error",
    projectTypes: ["fs", "fe"],
  },
  check(ctx) {
    const allow = ctx.options?.allow ?? [];
    const cssFiles = listFiles(
      ctx.projectContext,
      (path) => path.startsWith("webapp/") && path.endsWith(".css"),
    ).filter((path) => !matchesAny(path, allow));

    for (const file of cssFiles) {
      ctx.report({ message: ctx.t("no-custom-css.cssFile", { file }), file });
    }

    const cssResources = get(ctx.projectContext.manifest, "sap.ui5", "resources", "css");
    if (Array.isArray(cssResources) && cssResources.length > 0) {
      ctx.report({
        message: ctx.t("no-custom-css.resourcesNotEmpty"),
        file: "webapp/manifest.json",
      });
    }
  },
};
