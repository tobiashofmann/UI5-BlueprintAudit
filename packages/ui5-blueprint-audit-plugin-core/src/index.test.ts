import { describe, expect, it } from "vitest";
import corePlugin from "./index.js";

describe("core plugin", () => {
  it("exposes name and apiVersion", () => {
    expect(corePlugin.name).toBe("core");
    expect(corePlugin.apiVersion).toBe("1");
  });
});
