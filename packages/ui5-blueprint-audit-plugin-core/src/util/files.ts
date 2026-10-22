import { minimatch } from "minimatch";
import type { ProjectContext } from "@abap/ui5-blueprint-audit-types";

export function listFiles(ctx: ProjectContext, predicate: (path: string) => boolean): string[] {
  return ctx.fileTree.filter((e) => !e.isDirectory && predicate(e.path)).map((e) => e.path);
}

export function dirExists(ctx: ProjectContext, dirPath: string): boolean {
  const normalized = dirPath.replace(/\/$/, "");
  const prefix = `${normalized}/`;
  return ctx.fileTree.some((e) => e.path === normalized || e.path.startsWith(prefix));
}

export function fileExists(ctx: ProjectContext, filePath: string): boolean {
  return ctx.fileTree.some((e) => !e.isDirectory && e.path === filePath);
}

export function matchesAny(path: string, patterns: string[]): boolean {
  return patterns.some((pattern) => minimatch(path, pattern));
}

export function basenameWithoutExt(path: string): string {
  const fileName = path.split("/").pop() ?? path;
  const firstDot = fileName.indexOf(".");
  return firstDot === -1 ? fileName : fileName.slice(0, firstDot);
}
