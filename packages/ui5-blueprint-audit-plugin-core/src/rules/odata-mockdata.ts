import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";
import { listFiles } from "../util/files.js";
import { parseXml } from "../util/xml.js";
import { isComponentApp } from "../util/component.js";

interface Options {
  mode?: "any" | "one-entity" | "all-entities";
  dataPath?: string;
}

function entitySetNamesFromMetadata(metadataXml: string): string[] {
  const doc = parseXml(metadataXml);
  const names: string[] = [];

  function visit(node: unknown): void {
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }
    if (node && typeof node === "object") {
      const obj = node as Record<string, unknown>;
      const entitySets = obj.EntitySet;
      if (entitySets) {
        const list = Array.isArray(entitySets) ? entitySets : [entitySets];
        for (const entitySet of list) {
          const name = (entitySet as Record<string, unknown>)["@_Name"];
          if (typeof name === "string") names.push(name);
        }
      }
      for (const value of Object.values(obj)) visit(value);
    }
  }

  visit(doc);
  return names;
}

/**
 * Checks that mock data for the OData service exists, per `mode` (`any`, `one-entity`, or `all-entities`). Off by default.
 *
 * Default severity: `off`. Project types: FS, FE.
 */
export const odataMockdataRule: Rule<Options> = {
  meta: {
    descriptionKey: "odata-mockdata.description",
    defaultSeverity: "off",
    projectTypes: ["fs", "fe"],
  },
  check(ctx) {
    const projectContext = ctx.projectContext;
    // FLP-Plugins (sap.app/type: "component") haben konstruktionsbedingt keinen eigenen
    // Backend-Service, siehe odata-service.
    if (isComponentApp(projectContext)) return;

    const mode = ctx.options?.mode ?? "any";
    const dataPath = ctx.options?.dataPath ?? "webapp/localService/data";

    const jsonFiles = listFiles(projectContext, (path) => path.startsWith(`${dataPath}/`) && path.endsWith(".json"));

    if (mode === "any") {
      if (jsonFiles.length === 0) {
        ctx.report({ message: ctx.t("odata-mockdata.noneAny", { dataPath }), file: dataPath });
      }
      return;
    }

    const dataSources = (get(projectContext.manifest, "sap.app", "dataSources") ?? {}) as Record<
      string,
      Record<string, unknown>
    >;
    const entitySets = new Set<string>();
    for (const dataSource of Object.values(dataSources)) {
      if (dataSource.type !== "OData") continue;
      const localUri = get(dataSource, "settings", "localUri");
      if (typeof localUri !== "string") continue;
      const metadataContent = projectContext.readFile(`webapp/${localUri}`);
      if (!metadataContent) continue;
      for (const name of entitySetNamesFromMetadata(metadataContent)) entitySets.add(name);
    }

    const mockedEntitySets = new Set(jsonFiles.map((path) => path.split("/").pop()?.replace(/\.json$/, "")));
    const missing = [...entitySets].filter((name) => !mockedEntitySets.has(name));

    if (mode === "all-entities" && missing.length > 0) {
      ctx.report({ message: ctx.t("odata-mockdata.missingAllEntities", { entities: missing.join(", ") }), file: dataPath });
    }
    if (mode === "one-entity" && mockedEntitySets.size === 0 && entitySets.size > 0) {
      ctx.report({ message: ctx.t("odata-mockdata.noneOneEntity", { dataPath }), file: dataPath });
    }
  },
};
