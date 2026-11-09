import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_CONFIG_YAML } from "./config/default-config-template.js";
import { isEntryPoint, main, parseCliArgs, printHelp, writeDefaultConfig } from "./cli.js";

const sampleProjectsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "sample-prj");

describe("parseCliArgs", () => {
  it("liefert Defaults, wenn keine Optionen angegeben sind", () => {
    const args = parseCliArgs([]);

    expect(args).toEqual({
      targetDir: undefined,
      cliProjectType: undefined,
      cliLanguages: undefined,
      outDir: "ui5-blueprint-audit-report",
      init: false,
      force: false,
      help: false,
    });
  });

  it("übernimmt den positionellen Zielordner", () => {
    const args = parseCliArgs(["projects/"]);

    expect(args.targetDir).toBe("projects/");
  });

  it("akzeptiert einen gültigen --type", () => {
    expect(parseCliArgs(["--type", "fs"]).cliProjectType).toBe("fs");
    expect(parseCliArgs(["--type", "fe"]).cliProjectType).toBe("fe");
    expect(parseCliArgs(["--type", "lib"]).cliProjectType).toBe("lib");
  });

  it("wirft bei ungültigem --type", () => {
    expect(() => parseCliArgs(["--type", "nope"])).toThrow(/Ungültiger --type/);
  });

  it("zerlegt --lang in eine getrimmte, nicht-leere Liste", () => {
    expect(parseCliArgs(["--lang", "de, en , ,pt-BR"]).cliLanguages).toEqual(["de", "en", "pt-BR"]);
  });

  it("übernimmt --out", () => {
    expect(parseCliArgs(["--out", "reports"]).outDir).toBe("reports");
  });

  it("recognizes --init and --force", () => {
    const args = parseCliArgs(["--init", "--force"]);

    expect(args.init).toBe(true);
    expect(args.force).toBe(true);
  });

  it("erkennt --help", () => {
    expect(parseCliArgs(["--help"]).help).toBe(true);
  });
});

describe("printHelp", () => {
  it("gibt eine Usage-Beschreibung aus, ohne zu werfen", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    expect(() => printHelp()).not.toThrow();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("ui5-blueprint-audit"));

    logSpy.mockRestore();
  });
});

describe("main", () => {
  let outDir: string;
  let originalArgv: string[];

  beforeEach(() => {
    outDir = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-cli-"));
    originalArgv = process.argv;
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.exitCode = undefined;
    rmSync(outDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("schreibt alle Reports und setzt exitCode 1, wenn das Projekt Error-Findings hat", async () => {
    const projectDir = resolve(sampleProjectsDir, "prj-js");
    process.argv = ["node", "cli.js", projectDir, "--type", "fs", "--out", outDir];

    await main();

    expect(existsSync(join(outDir, "report_de.md"))).toBe(true);
    expect(existsSync(join(outDir, "report_en.md"))).toBe(true);
    expect(existsSync(join(outDir, "report.xml"))).toBe(true);
    expect(existsSync(join(outDir, "report.html"))).toBe(true);
    expect(process.exitCode).toBe(1);
  });

  it("gibt --help-Text aus und schreibt keine Reports", async () => {
    process.argv = ["node", "cli.js", "--help"];

    await main();

    expect(existsSync(outDir)).toBe(true);
    expect(existsSync(join(outDir, "report.xml"))).toBe(false);
  });

  it("nutzt --lang, um nur die angeforderten Report-Sprachen zu schreiben", async () => {
    const projectDir = resolve(sampleProjectsDir, "prj-js");
    process.argv = ["node", "cli.js", projectDir, "--type", "fs", "--lang", "pt-BR", "--out", outDir];

    await main();

    expect(existsSync(join(outDir, "report_pt-BR.md"))).toBe(true);
    expect(existsSync(join(outDir, "report_de.md"))).toBe(false);
    // report.xml bleibt unabhängig von --lang immer Englisch.
    const junit = readFileSync(join(outDir, "report.xml"), "utf8");
    expect(junit).toContain("<testsuites");
  });

  it("follows `languages` from the config for the console summary and report files when --lang is not given", async () => {
    const projectDir = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-cli-config-lang-"));
    try {
      mkdirSync(join(projectDir, "webapp"), { recursive: true });
      writeFileSync(join(projectDir, "webapp", "manifest.json"), JSON.stringify({ "sap.app": { id: "ns.app" } }), "utf8");
      writeFileSync(join(projectDir, "ui5-blueprint-audit.yaml"), "projectType: fs\nlanguages: [en]\n", "utf8");
      const log = vi.spyOn(console, "log").mockImplementation(() => {});
      process.argv = ["node", "cli.js", projectDir, "--out", outDir];

      await main();

      const printed = log.mock.calls.map((call) => String(call[0])).join("\n");
      expect(printed).toMatch(/error\(s\), \d+ warning\(s\)/);
      expect(existsSync(join(outDir, "report_en.md"))).toBe(true);
      expect(existsSync(join(outDir, "report_de.md"))).toBe(false);
    } finally {
      rmSync(projectDir, { recursive: true, force: true });
    }
  });
});

describe("default config template", () => {
  it("is identical to docs/ui5-blueprint-audit.yaml", () => {
    const docsFile = join(sampleProjectsDir, "..", "docs", "ui5-blueprint-audit.yaml");

    expect(DEFAULT_CONFIG_YAML).toBe(readFileSync(docsFile, "utf8"));
  });
});

describe("--init", () => {
  let dir: string;
  let originalCwd: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-init-"));
    originalCwd = process.cwd();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(dir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("writes the default config into the current directory", async () => {
    const originalArgv = process.argv;
    process.chdir(dir);
    process.argv = ["node", "cli.js", "--init"];

    await main();
    process.argv = originalArgv;

    expect(readFileSync(join(dir, "ui5-blueprint-audit.yaml"), "utf8")).toBe(DEFAULT_CONFIG_YAML);
    expect(existsSync(join(dir, "ui5-blueprint-audit-report"))).toBe(false);
  });

  it("refuses to overwrite an existing file without --force", () => {
    writeFileSync(join(dir, "ui5-blueprint-audit.yaml"), "projectType: lib\n", "utf8");

    expect(() => writeDefaultConfig(dir)).toThrow(/already exists/);
    expect(readFileSync(join(dir, "ui5-blueprint-audit.yaml"), "utf8")).toBe("projectType: lib\n");
  });

  it("overwrites an existing file with force", () => {
    writeFileSync(join(dir, "ui5-blueprint-audit.yaml"), "projectType: lib\n", "utf8");

    writeDefaultConfig(dir, true);

    expect(readFileSync(join(dir, "ui5-blueprint-audit.yaml"), "utf8")).toBe(DEFAULT_CONFIG_YAML);
  });
});

describe("isEntryPoint", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-entry-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("is true when argv[1] is the module file itself", () => {
    const file = join(dir, "cli.js");
    writeFileSync(file, "", "utf8");

    expect(isEntryPoint(file, pathToFileURL(realpathSync(file)).href)).toBe(true);
  });

  it("is true when argv[1] is a symlink to the module (npx / node_modules/.bin)", () => {
    const file = join(dir, "cli.js");
    const link = join(dir, "ui5-blueprint-audit");
    writeFileSync(file, "", "utf8");
    symlinkSync(file, link);

    expect(isEntryPoint(link, pathToFileURL(realpathSync(file)).href)).toBe(true);
  });

  it("is false for a different file", () => {
    const file = join(dir, "cli.js");
    const other = join(dir, "other.js");
    writeFileSync(file, "", "utf8");
    writeFileSync(other, "", "utf8");

    expect(isEntryPoint(other, pathToFileURL(realpathSync(file)).href)).toBe(false);
  });

  it("is false without argv[1]", () => {
    expect(isEntryPoint(undefined, "file:///x.js")).toBe(false);
  });

  it("falls back to the plain path when argv[1] does not exist", () => {
    const missing = join(dir, "missing.js");

    expect(isEntryPoint(missing, pathToFileURL(missing).href)).toBe(true);
  });
});
