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
  it("passes if at least one linked OData service exists", () => {
    const ctx = createTestContext({ manifest: manifestWithOData() });

    expect(runRule(odataServiceRule, ctx)).toEqual([]);
  });

  it("reports if no OData service is configured", () => {
    const ctx = createTestContext({ manifest: { "sap.app": {}, "sap.ui5": {} } });

    expect(runRule(odataServiceRule, ctx)).toHaveLength(1);
  });

  it("ignores dataSources that are not assigned to a model", () => {
    const ctx = createTestContext({
      manifest: {
        "sap.app": { dataSources: { northwind: { type: "OData" } } },
        "sap.ui5": { models: {} },
      },
    });

    expect(runRule(odataServiceRule, ctx)).toHaveLength(1);
  });

  it("reports if max is exceeded", () => {
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

  it("skips itself for FLP plugins (sap.app/type: component), even without an OData service", () => {
    const ctx = createTestContext({ manifest: { "sap.app": { type: "component" }, "sap.ui5": {} } });

    expect(runRule(odataServiceRule, ctx)).toEqual([]);
  });
});
