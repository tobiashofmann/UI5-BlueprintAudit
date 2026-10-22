import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { odataMockdataRule } from "./odata-mockdata.js";

const metadataXml = `<?xml version="1.0"?>
<edmx:Edmx xmlns:edmx="x"><edmx:DataServices><Schema xmlns="y">
  <EntityContainer><EntitySet Name="Products" /><EntitySet Name="Categories" /></EntityContainer>
</Schema></edmx:DataServices></edmx:Edmx>`;

function manifestWithOData() {
  return {
    "sap.app": {
      dataSources: {
        northwind: { type: "OData", settings: { localUri: "localService/metadata.xml" } },
      },
    },
  };
}

describe("odata-mockdata", () => {
  it("mode=any: ist erfüllt, wenn mindestens eine JSON-Datei existiert", () => {
    const ctx = createTestContext({
      files: { "webapp/localService/data/Products.json": "[]" },
    });

    expect(runRule(odataMockdataRule, ctx, { mode: "any" })).toEqual([]);
  });

  it("mode=any: meldet, wenn keine Mockdaten existieren", () => {
    const ctx = createTestContext({ files: {} });

    expect(runRule(odataMockdataRule, ctx, { mode: "any" })).toHaveLength(1);
  });

  it("mode=all-entities: meldet fehlende EntitySets", () => {
    const ctx = createTestContext({
      manifest: manifestWithOData(),
      files: {
        "webapp/localService/metadata.xml": metadataXml,
        "webapp/localService/data/Products.json": "[]",
      },
    });

    const findings = runRule(odataMockdataRule, ctx, { mode: "all-entities" });
    expect(findings).toHaveLength(1);
    expect(findings[0]?.message).toContain("Categories");
  });

  it("mode=all-entities: ist erfüllt, wenn alle EntitySets Mockdaten haben", () => {
    const ctx = createTestContext({
      manifest: manifestWithOData(),
      files: {
        "webapp/localService/metadata.xml": metadataXml,
        "webapp/localService/data/Products.json": "[]",
        "webapp/localService/data/Categories.json": "[]",
      },
    });

    expect(runRule(odataMockdataRule, ctx, { mode: "all-entities" })).toEqual([]);
  });

  it("überspringt sich für FLP-Plugins (sap.app/type: component), auch ohne Mockdaten", () => {
    const ctx = createTestContext({ manifest: { "sap.app": { type: "component" } }, files: {} });

    expect(runRule(odataMockdataRule, ctx, { mode: "any" })).toEqual([]);
  });
});
