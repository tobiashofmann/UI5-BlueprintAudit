import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { appVersionRule } from "./app-version.js";

describe("app-version", () => {
  it("ist erfüllt bei einer gepflegten Version", () => {
    const ctx = createTestContext({ manifest: { "sap.app": { applicationVersion: { version: "1.2.0" } } } });

    expect(runRule(appVersionRule, ctx)).toEqual([]);
  });

  it("meldet den Generator-Default 0.0.1", () => {
    const ctx = createTestContext({ manifest: { "sap.app": { applicationVersion: { version: "0.0.1" } } } });

    expect(runRule(appVersionRule, ctx)).toHaveLength(1);
  });

  it("prüft bei Libraries package.json#version statt manifest.json (Library-Default 1.0.0)", () => {
    const ctx = createTestContext({ projectType: "lib", packageJson: { version: "1.0.0" } });

    expect(runRule(appVersionRule, ctx)).toHaveLength(1);
  });

  it("ist bei Libraries erfüllt, wenn package.json#version gepflegt wurde", () => {
    const ctx = createTestContext({ projectType: "lib", packageJson: { version: "1.3.0" } });

    expect(runRule(appVersionRule, ctx)).toEqual([]);
  });
});
