import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";
import { gte, sameMajorMinor } from "../util/version.js";

interface Options {
  min?: string;
  max?: string;
}

export const ui5VersionRule: Rule<Options> = {
  meta: {
    descriptionKey: "ui5-version.description",
    defaultSeverity: "error",
    projectTypes: ["fs", "fe", "lib"],
  },
  check(ctx) {
    const min = ctx.options?.min ?? "1.152";
    const max = ctx.options?.max;
    const isLib = ctx.projectContext.projectType === "lib";
    // Libraries haben kein manifest.json/minUI5Version — ui5.yaml#framework.version ist
    // dort die einzige Quelle, ein Konsistenz-Abgleich entfällt mangels zweiter Quelle.
    const manifestVersion = isLib
      ? undefined
      : get(ctx.projectContext.manifest, "sap.ui5", "dependencies", "minUI5Version");
    const yamlVersion = get(ctx.projectContext.ui5Yaml, "framework", "version");

    const sources = isLib
      ? ([["framework.version", "ui5.yaml", yamlVersion]] as const)
      : ([
          ["sap.ui5/dependencies/minUI5Version", "webapp/manifest.json", manifestVersion],
          ["framework.version", "ui5.yaml", yamlVersion],
        ] as const);

    for (const [label, file, version] of sources) {
      if (typeof version !== "string") {
        ctx.report({ message: ctx.t("ui5-version.notSet", { label }), file });
        continue;
      }
      if (!gte(version, min)) {
        ctx.report({ message: ctx.t("ui5-version.belowMin", { label, version, min }), file });
      }
      if (max !== undefined && gte(version, max) && version !== max) {
        ctx.report({ message: ctx.t("ui5-version.aboveMax", { label, version, max }), file });
      }
    }

    if (
      typeof manifestVersion === "string" &&
      typeof yamlVersion === "string" &&
      !sameMajorMinor(manifestVersion, yamlVersion)
    ) {
      ctx.report({
        message: ctx.t("ui5-version.inconsistent", { manifestVersion, yamlVersion }),
      });
    }
  },
};
