import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";
import { extractI18nKey, parseProperties } from "../util/properties.js";

export const appTitleDescriptionRule: Rule = {
  meta: {
    descriptionKey: "app-title-description.description",
    defaultSeverity: "error",
    projectTypes: ["fs", "fe"],
  },
  check(ctx) {
    const title = get(ctx.projectContext.manifest, "sap.app", "title");
    const description = get(ctx.projectContext.manifest, "sap.app", "description");
    const i18nContent = ctx.projectContext.readFile("webapp/i18n/i18n.properties");
    const i18nValues = i18nContent ? parseProperties(i18nContent) : {};

    for (const [label, value] of [
      ["sap.app/title", title],
      ["sap.app/description", description],
    ] as const) {
      const key = extractI18nKey(value);
      if (!key) {
        ctx.report({ message: ctx.t("app-title-description.noI18nRef", { label }), file: "webapp/manifest.json" });
        continue;
      }
      if (!i18nValues[key]) {
        ctx.report({
          message: ctx.t("app-title-description.emptyValue", { key, label }),
          file: "webapp/i18n/i18n.properties",
        });
      }
    }
  },
};
