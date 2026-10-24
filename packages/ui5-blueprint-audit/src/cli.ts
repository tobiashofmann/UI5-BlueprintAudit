#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import type { LocaleCode, ProjectType } from "@abap/ui5-blueprint-audit-types";
import { createTranslator, mergeLocaleRegistries } from "@abap/ui5-blueprint-audit-types";
import { resolveProjectDirs } from "./engine/resolve-project-dirs.js";
import { runProject } from "./engine/run-project.js";
import { hasErrorFindings, type ProjectResult } from "./engine/types.js";
import { renderHtmlReport } from "./report/html.js";
import { renderJUnitReport } from "./report/junit.js";
import { renderMarkdownReport } from "./report/markdown.js";
import { renderTextSummary } from "./report/text.js";

const VALID_PROJECT_TYPES = new Set<ProjectType>(["fs", "fe", "lib"]);
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
      help: { type: "boolean" },
    },
  });

  if (values.type !== undefined && !VALID_PROJECT_TYPES.has(values.type as ProjectType)) {
    throw new Error(`Ungültiger --type "${values.type}". Erlaubt: fs, fe, lib.`);
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
    help: values.help ?? false,
  };
}

/** Prints the `--help` usage text to stdout. Exported for testing. */
export function printHelp(): void {
  console.log(`ui5-blueprint-audit [Ordner] [--type fs|fe|lib] [--lang de,en,pt-BR] [--out <Verzeichnis>]

Ohne Ordner wird das aktuelle Verzeichnis als ein Projekt geprüft.
Zeigt der angegebene Ordner selbst auf ein UI5-Projekt (hat webapp/manifest.json),
wird nur dieses eine Projekt geprüft. Sonst gilt er als Container (z. B. "projects/")
und jedes direkte Unterverzeichnis wird als eigenes Projekt geprüft.

Optionen:
  --type fs|fe|lib     Projekttyp, überschreibt "projectType" in ui5-blueprint-audit.yaml.
  --lang de,en,pt-BR   Ausgabesprachen, überschreibt "languages" in ui5-blueprint-audit.yaml.
                        Default: de,en. report.xml bleibt davon unabhängig immer Englisch.
  --out <dir>          Zielordner für die Reports (Default: ui5-blueprint-audit-report).
  --help               Diese Hilfe anzeigen.`);
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
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
  const projectDirs = resolveProjectDirs(cwd, args.targetDir);
  const activeLocales = args.cliLanguages ?? DEFAULT_LANGUAGES;

  const runResults = await Promise.all(
    projectDirs.map((dir) => runProject(dir, { cliProjectType: args.cliProjectType, cliLanguages: args.cliLanguages })),
  );
  const resultsByProject = runResults.map((r) => r.byLocale);

  // Vereinigt die Locale-Registries aller Projekte, damit Report-Chrome-Labels
  // (Titel, Spaltenüberschriften etc.) auch Add-on-Sprachen aus EINEM Projekt nutzen
  // können, selbst wenn andere Projekte im selben Lauf diese Plugins nicht laden.
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

  const englishProjects: ProjectResult[] = resultsByProject.map((r) => r.en).filter(isDefined);
  writeFileSync(resolve(outDir, "report.xml"), renderJUnitReport(englishProjects), "utf8");

  const projectsByLocale = Object.fromEntries(
    activeLocales.map((locale) => [locale, resultsByProject.map((r) => r[locale]).filter(isDefined)]),
  );
  writeFileSync(resolve(outDir, "report.html"), renderHtmlReport(projectsByLocale, translators, activeLocales), "utf8");

  console.log(`\nReports geschrieben nach ${outDir}`);

  process.exitCode = resultsByProject.some((r) => Object.values(r).some(hasErrorFindings)) ? 1 : 0;
}

// Nur ausführen, wenn direkt als Skript gestartet (z. B. `npx ui5-blueprint-audit`),
// nicht beim Import durch Tests.
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
