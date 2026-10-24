import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { fileExists } from "../util/files.js";

interface Options {
  fileName?: string;
}

/**
 * Checks that a MockServer configuration file (`fileName`, default `ui5-mockserver.yaml`) exists in the project root.
 *
 * Default severity: `warn`. Project types: FS, FE.
 */
export const mockserverConfigRule: Rule<Options> = {
  meta: {
    descriptionKey: "mockserver-config.description",
    defaultSeverity: "warn",
    projectTypes: ["fs", "fe"],
  },
  check(ctx) {
    const fileName = ctx.options?.fileName ?? "ui5-mockserver.yaml";
    if (!fileExists(ctx.projectContext, fileName)) {
      ctx.report({ message: ctx.t("mockserver-config.missing", { fileName }), file: fileName });
    }
  },
};
