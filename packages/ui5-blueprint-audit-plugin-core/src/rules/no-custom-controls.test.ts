import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { noCustomControlsRule } from "./no-custom-controls.js";

describe("no-custom-controls", () => {
  it("passes if no class extends Control/Element", () => {
    const ctx = createTestContext({
      files: { "webapp/controller/App.controller.ts": "export default class App extends Controller {}" },
    });

    expect(runRule(noCustomControlsRule, ctx)).toEqual([]);
  });

  it("reports a class that extends Control", () => {
    const ctx = createTestContext({
      files: { "webapp/MyControl.ts": "export default class MyControl extends Control {}" },
    });

    expect(runRule(noCustomControlsRule, ctx)).toHaveLength(1);
  });

  it("ignores allowed control names", () => {
    const ctx = createTestContext({
      files: { "webapp/MyControl.ts": "export default class MyControl extends Control {}" },
    });

    expect(runRule(noCustomControlsRule, ctx, { allow: ["MyControl"] })).toEqual([]);
  });

  it("also detects the legacy .extend() syntax", () => {
    const ctx = createTestContext({
      files: { "webapp/MyControl.js": 'sap.ui.core.Control.extend("ns.MyControl", {});' },
    });

    expect(runRule(noCustomControlsRule, ctx)).toHaveLength(1);
  });
  it("reports a class that extends a UI5 library control instead of Control", () => {
    const ctx = createTestContext({
      files: {
        "webapp/control/FancyButton.ts":
          'import Button from "sap/m/Button";\nexport default class FancyButton extends Button {}',
      },
    });

    const findings = runRule(noCustomControlsRule, ctx);
    expect(findings).toHaveLength(1);
    expect(findings[0]?.message).toContain("FancyButton");
  });

  it("reports a legacy .extend() on a UI5 library control loaded via sap.ui.define", () => {
    const ctx = createTestContext({
      files: {
        "webapp/control/FancyInput.js":
          'sap.ui.define(["sap/ui/core/library", "sap/m/Input"], function (coreLibrary, Input) {\n  return Input.extend("ns.control.FancyInput", { renderer: {} });\n});',
        "webapp/control/GlobalTable.js": 'sap.ui.table.Table.extend("ns.control.GlobalTable", {});',
      },
    });

    expect(runRule(noCustomControlsRule, ctx).map((f) => f.file)).toEqual([
      "webapp/control/FancyInput.js",
      "webapp/control/GlobalTable.js",
    ]);
  });

  it("reports a class that extends another custom control of the project, at any depth", () => {
    const ctx = createTestContext({
      files: {
        "webapp/control/Special.ts": 'import Derived from "./Derived";\nexport default class Special extends Derived {}',
        "webapp/control/Derived.ts": 'import Base from "./BaseTile";\nexport default class Derived extends Base {}',
        "webapp/control/BaseTile.ts":
          'import GenericTile from "sap/m/GenericTile";\nexport default class BaseTile extends GenericTile {}',
      },
    });

    expect(runRule(noCustomControlsRule, ctx)).toHaveLength(3);
  });

  it("does not report controllers, components, models, routers or plain helper classes", () => {
    const ctx = createTestContext({
      files: {
        "webapp/controller/BaseController.ts":
          'import Controller from "sap/ui/core/mvc/Controller";\nexport default class BaseController extends Controller {}',
        "webapp/controller/App.controller.ts":
          'import BaseController from "./BaseController";\nexport default class App extends BaseController {}',
        "webapp/Component.ts":
          'import UIComponent from "sap/ui/core/UIComponent";\nexport default class Component extends UIComponent {}',
        "webapp/model/AppModel.ts":
          'import JSONModel from "sap/ui/model/json/JSONModel";\nexport default class AppModel extends JSONModel {}',
        "webapp/Router.ts": 'import Router from "sap/m/routing/Router";\nexport default class AppRouter extends Router {}',
        "webapp/util/helper.js":
          'sap.ui.define(["sap/ui/base/Object"], function (BaseObject) {\n  jQuery.extend({}, {});\n  return BaseObject.extend("ns.util.Helper", {});\n});',
      },
    });

    expect(runRule(noCustomControlsRule, ctx)).toEqual([]);
  });
});
