import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { listFiles } from "../util/files.js";
import { findCustomControls } from "../util/ast.js";

interface Options {
  allow?: string[];
}

/**
 * Checks that the project does not define its own UI5 controls: no class extends `sap/ui/core/Control`, `sap/ui/core/Element`, a control from a UI5 control library (e.g. `sap/m/Button`), or another custom control of the project. Requires AST analysis of the TypeScript source.
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

    // All files are analyzed together: a class that extends another custom control of the
    // project is only recognizable once that base class is known.
    const sources = sourceFiles.flatMap((path) => {
      const content = ctx.projectContext.readFile(path);
      return content ? [{ path, content }] : [];
    });

    for (const { name, file } of findCustomControls(sources)) {
      if (allow.has(name)) continue;
      ctx.report({ message: ctx.t("no-custom-controls.customControl", { name, file }), file });
    }
  },
};
