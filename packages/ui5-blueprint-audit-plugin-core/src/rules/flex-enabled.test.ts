import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { flexEnabledRule } from "./flex-enabled.js";

describe("flex-enabled", () => {
  it("ist erfüllt bei flexEnabled: true", () => {
    const ctx = createTestContext({ manifest: { "sap.ui5": { flexEnabled: true } } });

    expect(runRule(flexEnabledRule, ctx)).toEqual([]);
  });

  it("meldet flexEnabled: false", () => {
    const ctx = createTestContext({ manifest: { "sap.ui5": { flexEnabled: false } } });

    expect(runRule(flexEnabledRule, ctx)).toHaveLength(1);
  });
});
