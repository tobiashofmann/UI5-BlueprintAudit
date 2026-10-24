import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";

interface Options {
  fileName?: string;
}

/**
 * Checks that a deployment configuration file (`fileName`, default `ui5-deploy.yaml`) exists with a configured deploy target (a non-empty `configuration.target.destination` or `.url`).
 *
 * Default severity: `error`. Project types: FS, FE.
 */
export const deployConfigRule: Rule<Options> = {
  meta: {
    descriptionKey: "deploy-config.description",
    defaultSeverity: "error",
    projectTypes: ["fs", "fe"],
  },
  check(ctx) {
    const fileName = ctx.options?.fileName ?? "ui5-deploy.yaml";
    const deployYaml = ctx.projectContext.ui5YamlExtensions[fileName];

    if (deployYaml === undefined) {
      ctx.report({ message: ctx.t("deploy-config.missingFile", { fileName }), file: fileName });
      return;
    }

    const customTasks = get(deployYaml, "builder", "customTasks");
    const hasBackend =
      Array.isArray(customTasks) &&
      customTasks.some((task) => {
        const destination = get(task, "configuration", "target", "destination");
        const url = get(task, "configuration", "target", "url");
        return (typeof destination === "string" && destination.length > 0) || (typeof url === "string" && url.length > 0);
      });

    if (!hasBackend) {
      ctx.report({
        message: ctx.t("deploy-config.noBackend", { fileName }),
        file: fileName,
      });
    }
  },
};
