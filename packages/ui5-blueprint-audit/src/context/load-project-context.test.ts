import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadProjectContext, ProjectContextError } from "./load-project-context.js";

function createProject(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-context-"));
  for (const [relPath, content] of Object.entries(files)) {
    const absolute = join(root, relPath);
    mkdirSync(join(absolute, ".."), { recursive: true });
    writeFileSync(absolute, content, "utf8");
  }
  return root;
}

describe("loadProjectContext", () => {
  it("lists files and directories with forward-slash paths relative to the project root", () => {
    const root = createProject({ "webapp/view/App.view.xml": "<View/>", "ui5.yaml": "type: application\n" });

    const paths = loadProjectContext(root, "fs").fileTree.map((e) => `${e.path}${e.isDirectory ? "/" : ""}`);

    expect(paths.sort()).toEqual(["ui5.yaml", "webapp/", "webapp/view/", "webapp/view/App.view.xml"]);
  });

  it("skips dependency, build, tool-output and hidden directories, at any depth", () => {
    const root = createProject({
      "webapp/Component.ts": "",
      "node_modules/pkg/index.js": "",
      "dist/Component.js": "",
      "coverage/lcov.info": "",
      "ui5-blueprint-audit-report/report.html": "",
      ".git/config": "",
      ".stryker-tmp/sandbox/webapp/Component.ts": "",
      "webapp/node_modules/x.js": "",
      ".gitignore": "dist\n",
    });

    const paths = loadProjectContext(root, "fs").fileTree.map((e) => e.path);

    expect(paths.sort()).toEqual([".gitignore", "webapp", "webapp/Component.ts"]);
  });

  it("reads each file from disk only once", () => {
    const root = createProject({ "webapp/view/App.view.xml": "<View/>" });
    const context = loadProjectContext(root, "fs");

    expect(context.readFile("webapp/view/App.view.xml")).toBe("<View/>");
    rmSync(join(root, "webapp/view/App.view.xml"));

    expect(context.readFile("webapp/view/App.view.xml")).toBe("<View/>");
  });

  it("returns undefined for a missing file and for a directory", () => {
    const root = createProject({ "webapp/view/App.view.xml": "<View/>" });
    const context = loadProjectContext(root, "fs");

    expect(context.readFile("webapp/missing.xml")).toBeUndefined();
    expect(context.readFile("webapp/view")).toBeUndefined();
  });

  it("parses manifest.json, ui5.yaml, ui5-*.yaml, package.json and index.html", () => {
    const root = createProject({
      "webapp/manifest.json": '{ "sap.app": { "id": "a.b" } }',
      "webapp/index.html": "<html></html>",
      "ui5.yaml": "type: application\n",
      "ui5-deploy.yaml": "builder: {}\n",
      "package.json": '{ "version": "1.2.3" }',
    });

    const context = loadProjectContext(root, "fs");

    expect(context.manifest).toEqual({ "sap.app": { id: "a.b" } });
    expect(context.ui5Yaml).toEqual({ type: "application" });
    expect(context.ui5YamlExtensions).toEqual({ "ui5-deploy.yaml": { builder: {} } });
    expect(context.packageJson).toEqual({ version: "1.2.3" });
    expect(context.indexHtml).toBe("<html></html>");
  });

  it("throws a ProjectContextError for an existing but unparseable file", () => {
    const root = createProject({ "ui5.yaml": "type: [unclosed\n" });

    expect(() => loadProjectContext(root, "fs")).toThrow(ProjectContextError);
  });
});
