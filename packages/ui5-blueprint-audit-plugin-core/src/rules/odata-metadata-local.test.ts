import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { odataMetadataLocalRule } from "./odata-metadata-local.js";

describe("odata-metadata-local", () => {
  it("passes if the local metadata file exists", () => {
    const ctx = createTestContext({
      manifest: {
        "sap.app": {
          dataSources: { northwind: { type: "OData", settings: { localUri: "localService/metadata.xml" } } },
        },
      },
      files: { "webapp/localService/metadata.xml": "<edmx:Edmx/>" },
    });

    expect(runRule(odataMetadataLocalRule, ctx)).toEqual([]);
  });

  it("reports a missing localUri", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { dataSources: { northwind: { type: "OData" } } } },
    });

    expect(runRule(odataMetadataLocalRule, ctx)).toHaveLength(1);
  });

  it("reports a missing metadata file", () => {
    const ctx = createTestContext({
      manifest: {
        "sap.app": {
          dataSources: { northwind: { type: "OData", settings: { localUri: "localService/metadata.xml" } } },
        },
      },
      files: {},
    });

    expect(runRule(odataMetadataLocalRule, ctx)).toHaveLength(1);
  });

  it("skips itself for FLP plugins (sap.app/type: component), even with a missing localUri", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { type: "component", dataSources: { northwind: { type: "OData" } } } },
    });

    expect(runRule(odataMetadataLocalRule, ctx)).toEqual([]);
  });
});
