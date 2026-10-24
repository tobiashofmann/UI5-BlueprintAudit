import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { listFiles } from "../util/files.js";
import { findControlExtensions } from "../util/ast.js";

interface Options {
  allow?: string[];
}

/**
 * Checks that the project does not define its own UI5 controls: no class extends `sap/ui/core/Control`, `sap/ui/core/Element`, or another control. Requires AST analysis of the TypeScript source.
 *
 * Default severity: `error`. Project types: FS, FE.
 */
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
