import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { cacheBusterRule } from "./cache-buster.js";

describe("cache-buster", () => {
  it("passes if a cache-buster task is configured in ui5.yaml", () => {
    const ctx = createTestContext({
      ui5Yaml: { builder: { customTasks: [{ name: "generateCachebusterInfo" }] } },
    });

    expect(runRule(cacheBusterRule, ctx)).toEqual([]);
  });

  it("reports if no cache-buster mechanism is configured", () => {
    const ctx = createTestContext({
      ui5Yaml: { type: "application" },
      indexHtml: '<script id="sap-ui-bootstrap" src="resources/sap-ui-core.js"></script>',
    });

    expect(runRule(cacheBusterRule, ctx)).toHaveLength(1);
  });

  it("passes with a versioned cache-buster URL in index.html", () => {
    const ctx = createTestContext({
      indexHtml: '<script id="sap-ui-bootstrap" src="resources/sap-ui-core.js?sap-ui-cachebuster=abc"></script>',
    });

    expect(runRule(cacheBusterRule, ctx)).toEqual([]);
  });

  it("passes with a versioned cache-buster URL, src before id", () => {
    const ctx = createTestContext({
      indexHtml: '<script src="resources/sap-ui-core.js?sap-ui-cachebuster=abc" id="sap-ui-bootstrap"></script>',
    });

    expect(runRule(cacheBusterRule, ctx)).toEqual([]);
  });

  it("stays fast with many <script> repetitions and no match", () => {
    const indexHtml = "<script ".repeat(20000) + '<script id="sap-ui-bootstrap" src="resources/sap-ui-core.js"></script>';
    const ctx = createTestContext({ indexHtml });

    const start = performance.now();
    const findings = runRule(cacheBusterRule, ctx);
    expect(performance.now() - start).toBeLessThan(1000);
    expect(findings).toHaveLength(1);
  });
});
