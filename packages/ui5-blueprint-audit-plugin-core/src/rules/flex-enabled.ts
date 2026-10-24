import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";

interface Options {
  value?: boolean;
}

/**
 * Checks that `sap.ui5/flexEnabled` in the manifest matches the expected `value`.
 *
 * Default severity: `warn`. Project types: FS, FE.
 */
export const flexEnabledRule: Rule<Options> = {
  meta: {
    descriptionKey: "flex-enabled.description",
    defaultSeverity: "warn",
    projectTypes: ["fs", "fe"],
  },
  check(ctx) {
    const expected = ctx.options?.value ?? true;
    const actual = get(ctx.projectContext.manifest, "sap.ui5", "flexEnabled");

    if (actual !== expected) {
      ctx.report({
        message: ctx.t("flex-enabled.wrongValue", { actual: String(actual), expected: String(expected) }),
        file: "webapp/manifest.json",
      });
    }
  },
};
