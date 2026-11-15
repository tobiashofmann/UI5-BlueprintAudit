# Plugins and localization

## Loading plugins

`runProject` calls [`loadPlugins`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit/src/plugins/load-plugins.ts) with the `plugins` list from the config. The core plugin is always loaded first.

```mermaid
flowchart TD
    spec["plugins entry from config"] --> local{"starts with ./ or ../<br/>or is an absolute path?"}
    local -->|yes| file["resolve relative to the<br/>config file"]
    local -->|no| npm["import-meta-resolve(spec, configPath)<br/>ESM conditions, resolved from the project"]
    npm -->|fails| e1["PluginLoadError<br/>plugin.npmResolveFailed<br/>plugin.npmNotExported<br/>plugin.npmResolveError"]
    file --> imp["dynamic import()"]
    npm --> imp
    imp --> valid{"default export has<br/>name, apiVersion, rules?"}
    valid -->|no| e2["PluginLoadError<br/>plugin.invalidDefaultExport"]
    valid -->|yes| api{"apiVersion = supported?"}
    api -->|no| e3["PluginLoadError<br/>plugin.unsupportedApiVersion"]
    api -->|yes| ok["Plugin"]
```

The two branches are the key part of `loadOnePlugin`:

```ts
const moduleUrl = isLocalSpecifier(spec)
  ? pathToFileURL(resolve(dirname(configPath), spec)).href
  : resolveNpmPlugin(spec, configPath);

const imported = (await import(moduleUrl)) as { default?: unknown };
return validatePlugin(spec, unwrapDefaultExport(imported.default));
```

`resolveNpmPlugin` resolves the package the way `import` would from the project: with the ESM conditions (`import`, `default`). A package that only has an `import` condition in `exports` works, and a dual package resolves to its ESM build. `require.resolve` is not used, because it applies the CommonJS conditions. `import.meta.resolve(spec, parent)` is not used either, because it needs an experimental Node flag; the `import-meta-resolve` package provides the same resolution without it. If that fails because `exports` has no `import` or `default` condition, it falls back to `createRequire(configPath).resolve(spec)`, so a package that only declares `require` still loads as CommonJS. It reports three distinct errors: the package is not installed (`plugin.npmResolveFailed`), it is installed but its `exports` does not export that name (`plugin.npmNotExported`), or any other reason (`plugin.npmResolveError`, with Node's message).

`unwrapDefaultExport` handles plugins compiled to CommonJS. `import()` of such a module puts `module.exports` into `default`, so `exports.default = plugin` arrives as `{ default: plugin }`.

Local paths resolve relative to the config file. npm packages resolve from the project, not from the folder of the audit tool. The supported plugin API version is `"1"`.

## Rule IDs and namespacing

[`buildRuleMap`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit/src/plugins/load-plugins.ts) flattens all plugins into one map. The first plugin (core) keeps bare IDs. Every other plugin gets a `<plugin>/<rule>` prefix:

```ts
plugins.forEach((plugin, index) => {
  const prefix = index === 0 ? "" : `${plugin.name}/`;
  for (const [ruleId, rule] of Object.entries(plugin.rules)) {
    map[`${prefix}${ruleId}`] = rule;
  }
});
```

## Rule configuration

[`mergeRuleConfig`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit/src/config/merge-rule-config.ts) starts from each rule's `defaultSeverity` and applies the overrides from the config. A config entry is either a severity or `[severity, options]`:

```ts
function normalize(value: RuleConfigValue): RuleConfigEntry {
  if (Array.isArray(value)) {
    const [severity, options] = value;
    return { severity, options };
  }
  return { severity: value };
}
```

## Localization

Every text a user can see goes through a translator. The pieces live in [`-types`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit-types/src/index.ts):

```mermaid
flowchart LR
    core["core plugin<br/>locales: en, de, pt-BR"] --> reg
    other["other plugins<br/>locales"] --> reg
    cliTexts["CLI texts<br/>report labels, errors"] --> reg
    reg["buildLocaleRegistry<br/>merge bundles in load order"] --> tr["createTranslator(registry, locale)"]
    tr --> t["t(key, params)"]
    t --> a{"key in locale bundle?"}
    a -->|yes| out["interpolate {param}"]
    a -->|no| b{"key in reference<br/>locale (en)?"}
    b -->|yes| out
    b -->|no| raw["return the raw key"]
```

`createTranslator` is short:

```ts
export function createTranslator(registry: LocaleRegistry, locale: LocaleCode): Translator {
  return (key, params) => {
    const template = registry.bundles[locale]?.[key] ?? registry.bundles[registry.referenceLocale]?.[key] ?? key;
    return interpolate(template, params);
  };
}
```

### Bundles in the repository

- Rule messages: [`packages/ui5-blueprint-audit-plugin-core/src/locales/`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit-plugin-core/src/locales/en.ts)
- Report labels and error texts: [`packages/ui5-blueprint-audit/src/locales/`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit/src/locales/en.ts)

`en.ts` is the source of truth for the key names. `de.ts` and `pt-BR.ts` are typed as `Record<keyof typeof en, string>`, so a missing key is a **build error**:

```ts
const de: Record<keyof typeof en, string> = {
  "typescript.description": "Das Projekt verwendet TypeScript.",
  // ...
};
```

A test in each package also checks that all languages have the same keys.

### Output languages

| Output | Languages |
|---|---|
| `report_LOCALE.md` | One file per active language |
| `report.xml` | Always English, so CI dashboards stay stable |
| `report.html` | One file with all active languages and a switcher |
| Console summary | The first active language |

To add a language without changing the repository, ship it as a [plugin with `locales`](/concepts/own-rules#add-a-language).
