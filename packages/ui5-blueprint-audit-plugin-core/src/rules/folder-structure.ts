import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { dirExists, listFiles } from "../util/files.js";

interface Options {
  folders?: string[];
  viewPath?: string;
  controllerPath?: string;
}

export const folderStructureRule: Rule<Options> = {
  meta: {
    descriptionKey: "folder-structure.description",
    defaultSeverity: "error",
    projectTypes: ["fs"],
  },
  check(ctx) {
    const folders = ctx.options?.folders ?? ["controller", "view", "model"];
    const viewPath = ctx.options?.viewPath ?? "webapp/view";
    const controllerPath = ctx.options?.controllerPath ?? "webapp/controller";
    const projectContext = ctx.projectContext;

    for (const folder of folders) {
      const folderPath = `webapp/${folder}`;
      if (!dirExists(projectContext, folderPath)) {
        ctx.report({ message: ctx.t("folder-structure.missingFolder", { folderPath }), file: folderPath });
      }
    }

    for (const file of listFiles(
      projectContext,
      (path) => path.endsWith(".view.xml") && !path.startsWith("webapp/test/"),
    )) {
      if (!file.startsWith(`${viewPath}/`)) {
        ctx.report({ message: ctx.t("folder-structure.viewWrongPath", { viewPath, file }), file });
      }
    }

    for (const file of listFiles(
      projectContext,
      (path) => path.endsWith(".controller.ts") && !path.startsWith("webapp/test/"),
    )) {
      if (!file.startsWith(`${controllerPath}/`)) {
        ctx.report({ message: ctx.t("folder-structure.controllerWrongPath", { controllerPath, file }), file });
      }
    }
  },
};
