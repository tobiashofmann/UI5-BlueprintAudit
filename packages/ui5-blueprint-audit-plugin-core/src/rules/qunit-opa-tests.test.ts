import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { qunitOpaTestsRule } from "./qunit-opa-tests.js";

describe("qunit-opa-tests", () => {
  it("passes with a QUnit test suite", () => {
    const ctx = createTestContext({ files: { "webapp/test/unit/unitTests.qunit.ts": "" } });

    expect(runRule(qunitOpaTestsRule, ctx)).toEqual([]);
  });

  it("passes with an OPA5 journey", () => {
    const ctx = createTestContext({
      files: { "webapp/test/integration/NavigationJourney.js": 'import Opa5 from "sap/ui/test/Opa5";' },
    });

    expect(runRule(qunitOpaTestsRule, ctx)).toEqual([]);
  });

  it("reports if no tests exist", () => {
    const ctx = createTestContext({ files: {} });

    expect(runRule(qunitOpaTestsRule, ctx)).toHaveLength(1);
  });

  it("checks test/ instead of webapp/test/ for libraries", () => {
    const ctx = createTestContext({
      projectType: "lib",
      files: { "test/ns/lib/qunit/Example.qunit.ts": "" },
    });

    expect(runRule(qunitOpaTestsRule, ctx)).toEqual([]);
  });
});
