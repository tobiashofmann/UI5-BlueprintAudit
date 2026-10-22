import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";

interface Options {
  requiredIcons?: string[];
}

export const appIconsRule: Rule<Options> = {
  meta: {
    descriptionKey: "app-icons.description",
    defaultSeverity: "warn",
    // Nicht für LIB: sap.ui/icons ist ein App-/Launchpad-Kachel-Konzept (manifest.json),
    // das es für Libraries nicht gibt.
    projectTypes: ["fs", "fe"],
  },
  check(ctx) {
    const requiredIcons = ctx.options?.requiredIcons ?? ["icon", "favIcon"];
    const icons = (get(ctx.projectContext.manifest, "sap.ui", "icons") ?? {}) as Record<string, unknown>;

    for (const field of requiredIcons) {
      const value = icons[field];
      if (typeof value !== "string" || value.length === 0) {
        ctx.report({ message: ctx.t("app-icons.notSet", { field }), file: "webapp/manifest.json" });
      }
    }
  },
};
