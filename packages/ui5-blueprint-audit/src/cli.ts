#!/usr/bin/env node

import { existsSync, mkdirSync, realpathSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import type { LocaleCode, ProjectType } from "@abap/ui5-blueprint-audit-types";
import { createTranslator, mergeLocaleRegistries } from "@abap/ui5-blueprint-audit-types";
import { DEFAULT_CONFIG_YAML } from "./config/default-config-template.js";
import { resolveProjectDirs } from "./engine/resolve-project-dirs.js";
import { runProject } from "./engine/run-project.js";
import { hasErrorFindings, type ProjectResult } from "./engine/types.js";
import { renderHtmlReport } from "./report/html.js";
import { renderJUnitReport } from "./report/junit.js";
import { renderMarkdownReport } from "./report/markdown.js";
import { renderMarkdownTable } from "./report/markdown-table.js";
import { renderTextSummary } from "./report/text.js";

const VALID_PROJECT_TYPES = new Set<ProjectType>(["fs", "fe", "lib"]);
const CONFIG_FILE_NAME = "ui5-blueprint-audit.yaml";
const DEFAULT_LANGUAGES: LocaleCode[] = ["de", "en"];

/**
 * Parses and validates the CLI's own flags (`--type`, `--lang`, `--out`, `--help`) plus
 * the positional target folder. Exported for testing; not part of the published package API.
 *
 * @param argv - Argument vector, without the `node`/script entries (i.e. `process.argv.slice(2)`).
 * @throws If `--type` is given but isn't one of "fs", "fe", "lib".
 */
export function parseCliArgs(argv: string[]) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      type: { type: "string" },
      lang: { type: "string" },
      out: { type: "string" },
      init: { type: "boolean" },
      force: { type: "boolean" },
      table: { type: "boolean" },
      help: { type: "boolean" },
    },
  });

  if (values.type !== undefined && !VALID_PROJECT_TYPES.has(values.type as ProjectType)) {
    throw new Error(`Invalid --type "${values.type}". Allowed: fs, fe, lib.`);
  }

  const cliLanguages = values.lang
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    targetDir: positionals[0],
    cliProjectType: values.type as ProjectType | undefined,
    cliLanguages,
    outDir: values.out ?? "ui5-blueprint-audit-report",
    init: values.init ?? false,
    force: values.force ?? false,
    table: values.table ?? false,
    help: values.help ?? false,
  };
}

/**
 * Writes the default `ui5-blueprint-audit.yaml` into `dir`. Exported for testing.
 *
 * @param dir - Directory to create the file in (the current working directory for `--init`).
 * @param force - Overwrite an existing file instead of aborting.
 * @returns The absolute path of the written file.
 * @throws If the file already exists and `force` is not set.
 */
export function writeDefaultConfig(dir: string, force = false): string {
  const target = resolve(dir, CONFIG_FILE_NAME);
  if (existsSync(target) && !force) {
    throw new Error(`${target} already exists. Use --force to overwrite it.`);
  }
  writeFileSync(target, DEFAULT_CONFIG_YAML, "utf8");
  return target;
}

/** Prints the `--help` usage text to stdout. Exported for testing. */
export function printHelp(): void {
  console.log(`ui5-blueprint-audit [folder] [--type fs|fe|lib] [--lang de,en,pt-BR] [--out <directory>] [--table]
ui5-blueprint-audit --init [--force]

Without a folder, the current directory is checked as one project.
If the given folder itself is a UI5 project (ui5.yaml with type application or library,
or webapp/manifest.json), only that one project is checked. Otherwise it counts as a
container (e.g. "projects/") and every direct subdirectory is checked as its own project.

Options:
  --type fs|fe|lib     Project type, overrides "projectType" in ui5-blueprint-audit.yaml.
  --lang de,en,pt-BR   Output languages, overrides "languages" in ui5-blueprint-audit.yaml.
                        Default: de,en. report.xml always stays English regardless.
  --out <dir>          Target folder for the reports (default: ui5-blueprint-audit-report).
  --table              Additionally writes a compact table per language (table_<locale>.md):
                        rule, status and, for findings, the message.
  --init               Creates the default configuration ui5-blueprint-audit.yaml in the
                        current directory (e.g. via "npx @abap/ui5-blueprint-audit --init")
                        and exits without checking.
  --force              With --init: overwrite an existing ui5-blueprint-audit.yaml.
  --help               Show this help.`);
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/**
 * True if `moduleUrl` is the script Node was started with. `argv1` is the symlink path when
 * started via npx / `node_modules/.bin`, while `moduleUrl` (`import.meta.url`) is the real
 * path, so symlinks are resolved before comparing. Exported for testing.
 */
export function isEntryPoint(argv1: string | undefined, moduleUrl: string): boolean {
  if (!argv1) return false;
  try {
    return moduleUrl === pathToFileURL(realpathSync(argv1)).href;
  } catch {
    return moduleUrl === pathToFileURL(argv1).href;
  }
}

/**
 * The CLI entry point: parses args, runs every resolved project, prints the text summary,
 * writes `report_<locale>.md` per active language plus `report.xml` (always English) and
 * `report.html` (all active languages), and sets `process.exitCode` to 1 if any project
 * has an error-severity finding (see CLAUDE.md, "Output and exit codes"). Exported for
 * testing; actually invoked only when this module is run as a script (see the
 * `import.meta.url` check below), not on import.
 */
export async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const cwd = process.cwd();

  if (args.init) {
    console.log(`Created ${writeDefaultConfig(cwd, args.force)}`);
    return;
  }

  const projectDirs = resolveProjectDirs(cwd, args.targetDir);

  const runResults = await Promise.all(
    projectDirs.map((dir) => runProject(dir, { cliProjectType: args.cliProjectType, cliLanguages: args.cliLanguages })),
  );
  // --lang wins; otherwise the languages each project's config resolved to (first project's
  // order first), so the console summary and report files follow `languages` from the config.
  const configuredLocales = [...new Set(runResults.flatMap((r) => r.languages))];
  const activeLocales = args.cliLanguages ?? (configuredLocales.length > 0 ? configuredLocales : DEFAULT_LANGUAGES);
  const resultsByProject = runResults.map((r) => r.byLocale);

  // Merges the locale registries of all projects, so that report-chrome labels (title,
  // column headers, etc.) can use add-on languages from ONE project, even if other
  // projects in the same run don't load those plugins.
  const combinedRegistry = mergeLocaleRegistries(runResults.map((r) => r.registry), "en");

  const consoleLocale = activeLocales[0] ?? "en";
  const consoleProjects = resultsByProject.map((r) => r[consoleLocale]).filter(isDefined);
  console.log(renderTextSummary(consoleProjects));

  const outDir = resolve(cwd, args.outDir);
  mkdirSync(outDir, { recursive: true });

  const translators = Object.fromEntries(
    activeLocales.map((locale) => [locale, createTranslator(combinedRegistry, locale)]),
  );

  for (const locale of activeLocales) {
    const projects: ProjectResult[] = resultsByProject.map((r) => r[locale]).filter(isDefined);
    writeFileSync(resolve(outDir, `report_${locale}.md`), renderMarkdownReport(projects, translators[locale]!), "utf8");
  }

  if (args.table) {
    const generatedAt = new Date();
    for (const locale of activeLocales) {
      const projects: ProjectResult[] = resultsByProject.map((r) => r[locale]).filter(isDefined);
      writeFileSync(resolve(outDir, `table_${locale}.md`), renderMarkdownTable(projects, translators[locale]!, generatedAt), "utf8");
    }
  }

  const englishProjects: ProjectResult[] = resultsByProject.map((r) => r.en).filter(isDefined);
  writeFileSync(resolve(outDir, "report.xml"), renderJUnitReport(englishProjects), "utf8");

  const projectsByLocale = Object.fromEntries(
    activeLocales.map((locale) => [locale, resultsByProject.map((r) => r[locale]).filter(isDefined)]),
  );
  writeFileSync(resolve(outDir, "report.html"), renderHtmlReport(projectsByLocale, translators, activeLocales), "utf8");

  console.log(`\nReports written to ${outDir}`);

  process.exitCode = resultsByProject.some((r) => Object.values(r).some(hasErrorFindings)) ? 1 : 0;
}

// Only run when started directly as a script (e.g. `npx @abap/ui5-blueprint-audit`), not
// when imported by tests.
if (isEntryPoint(process.argv[1], import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
