import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { mockserverConfigRule } from "./mockserver-config.js";

describe("mockserver-config", () => {
  it("passes if the file exists", () => {
    const ctx = createTestContext({ files: { "ui5-mockserver.yaml": "" } });

    expect(runRule(mockserverConfigRule, ctx)).toEqual([]);
  });

  it("reports a missing file", () => {
    const ctx = createTestContext({ files: {} });

    expect(runRule(mockserverConfigRule, ctx)).toHaveLength(1);
  });

  it("respects an alternative file name", () => {
    const ctx = createTestContext({ files: { "mock.yaml": "" } });

    expect(runRule(mockserverConfigRule, ctx, { fileName: "mock.yaml" })).toEqual([]);
  });
});
