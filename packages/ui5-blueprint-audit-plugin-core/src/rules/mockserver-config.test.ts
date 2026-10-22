import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { mockserverConfigRule } from "./mockserver-config.js";

describe("mockserver-config", () => {
  it("ist erfüllt, wenn die Datei existiert", () => {
    const ctx = createTestContext({ files: { "ui5-mockserver.yaml": "" } });

    expect(runRule(mockserverConfigRule, ctx)).toEqual([]);
  });

  it("meldet eine fehlende Datei", () => {
    const ctx = createTestContext({ files: {} });

    expect(runRule(mockserverConfigRule, ctx)).toHaveLength(1);
  });

  it("respektiert einen alternativen Dateinamen", () => {
    const ctx = createTestContext({ files: { "mock.yaml": "" } });

    expect(runRule(mockserverConfigRule, ctx, { fileName: "mock.yaml" })).toEqual([]);
  });
});
