import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildRuleMap, loadPlugins, PluginLoadError } from "./load-plugins.js";

function writePluginFile(dir: string, fileName: string, content: string): string {
  const path = join(dir, fileName);
  writeFileSync(path, content, "utf8");
  return path;
}

/** Creates a project folder with a config path and installs fake npm packages into its node_modules. */
function projectWithPackages(packages: Record<string, { packageJson: object; files: Record<string, string> }>): string {
  const dir = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-npm-"));
  for (const [name, { packageJson, files }] of Object.entries(packages)) {
    const packageDir = join(dir, "node_modules", name);
    mkdirSync(packageDir, { recursive: true });
    writeFileSync(join(packageDir, "package.json"), JSON.stringify({ name, ...packageJson }), "utf8");
    for (const [fileName, content] of Object.entries(files)) writeFileSync(join(packageDir, fileName), content, "utf8");
  }
  return join(dir, "ui5-blueprint-audit.yaml");
}

const esmPlugin = (name: string) => `export default { name: "${name}", apiVersion: "1", rules: {} };`;

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

  describe("npm packages", () => {
    it("resolves a package that only has a main field", async () => {
      const configPath = projectWithPackages({
        "p-main": { packageJson: { type: "module", main: "./index.js" }, files: { "index.js": esmPlugin("p-main") } },
      });

      const plugins = await loadPlugins(configPath, ["p-main"]);

      expect(plugins.map((p) => p.name)).toEqual(["core", "p-main"]);
    });

    it("resolves a package whose exports only declare the import condition", async () => {
      const configPath = projectWithPackages({
        "p-import": {
          packageJson: { type: "module", exports: { ".": { types: "./index.d.ts", import: "./index.js" } } },
          files: { "index.js": esmPlugin("p-import") },
        },
      });

      const plugins = await loadPlugins(configPath, ["p-import"]);

      expect(plugins.map((p) => p.name)).toEqual(["core", "p-import"]);
    });

    it("resolves a scoped package", async () => {
      const configPath = projectWithPackages({
        "@scope/p-scoped": {
          packageJson: { type: "module", exports: { ".": { import: "./index.js" } } },
          files: { "index.js": esmPlugin("scoped") },
        },
      });

      const plugins = await loadPlugins(configPath, ["@scope/p-scoped"]);

      expect(plugins.map((p) => p.name)).toEqual(["core", "scoped"]);
    });

    it("resolves an exported subpath", async () => {
      const configPath = projectWithPackages({
        "p-sub": {
          packageJson: { type: "module", exports: { "./plugin": { import: "./index.js" } } },
          files: { "index.js": esmPlugin("p-sub") },
        },
      });

      const plugins = await loadPlugins(configPath, ["p-sub/plugin"]);

      expect(plugins.map((p) => p.name)).toEqual(["core", "p-sub"]);
    });

    it("prefers the ESM build of a dual package", async () => {
      const configPath = projectWithPackages({
        "p-dual": {
          packageJson: { exports: { ".": { import: "./index.mjs", require: "./index.cjs" } } },
          files: {
            "index.mjs": esmPlugin("dual-esm"),
            "index.cjs": 'exports.default = { name: "dual-cjs", apiVersion: "1", rules: {} };',
          },
        },
      });

      const plugins = await loadPlugins(configPath, ["p-dual"]);

      expect(plugins.map((p) => p.name)).toEqual(["core", "dual-esm"]);
    });

    it("reports a package that is not installed", async () => {
      const configPath = projectWithPackages({});

      await expect(loadPlugins(configPath, ["p-missing"])).rejects.toMatchObject({
        key: "plugin.npmResolveFailed",
        params: { spec: "p-missing" },
      });
    });

    it("reports an installed package that does not export the requested name, distinct from a missing one", async () => {
      const configPath = projectWithPackages({
        "p-sub": {
          packageJson: { type: "module", exports: { "./plugin": { import: "./index.js" } } },
          files: { "index.js": esmPlugin("p-sub") },
        },
      });

      await expect(loadPlugins(configPath, ["p-sub"])).rejects.toMatchObject({
        key: "plugin.npmNotExported",
        params: { spec: "p-sub" },
      });
    });

    it("resolves from the project folder, not from the folder of the tool", async () => {
      // vitest itself is installed next to the tool but not in this project's node_modules.
      const configPath = projectWithPackages({});

      await expect(loadPlugins(configPath, ["vitest"])).rejects.toMatchObject({ key: "plugin.npmResolveFailed" });
    });
  });

  describe("CommonJS plugins", () => {
    it("loads a plugin compiled with exports.default and __esModule", async () => {
      const dir = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-plugins-"));
      writePluginFile(
        dir,
        "compiled.cjs",
        `"use strict"; Object.defineProperty(exports, "__esModule", { value: true });
         exports.default = { name: "compiled", apiVersion: "1", rules: {} };`,
      );

      const plugins = await loadPlugins(join(dir, "ui5-blueprint-audit.yaml"), ["./compiled.cjs"]);

      expect(plugins.map((p) => p.name)).toEqual(["core", "compiled"]);
    });

    it("loads a plugin written with a plain exports.default", async () => {
      const dir = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-plugins-"));
      writePluginFile(dir, "plain.cjs", `exports.default = { name: "plain", apiVersion: "1", rules: {} };`);

      const plugins = await loadPlugins(join(dir, "ui5-blueprint-audit.yaml"), ["./plain.cjs"]);

      expect(plugins.map((p) => p.name)).toEqual(["core", "plain"]);
    });

    it("loads a plugin written with module.exports = plugin", async () => {
      const dir = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-plugins-"));
      writePluginFile(dir, "direct.cjs", `module.exports = { name: "direct", apiVersion: "1", rules: {} };`);

      const plugins = await loadPlugins(join(dir, "ui5-blueprint-audit.yaml"), ["./direct.cjs"]);

      expect(plugins.map((p) => p.name)).toEqual(["core", "direct"]);
    });

    it("still rejects a CommonJS plugin without a valid default export", async () => {
      const dir = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-plugins-"));
      writePluginFile(dir, "empty.cjs", `exports.default = { oops: true };`);

      await expect(loadPlugins(join(dir, "ui5-blueprint-audit.yaml"), ["./empty.cjs"])).rejects.toMatchObject({
        key: "plugin.invalidDefaultExport",
      });
    });
  });
});
