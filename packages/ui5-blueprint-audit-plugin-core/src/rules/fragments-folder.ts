import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { listFiles } from "../util/files.js";
import { getRootElementName } from "../util/xml.js";

interface Options {
  basePath?: string;
  dialogRoots?: string[];
}

export const fragmentsFolderRule: Rule<Options> = {
  meta: {
    descriptionKey: "fragments-folder.description",
    defaultSeverity: "error",
    projectTypes: ["fs"],
  },
  check(ctx) {
    const basePath = ctx.options?.basePath ?? "webapp/view/fragments";
    const dialogRoots = new Set(ctx.options?.dialogRoots ?? ["Dialog", "Popover"]);
    const projectContext = ctx.projectContext;

    for (const file of listFiles(projectContext, (path) => path.endsWith(".fragment.xml"))) {
      const content = projectContext.readFile(file);
      if (!content) continue;
      const rootElement = getRootElementName(content);
      if (rootElement && dialogRoots.has(rootElement)) continue;

      if (!file.startsWith(`${basePath}/`)) {
        ctx.report({ message: ctx.t("fragments-folder.wrongPath", { basePath, file }), file });
      }
    }
  },
};
