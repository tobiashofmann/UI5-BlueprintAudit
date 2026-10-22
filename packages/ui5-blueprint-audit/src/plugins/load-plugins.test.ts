import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildRuleMap, loadPlugins, PluginLoadError } from "./load-plugins.js";

function writePluginFile(dir: string, fileName: string, content: string): string {
  const path = join(dir, fileName);
  writeFileSync(path, content, "utf8");
  return path;
}

describe("loadPlugins", () => {
  it("lädt immer das Kern-Plugin, auch ohne zusätzliche Plugins", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-plugins-"));
    const configPath = join(dir, "ui5-blueprint-audit.yaml");

    const plugins = await loadPlugins(configPath, []);

    expect(plugins).toHaveLength(1);
    expect(plugins[0]?.name).toBe("core");
  });

  it("lädt ein lokales Plugin relativ zur Config-Datei", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-plugins-"));
    const configPath = join(dir, "ui5-blueprint-audit.yaml");
    writePluginFile(
      dir,
      "local-plugin.mjs",
      `export default {
        name: "local",
        apiVersion: "1",
        rules: { "my-rule": { meta: { description: "x", defaultSeverity: "warn", projectTypes: ["fs"] }, check() {} } },
      };`,
    );

    const plugins = await loadPlugins(configPath, ["./local-plugin.mjs"]);

    expect(plugins.map((p) => p.name)).toEqual(["core", "local"]);
  });

  it("wirft einen klaren Fehler bei falscher apiVersion", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-plugins-"));
    const configPath = join(dir, "ui5-blueprint-audit.yaml");
    writePluginFile(
      dir,
      "bad-version.mjs",
      `export default { name: "bad", apiVersion: "99", rules: {} };`,
    );

    await expect(loadPlugins(configPath, ["./bad-version.mjs"])).rejects.toThrow(PluginLoadError);
  });

  it("wirft einen klaren Fehler bei ungültigem Default-Export", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-plugins-"));
    const configPath = join(dir, "ui5-blueprint-audit.yaml");
    writePluginFile(dir, "invalid.mjs", `export default { oops: true };`);

    await expect(loadPlugins(configPath, ["./invalid.mjs"])).rejects.toThrow(PluginLoadError);
  });
});

describe("buildRuleMap", () => {
  it("lässt Kern-Regeln ohne Präfix und präfixt alle weiteren Plugins", () => {
    const map = buildRuleMap([
      { name: "core", apiVersion: "1", rules: { "core-rule": { meta: {} as never, check() {} } } },
      { name: "extra", apiVersion: "1", rules: { "extra-rule": { meta: {} as never, check() {} } } },
    ]);

    expect(Object.keys(map)).toEqual(["core-rule", "extra/extra-rule"]);
  });
});
