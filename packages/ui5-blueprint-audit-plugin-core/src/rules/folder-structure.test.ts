import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { folderStructureRule } from "./folder-structure.js";

describe("folder-structure", () => {
  it("passes if all required folders exist and files are in the right place", () => {
    const ctx = createTestContext({
      files: {
        "webapp/view/App.view.xml": "",
        "webapp/controller/App.controller.ts": "",
        "webapp/model/models.ts": "",
      },
    });

    expect(runRule(folderStructureRule, ctx)).toEqual([]);
  });

  it("reports a missing model folder", () => {
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

  it("reports views/controllers in the wrong place", () => {
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
