import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";

/**
 * Checks that the app has a Fiori Launchpad configuration for at least one tile: `sap.app/crossNavigation/inbounds` has at least one entry with `semanticObject` and `action`.
 *
 * Default severity: `error`. Project types: FS, FE.
 */
export const flpConfigRule: Rule = {
  meta: {
    descriptionKey: "flp-config.description",
    defaultSeverity: "error",
    projectTypes: ["fs", "fe"],
  },
  check(ctx) {
    const inbounds = (get(ctx.projectContext.manifest, "sap.app", "crossNavigation", "inbounds") ?? {}) as Record<
      string,
      Record<string, unknown>
    >;

    const hasValidInbound = Object.values(inbounds).some(
      (inbound) => typeof inbound.semanticObject === "string" && typeof inbound.action === "string",
    );

    if (!hasValidInbound) {
      ctx.report({
        message: ctx.t("flp-config.missing"),
        file: "webapp/manifest.json",
      });
    }
  },
};
