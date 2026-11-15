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
  it("mode=any: passes if at least one JSON file exists", () => {
    const ctx = createTestContext({
      files: { "webapp/localService/data/Products.json": "[]" },
    });

    expect(runRule(odataMockdataRule, ctx, { mode: "any" })).toEqual([]);
  });

  it("mode=any: reports if no mock data exists", () => {
    const ctx = createTestContext({ files: {} });

    expect(runRule(odataMockdataRule, ctx, { mode: "any" })).toHaveLength(1);
  });

  it("mode=all-entities: reports missing EntitySets", () => {
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

  it("mode=all-entities: passes if all EntitySets have mock data", () => {
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

  it("skips itself for FLP plugins (sap.app/type: component), even without mock data", () => {
    const ctx = createTestContext({ manifest: { "sap.app": { type: "component" } }, files: {} });

    expect(runRule(odataMockdataRule, ctx, { mode: "any" })).toEqual([]);
  });
  it("mode=one-entity: is satisfied if one EntitySet has a matching <EntitySet>.json", () => {
    const ctx = createTestContext({
      manifest: manifestWithOData(),
      files: {
        "webapp/localService/metadata.xml": metadataXml,
        "webapp/localService/data/Categories.json": "[]",
      },
    });

    expect(runRule(odataMockdataRule, ctx, { mode: "one-entity" })).toEqual([]);
  });

  it("mode=one-entity: reports JSON files that match no EntitySet", () => {
    const ctx = createTestContext({
      manifest: manifestWithOData(),
      files: {
        "webapp/localService/metadata.xml": metadataXml,
        "webapp/localService/data/Unrelated.json": "[]",
      },
    });

    expect(runRule(odataMockdataRule, ctx, { mode: "one-entity" })).toHaveLength(1);
  });

  it("mode=one-entity: reports a data folder without any JSON file", () => {
    const ctx = createTestContext({
      manifest: manifestWithOData(),
      files: { "webapp/localService/metadata.xml": metadataXml },
    });

    expect(runRule(odataMockdataRule, ctx, { mode: "one-entity" })).toHaveLength(1);
  });
});
