import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { nonOdataJsonRule } from "./non-odata-json.js";

describe("non-odata-json", () => {
  it("ist erfüllt ohne Nicht-OData-dataSources", () => {
    const ctx = createTestContext({ manifest: { "sap.app": {}, "sap.ui5": {} } });

    expect(runRule(nonOdataJsonRule, ctx)).toEqual([]);
  });

  it("ist erfüllt, wenn type JSON ist und ein JSONModel zugeordnet ist", () => {
    const ctx = createTestContext({
      manifest: {
        "sap.app": { dataSources: { config: { type: "JSON" } } },
        "sap.ui5": { models: { config: { type: "sap.ui.model.json.JSONModel", dataSource: "config" } } },
      },
    });

    expect(runRule(nonOdataJsonRule, ctx)).toEqual([]);
  });

  it("meldet einen falschen dataSource-type", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { dataSources: { config: { type: "ODataAnnotation" } } }, "sap.ui5": {} },
    });

    expect(runRule(nonOdataJsonRule, ctx)).toHaveLength(1);
  });

  it("meldet ein falsches Model für eine JSON-dataSource", () => {
    const ctx = createTestContext({
      manifest: {
        "sap.app": { dataSources: { config: { type: "JSON" } } },
        "sap.ui5": { models: { config: { type: "sap.ui.model.odata.v4.ODataModel", dataSource: "config" } } },
      },
    });

    expect(runRule(nonOdataJsonRule, ctx)).toHaveLength(1);
  });

  it("überspringt sich für FLP-Plugins (sap.app/type: component), auch bei falschem dataSource-type", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { type: "component", dataSources: { config: { type: "ODataAnnotation" } } } },
    });

    expect(runRule(nonOdataJsonRule, ctx)).toEqual([]);
  });
});
