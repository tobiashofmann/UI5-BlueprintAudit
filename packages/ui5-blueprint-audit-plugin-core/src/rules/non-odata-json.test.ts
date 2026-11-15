import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { nonOdataJsonRule } from "./non-odata-json.js";

describe("non-odata-json", () => {
  it("passes without non-OData dataSources", () => {
    const ctx = createTestContext({ manifest: { "sap.app": {}, "sap.ui5": {} } });

    expect(runRule(nonOdataJsonRule, ctx)).toEqual([]);
  });

  it("passes if type is JSON and a JSONModel is assigned", () => {
    const ctx = createTestContext({
      manifest: {
        "sap.app": { dataSources: { config: { type: "JSON" } } },
        "sap.ui5": { models: { config: { type: "sap.ui.model.json.JSONModel", dataSource: "config" } } },
      },
    });

    expect(runRule(nonOdataJsonRule, ctx)).toEqual([]);
  });

  it("reports a wrong dataSource type", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { dataSources: { config: { type: "ODataAnnotation" } } }, "sap.ui5": {} },
    });

    expect(runRule(nonOdataJsonRule, ctx)).toHaveLength(1);
  });

  it("reports a wrong model for a JSON dataSource", () => {
    const ctx = createTestContext({
      manifest: {
        "sap.app": { dataSources: { config: { type: "JSON" } } },
        "sap.ui5": { models: { config: { type: "sap.ui.model.odata.v4.ODataModel", dataSource: "config" } } },
      },
    });

    expect(runRule(nonOdataJsonRule, ctx)).toHaveLength(1);
  });

  it("skips itself for FLP plugins (sap.app/type: component), even with a wrong dataSource type", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { type: "component", dataSources: { config: { type: "ODataAnnotation" } } } },
    });

    expect(runRule(nonOdataJsonRule, ctx)).toEqual([]);
  });
});
