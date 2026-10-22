import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";

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
