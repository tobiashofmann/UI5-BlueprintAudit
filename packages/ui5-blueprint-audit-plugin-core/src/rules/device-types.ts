import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { get } from "../util/get.js";

interface Options {
  desktop?: boolean;
  tablet?: boolean;
  phone?: boolean;
}

/**
 * Checks that `sap.ui/deviceTypes` in the manifest matches the expected desktop/tablet/phone values.
 *
 * Default severity: `error`. Project types: FS, FE.
 */
export const deviceTypesRule: Rule<Options> = {
  meta: {
    descriptionKey: "device-types.description",
    defaultSeverity: "error",
    projectTypes: ["fs", "fe"],
  },
  check(ctx) {
    const expected = {
      desktop: ctx.options?.desktop ?? true,
      tablet: ctx.options?.tablet ?? true,
      phone: ctx.options?.phone ?? true,
    };
    const actual = get(ctx.projectContext.manifest, "sap.ui", "deviceTypes") as Record<string, unknown> | undefined;

    for (const [key, expectedValue] of Object.entries(expected)) {
      if ((actual?.[key] ?? false) !== expectedValue) {
        ctx.report({ message: ctx.t("device-types.wrongValue", { key, expected: String(expectedValue) }), file: "webapp/manifest.json" });
      }
    }
  },
};
