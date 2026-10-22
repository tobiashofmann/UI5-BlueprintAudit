import type { ProjectContext } from "@abap/ui5-blueprint-audit-types";
import { get } from "./get.js";

/**
 * sap.app/type "component" statt "application" (z. B. ein Fiori-Launchpad-Plugin, das
 * sich in die Shell einklinkt statt eigenständig gestartet zu werden). Solche Projekte
 * haben konstruktionsbedingt keinen eigenen Backend-Service — Regeln, die einen OData-
 * Service voraussetzen, überspringen sich deshalb dafür (siehe Katalog-Abschnitt
 * "Besonderheiten bei FLP-Plugins").
 */
export function isComponentApp(ctx: ProjectContext): boolean {
  return get(ctx.manifest, "sap.app", "type") === "component";
}
