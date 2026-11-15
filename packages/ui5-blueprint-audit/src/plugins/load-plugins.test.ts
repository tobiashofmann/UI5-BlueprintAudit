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
  it("always loads the core plugin, even without additional plugins", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-plugins-"));
    const configPath = join(dir, "ui5-blueprint-audit.yaml");

    const plugins = await loadPlugins(configPath, []);

    expect(plugins).toHaveLength(1);
    expect(plugins[0]?.name).toBe("core");
  });

  it("loads a local plugin relative to the config file", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-plugins-"));
    const configPath = join(dir, "ui5-blueprint-audit.yaml");
    writePluginFile(
      dir,
      "local-plugin.mjs",
      `export default {
        name: "local",
        apiVersion: "1",
        rules: { "my-rule": { meta: { descriptionKey: "x", defaultSeverity: "warn", projectTypes: ["fs"] }, check() {} } },
      };`,
    );

    const plugins = await loadPlugins(configPath, ["./local-plugin.mjs"]);

    expect(plugins.map((p) => p.name)).toEqual(["core", "local"]);
  });

  it("throws a clear error on a wrong apiVersion", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-plugins-"));
    const configPath = join(dir, "ui5-blueprint-audit.yaml");
    writePluginFile(
      dir,
      "bad-version.mjs",
      `export default { name: "bad", apiVersion: "99", rules: {} };`,
    );

    await expect(loadPlugins(configPath, ["./bad-version.mjs"])).rejects.toThrow(PluginLoadError);
  });

  it("throws a clear error on an invalid default export", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-plugins-"));
    const configPath = join(dir, "ui5-blueprint-audit.yaml");
    writePluginFile(dir, "invalid.mjs", `export default { oops: true };`);

    await expect(loadPlugins(configPath, ["./invalid.mjs"])).rejects.toThrow(PluginLoadError);
  });
  it("rejects a plugin rule without valid meta or check function", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-plugins-"));
    const configPath = join(dir, "ui5-blueprint-audit.yaml");
    writePluginFile(
      dir,
      "broken-rule.mjs",
      `export default { name: "broken", apiVersion: "1", rules: { "no-meta": { check() {} } } };`,
    );

    await expect(loadPlugins(configPath, ["./broken-rule.mjs"])).rejects.toMatchObject({
      key: "plugin.invalidRule",
      params: { name: "broken", ruleId: "no-meta" },
    });
    await expect(loadPlugins(configPath, ["./broken-rule.mjs"])).rejects.toBeInstanceOf(PluginLoadError);
  });
});

describe("buildRuleMap", () => {
  it("leaves core rules without a prefix and prefixes all other plugins", () => {
    const map = buildRuleMap([
      { name: "core", apiVersion: "1", rules: { "core-rule": { meta: {} as never, check() {} } } },
      { name: "extra", apiVersion: "1", rules: { "extra-rule": { meta: {} as never, check() {} } } },
    ]);

    expect(Object.keys(map)).toEqual(["core-rule", "extra/extra-rule"]);
  });
});
