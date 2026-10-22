import type { ProjectContext } from "@abap/ui5-blueprint-audit-types";
import { get } from "./get.js";

/**
 * Libraries haben kein manifest.json — ui5.yaml#metadata.name ist dort der verlässliche
 * Namensraum (siehe auch "namespace"-Regel). Bei FS/FE ist es ebenfalls gesetzt, aber
 * sap.app/id im Manifest bleibt dort die maßgebliche Quelle.
 */
function ui5YamlNamespace(ctx: ProjectContext): string | undefined {
  const name = get(ctx.ui5Yaml, "metadata", "name");
  return typeof name === "string" && name.length > 0 ? name : undefined;
}

/** Namensraum/ID des Projekts: sap.app/id bei FS/FE, ui5.yaml#metadata.name bei LIB. */
export function getProjectNamespace(ctx: ProjectContext): string | undefined {
  if (ctx.projectType === "lib") return ui5YamlNamespace(ctx);
  const id = get(ctx.manifest, "sap.app", "id");
  return typeof id === "string" ? id : undefined;
}

/** Der Datei-Verweis für Namensraum-Funde: ui5.yaml bei LIB, webapp/manifest.json sonst. */
export function getNamespaceFileRef(ctx: ProjectContext): string {
  return ctx.projectType === "lib" ? "ui5.yaml" : "webapp/manifest.json";
}

/** Das Feld, das den Namensraum trägt, als Label für Finding-Messages. */
export function getNamespaceLabel(ctx: ProjectContext): string {
  return ctx.projectType === "lib" ? "metadata.name in ui5.yaml" : "sap.app/id";
}

/**
 * Namensraum-Ordner einer Library unter src/ (z. B. "src/de/itsfullofstars/.../lib"),
 * abgeleitet aus ui5.yaml#metadata.name. undefined, wenn der Namensraum nicht ermittelt
 * werden kann (z. B. fehlende/fehlerhafte ui5.yaml).
 */
export function getLibraryBasePath(ctx: ProjectContext): string | undefined {
  const name = ui5YamlNamespace(ctx);
  return name ? `src/${name.split(".").join("/")}` : undefined;
}

/** Quell-Ordner für Code/Views: src/ bei LIB, webapp/ bei FS/FE. */
export function getSourceRoot(ctx: ProjectContext): string {
  return ctx.projectType === "lib" ? "src" : "webapp";
}

/** Test-Ordner: test/ bei LIB, webapp/test/ bei FS/FE. */
export function getTestRoot(ctx: ProjectContext): string {
  return ctx.projectType === "lib" ? "test" : "webapp/test";
}

/** i18n-Dateinamens-Präfix: "messagebundle" bei LIB (UI5-Konvention), "i18n" bei FS/FE. */
export function getI18nPrefix(ctx: ProjectContext): string {
  return ctx.projectType === "lib" ? "messagebundle" : "i18n";
}

/** Default-Ordner für i18n-/messagebundle-Dateien, falls nicht explizit per Option gesetzt. */
export function getDefaultI18nBasePath(ctx: ProjectContext): string | undefined {
  return ctx.projectType === "lib" ? getLibraryBasePath(ctx) : "webapp/i18n";
}

/** Das Feld, das die gepflegte Projekt-Version trägt, als Label für Finding-Messages. */
export function getVersionLabel(ctx: ProjectContext): string {
  return ctx.projectType === "lib" ? "package.json#version" : "sap.app/applicationVersion/version";
}
