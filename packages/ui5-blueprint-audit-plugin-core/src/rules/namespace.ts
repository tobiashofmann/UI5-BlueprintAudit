import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { getNamespaceFileRef, getNamespaceLabel, getProjectNamespace } from "../util/library.js";

interface Options {
  value?: string;
}

/**
 * Checks that `sap.app/id` in the manifest starts with the configured namespace (`value`, default `de.itsfullofstars`).
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

    if (typeof id !== "string" || !id.startsWith(expected)) {
      ctx.report({
        message: ctx.t("namespace.wrongPrefix", { label: getNamespaceLabel(ctx.projectContext), id: String(id), expected }),
        file: getNamespaceFileRef(ctx.projectContext),
      });
    }
  },
};
