import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { flexEnabledRule } from "./flex-enabled.js";

describe("flex-enabled", () => {
  it("passes with flexEnabled: true", () => {
    const ctx = createTestContext({ manifest: { "sap.ui5": { flexEnabled: true } } });

    expect(runRule(flexEnabledRule, ctx)).toEqual([]);
  });

  it("reports flexEnabled: false", () => {
    const ctx = createTestContext({ manifest: { "sap.ui5": { flexEnabled: false } } });

    expect(runRule(flexEnabledRule, ctx)).toHaveLength(1);
  });
});
