import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { fileExists, listFiles, matchesAny } from "../util/files.js";
import { getSourceRoot, getTestRoot } from "../util/library.js";

interface Options {
  allowJs?: string[];
}

export const typescriptRule: Rule<Options> = {
  meta: {
    descriptionKey: "typescript.description",
    defaultSeverity: "error",
    projectTypes: ["fs", "lib"],
  },
  check(ctx) {
    const allowJs = ctx.options?.allowJs ?? [];

    if (!fileExists(ctx.projectContext, "tsconfig.json")) {
      ctx.report({ message: ctx.t("typescript.missingTsconfig"), file: "tsconfig.json" });
    }

    const sourceRoot = `${getSourceRoot(ctx.projectContext)}/`;
    const testRoot = `${getTestRoot(ctx.projectContext)}/`;
    const disallowedJsFiles = listFiles(
      ctx.projectContext,
      (path) => path.startsWith(sourceRoot) && !path.startsWith(testRoot) && path.endsWith(".js"),
    ).filter((path) => !matchesAny(path, allowJs));

    for (const file of disallowedJsFiles) {
      ctx.report({ message: ctx.t("typescript.jsInsteadOfTs", { file }), file });
    }
  },
};
