import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";
import { isComponentApp } from "../util/component.js";

export const nonOdataJsonRule: Rule = {
  meta: {
    descriptionKey: "non-odata-json.description",
    defaultSeverity: "error",
    projectTypes: ["fs"],
  },
  check(ctx) {
    // FLP-Plugins (sap.app/type: "component") haben konstruktionsbedingt keinen eigenen
    // Backend-Service, siehe odata-service.
    if (isComponentApp(ctx.projectContext)) return;

    const manifest = ctx.projectContext.manifest;
    const dataSources = (get(manifest, "sap.app", "dataSources") ?? {}) as Record<string, Record<string, unknown>>;
    const models = (get(manifest, "sap.ui5", "models") ?? {}) as Record<string, Record<string, unknown>>;

    for (const [name, dataSource] of Object.entries(dataSources)) {
      if (dataSource.type === "OData") continue;
      if (dataSource.type !== "JSON") {
        ctx.report({
          message: ctx.t("non-odata-json.wrongType", { name, type: String(dataSource.type) }),
          file: "webapp/manifest.json",
        });
        continue;
      }

      const model = Object.values(models).find((m) => m.dataSource === name);
      if (model && model.type !== "sap.ui.model.json.JSONModel") {
        ctx.report({
          message: ctx.t("non-odata-json.wrongModel", { name }),
          file: "webapp/manifest.json",
        });
      }
    }
  },
};
