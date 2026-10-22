import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { qunitOpaTestsRule } from "./qunit-opa-tests.js";

describe("qunit-opa-tests", () => {
  it("ist erfüllt bei einer QUnit-Testsuite", () => {
    const ctx = createTestContext({ files: { "webapp/test/unit/unitTests.qunit.ts": "" } });

    expect(runRule(qunitOpaTestsRule, ctx)).toEqual([]);
  });

  it("ist erfüllt bei einem OPA5-Journey", () => {
    const ctx = createTestContext({
      files: { "webapp/test/integration/NavigationJourney.js": 'import Opa5 from "sap/ui/test/Opa5";' },
    });

    expect(runRule(qunitOpaTestsRule, ctx)).toEqual([]);
  });

  it("meldet, wenn keine Tests existieren", () => {
    const ctx = createTestContext({ files: {} });

    expect(runRule(qunitOpaTestsRule, ctx)).toHaveLength(1);
  });

  it("prüft bei Libraries test/ statt webapp/test/", () => {
    const ctx = createTestContext({
      projectType: "lib",
      files: { "test/ns/lib/qunit/Example.qunit.ts": "" },
    });

    expect(runRule(qunitOpaTestsRule, ctx)).toEqual([]);
  });
});
