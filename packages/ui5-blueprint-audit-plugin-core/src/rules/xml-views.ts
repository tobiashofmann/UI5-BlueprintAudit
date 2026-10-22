import type { ProjectContext, Rule } from "@abap/ui5-blueprint-audit-types";
import { listFiles } from "../util/files.js";
import { findControlExtensions } from "../util/ast.js";
import { getSourceRoot } from "../util/library.js";

const FORBIDDEN_SUFFIXES = [".view.js", ".view.json", ".view.html", ".view.ts"];
const FORBIDDEN_USAGE = /sap\.ui\.(jsview|htmlview|jsonview)/;

function projectHasControls(ctx: ProjectContext): boolean {
  const sourceRoot = `${getSourceRoot(ctx)}/`;
  const sourceFiles = listFiles(ctx, (path) => path.startsWith(sourceRoot) && /\.(ts|js)$/.test(path));
  return sourceFiles.some((path) => {
    const content = ctx.readFile(path);
    return content !== undefined && findControlExtensions(content, path).length > 0;
  });
}

export const xmlViewsRule: Rule = {
  meta: {
    descriptionKey: "xml-views.description",
    defaultSeverity: "error",
    projectTypes: ["fs", "fe", "lib"],
  },
  check(ctx) {
    const projectContext = ctx.projectContext;

    if (projectContext.projectType === "lib" && !projectHasControls(projectContext)) {
      return;
    }

    for (const suffix of FORBIDDEN_SUFFIXES) {
      for (const file of listFiles(projectContext, (path) => path.endsWith(suffix))) {
        ctx.report({ message: ctx.t("xml-views.nonXmlView", { file }), file });
      }
    }

    const sourceRoot = `${getSourceRoot(projectContext)}/`;
    for (const file of listFiles(projectContext, (path) => path.startsWith(sourceRoot) && /\.(ts|js)$/.test(path))) {
      const content = projectContext.readFile(file);
      if (content && FORBIDDEN_USAGE.test(content)) {
        ctx.report({ message: ctx.t("xml-views.forbiddenUsage", { file }), file });
      }
    }
  },
};
