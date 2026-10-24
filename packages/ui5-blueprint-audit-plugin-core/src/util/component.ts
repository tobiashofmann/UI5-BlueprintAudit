import type { ProjectContext } from "@abap/ui5-blueprint-audit-types";
import { get } from "./get.js";

/**
 * Whether `sap.app/type` in the manifest is `"component"` rather than `"application"`
 * (e.g. a Fiori Launchpad plugin that hooks into the shell instead of being launched on
 * its own). Such projects have no backend service of their own by design, so rules that
 * assume an OData service skip themselves for them (see the catalog's "Special cases for
 * FLP plugins" section).
 *
 * @param ctx - The project context to check.
 * @returns `true` if the project is a component/FLP-plugin app.
 */
export function isComponentApp(ctx: ProjectContext): boolean {
  return get(ctx.manifest, "sap.app", "type") === "component";
}
