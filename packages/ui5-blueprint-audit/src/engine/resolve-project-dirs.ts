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
 * Resolves which directories to check as individual projects for one CLI invocation.
 * Without a target folder, only the current project (cwd) is checked. If the given
 * folder itself points to a UI5 project — `ui5.yaml` with `type: application` or
 * `type: library` (more reliable than file layout, also detects libraries without
 * `webapp/`), otherwise falling back to `webapp/manifest.json` — only that one project
 * is checked. Otherwise the folder is treated as a container (e.g. `projects/`) and
 * every direct subdirectory is checked as its own project (e.g. `npx ui5-blueprint-audit projects/`).
 *
 * @param cwd - The current working directory, used when `targetDir` is omitted.
 * @param targetDir - The folder given on the command line, resolved relative to `cwd`.
 * @returns Absolute paths of every project directory to check.
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
