import type { Rule } from "@abap/ui5-blueprint-audit-types";

function hasCacheBusterEntry(list: unknown): boolean {
  if (!Array.isArray(list)) return false;
  return list.some((entry) => {
    const name = (entry as Record<string, unknown>)?.name;
    return typeof name === "string" && /cachebuster/i.test(name);
  });
}

function indexHtmlUsesCacheBusterUrl(indexHtml: string | undefined): boolean {
  if (!indexHtml) return false;
  const match = /<script[^>]*\bsrc=["']([^"']+)["'][^>]*id=["']sap-ui-bootstrap["']|id=["']sap-ui-bootstrap["'][^>]*\bsrc=["']([^"']+)["']/.exec(
    indexHtml,
  );
  const src = match?.[1] ?? match?.[2];
  return !!src && /cachebuster/i.test(src);
}

export const cacheBusterRule: Rule = {
  meta: {
    descriptionKey: "cache-buster.description",
    defaultSeverity: "error",
    projectTypes: ["fs"],
  },
  check(ctx) {
    const ui5Yaml = ctx.projectContext.ui5Yaml;
    const customTasks = ui5Yaml && typeof ui5Yaml === "object" ? (ui5Yaml as Record<string, unknown>).builder : undefined;
    const customMiddleware = ui5Yaml && typeof ui5Yaml === "object" ? (ui5Yaml as Record<string, unknown>).server : undefined;

    const hasTask = hasCacheBusterEntry((customTasks as Record<string, unknown>)?.customTasks);
    const hasMiddleware = hasCacheBusterEntry((customMiddleware as Record<string, unknown>)?.customMiddleware);
    const hasUrl = indexHtmlUsesCacheBusterUrl(ctx.projectContext.indexHtml);

    if (!hasTask && !hasMiddleware && !hasUrl) {
      ctx.report({ message: ctx.t("cache-buster.missing") });
    }
  },
};
