import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveProjectDirs } from "./resolve-project-dirs.js";

describe("resolveProjectDirs", () => {
  it("liefert nur das cwd, wenn kein Ordner angegeben ist", () => {
    expect(resolveProjectDirs("/some/cwd")).toEqual(["/some/cwd"]);
  });

  it("liefert die direkten Unterordner eines angegebenen Ordners", () => {
    const root = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-dirs-"));
    mkdirSync(join(root, "projects", "a"), { recursive: true });
    mkdirSync(join(root, "projects", "b"), { recursive: true });
    mkdirSync(join(root, "projects", "node_modules"), { recursive: true });
    mkdirSync(join(root, "projects", ".hidden"), { recursive: true });

    const dirs = resolveProjectDirs(root, "projects");

    expect(dirs).toEqual([join(root, "projects", "a"), join(root, "projects", "b")]);
  });

  it("löst den Ordner relativ zum cwd auf", () => {
    const root = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-dirs-"));
    mkdirSync(join(root, "sub", "x"), { recursive: true });

    expect(resolveProjectDirs(root, "sub")).toEqual([join(root, "sub", "x")]);
  });

  it("behandelt den angegebenen Ordner selbst als Projekt, wenn er webapp/manifest.json hat", () => {
    const root = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-dirs-"));
    mkdirSync(join(root, "my-app", "webapp"), { recursive: true });
    writeFileSync(join(root, "my-app", "webapp", "manifest.json"), "{}", "utf8");

    expect(resolveProjectDirs(root, "my-app")).toEqual([join(root, "my-app")]);
  });

  it("erkennt eine Library (ui5.yaml: type: library, kein webapp/) als ein Projekt, nicht als Container", () => {
    const root = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-dirs-"));
    mkdirSync(join(root, "my-lib", "src", "my", "ns"), { recursive: true });
    mkdirSync(join(root, "my-lib", "test"), { recursive: true });
    writeFileSync(join(root, "my-lib", "ui5.yaml"), 'specVersion: "4.0"\ntype: library\n', "utf8");

    expect(resolveProjectDirs(root, "my-lib")).toEqual([join(root, "my-lib")]);
  });

  it("erkennt eine App auch über ui5.yaml: type: application, ohne webapp/manifest.json", () => {
    const root = mkdtempSync(join(tmpdir(), "ui5-blueprint-audit-dirs-"));
    mkdirSync(join(root, "my-app"), { recursive: true });
    writeFileSync(join(root, "my-app", "ui5.yaml"), 'specVersion: "4.0"\ntype: application\n', "utf8");

    expect(resolveProjectDirs(root, "my-app")).toEqual([join(root, "my-app")]);
  });
});
