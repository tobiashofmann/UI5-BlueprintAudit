import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";

const IGNORED = new Set(["node_modules", "dist", ".git"]);
const UI5_PROJECT_TYPES = new Set(["application", "library"]);

function looksLikeProject(dir: string): boolean {
  const ui5YamlPath = resolve(dir, "ui5.yaml");
  if (existsSync(ui5YamlPath)) {
    try {
      const parsed = parse(readFileSync(ui5YamlPath, "utf8")) as { type?: unknown } | undefined;
      if (typeof parsed?.type === "string" && UI5_PROJECT_TYPES.has(parsed.type)) return true;
    } catch {
      // malformed ui5.yaml -> fall through to the webapp/manifest.json check below
    }
  }
  // Fallback für Projekte ohne (lesbare) ui5.yaml, aber mit klassischem FS/FE-Layout.
  return existsSync(resolve(dir, "webapp", "manifest.json"));
}

/**
 * Ohne Angabe eines Ordners wird nur das aktuelle Projekt (cwd) geprüft. Zeigt der
 * angegebene Ordner selbst auf ein UI5-Projekt — `ui5.yaml` mit `type: application`
 * oder `type: library` (zuverlässiger als Datei-Layout, erkennt auch Libraries ohne
 * `webapp/`), sonst als Fallback `webapp/manifest.json` — wird nur dieses eine Projekt
 * geprüft. Sonst gilt der Ordner als Container (z. B. `projects/`) und jedes direkte
 * Unterverzeichnis wird als eigenes Projekt geprüft (z. B. `npx ui5-blueprint-audit projects/`).
 */
export function resolveProjectDirs(cwd: string, targetDir?: string): string[] {
  if (!targetDir) return [cwd];

  const root = resolve(cwd, targetDir);
  if (looksLikeProject(root)) return [root];

  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith(".") && !IGNORED.has(entry.name))
    .map((entry) => resolve(root, entry.name))
    .sort();
}
