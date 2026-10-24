import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";
import { isComponentApp } from "../util/component.js";

interface Options {
  min?: number;
  max?: number;
}

/**
 * Checks that the number of OData services used (`dataSources` of type OData in `sap.app` that are assigned to a model in `sap.ui5/models`) is within `min`/`max`.
 *
 * Default severity: `error`. Project types: FS, FE.
 */
export const odataServiceRule: Rule<Options> = {
  meta: {
    descriptionKey: "odata-service.description",
    defaultSeverity: "error",
    projectTypes: ["fs", "fe"],
  },
  check(ctx) {
    // FLP-Plugins (sap.app/type: "component") klinken sich nur in die Shell ein und haben
    // konstruktionsbedingt keinen eigenen Backend-Service.
    if (isComponentApp(ctx.projectContext)) return;

    const min = ctx.options?.min ?? 1;
    const max = ctx.options?.max;
    const manifest = ctx.projectContext.manifest;

    const dataSources = (get(manifest, "sap.app", "dataSources") ?? {}) as Record<string, Record<string, unknown>>;
    const models = (get(manifest, "sap.ui5", "models") ?? {}) as Record<string, Record<string, unknown>>;
    const mappedDataSourceNames = new Set(
      Object.values(models)
        .map((model) => model.dataSource)
        .filter((name): name is string => typeof name === "string"),
    );

    const odataServiceCount = Object.entries(dataSources).filter(
      ([name, dataSource]) => dataSource.type === "OData" && mappedDataSourceNames.has(name),
    ).length;

    if (odataServiceCount < min) {
      ctx.report({
        message: ctx.t("odata-service.belowMin", { count: odataServiceCount, min }),
        file: "webapp/manifest.json",
      });
    }
    if (max !== undefined && odataServiceCount > max) {
      ctx.report({
        message: ctx.t("odata-service.aboveMax", { count: odataServiceCount, max }),
        file: "webapp/manifest.json",
      });
    }
  },
};
