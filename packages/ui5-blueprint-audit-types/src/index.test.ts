import { describe, expect, it } from "vitest";
import {
  assertLocalesAvailable,
  availableLocales,
  buildLocaleRegistry,
  createTranslator,
  mergeLocaleRegistries,
  type Plugin,
} from "./index.js";

function pluginWithLocales(locales: Plugin["locales"]): Plugin {
  return { name: "test-plugin", apiVersion: "1", rules: {}, locales };
}

describe("buildLocaleRegistry", () => {
  it("merges the bundles of several plugins per locale", () => {
    const registry = buildLocaleRegistry([
      pluginWithLocales({ en: { a: "A", b: "B" } }),
      pluginWithLocales({ en: { c: "C" }, de: { a: "A-de" } }),
    ]);

    expect(registry.bundles.en).toEqual({ a: "A", b: "B", c: "C" });
    expect(registry.bundles.de).toEqual({ a: "A-de" });
    expect(registry.referenceLocale).toBe("en");
  });

  it("lets a later plugin override individual keys of an earlier one", () => {
    const registry = buildLocaleRegistry([
      pluginWithLocales({ en: { a: "first" } }),
      pluginWithLocales({ en: { a: "second" } }),
    ]);

    expect(registry.bundles.en?.a).toBe("second");
  });

  it("works with plugins that have no locales field", () => {
    const registry = buildLocaleRegistry([{ name: "p", apiVersion: "1", rules: {} }]);

    expect(registry.bundles).toEqual({});
  });

  it("uses the given referenceLocale instead of the default", () => {
    const registry = buildLocaleRegistry([], "de");

    expect(registry.referenceLocale).toBe("de");
  });
});

describe("mergeLocaleRegistries", () => {
  it("merges the bundles of several registries per locale, later ones win on conflicts", () => {
    const a = buildLocaleRegistry([pluginWithLocales({ en: { x: "a-x", y: "a-y" } })]);
    const b = buildLocaleRegistry([pluginWithLocales({ en: { x: "b-x" }, de: { y: "b-y-de" } })]);

    const merged = mergeLocaleRegistries([a, b]);

    expect(merged.bundles.en).toEqual({ x: "b-x", y: "a-y" });
    expect(merged.bundles.de).toEqual({ y: "b-y-de" });
  });
});

describe("availableLocales", () => {
  it("lists the keys of the bundles map", () => {
    const registry = buildLocaleRegistry([pluginWithLocales({ en: { a: "A" }, de: { a: "A-de" } })]);

    expect(availableLocales(registry)).toEqual(["en", "de"]);
  });

  it("is empty if no bundles were loaded", () => {
    expect(availableLocales(buildLocaleRegistry([]))).toEqual([]);
  });
});

describe("createTranslator", () => {
  const registry = buildLocaleRegistry(
    [pluginWithLocales({ en: { greet: "Hello {name}", onlyEn: "only en" }, de: { greet: "Hallo {name}" } })],
    "en",
  );

  it("translates in the requested locale", () => {
    const t = createTranslator(registry, "de");

    expect(t("greet", { name: "Welt" })).toBe("Hallo Welt");
  });

  it("falls back to the referenceLocale if the key is missing in the locale", () => {
    const t = createTranslator(registry, "de");

    expect(t("onlyEn")).toBe("only en");
  });

  it("falls back to the raw key if it exists in no bundle", () => {
    const t = createTranslator(registry, "de");

    expect(t("unknown.key")).toBe("unknown.key");
  });

  it("leaves a placeholder unchanged if params is not passed at all", () => {
    const t = createTranslator(registry, "en");

    expect(t("greet")).toBe("Hello {name}");
  });

  it("leaves a placeholder unchanged if params does not contain it", () => {
    const t = createTranslator(registry, "en");

    expect(t("greet", {})).toBe("Hello {name}");
  });

  it("interpolates unchanged without a params argument", () => {
    const t = createTranslator(registry, "en");

    expect(t("onlyEn")).toBe("only en");
  });
});

describe("assertLocalesAvailable", () => {
  const registry = buildLocaleRegistry([pluginWithLocales({ en: { a: "A" }, de: { a: "A-de" } })]);

  it("does not throw if all requested locales are available", () => {
    expect(() => assertLocalesAvailable(registry, ["en", "de"])).not.toThrow();
  });

  it("throws with the unknown and the available locales if one is missing", () => {
    expect(() => assertLocalesAvailable(registry, ["en", "pt-BR"])).toThrow(/pt-BR/);
    expect(() => assertLocalesAvailable(registry, ["en", "pt-BR"])).toThrow(/en, de/);
  });
});
