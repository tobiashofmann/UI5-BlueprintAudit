import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";
import { getVersionLabel } from "../util/library.js";

interface Options {
  defaultValue?: string;
}

/**
 * Checks that the app version has been maintained and isn't the generator default (`sap.app/applicationVersion/version` differs from `defaultValue`).
 *
 * Default severity: `warn`. Project types: FS, FE, LIB.
 */
export const appVersionRule: Rule<Options> = {
  meta: {
    descriptionKey: "app-version.description",
    defaultSeverity: "warn",
    projectTypes: ["fs", "fe", "lib"],
  },
  check(ctx) {
    const projectContext = ctx.projectContext;
    const isLib = projectContext.projectType === "lib";

    // Libraries haben kein manifest.json/applicationVersion — die gepflegte Version
    // ist package.json#version. UI5-Library-Generatoren starten dort typischerweise bei
    // "1.0.0" statt dem Fiori-App-Default "0.0.1".
    const defaultValue = ctx.options?.defaultValue ?? (isLib ? "1.0.0" : "0.0.1");
    const version = isLib
      ? get(projectContext.packageJson, "version")
      : get(projectContext.manifest, "sap.app", "applicationVersion", "version");

    if (version === defaultValue) {
      ctx.report({
        message: ctx.t("app-version.stillDefault", { label: getVersionLabel(projectContext), defaultValue }),
        file: isLib ? "package.json" : "webapp/manifest.json",
      });
    }
  },
};
