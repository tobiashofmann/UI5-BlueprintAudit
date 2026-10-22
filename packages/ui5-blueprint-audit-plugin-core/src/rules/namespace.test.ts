import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { namespaceRule } from "./namespace.js";

describe("namespace", () => {
  it("ist erfüllt, wenn sap.app/id mit dem vorgegebenen Namensraum beginnt", () => {
    const ctx = createTestContext({ manifest: { "sap.app": { id: "com.firma.myapp" } } });

    expect(runRule(namespaceRule, ctx, { value: "com.firma" })).toEqual([]);
  });

  it("meldet einen abweichenden Namensraum", () => {
    const ctx = createTestContext({ manifest: { "sap.app": { id: "com.other.myapp" } } });

    expect(runRule(namespaceRule, ctx, { value: "com.firma" })).toHaveLength(1);
  });

  it("nutzt bei Libraries ui5.yaml#metadata.name statt sap.app/id (kein manifest.json)", () => {
    const ctx = createTestContext({
      projectType: "lib",
      ui5Yaml: { metadata: { name: "com.firma.mylib" } },
    });

    expect(runRule(namespaceRule, ctx, { value: "com.firma" })).toEqual([]);
  });

  it("meldet einen abweichenden Namensraum bei Libraries", () => {
    const ctx = createTestContext({
      projectType: "lib",
      ui5Yaml: { metadata: { name: "com.other.mylib" } },
    });

    expect(runRule(namespaceRule, ctx, { value: "com.firma" })).toHaveLength(1);
  });
});
