import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { main, parseCliArgs, printHelp } from "./cli.js";

const sampleProjectsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "sample-prj");

describe("parseCliArgs", () => {
  it("liefert Defaults, wenn keine Optionen angegeben sind", () => {
    const args = parseCliArgs([]);

    expect(args).toEqual({
      targetDir: undefined,
      cliProjectType: undefined,
      cliLanguages: undefined,
      outDir: "ui5-blueprint-audit-report",
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
});
