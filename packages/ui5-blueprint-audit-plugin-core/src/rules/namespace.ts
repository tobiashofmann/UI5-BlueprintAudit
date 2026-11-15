import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { getNamespaceFileRef, getNamespaceLabel, getProjectNamespace, isInNamespace } from "../util/library.js";

interface Options {
  value?: string;
}

/**
 * Checks that `sap.app/id` in the manifest lies in the configured namespace (`value`, default `de.itsfullofstars`): equal to it, or starting with it followed by a dot.
 *
 * Default severity: `error`. Project types: FS, FE, LIB.
 */
export const namespaceRule: Rule<Options> = {
  meta: {
    descriptionKey: "namespace.description",
    defaultSeverity: "error",
    projectTypes: ["fs", "fe", "lib"],
  },
  check(ctx) {
    const expected = ctx.options?.value ?? "de.itsfullofstars";
    const id = getProjectNamespace(ctx.projectContext);

    if (typeof id !== "string" || !isInNamespace(id, expected)) {
      ctx.report({
        message: ctx.t("namespace.wrongPrefix", { label: getNamespaceLabel(ctx.projectContext), id: String(id), expected }),
        file: getNamespaceFileRef(ctx.projectContext),
      });
    }
  },
};
