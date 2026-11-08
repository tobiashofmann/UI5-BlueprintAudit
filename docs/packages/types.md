# @abap/ui5-blueprint-audit-types

The shared base of the other two packages: the plugin contract as TypeScript types, plus a few small, stateless translation helpers.

[Source on GitHub](https://github.com/tobiashofmann/UI5-BlueprintAudit/tree/main/packages/ui5-blueprint-audit-types) · [npm](https://www.npmjs.com/package/@abap/ui5-blueprint-audit-types)

## Who needs it

You need this package when you write a [plugin](/concepts/own-rules) in TypeScript. A plugin written in plain JavaScript does not need it.

```bash
npm install --save-dev @abap/ui5-blueprint-audit-types
```

```ts
import type { Plugin, Rule } from "@abap/ui5-blueprint-audit-types";

const rule: Rule = {
  meta: {
    descriptionKey: "acme.readmePresent.description",
    defaultSeverity: "error",
    projectTypes: ["fs", "fe", "lib"],
  },
  check(ctx) {
    // ...
  },
};

const plugin: Plugin = {
  name: "acme",
  apiVersion: "1",
  rules: { "readme-present": rule },
};

export default plugin;
```

## Types

| Type | Description |
|---|---|
| `Plugin` | `{ name, apiVersion, rules, configs?, locales? }`. What a plugin exports. |
| `Rule` | `{ meta, check(ctx) }`. One check. |
| `RuleMeta` | `{ descriptionKey, defaultSeverity, projectTypes }`. |
| `RuleContext` | What `check` receives: `projectContext`, `options`, `t`, `report`. |
| `ProjectContext` | The project, read once: manifest, YAML files, `package.json`, `index.html`, file tree, `readFile`. |
| `Finding` | One reported violation: `ruleId`, `severity`, `message`, and optional `file`, `line`, `column`. |
| `ProjectType` | `"fs" \| "fe" \| "lib"`. |
| `Severity` | `"off" \| "warn" \| "error"`. |
| `Translator` | `(key, params?) => string`. |
| `LocaleRegistry`, `LocaleCode` | The merged translation bundles, and a locale code such as `"de"`. |

## Translation helpers

This package is more than types on purpose. The core plugin needs a translator for its own tests, and it must not depend on the CLI package to get one, because the CLI already depends on the core plugin. This package is the only base both of them share.

| Function | Description |
|---|---|
| `buildLocaleRegistry(plugins, referenceLocale?)` | Merges the `locales` of all plugins. A later plugin can override single keys of an earlier one. |
| `mergeLocaleRegistries(registries, referenceLocale?)` | Merges several registries, for example one per project. |
| `createTranslator(registry, locale)` | Returns a `Translator` bound to one locale. A missing key falls back to the reference locale (`en`), then to the raw key. |
| `availableLocales(registry)` | Lists the locales that have at least one bundle. |
| `assertLocalesAvailable(registry, requested)` | Throws if a requested locale exists in no bundle. |

Interpolation is deliberately simple: only `{paramName}`. There is no ICU syntax and no plural handling.

```ts
const t = createTranslator(registry, "de");
t("theme.notAllowed", { theme: "sap_bluecrystal", allowed: "sap_horizon" });
```
