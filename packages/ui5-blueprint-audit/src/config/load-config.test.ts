import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ConfigError, loadConfig } from "./load-config.js";

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "test", "fixtures", "config");

function projectWithConfig(yaml: string): string {
  const root = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-"));
  writeFileSync(join(root, "ui5-blueprint-audit.yaml"), yaml, "utf8");
  return root;
}

function configErrorKey(yaml: string): string | undefined {
  try {
    loadConfig(projectWithConfig(yaml));
  } catch (error) {
    expect(error).toBeInstanceOf(ConfigError);
    return (error as ConfigError).key;
  }
  return undefined;
}

describe("loadConfig", () => {
  it("liest projectType, plugins und rules aus einer gültigen Config", () => {
    const config = loadConfig(join(fixturesDir, "valid-fs"));

    expect(config.projectType).toBe("fs");
    expect(config.plugins).toEqual(["./guardrails-rules/local.mjs"]);
    expect(config.rules["no-custom-controls"]).toBe("error");
    expect(config.rules.namespace).toEqual(["error", { value: "com.firma" }]);
  });

  it("CLI --type hat Vorrang vor projectType in der Config-Datei", () => {
    const config = loadConfig(join(fixturesDir, "type-override"), { cliProjectType: "fs" });

    expect(config.projectType).toBe("fs");
  });

  it("verwendet projectType aus der Config, wenn kein --type gesetzt ist", () => {
    const config = loadConfig(join(fixturesDir, "type-override"));

    expect(config.projectType).toBe("fe");
  });

  it("bricht ohne Projekttyp (weder CLI noch Config) mit klarer Fehlermeldung ab", () => {
    expect(() => loadConfig(join(fixturesDir, "missing-type"))).toThrow(ConfigError);
    try {
      loadConfig(join(fixturesDir, "missing-type"));
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigError);
      expect((error as ConfigError).key).toBe("config.missingProjectType");
    }
  });

  it("bricht bei einem ungültigen Projekttyp ab", () => {
    try {
      loadConfig(join(fixturesDir, "invalid-type"));
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigError);
      expect((error as ConfigError).key).toBe("config.invalidProjectType");
    }
  });

  it("löst languages mit CLI-Vorrang und Default [de, en] auf", () => {
    const withDefault = loadConfig(join(fixturesDir, "valid-fs"));
    expect(withDefault.languages).toEqual(["de", "en"]);

    const withCli = loadConfig(join(fixturesDir, "valid-fs"), { cliLanguages: ["pt-BR"] });
    expect(withCli.languages).toEqual(["pt-BR"]);
  });

  it("funktioniert ohne Config-Datei, wenn --type gesetzt ist", () => {
    const emptyProject = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-"));

    const config = loadConfig(emptyProject, { cliProjectType: "lib" });

    expect(config.projectType).toBe("lib");
    expect(config.plugins).toEqual([]);
    expect(config.rules).toEqual({});
  });
  it("rejects a misspelled severity instead of running the rule with it", () => {
    expect(configErrorKey("projectType: fs\nrules:\n  namespace: eror\n")).toBe("config.invalidRuleConfig");
    expect(configErrorKey("projectType: fs\nrules:\n  namespace:\n    - eror\n    - value: a.b\n")).toBe(
      "config.invalidRuleConfig",
    );
  });

  it("rejects rule options that are not a mapping", () => {
    expect(configErrorKey("projectType: fs\nrules:\n  namespace: [error, a.b]\n")).toBe("config.invalidRuleConfig");
  });

  it("accepts a severity, [severity] and [severity, options]", () => {
    const config = loadConfig(
      projectWithConfig("projectType: fs\nrules:\n  a: off\n  b: [warn]\n  c:\n    - error\n    - value: x\n"),
    );

    expect(config.rules).toEqual({ a: "off", b: ["warn"], c: ["error", { value: "x" }] });
  });

  it("rejects languages, plugins and rules of the wrong shape", () => {
    expect(configErrorKey("projectType: fs\nlanguages: de\n")).toBe("config.invalidLanguages");
    expect(configErrorKey("projectType: fs\nplugins: ./x.mjs\n")).toBe("config.invalidPlugins");
    expect(configErrorKey("projectType: fs\nrules: [namespace]\n")).toBe("config.invalidRules");
    expect(configErrorKey("- projectType\n")).toBe("config.notAMapping");
  });
});
