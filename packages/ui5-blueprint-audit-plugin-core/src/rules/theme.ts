import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";

interface Options {
  themes?: string[];
}

function themeFromIndexHtml(indexHtml: string | undefined): string | undefined {
  if (!indexHtml) return undefined;
  return /data-sap-ui-theme=["']([^"']+)["']/.exec(indexHtml)?.[1];
}

function themeFromUi5Yaml(ui5Yaml: unknown): string | undefined {
  const libraries = get(ui5Yaml, "framework", "libraries");
  if (!Array.isArray(libraries)) return undefined;
  for (const lib of libraries) {
    const name = (lib as Record<string, unknown>)?.name;
    if (typeof name === "string" && name.startsWith("themelib_")) {
      return name.slice("themelib_".length);
    }
  }
  return undefined;
}

export const themeRule: Rule<Options> = {
  meta: {
    descriptionKey: "theme.description",
    defaultSeverity: "error",
    projectTypes: ["fs"],
  },
  check(ctx) {
    const themes = ctx.options?.themes ?? ["sap_horizon"];
    const projectContext = ctx.projectContext;

    const hasIndexHtml = projectContext.indexHtml !== undefined;
    const hasUi5Yaml = projectContext.ui5Yaml !== undefined;
    if (!hasIndexHtml && !hasUi5Yaml) return;

    const htmlTheme = hasIndexHtml ? themeFromIndexHtml(projectContext.indexHtml) : undefined;
    const yamlTheme = hasUi5Yaml ? themeFromUi5Yaml(projectContext.ui5Yaml) : undefined;

    if (hasIndexHtml && hasUi5Yaml && htmlTheme && yamlTheme && htmlTheme !== yamlTheme) {
      ctx.report({
        message: ctx.t("theme.conflict", { htmlTheme, yamlTheme }),
      });
      return;
    }

    const detectedTheme = htmlTheme ?? yamlTheme;
    if (!detectedTheme) {
      ctx.report({ message: ctx.t("theme.notDetected") });
      return;
    }

    if (!themes.includes(detectedTheme)) {
      ctx.report({ message: ctx.t("theme.notAllowed", { theme: detectedTheme, allowed: themes.join(", ") }) });
    }
  },
};
