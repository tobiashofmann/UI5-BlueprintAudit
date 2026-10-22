import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { listFiles } from "../util/files.js";
import { findControlExtensions } from "../util/ast.js";

interface Options {
  allow?: string[];
}

export const noCustomControlsRule: Rule<Options> = {
  meta: {
    descriptionKey: "no-custom-controls.description",
    defaultSeverity: "error",
    projectTypes: ["fs", "fe"],
  },
  check(ctx) {
    const allow = new Set(ctx.options?.allow ?? []);
    const sourceFiles = listFiles(
      ctx.projectContext,
      (path) => path.startsWith("webapp/") && /\.(ts|js)$/.test(path),
    );

    for (const file of sourceFiles) {
      const content = ctx.projectContext.readFile(file);
      if (!content) continue;
      for (const extension of findControlExtensions(content, file)) {
        if (allow.has(extension.name)) continue;
        ctx.report({ message: ctx.t("no-custom-controls.customControl", { name: extension.name, file }), file });
      }
    }
  },
};
