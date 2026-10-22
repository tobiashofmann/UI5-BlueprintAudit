import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";

interface Options {
  name?: string;
}

export const frameworkRule: Rule<Options> = {
  meta: {
    descriptionKey: "framework.description",
    defaultSeverity: "error",
    projectTypes: ["fs", "fe", "lib"],
  },
  check(ctx) {
    const expected = ctx.options?.name ?? "SAPUI5";
    const actual = get(ctx.projectContext.ui5Yaml, "framework", "name");

    if (actual !== expected) {
      ctx.report({ message: ctx.t("framework.wrongValue", { actual: String(actual), expected }), file: "ui5.yaml" });
    }
  },
};
