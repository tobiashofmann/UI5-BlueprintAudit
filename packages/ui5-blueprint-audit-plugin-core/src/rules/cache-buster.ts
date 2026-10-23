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
  // Find candidate <script> tags first (a single, unambiguous [^>]* scan), then inspect
  // each tag's short, bounded content independently. Avoids a combined regex with two
  // overlapping [^>]* groups across alternatives, which CodeQL flags as a polynomial ReDoS
  // risk on attacker-sized index.html content.
  const scriptTags = indexHtml.match(/<script\b[^>]*>/gi) ?? [];
  const bootstrapTag = scriptTags.find((tag) => /\bid=["']sap-ui-bootstrap["']/.test(tag));
  if (!bootstrapTag) return false;

  const src = /\bsrc=["']([^"']+)["']/.exec(bootstrapTag)?.[1];
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
