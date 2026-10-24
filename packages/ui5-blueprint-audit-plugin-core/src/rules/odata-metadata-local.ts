import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";
import { fileExists } from "../util/files.js";
import { isComponentApp } from "../util/component.js";

interface Options {
  basePath?: string;
}

/**
 * Checks that every OData dataSource has a `settings.localUri`, and that the referenced `metadata.xml` exists locally.
 *
 * Default severity: `error`. Project types: FS, FE.
 */
export const odataMetadataLocalRule: Rule<Options> = {
  meta: {
    descriptionKey: "odata-metadata-local.description",
    defaultSeverity: "error",
    projectTypes: ["fs", "fe"],
  },
  check(ctx) {
    // FLP-Plugins (sap.app/type: "component") haben konstruktionsbedingt keinen eigenen
    // Backend-Service, siehe odata-service.
    if (isComponentApp(ctx.projectContext)) return;

    const basePath = ctx.options?.basePath ?? "webapp/localService";
    const dataSources = (get(ctx.projectContext.manifest, "sap.app", "dataSources") ?? {}) as Record<
      string,
      Record<string, unknown>
    >;

    for (const [name, dataSource] of Object.entries(dataSources)) {
      if (dataSource.type !== "OData") continue;
      const localUri = get(dataSource, "settings", "localUri");

      if (typeof localUri !== "string" || localUri.length === 0) {
        ctx.report({ message: ctx.t("odata-metadata-local.missingLocalUri", { name }), file: "webapp/manifest.json" });
        continue;
      }

      const filePath = `webapp/${localUri}`;
      if (!fileExists(ctx.projectContext, filePath)) {
        ctx.report({ message: ctx.t("odata-metadata-local.missingFile", { filePath }), file: filePath });
        continue;
      }
      if (!filePath.startsWith(`${basePath}/`)) {
        ctx.report({ message: ctx.t("odata-metadata-local.wrongPath", { basePath, filePath }), file: filePath });
      }
    }
  },
};
