import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { noCustomControlsRule } from "./no-custom-controls.js";

describe("no-custom-controls", () => {
  it("ist erfüllt, wenn keine Klasse Control/Element erweitert", () => {
    const ctx = createTestContext({
      files: { "webapp/controller/App.controller.ts": "export default class App extends Controller {}" },
    });

    expect(runRule(noCustomControlsRule, ctx)).toEqual([]);
  });

  it("meldet eine Klasse, die Control erweitert", () => {
    const ctx = createTestContext({
      files: { "webapp/MyControl.ts": "export default class MyControl extends Control {}" },
    });

    expect(runRule(noCustomControlsRule, ctx)).toHaveLength(1);
  });

  it("ignoriert erlaubte Control-Namen", () => {
    const ctx = createTestContext({
      files: { "webapp/MyControl.ts": "export default class MyControl extends Control {}" },
    });

    expect(runRule(noCustomControlsRule, ctx, { allow: ["MyControl"] })).toEqual([]);
  });

  it("erkennt auch die Legacy-.extend()-Syntax", () => {
    const ctx = createTestContext({
      files: { "webapp/MyControl.js": 'sap.ui.core.Control.extend("ns.MyControl", {});' },
    });

    expect(runRule(noCustomControlsRule, ctx)).toHaveLength(1);
  });
});
