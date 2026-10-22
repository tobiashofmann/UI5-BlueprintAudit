import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { folderStructureRule } from "./folder-structure.js";

describe("folder-structure", () => {
  it("ist erfüllt, wenn alle Pflichtordner existieren und Dateien korrekt liegen", () => {
    const ctx = createTestContext({
      files: {
        "webapp/view/App.view.xml": "",
        "webapp/controller/App.controller.ts": "",
        "webapp/model/models.ts": "",
      },
    });

    expect(runRule(folderStructureRule, ctx)).toEqual([]);
  });

  it("meldet fehlenden model-Ordner", () => {
    const ctx = createTestContext({
      files: {
        "webapp/view/App.view.xml": "",
        "webapp/controller/App.controller.ts": "",
      },
    });

    const findings = runRule(folderStructureRule, ctx);
    expect(findings).toHaveLength(1);
    expect(findings[0]?.file).toBe("webapp/model");
  });

  it("meldet Views/Controller am falschen Ort", () => {
    const ctx = createTestContext({
      files: {
        "webapp/App.view.xml": "",
        "webapp/App.controller.ts": "",
      },
      extraEntries: [
        { path: "webapp/view", isDirectory: true },
        { path: "webapp/controller", isDirectory: true },
        { path: "webapp/model", isDirectory: true },
      ],
    });

    expect(runRule(folderStructureRule, ctx)).toHaveLength(2);
  });
});
