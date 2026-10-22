import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import en from "./en.js";
import de from "./de.js";
import ptBR from "./pt-BR.js";

describe("locale bundles", () => {
  it("de hat exakt dieselben Keys wie en", () => {
    expect(Object.keys(de).sort()).toEqual(Object.keys(en).sort());
  });

  it("pt-BR hat exakt dieselben Keys wie en", () => {
    expect(Object.keys(ptBR).sort()).toEqual(Object.keys(en).sort());
  });

  it("jeder in den Regeln verwendete Key existiert in en (Tippfehler-Schutz)", () => {
    const rulesDir = join(dirname(fileURLToPath(import.meta.url)), "..", "rules");
    const usedKeys = new Set<string>();
    const keyPattern = /(?:ctx\.t\(\s*|descriptionKey:\s*)["'`]([\w.-]+)["'`]/g;

    for (const file of readdirSync(rulesDir)) {
      if (!file.endsWith(".ts") || file.endsWith(".test.ts")) continue;
      const content = readFileSync(join(rulesDir, file), "utf8");
      for (const match of content.matchAll(keyPattern)) {
        usedKeys.add(match[1]);
      }
    }

    expect(usedKeys.size).toBeGreaterThan(0);
    const knownKeys = new Set(Object.keys(en));
    const unknown = [...usedKeys].filter((key) => !knownKeys.has(key));
    expect(unknown).toEqual([]);
  });
});
