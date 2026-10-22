import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { controllerMatchesViewRule } from "./controller-matches-view.js";

describe("controller-matches-view", () => {
  it("ist erfüllt, wenn der Controller existiert", () => {
    const ctx = createTestContext({
      files: {
        "webapp/view/View1.view.xml": '<mvc:View controllerName="ns.controller.View1"></mvc:View>',
        "webapp/controller/View1.controller.ts": "",
      },
    });

    expect(runRule(controllerMatchesViewRule, ctx)).toEqual([]);
  });

  it("meldet eine View, deren Controller-Datei fehlt", () => {
    const ctx = createTestContext({
      files: {
        "webapp/view/Detail.view.xml": '<mvc:View controllerName="ns.controller.Detail"></mvc:View>',
      },
    });

    expect(runRule(controllerMatchesViewRule, ctx)).toHaveLength(1);
  });

  it("meldet eine View, die auf einen existierenden, aber falsch benannten Controller verweist", () => {
    const ctx = createTestContext({
      files: {
        "webapp/view/App.view.xml": '<mvc:View controllerName="ns.controller.Home"></mvc:View>',
        "webapp/controller/Home.controller.ts": "",
      },
    });

    const findings = runRule(controllerMatchesViewRule, ctx);
    expect(findings).toHaveLength(1);
    expect(findings[0]?.message).toContain("App");
  });

  it("ignoriert Views ohne controllerName", () => {
    const ctx = createTestContext({
      files: { "webapp/view/Static.view.xml": "<mvc:View></mvc:View>" },
    });

    expect(runRule(controllerMatchesViewRule, ctx)).toEqual([]);
  });

  it("zählt einen gleichnamigen Test-Controller unter webapp/test nicht als Treffer", () => {
    const ctx = createTestContext({
      files: {
        "webapp/view/View1.view.xml": '<mvc:View controllerName="ns.controller.View1"></mvc:View>',
        "webapp/test/unit/controller/View1.controller.ts": "",
      },
    });

    expect(runRule(controllerMatchesViewRule, ctx)).toHaveLength(1);
  });
});
