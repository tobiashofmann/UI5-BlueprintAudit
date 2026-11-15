import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { basenameWithoutExt, listFiles } from "../util/files.js";
import { getRootAttribute } from "../util/xml.js";

interface Options {
  caseSensitive?: boolean;
}

/**
 * Checks that every XML view with a `controllerName` points to a controller named after the view itself (not an unrelated, coincidentally-existing controller), and that this controller file actually exists.
 *
 * Default severity: `error`. Project types: FS.
 */
export const controllerMatchesViewRule: Rule<Options> = {
  meta: {
    descriptionKey: "controller-matches-view.description",
    defaultSeverity: "error",
    projectTypes: ["fs"],
  },
  check(ctx) {
    const caseSensitive = ctx.options?.caseSensitive ?? false;
    const projectContext = ctx.projectContext;
    const viewFiles = listFiles(
      projectContext,
      (path) => path.endsWith(".view.xml") && !path.startsWith("webapp/test/"),
    );
    const controllerFiles = listFiles(
      projectContext,
      (path) => /\.controller\.(ts|js)$/.test(path) && !path.startsWith("webapp/test/"),
    );
    const controllerBaseNames = controllerFiles.map((path) => basenameWithoutExt(path));

    const sameName = (a: string, b: string) => (caseSensitive ? a === b : a.toLowerCase() === b.toLowerCase());

    for (const viewFile of viewFiles) {
      const content = projectContext.readFile(viewFile);
      if (!content) continue;
      const controllerName = getRootAttribute(content, "controllerName");
      if (!controllerName) continue;

      // Naming convention: the view itself dictates the expected name (App.view.xml ->
      // the controller has to end in ...App), not the other way round. Otherwise an existing
      // controller with the wrong name (e.g. Home instead of App) would go unnoticed, even
      // though the view points to the wrong controller.
      const viewBaseName = basenameWithoutExt(viewFile);
      const controllerBaseName = controllerName.split(".").pop() ?? controllerName;

      if (!sameName(controllerBaseName, viewBaseName)) {
        ctx.report({
          message: ctx.t("controller-matches-view.nameMismatch", { viewFile, viewBaseName, controllerName, controllerBaseName }),
          file: viewFile,
        });
        continue;
      }

      const controllerExists = controllerBaseNames.some((name) => sameName(name, viewBaseName));
      if (!controllerExists) {
        ctx.report({
          message: ctx.t("controller-matches-view.missingController", { viewFile, controllerName, expectedBaseName: viewBaseName }),
          file: viewFile,
        });
      }
    }
  },
};
