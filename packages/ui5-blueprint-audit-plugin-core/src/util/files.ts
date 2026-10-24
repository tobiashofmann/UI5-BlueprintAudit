import { minimatch } from "minimatch";
import type { ProjectContext } from "@abap/ui5-blueprint-audit-types";

/**
 * Lists every file (not directory) in the project whose path matches `predicate`.
 *
 * @param ctx - The project context to search.
 * @param predicate - Called with each file's path; return `true` to include it.
 * @returns Matching file paths, in file-tree order.
 */
export function listFiles(ctx: ProjectContext, predicate: (path: string) => boolean): string[] {
  return ctx.fileTree.filter((e) => !e.isDirectory && predicate(e.path)).map((e) => e.path);
}

/**
 * Whether a directory exists in the project, i.e. the file tree has an entry for it or
 * for anything under it.
 *
 * @param ctx - The project context to search.
 * @param dirPath - The directory path to check (trailing slash optional).
 */
export function dirExists(ctx: ProjectContext, dirPath: string): boolean {
  const normalized = dirPath.replace(/\/$/, "");
  const prefix = `${normalized}/`;
  return ctx.fileTree.some((e) => e.path === normalized || e.path.startsWith(prefix));
}

/**
 * Whether a file (not directory) exists at exactly this path in the project.
 *
 * @param ctx - The project context to search.
 * @param filePath - The exact file path to check.
 */
export function fileExists(ctx: ProjectContext, filePath: string): boolean {
  return ctx.fileTree.some((e) => !e.isDirectory && e.path === filePath);
}

/**
 * Whether a path matches at least one of the given glob patterns.
 *
 * @param path - The path to test.
 * @param patterns - Glob patterns (as understood by `minimatch`).
 */
export function matchesAny(path: string, patterns: string[]): boolean {
  return patterns.some((pattern) => minimatch(path, pattern));
}

/**
 * A path's file name without its extension, e.g. `"webapp/App.view.xml"` → `"App"`.
 * Everything from the first dot in the file name onward is treated as the extension,
 * so multi-part extensions like `.view.xml` are stripped in one go.
 */
export function basenameWithoutExt(path: string): string {
  const fileName = path.split("/").pop() ?? path;
  const firstDot = fileName.indexOf(".");
  return firstDot === -1 ? fileName : fileName.slice(0, firstDot);
}
