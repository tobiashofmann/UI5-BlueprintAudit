import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { appVersionRule } from "./app-version.js";

describe("app-version", () => {
  it("passes with a maintained version", () => {
    const ctx = createTestContext({ manifest: { "sap.app": { applicationVersion: { version: "1.2.0" } } } });

    expect(runRule(appVersionRule, ctx)).toEqual([]);
  });

  it("reports the generator default 0.0.1", () => {
    const ctx = createTestContext({ manifest: { "sap.app": { applicationVersion: { version: "0.0.1" } } } });

    expect(runRule(appVersionRule, ctx)).toHaveLength(1);
  });

  it("checks package.json#version instead of manifest.json for libraries (library default 1.0.0)", () => {
    const ctx = createTestContext({ projectType: "lib", packageJson: { version: "1.0.0" } });

    expect(runRule(appVersionRule, ctx)).toHaveLength(1);
  });

  it("passes for libraries if package.json#version has been maintained", () => {
    const ctx = createTestContext({ projectType: "lib", packageJson: { version: "1.3.0" } });

    expect(runRule(appVersionRule, ctx)).toEqual([]);
  });
});
