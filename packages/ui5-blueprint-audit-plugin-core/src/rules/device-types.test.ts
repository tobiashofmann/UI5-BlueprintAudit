import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { deviceTypesRule } from "./device-types.js";

describe("device-types", () => {
  it("passes with all device types true (default)", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui": { deviceTypes: { desktop: true, tablet: true, phone: true } } },
    });

    expect(runRule(deviceTypesRule, ctx)).toEqual([]);
  });

  it("reports deviating device types", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui": { deviceTypes: { desktop: false, tablet: true, phone: false } } },
    });

    expect(runRule(deviceTypesRule, ctx)).toHaveLength(2);
  });

  it("respects configured expectations", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui": { deviceTypes: { desktop: false, tablet: true, phone: false } } },
    });

    expect(runRule(deviceTypesRule, ctx, { desktop: false, tablet: true, phone: false })).toEqual([]);
  });
});
