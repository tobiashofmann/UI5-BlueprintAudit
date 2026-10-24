import type { ProjectContext } from "@abap/ui5-blueprint-audit-types";
import { get } from "./get.js";

/**
 * Libraries have no manifest.json — `ui5.yaml#metadata.name` is the reliable namespace
 * there (see also the `namespace` rule). FS/FE projects set it too, but `sap.app/id` in
 * the manifest remains the authoritative source for them.
 */
function ui5YamlNamespace(ctx: ProjectContext): string | undefined {
  const name = get(ctx.ui5Yaml, "metadata", "name");
  return typeof name === "string" && name.length > 0 ? name : undefined;
}

/** The project's namespace/ID: `sap.app/id` for FS/FE, `ui5.yaml#metadata.name` for LIB. */
export function getProjectNamespace(ctx: ProjectContext): string | undefined {
  if (ctx.projectType === "lib") return ui5YamlNamespace(ctx);
  const id = get(ctx.manifest, "sap.app", "id");
  return typeof id === "string" ? id : undefined;
}

/** The file to reference in namespace-related findings: `ui5.yaml` for LIB, `webapp/manifest.json` otherwise. */
export function getNamespaceFileRef(ctx: ProjectContext): string {
  return ctx.projectType === "lib" ? "ui5.yaml" : "webapp/manifest.json";
}

/** The field that carries the namespace, as a label for finding messages. */
export function getNamespaceLabel(ctx: ProjectContext): string {
  return ctx.projectType === "lib" ? "metadata.name in ui5.yaml" : "sap.app/id";
}

/**
 * A library's namespace folder under `src/` (e.g. `"src/de/itsfullofstars/.../lib"`),
 * derived from `ui5.yaml#metadata.name`.
 *
 * @returns The base path, or `undefined` if the namespace can't be determined (e.g. a
 * missing or malformed `ui5.yaml`).
 */
export function getLibraryBasePath(ctx: ProjectContext): string | undefined {
  const name = ui5YamlNamespace(ctx);
  return name ? `src/${name.split(".").join("/")}` : undefined;
}

/** The source folder for code/views: `src/` for LIB, `webapp/` for FS/FE. */
export function getSourceRoot(ctx: ProjectContext): string {
  return ctx.projectType === "lib" ? "src" : "webapp";
}

/** The test folder: `test/` for LIB, `webapp/test/` for FS/FE. */
export function getTestRoot(ctx: ProjectContext): string {
  return ctx.projectType === "lib" ? "test" : "webapp/test";
}

/** The i18n file name prefix: `"messagebundle"` for LIB (UI5 convention), `"i18n"` for FS/FE. */
export function getI18nPrefix(ctx: ProjectContext): string {
  return ctx.projectType === "lib" ? "messagebundle" : "i18n";
}

/** The default folder for i18n/messagebundle files, when not explicitly set via a rule option. */
export function getDefaultI18nBasePath(ctx: ProjectContext): string | undefined {
  return ctx.projectType === "lib" ? getLibraryBasePath(ctx) : "webapp/i18n";
}

/** The field that carries the maintained project version, as a label for finding messages. */
export function getVersionLabel(ctx: ProjectContext): string {
  return ctx.projectType === "lib" ? "package.json#version" : "sap.app/applicationVersion/version";
}
