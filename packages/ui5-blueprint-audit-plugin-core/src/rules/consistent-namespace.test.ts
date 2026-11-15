import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { consistentNamespaceRule } from "./consistent-namespace.js";

describe("consistent-namespace", () => {
  it("ist erfüllt, wenn alle Artefakte denselben Namensraum verwenden", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { id: "ns.app" }, "sap.ui5": { rootView: { viewName: "ns.app.view.App" } } },
      files: { "webapp/view/View1.view.xml": '<mvc:View controllerName="ns.app.controller.View1"></mvc:View>' },
    });

    expect(runRule(consistentNamespaceRule, ctx)).toEqual([]);
  });

  it("meldet eine View mit abweichendem Namensraum", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { id: "ns.app" }, "sap.ui5": { rootView: { viewName: "ns.app.view.App" } } },
      files: { "webapp/view/View1.view.xml": '<mvc:View controllerName="ns.other.controller.View1"></mvc:View>' },
    });

    expect(runRule(consistentNamespaceRule, ctx)).toHaveLength(1);
  });

  it("meldet einen abweichenden rootView-Namensraum", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { id: "ns.app" }, "sap.ui5": { rootView: { viewName: "ns.other.view.App" } } },
    });

    expect(runRule(consistentNamespaceRule, ctx)).toHaveLength(1);
  });

  it("nutzt bei Libraries ui5.yaml#metadata.name als Basis-Namensraum", () => {
    const ctx = createTestContext({
      projectType: "lib",
      ui5Yaml: { metadata: { name: "ns.lib" } },
    });

    expect(runRule(consistentNamespaceRule, ctx)).toEqual([]);
  });
  it("flags a controllerName that only shares a string prefix with the namespace", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { id: "com.firma" } },
      files: {
        "webapp/view/App.view.xml":
          '<mvc:View xmlns:mvc="sap.ui.core.mvc" controllerName="com.firmaX.controller.App"></mvc:View>',
      },
    });

    expect(runRule(consistentNamespaceRule, ctx)).toHaveLength(1);
  });
});
