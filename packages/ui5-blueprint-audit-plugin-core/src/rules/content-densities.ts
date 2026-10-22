import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";

interface Options {
  compact?: boolean;
  cozy?: boolean;
}

export const contentDensitiesRule: Rule<Options> = {
  meta: {
    descriptionKey: "content-densities.description",
    defaultSeverity: "error",
    projectTypes: ["fs", "fe"],
  },
  check(ctx) {
    const expected = {
      compact: ctx.options?.compact ?? true,
      cozy: ctx.options?.cozy ?? true,
    };
    const actual = get(ctx.projectContext.manifest, "sap.ui5", "contentDensities") as
      | Record<string, unknown>
      | undefined;

    for (const [key, expectedValue] of Object.entries(expected)) {
      if ((actual?.[key] ?? false) !== expectedValue) {
        ctx.report({
          message: ctx.t("content-densities.wrongValue", { key, expected: String(expectedValue) }),
          file: "webapp/manifest.json",
        });
      }
    }
  },
};
