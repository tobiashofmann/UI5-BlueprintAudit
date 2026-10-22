import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { odataMetadataLocalRule } from "./odata-metadata-local.js";

describe("odata-metadata-local", () => {
  it("ist erfüllt, wenn die lokale Metadaten-Datei existiert", () => {
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

  it("meldet fehlendes localUri", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { dataSources: { northwind: { type: "OData" } } } },
    });

    expect(runRule(odataMetadataLocalRule, ctx)).toHaveLength(1);
  });

  it("meldet eine fehlende Metadaten-Datei", () => {
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

  it("überspringt sich für FLP-Plugins (sap.app/type: component), auch bei fehlendem localUri", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { type: "component", dataSources: { northwind: { type: "OData" } } } },
    });

    expect(runRule(odataMetadataLocalRule, ctx)).toEqual([]);
  });
});
