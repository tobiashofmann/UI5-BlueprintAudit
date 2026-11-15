import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { controllerMatchesViewRule } from "./controller-matches-view.js";

describe("controller-matches-view", () => {
  it("passes if the controller exists", () => {
    const ctx = createTestContext({
      files: {
        "webapp/view/View1.view.xml": '<mvc:View controllerName="ns.controller.View1"></mvc:View>',
        "webapp/controller/View1.controller.ts": "",
      },
    });

    expect(runRule(controllerMatchesViewRule, ctx)).toEqual([]);
  });

  it("reports a view whose controller file is missing", () => {
    const ctx = createTestContext({
      files: {
        "webapp/view/Detail.view.xml": '<mvc:View controllerName="ns.controller.Detail"></mvc:View>',
      },
    });

    expect(runRule(controllerMatchesViewRule, ctx)).toHaveLength(1);
  });

  it("reports a view that points to an existing but wrongly named controller", () => {
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

  it("ignores views without controllerName", () => {
    const ctx = createTestContext({
      files: { "webapp/view/Static.view.xml": "<mvc:View></mvc:View>" },
    });

    expect(runRule(controllerMatchesViewRule, ctx)).toEqual([]);
  });

  it("does not count a test controller of the same name under webapp/test as a match", () => {
    const ctx = createTestContext({
      files: {
        "webapp/view/View1.view.xml": '<mvc:View controllerName="ns.controller.View1"></mvc:View>',
        "webapp/test/unit/controller/View1.controller.ts": "",
      },
    });

    expect(runRule(controllerMatchesViewRule, ctx)).toHaveLength(1);
  });
});
