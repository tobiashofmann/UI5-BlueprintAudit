import type { Finding, FileTreeEntry, LocaleCode, ProjectContext, ProjectType, Rule } from "@abap/ui5-blueprint-audit-types";
import { buildLocaleRegistry, createTranslator } from "@abap/ui5-blueprint-audit-types";
import corePlugin from "./index.js";

const testRegistry = buildLocaleRegistry([corePlugin], "en");

export interface TestContextOptions {
  projectRoot?: string;
  projectType?: ProjectType;
  manifest?: Record<string, unknown>;
  ui5Yaml?: unknown;
  ui5YamlExtensions?: Record<string, unknown>;
  packageJson?: Record<string, unknown>;
  indexHtml?: string;
  /** Dateiinhalte, keyed nach projektrelativem Pfad. Ergänzt den fileTree automatisch. */
  files?: Record<string, string>;
  /** Zusätzliche fileTree-Einträge ohne Inhalt (z. B. leere Verzeichnisse). */
  extraEntries?: FileTreeEntry[];
}

export function createTestContext(options: TestContextOptions = {}): ProjectContext {
  const files = options.files ?? {};
  const fileTree: FileTreeEntry[] = [
    ...Object.keys(files).map((path): FileTreeEntry => ({ path, isDirectory: false })),
    ...(options.extraEntries ?? []),
  ];

  return {
    projectRoot: options.projectRoot ?? "/project",
    projectType: options.projectType ?? "fs",
    manifest: options.manifest,
    ui5Yaml: options.ui5Yaml,
    ui5YamlExtensions: options.ui5YamlExtensions ?? {},
    packageJson: options.packageJson,
    indexHtml: options.indexHtml,
    fileTree,
    readFile: (path: string) => files[path],
  };
}

export function runRule(
  rule: Rule,
  projectContext: ProjectContext,
  options: unknown = {},
  locale: LocaleCode = "en",
): Array<Omit<Finding, "ruleId" | "severity">> {
  const findings: Array<Omit<Finding, "ruleId" | "severity">> = [];
  const t = createTranslator(testRegistry, locale);
  rule.check({ projectContext, options, t, report: (finding) => findings.push(finding) });
  return findings;
}
