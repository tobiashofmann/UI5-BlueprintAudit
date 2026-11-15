import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";

interface Options {
  themes?: string[];
}

const THEMELIB_PREFIX = "themelib_";

function themeFromIndexHtml(indexHtml: string | undefined): string | undefined {
  if (!indexHtml) return undefined;
  return /data-sap-ui-theme=["']([^"']+)["']/.exec(indexHtml)?.[1];
}

/** Every theme whose `themelib_<theme>` is listed under `framework.libraries` in `ui5.yaml`. */
function themesFromUi5Yaml(ui5Yaml: unknown): string[] {
  const libraries = get(ui5Yaml, "framework", "libraries");
  if (!Array.isArray(libraries)) return [];
  const themes: string[] = [];
  for (const lib of libraries) {
    const name = get(lib, "name");
    if (typeof name === "string" && name.startsWith(THEMELIB_PREFIX)) {
      themes.push(name.slice(THEMELIB_PREFIX.length));
    }
  }
  return themes;
}

/** Whether the UI5 bootstrap script in `index.html` is loaded from an absolute URL (a CDN or an SAP server). */
function bootstrapsFromRemoteUrl(indexHtml: string | undefined): boolean {
  if (!indexHtml) return false;
  const scriptTags = indexHtml.match(/<script\b[^>]*>/gi) ?? [];
  return scriptTags.some((tag) => {
    const src = /\bsrc=["']([^"']+)["']/.exec(tag)?.[1];
    return !!src && /sap-ui-(core|cachebuster)/.test(src) && /^(https?:)?\/\//i.test(src);
  });
}

/**
 * Whether a server middleware in `ui5.yaml` proxies the UI5 resources from elsewhere, i.e.
 * it has a `configuration.ui5` entry (as `fiori-tools-proxy` does for `/resources`).
 */
function proxiesUi5Resources(ui5Yaml: unknown): boolean {
  const middleware = get(ui5Yaml, "server", "customMiddleware");
  if (!Array.isArray(middleware)) return false;
  return middleware.some((entry) => {
    const ui5 = get(entry, "configuration", "ui5");
    return typeof ui5 === "object" && ui5 !== null;
  });
}

/**
 * Checks that the theme is fixed and consistently configured: `data-sap-ui-theme` in `index.html` is one of `themes`, and the matching theme library is listed in `ui5.yaml`. The theme library may only be omitted if UI5 is loaded from a CDN or an SAP server (absolute bootstrap URL, or a proxy middleware with a `ui5` configuration); with a local UI5 (and for the build) it must be listed. A missing file is skipped (e.g. Launchpad plugins without `index.html`).
 *
 * Default severity: `error`. Project types: FS.
 */
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

    const htmlTheme = themeFromIndexHtml(projectContext.indexHtml);
    const yamlThemes = themesFromUi5Yaml(projectContext.ui5Yaml);

    if (htmlTheme && yamlThemes.length > 0 && !yamlThemes.includes(htmlTheme)) {
      ctx.report({
        message: ctx.t("theme.conflict", { htmlTheme, yamlTheme: yamlThemes.join(", ") }),
      });
      return;
    }

    const detectedThemes = htmlTheme ? [htmlTheme] : yamlThemes;
    if (detectedThemes.length === 0) {
      ctx.report({ message: ctx.t("theme.notDetected") });
      return;
    }

    for (const theme of detectedThemes) {
      if (!themes.includes(theme)) {
        ctx.report({ message: ctx.t("theme.notAllowed", { theme, allowed: themes.join(", ") }) });
      }
    }

    // The theme in index.html alone is enough only if UI5 comes from a CDN or an SAP server.
    // A local UI5 (UI5 Tooling framework dependencies, also used by the build) serves only
    // the libraries listed in ui5.yaml, so the theme library has to be listed there.
    if (htmlTheme && hasUi5Yaml && yamlThemes.length === 0) {
      const loadsUi5Remotely =
        bootstrapsFromRemoteUrl(projectContext.indexHtml) || proxiesUi5Resources(projectContext.ui5Yaml);
      if (!loadsUi5Remotely) {
        ctx.report({ message: ctx.t("theme.missingThemeLib", { theme: htmlTheme }), file: "ui5.yaml" });
      }
    }
  },
};
