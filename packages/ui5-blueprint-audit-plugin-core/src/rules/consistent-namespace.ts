import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";
import { listFiles } from "../util/files.js";
import { getRootAttribute } from "../util/xml.js";
import { getProjectNamespace } from "../util/library.js";

/**
 * Checks that all artifacts of the app (`sap.app/id`, controller/fragment/view names, class IDs in views/fragments/code) use the same namespace.
 *
 * Default severity: `error`. Project types: FS, FE, LIB.
 */
export const consistentNamespaceRule: Rule = {
  meta: {
    descriptionKey: "consistent-namespace.description",
    defaultSeverity: "error",
    projectTypes: ["fs", "fe", "lib"],
  },
  check(ctx) {
    const projectContext = ctx.projectContext;
    const baseNamespace = getProjectNamespace(projectContext);
    if (typeof baseNamespace !== "string") return;

    const rootViewName = get(projectContext.manifest, "sap.ui5", "rootView", "viewName");
    if (typeof rootViewName === "string" && !rootViewName.startsWith(baseNamespace)) {
      ctx.report({
        message: ctx.t("consistent-namespace.rootView", { rootViewName, baseNamespace }),
        file: "webapp/manifest.json",
      });
    }

    for (const file of listFiles(projectContext, (path) => path.endsWith(".view.xml"))) {
      const content = projectContext.readFile(file);
      if (!content) continue;
      const controllerName = getRootAttribute(content, "controllerName");
      if (controllerName && !controllerName.startsWith(baseNamespace)) {
        ctx.report({
          message: ctx.t("consistent-namespace.controllerName", { controllerName, file, baseNamespace }),
          file,
        });
      }
    }
  },
};
