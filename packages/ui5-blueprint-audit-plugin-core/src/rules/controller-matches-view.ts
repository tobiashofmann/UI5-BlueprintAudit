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

      // Namenskonvention: Die View selbst gibt den erwarteten Namen vor (App.view.xml ->
      // Controller muss auf ...App enden), nicht umgekehrt. Ein existierender Controller mit
      // falschem Namen (z. B. Home statt App) würde sonst unbemerkt durchgehen, obwohl die
      // View auf den falschen Controller zeigt.
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
