import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { odataServiceRule } from "./odata-service.js";

function manifestWithOData() {
  return {
    "sap.app": {
      dataSources: {
        northwind: { uri: "...", type: "OData" },
      },
    },
    "sap.ui5": {
      models: {
        "": { dataSource: "northwind" },
      },
    },
  };
}

describe("odata-service", () => {
  it("ist erfüllt, wenn mindestens ein verknüpfter OData-Service existiert", () => {
    const ctx = createTestContext({ manifest: manifestWithOData() });

    expect(runRule(odataServiceRule, ctx)).toEqual([]);
  });

  it("meldet, wenn kein OData-Service konfiguriert ist", () => {
    const ctx = createTestContext({ manifest: { "sap.app": {}, "sap.ui5": {} } });

    expect(runRule(odataServiceRule, ctx)).toHaveLength(1);
  });

  it("ignoriert dataSources, die keinem Model zugeordnet sind", () => {
    const ctx = createTestContext({
      manifest: {
        "sap.app": { dataSources: { northwind: { type: "OData" } } },
        "sap.ui5": { models: {} },
      },
    });

    expect(runRule(odataServiceRule, ctx)).toHaveLength(1);
  });

  it("meldet, wenn max überschritten wird", () => {
    const ctx = createTestContext({
      manifest: {
        "sap.app": {
          dataSources: {
            a: { type: "OData" },
            b: { type: "OData" },
          },
        },
        "sap.ui5": { models: { a: { dataSource: "a" }, b: { dataSource: "b" } } },
      },
    });

    expect(runRule(odataServiceRule, ctx, { min: 1, max: 1 })).toHaveLength(1);
  });

  it("überspringt sich für FLP-Plugins (sap.app/type: component), auch ohne OData-Service", () => {
    const ctx = createTestContext({ manifest: { "sap.app": { type: "component" }, "sap.ui5": {} } });

    expect(runRule(odataServiceRule, ctx)).toEqual([]);
  });
});
