import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { cacheBusterRule } from "./cache-buster.js";

describe("cache-buster", () => {
  it("ist erfüllt, wenn ein Cachebuster-Task in ui5.yaml konfiguriert ist", () => {
    const ctx = createTestContext({
      ui5Yaml: { builder: { customTasks: [{ name: "generateCachebusterInfo" }] } },
    });

    expect(runRule(cacheBusterRule, ctx)).toEqual([]);
  });

  it("meldet, wenn kein Cachebuster-Mechanismus konfiguriert ist", () => {
    const ctx = createTestContext({
      ui5Yaml: { type: "application" },
      indexHtml: '<script id="sap-ui-bootstrap" src="resources/sap-ui-core.js"></script>',
    });

    expect(runRule(cacheBusterRule, ctx)).toHaveLength(1);
  });

  it("ist erfüllt bei versionierter Cachebuster-URL in index.html", () => {
    const ctx = createTestContext({
      indexHtml: '<script id="sap-ui-bootstrap" src="resources/sap-ui-core.js?sap-ui-cachebuster=abc"></script>',
    });

    expect(runRule(cacheBusterRule, ctx)).toEqual([]);
  });

  it("ist erfüllt bei versionierter Cachebuster-URL, src vor id", () => {
    const ctx = createTestContext({
      indexHtml: '<script src="resources/sap-ui-core.js?sap-ui-cachebuster=abc" id="sap-ui-bootstrap"></script>',
    });

    expect(runRule(cacheBusterRule, ctx)).toEqual([]);
  });

  it("bleibt bei vielen <script>-Wiederholungen ohne Treffer performant", () => {
    const indexHtml = "<script ".repeat(20000) + '<script id="sap-ui-bootstrap" src="resources/sap-ui-core.js"></script>';
    const ctx = createTestContext({ indexHtml });

    const start = performance.now();
    const findings = runRule(cacheBusterRule, ctx);
    expect(performance.now() - start).toBeLessThan(1000);
    expect(findings).toHaveLength(1);
  });
});
