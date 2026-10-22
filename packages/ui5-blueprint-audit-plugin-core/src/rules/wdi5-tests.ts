import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { fileExists } from "../util/files.js";

interface Options {
  configFile?: string;
}

function hasDependency(packageJson: Record<string, unknown> | undefined, name: string): boolean {
  if (!packageJson) return false;
  const deps = { ...(packageJson.dependencies as Record<string, unknown>), ...(packageJson.devDependencies as Record<string, unknown>) };
  return name in deps;
}

export const wdi5TestsRule: Rule<Options> = {
  meta: {
    descriptionKey: "wdi5-tests.description",
    defaultSeverity: "warn",
    projectTypes: ["fs"],
  },
  check(ctx) {
    const configFile = ctx.options?.configFile ?? "wdio.conf.js";
    const alternateConfigFile = configFile.replace(/\.js$/, ".ts");
    const projectContext = ctx.projectContext;

    const hasConfig = fileExists(projectContext, configFile) || fileExists(projectContext, alternateConfigFile);
    if (!hasConfig) {
      ctx.report({ message: ctx.t("wdi5-tests.missingConfig", { configFile }), file: configFile });
    }

    if (!hasDependency(projectContext.packageJson, "wdio-ui5-service")) {
      ctx.report({ message: ctx.t("wdi5-tests.missingDependency"), file: "package.json" });
    }
  },
};
