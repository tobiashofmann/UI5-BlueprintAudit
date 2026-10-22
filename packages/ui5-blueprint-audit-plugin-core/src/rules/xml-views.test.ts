import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { xmlViewsRule } from "./xml-views.js";

describe("xml-views", () => {
  it("ist erfüllt bei reinen XML Views", () => {
    const ctx = createTestContext({
      files: { "webapp/view/App.view.xml": "<mvc:View/>" },
    });

    expect(runRule(xmlViewsRule, ctx)).toEqual([]);
  });

  it("meldet .view.js-Dateien und jsview-Nutzung", () => {
    const ctx = createTestContext({
      files: {
        "webapp/view/Legacy.view.js": "",
        "webapp/controller/App.controller.js": "sap.ui.jsview('x');",
      },
    });

    const findings = runRule(xmlViewsRule, ctx);
    expect(findings).toHaveLength(2);
  });

  it("überspringt Libraries ohne eigene Controls", () => {
    const ctx = createTestContext({
      projectType: "lib",
      files: { "webapp/view/Legacy.view.js": "" },
    });

    expect(runRule(xmlViewsRule, ctx)).toEqual([]);
  });

  it("prüft Libraries mit eigenen Controls (Quelle liegt unter src/, nicht webapp/)", () => {
    const ctx = createTestContext({
      projectType: "lib",
      files: {
        "src/MyControl.ts": "export default class MyControl extends Control {}",
        "src/view/Legacy.view.js": "",
      },
    });

    expect(runRule(xmlViewsRule, ctx)).toHaveLength(1);
  });
});
