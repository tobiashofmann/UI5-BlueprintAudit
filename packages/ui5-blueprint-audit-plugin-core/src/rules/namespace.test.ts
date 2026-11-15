import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { namespaceRule } from "./namespace.js";

describe("namespace", () => {
  it("passes if sap.app/id starts with the prescribed namespace", () => {
    const ctx = createTestContext({ manifest: { "sap.app": { id: "com.firma.myapp" } } });

    expect(runRule(namespaceRule, ctx, { value: "com.firma" })).toEqual([]);
  });

  it("reports a deviating namespace", () => {
    const ctx = createTestContext({ manifest: { "sap.app": { id: "com.other.myapp" } } });

    expect(runRule(namespaceRule, ctx, { value: "com.firma" })).toHaveLength(1);
  });

  it("uses ui5.yaml#metadata.name instead of sap.app/id for libraries (no manifest.json)", () => {
    const ctx = createTestContext({
      projectType: "lib",
      ui5Yaml: { metadata: { name: "com.firma.mylib" } },
    });

    expect(runRule(namespaceRule, ctx, { value: "com.firma" })).toEqual([]);
  });

  it("reports a deviating namespace for libraries", () => {
    const ctx = createTestContext({
      projectType: "lib",
      ui5Yaml: { metadata: { name: "com.other.mylib" } },
    });

    expect(runRule(namespaceRule, ctx, { value: "com.firma" })).toHaveLength(1);
  });
  it("only matches on a segment boundary, not on a plain string prefix", () => {
    const ctx = createTestContext({ manifest: { "sap.app": { id: "com.firmaX.myapp" } } });

    expect(runRule(namespaceRule, ctx, { value: "com.firma" })).toHaveLength(1);
  });

  it("accepts an ID equal to the namespace and a namespace configured with a trailing dot", () => {
    const exact = createTestContext({ manifest: { "sap.app": { id: "com.firma" } } });
    const below = createTestContext({ manifest: { "sap.app": { id: "com.firma.myapp" } } });

    expect(runRule(namespaceRule, exact, { value: "com.firma" })).toEqual([]);
    expect(runRule(namespaceRule, below, { value: "com.firma." })).toEqual([]);
  });
});
