import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { xmlViewsRule } from "./xml-views.js";

describe("xml-views", () => {
  it("passes with XML views only", () => {
    const ctx = createTestContext({
      files: { "webapp/view/App.view.xml": "<mvc:View/>" },
    });

    expect(runRule(xmlViewsRule, ctx)).toEqual([]);
  });

  it("reports .view.js files and jsview usage", () => {
    const ctx = createTestContext({
      files: {
        "webapp/view/Legacy.view.js": "",
        "webapp/controller/App.controller.js": "sap.ui.jsview('x');",
      },
    });

    const findings = runRule(xmlViewsRule, ctx);
    expect(findings).toHaveLength(2);
  });

  it("skips libraries without their own controls", () => {
    const ctx = createTestContext({
      projectType: "lib",
      files: { "webapp/view/Legacy.view.js": "" },
    });

    expect(runRule(xmlViewsRule, ctx)).toEqual([]);
  });

  it("checks libraries with their own controls (source is under src/, not webapp/)", () => {
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
