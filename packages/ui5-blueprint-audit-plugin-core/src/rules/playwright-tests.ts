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

export const playwrightTestsRule: Rule<Options> = {
  meta: {
    descriptionKey: "playwright-tests.description",
    defaultSeverity: "warn",
    projectTypes: ["fs", "fe"],
  },
  check(ctx) {
    const configFile = ctx.options?.configFile ?? "playwright.config.ts";
    const alternateConfigFile = configFile.replace(/\.ts$/, ".js");
    const projectContext = ctx.projectContext;

    const hasConfig = fileExists(projectContext, configFile) || fileExists(projectContext, alternateConfigFile);
    if (!hasConfig) {
      ctx.report({ message: ctx.t("playwright-tests.missingConfig", { configFile }), file: configFile });
    }

    if (!hasDependency(projectContext.packageJson, "@playwright/test")) {
      ctx.report({ message: ctx.t("playwright-tests.missingDependency"), file: "package.json" });
    }
  },
};
