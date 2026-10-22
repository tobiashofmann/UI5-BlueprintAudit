import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { parse as parseYaml } from "yaml";
import type { FileTreeEntry, ManifestJson, ProjectContext, ProjectType } from "@abap/ui5-blueprint-audit-types";

const IGNORED_DIRS = new Set(["node_modules", "dist", ".git"]);

function walk(root: string, dir: string, out: FileTreeEntry[]): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const absolute = join(dir, entry.name);
    const relPath = relative(root, absolute).split("\\").join("/");
    if (entry.isDirectory()) {
      out.push({ path: relPath, isDirectory: true });
      walk(root, absolute, out);
    } else if (entry.isFile()) {
      out.push({ path: relPath, isDirectory: false });
    }
  }
}

function readProjectFile(root: string, relPath: string): string | undefined {
  const absolute = join(root, relPath);
  if (!existsSync(absolute) || !statSync(absolute).isFile()) return undefined;
  return readFileSync(absolute, "utf8");
}

function tryParseJson(content: string | undefined): ManifestJson | undefined {
  if (content === undefined) return undefined;
  try {
    return JSON.parse(content) as ManifestJson;
  } catch {
    return undefined;
  }
}

function tryParseYaml(content: string | undefined): unknown {
  if (content === undefined) return undefined;
  try {
    return parseYaml(content);
  } catch {
    return undefined;
  }
}

/**
 * Liest manifest.json, ui5.yaml, weitere ui5-*.yaml, package.json, index.html und den
 * Dateibaum eines Projekts einmalig ein. Regeln greifen nur über den resultierenden
 * ProjectContext zu, nicht selbst aufs Dateisystem (siehe CLAUDE.md, "Project Context").
 */
export function loadProjectContext(projectRoot: string, projectType: ProjectType): ProjectContext {
  const fileTree: FileTreeEntry[] = [];
  walk(projectRoot, projectRoot, fileTree);

  const manifest = tryParseJson(readProjectFile(projectRoot, "webapp/manifest.json"));
  const ui5Yaml = tryParseYaml(readProjectFile(projectRoot, "ui5.yaml"));
  const packageJson = tryParseJson(readProjectFile(projectRoot, "package.json"));
  const indexHtml = readProjectFile(projectRoot, "webapp/index.html");

  const ui5YamlExtensions: Record<string, unknown> = {};
  for (const entry of fileTree) {
    if (entry.isDirectory) continue;
    if (!entry.path.includes("/") && /^ui5-.*\.yaml$/.test(entry.path) && entry.path !== "ui5.yaml") {
      const parsed = tryParseYaml(readProjectFile(projectRoot, entry.path));
      if (parsed !== undefined) ui5YamlExtensions[entry.path] = parsed;
    }
  }

  return {
    projectRoot,
    projectType,
    manifest,
    ui5Yaml,
    ui5YamlExtensions,
    packageJson,
    indexHtml,
    fileTree,
    readFile: (relPath: string) => readProjectFile(projectRoot, relPath),
  };
}
