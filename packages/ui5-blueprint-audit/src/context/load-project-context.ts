import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import type { FileTreeEntry, ManifestJson, ProjectContext, ProjectType } from "@abap/ui5-blueprint-audit-types";

/**
 * Directories the file tree never descends into: dependencies, build and tool output.
 * None of them holds project sources, and they can be far larger than the project itself.
 * Hidden directories (`.git`, `.stryker-tmp`, …) are skipped as well, see {@link walk}.
 */
const IGNORED_DIRS = new Set(["node_modules", "dist", "coverage", "ui5-blueprint-audit-report"]);

/**
 * Collects the file tree below `absoluteDir`. `relativeDir` is the same directory relative
 * to the project root, in forward-slash notation (empty for the root itself); passing it
 * down avoids recomputing a relative path for every entry.
 */
function walk(absoluteDir: string, relativeDir: string, out: FileTreeEntry[]): void {
  for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
    const relPath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
      out.push({ path: relPath, isDirectory: true });
      walk(join(absoluteDir, entry.name), relPath, out);
    } else if (entry.isFile()) {
      out.push({ path: relPath, isDirectory: false });
    }
  }
}

function readProjectFile(root: string, relPath: string): string | undefined {
  try {
    return readFileSync(join(root, relPath), "utf8");
  } catch {
    // Missing, a directory, or unreadable: all "no such file" from a rule's point of view.
    return undefined;
  }
}

/**
 * A `readFile` that hits the disk once per path. Rules run once per output language and
 * several rules read the same views and sources, so without this every file would be read
 * again for each rule and language.
 */
function createCachedReader(root: string): (relPath: string) => string | undefined {
  const cache = new Map<string, string | undefined>();
  return (relPath) => {
    if (!cache.has(relPath)) cache.set(relPath, readProjectFile(root, relPath));
    return cache.get(relPath);
  };
}

/**
 * A project file exists but can't be parsed. Like ConfigError: key/params for localized
 * display, message as the English fallback.
 */
export class ProjectContextError extends Error {
  constructor(
    public readonly key: string,
    public readonly params: Record<string, string> | undefined,
    fallbackMessage: string,
  ) {
    super(fallbackMessage);
  }
}

/**
 * Parses a project file that exists. A missing file stays `undefined` (rules handle that),
 * but a broken one must not look like a missing one — that would bury the real cause
 * under a pile of follow-up findings.
 */
function parseProjectFile<T>(relPath: string, content: string | undefined, parser: (text: string) => T): T | undefined {
  if (content === undefined) return undefined;
  try {
    return parser(content);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new ProjectContextError(
      "context.unparseableFile",
      { file: relPath, error: reason },
      `${relPath} could not be parsed: ${reason}`,
    );
  }
}

type ReadFile = (relPath: string) => string | undefined;

function parseJsonFile(readFile: ReadFile, relPath: string): ManifestJson | undefined {
  return parseProjectFile(relPath, readFile(relPath), (text) => JSON.parse(text) as ManifestJson);
}

function parseYamlFile(readFile: ReadFile, relPath: string): unknown {
  return parseProjectFile(relPath, readFile(relPath), (text) => parseYaml(text) as unknown);
}

/**
 * Reads manifest.json, ui5.yaml, further ui5-*.yaml files, package.json, index.html, and
 * the file tree of a project once. The file tree leaves out hidden directories, `node_modules`,
 * `dist`, `coverage`, and the tool's own default report folder. `readFile` caches per path. Rules only access this via the resulting ProjectContext,
 * never the file system directly (see CLAUDE.md, "Project Context").
 *
 * @param projectRoot - Absolute path to the project directory to read.
 * @param projectType - The project's type, as resolved by `loadConfig` (not auto-detected here).
 * @throws {ProjectContextError} If one of these files exists but is not valid JSON/YAML.
 * @returns The project's context: parsed manifest/config files, file tree, and a `readFile` accessor.
 */
export function loadProjectContext(projectRoot: string, projectType: ProjectType): ProjectContext {
  const fileTree: FileTreeEntry[] = [];
  walk(projectRoot, "", fileTree);
  const readFile = createCachedReader(projectRoot);

  const manifest = parseJsonFile(readFile, "webapp/manifest.json");
  const ui5Yaml = parseYamlFile(readFile, "ui5.yaml");
  const packageJson = parseJsonFile(readFile, "package.json");
  const indexHtml = readFile("webapp/index.html");

  const ui5YamlExtensions: Record<string, unknown> = {};
  for (const entry of fileTree) {
    if (entry.isDirectory) continue;
    if (!entry.path.includes("/") && /^ui5-.*\.yaml$/.test(entry.path) && entry.path !== "ui5.yaml") {
      const parsed = parseYamlFile(readFile, entry.path);
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
    readFile,
  };
}
