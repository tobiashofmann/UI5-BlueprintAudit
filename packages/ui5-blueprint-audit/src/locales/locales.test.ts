import { describe, expect, it } from "vitest";
import en from "./en.js";
import de from "./de.js";
import ptBR from "./pt-BR.js";

describe("locale bundles (CLI/Reporter-Labels)", () => {
  it("de hat exakt dieselben Keys wie en", () => {
    expect(Object.keys(de).sort()).toEqual(Object.keys(en).sort());
  });

  it("pt-BR hat exakt dieselben Keys wie en", () => {
    expect(Object.keys(ptBR).sort()).toEqual(Object.keys(en).sort());
  });
});
