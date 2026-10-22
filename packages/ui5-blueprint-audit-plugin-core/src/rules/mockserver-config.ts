import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { fileExists } from "../util/files.js";

interface Options {
  fileName?: string;
}

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
