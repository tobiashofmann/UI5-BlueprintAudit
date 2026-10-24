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
  it("merged die Bundles mehrerer Plugins pro Locale", () => {
    const registry = buildLocaleRegistry([
      pluginWithLocales({ en: { a: "A", b: "B" } }),
      pluginWithLocales({ en: { c: "C" }, de: { a: "A-de" } }),
    ]);

    expect(registry.bundles.en).toEqual({ a: "A", b: "B", c: "C" });
    expect(registry.bundles.de).toEqual({ a: "A-de" });
    expect(registry.referenceLocale).toBe("en");
  });

  it("lässt ein späteres Plugin einzelne Keys eines früheren überschreiben", () => {
    const registry = buildLocaleRegistry([
      pluginWithLocales({ en: { a: "first" } }),
      pluginWithLocales({ en: { a: "second" } }),
    ]);

    expect(registry.bundles.en?.a).toBe("second");
  });

  it("funktioniert ohne Plugins ohne locales-Feld", () => {
    const registry = buildLocaleRegistry([{ name: "p", apiVersion: "1", rules: {} }]);

    expect(registry.bundles).toEqual({});
  });

  it("nutzt die übergebene referenceLocale statt des Defaults", () => {
    const registry = buildLocaleRegistry([], "de");

    expect(registry.referenceLocale).toBe("de");
  });
});

describe("mergeLocaleRegistries", () => {
  it("merged die Bundles mehrerer Registries pro Locale, spätere gewinnen bei Konflikten", () => {
    const a = buildLocaleRegistry([pluginWithLocales({ en: { x: "a-x", y: "a-y" } })]);
    const b = buildLocaleRegistry([pluginWithLocales({ en: { x: "b-x" }, de: { y: "b-y-de" } })]);

    const merged = mergeLocaleRegistries([a, b]);

    expect(merged.bundles.en).toEqual({ x: "b-x", y: "a-y" });
    expect(merged.bundles.de).toEqual({ y: "b-y-de" });
  });
});

describe("availableLocales", () => {
  it("listet die Keys der bundles-Map", () => {
    const registry = buildLocaleRegistry([pluginWithLocales({ en: { a: "A" }, de: { a: "A-de" } })]);

    expect(availableLocales(registry)).toEqual(["en", "de"]);
  });

  it("ist leer, wenn keine Bundles geladen wurden", () => {
    expect(availableLocales(buildLocaleRegistry([]))).toEqual([]);
  });
});

describe("createTranslator", () => {
  const registry = buildLocaleRegistry(
    [pluginWithLocales({ en: { greet: "Hello {name}", onlyEn: "only en" }, de: { greet: "Hallo {name}" } })],
    "en",
  );

  it("übersetzt in der angeforderten Locale", () => {
    const t = createTranslator(registry, "de");

    expect(t("greet", { name: "Welt" })).toBe("Hallo Welt");
  });

  it("fällt auf die referenceLocale zurück, wenn der Key in der Locale fehlt", () => {
    const t = createTranslator(registry, "de");

    expect(t("onlyEn")).toBe("only en");
  });

  it("fällt auf den rohen Key zurück, wenn er in keinem Bundle existiert", () => {
    const t = createTranslator(registry, "de");

    expect(t("unknown.key")).toBe("unknown.key");
  });

  it("lässt einen Platzhalter unverändert, wenn params gar nicht übergeben wird", () => {
    const t = createTranslator(registry, "en");

    expect(t("greet")).toBe("Hello {name}");
  });

  it("lässt einen Platzhalter unverändert, wenn params ihn nicht enthält", () => {
    const t = createTranslator(registry, "en");

    expect(t("greet", {})).toBe("Hello {name}");
  });

  it("interpoliert ohne params-Argument unverändert", () => {
    const t = createTranslator(registry, "en");

    expect(t("onlyEn")).toBe("only en");
  });
});

describe("assertLocalesAvailable", () => {
  const registry = buildLocaleRegistry([pluginWithLocales({ en: { a: "A" }, de: { a: "A-de" } })]);

  it("wirft nicht, wenn alle angeforderten Locales verfügbar sind", () => {
    expect(() => assertLocalesAvailable(registry, ["en", "de"])).not.toThrow();
  });

  it("wirft mit den unbekannten und verfügbaren Locales, wenn eine fehlt", () => {
    expect(() => assertLocalesAvailable(registry, ["en", "pt-BR"])).toThrow(/pt-BR/);
    expect(() => assertLocalesAvailable(registry, ["en", "pt-BR"])).toThrow(/en, de/);
  });
});
